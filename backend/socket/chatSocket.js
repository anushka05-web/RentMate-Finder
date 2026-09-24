const ws = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Listing = require('../models/Listing');
const InterestRequest = require('../models/InterestRequest');
const Message = require('../models/Message');

// Store active connections: userId -> Set of WebSocket clients
const activeConnections = new Map();

function initChatSocket(server) {
  const wss = new ws.Server({ noServer: true });

  // Hook WebSocket server into the HTTP server's upgrade event
  server.on('upgrade', (request, socket, head) => {
    // Parse query params to extract the token
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      wss.handleUpgrade(request, socket, head, (wsClient) => {
        wsClient.userId = decoded.id;
        wss.emit('connection', wsClient, request);
      });
    } catch (err) {
      socket.write('HTTP/1.1 401 Unauthorized - Invalid Token\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', async (wsClient) => {
    const userId = wsClient.userId;
    console.log(`WebSocket client connected: User ID ${userId}`);

    // Register user connection
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(wsClient);

    wsClient.on('message', async (messageData) => {
      try {
        const payload = JSON.parse(messageData);

        if (payload.type === 'message') {
          const { chatRoomId, text } = payload;
          if (!chatRoomId || !text || text.trim() === '') return;

          // chatRoomId shape: "listingId_tenantId"
          const parts = chatRoomId.split('_');
          if (parts.length !== 2) {
            wsClient.send(JSON.stringify({ type: 'error', message: 'Invalid chatRoomId format' }));
            return;
          }

          const [listingId, tenantId] = parts;

          // 1. Authorize sender
          const listing = await Listing.findById(listingId);
          if (!listing) {
            wsClient.send(JSON.stringify({ type: 'error', message: 'Room listing not found' }));
            return;
          }

          const isOwner = listing.owner.toString() === userId;
          const isTenant = tenantId === userId;

          if (!isOwner && !isTenant) {
            wsClient.send(JSON.stringify({ type: 'error', message: 'You are not authorized for this chat room' }));
            return;
          }

          // 2. Validate Interest request is "accepted"
          const interest = await InterestRequest.findOne({ listing: listingId, tenant: tenantId });
          if (!interest || interest.status !== 'accepted') {
            wsClient.send(JSON.stringify({
              type: 'error',
              message: 'Chat is locked until the owner accepts the interest request'
            }));
            return;
          }

          // 3. Save message in MongoDB
          const newMessage = await Message.create({
            chatRoomId,
            sender: userId,
            text: text.trim(),
            timestamp: new Date()
          });

          // Populate sender info for the frontend
          const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name role');

          const messageResponse = {
            type: 'message',
            chatRoomId,
            message: populatedMessage
          };

          // 4. Send to both Tenant and Owner if they are online
          const recipientIds = [listing.owner.toString(), tenantId];
          recipientIds.forEach((recipientId) => {
            if (activeConnections.has(recipientId)) {
              activeConnections.get(recipientId).forEach((client) => {
                if (client.readyState === ws.OPEN) {
                  client.send(JSON.stringify(messageResponse));
                }
              });
            }
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err.message);
        wsClient.send(JSON.stringify({ type: 'error', message: 'Error processing message' }));
      }
    });

    wsClient.on('close', () => {
      console.log(`WebSocket client disconnected: User ID ${userId}`);
      if (activeConnections.has(userId)) {
        activeConnections.get(userId).delete(wsClient);
        if (activeConnections.get(userId).size === 0) {
          activeConnections.delete(userId);
        }
      }
    });
  });

  return wss;
}

module.exports = {
  initChatSocket
};
