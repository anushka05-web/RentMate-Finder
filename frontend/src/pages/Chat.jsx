import React, { useEffect, useState, useRef } from 'react';
import { useAuth, API_URL, WS_URL } from '../context/AuthContext';
import { Send, MessageSquare, Home, AlertCircle, Phone, Mail, User, Paperclip, Smile, ShieldCheck } from 'lucide-react';

const Chat = () => {
  const { token, user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Active Matches/Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/active-rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
        if (data.rooms.length > 0) {
          setActiveRoom(data.rooms[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err.message);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
    }
  }, [token]);

  // Fetch Chat History when active room changes
  useEffect(() => {
    if (!activeRoom) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${API_URL}/chat/messages/${activeRoom.chatRoomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        } else {
          setErrorMsg(data.message);
        }
      } catch (err) {
        setErrorMsg('Could not retrieve conversation history');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [activeRoom, token]);

  // Establish WebSocket connection
  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_URL}?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket Connection Established');
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'message') {
          if (activeRoom && payload.chatRoomId === activeRoom.chatRoomId) {
            setMessages((prev) => [...prev, payload.message]);
          }
        } else if (payload.type === 'error') {
          setErrorMsg(payload.message);
        }
      } catch (err) {
        console.error('WebSocket payload parsing error:', err.message);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Connection Terminated');
    };

    socket.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };

    return () => {
      socket.close();
    };
  }, [token, activeRoom]);

  // Send Message via WebSocket
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setErrorMsg('Chat server disconnected. Retrying...');
      return;
    }

    const payload = {
      type: 'message',
      chatRoomId: activeRoom.chatRoomId,
      text: inputText.trim()
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputText('');
  };

  const getInitials = (name) => {
    if (!name) return 'RM';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="glass-card fade-in" style={{
      display: 'flex',
      height: '75vh',
      padding: 0,
      overflow: 'hidden',
      borderRadius: '24px',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Sidebar - Rooms List */}
      <div style={{
        width: '340px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Matches Chat</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Conversations with matched profiles</p>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loadingRooms ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />)}
            </div>
          ) : rooms.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <MessageSquare size={44} style={{ margin: '0 auto', opacity: 0.6 }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>No matched chats yet</p>
              <p style={{ fontSize: '12px', lineHeight: 1.5 }}>Send interest requests to properties. When owners accept, chats unlock automatically here.</p>
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = activeRoom && room.chatRoomId === activeRoom.chatRoomId;
              return (
                <button
                  key={room.chatRoomId}
                  onClick={() => setActiveRoom(room)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #2563EB' : '4px solid transparent',
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isSelected ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : 'var(--bg-tertiary)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    {getInitials(room.otherUser.name)}
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {room.otherUser.name}
                      </h4>
                      <span style={{ fontSize: '10px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {room.otherUser.role}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      Room: {room.listing.roomType} in {room.listing.location}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
        {activeRoom ? (
          <>
            {/* Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700
                  }}>
                    {getInitials(activeRoom.otherUser.name)}
                  </div>
                  {/* Online indicator dot */}
                  <span style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-secondary)'
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeRoom.otherUser.name}
                    <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <ShieldCheck size={10} /> Connected
                    </span>
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                    Listing: {activeRoom.listing.roomType} room • {activeRoom.listing.address}
                  </p>
                </div>
              </div>

              {/* Contact info cards */}
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <Phone size={12} /> {activeRoom.otherUser.phone}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <Mail size={12} /> {activeRoom.otherUser.email}
                </span>
              </div>
            </div>

            {/* Error banners */}
            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                padding: '10px 24px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 500
              }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Messages Feed */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loadingHistory ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', margin: 'auto' }}>
                  <Loader className="spin" size={24} style={{ animation: 'spin 1s linear infinite', color: '#2563EB' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>Loading history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Conversation Started</p>
                  <p style={{ fontSize: '12px', maxWidth: '280px', lineHeight: 1.5 }}>Ask about rent terms, deposit limits, or schedule a physical property visit.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender._id === user?._id || msg.sender === user?._id;
                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                        maxWidth: '65%',
                        gap: '4px'
                      }}
                    >
                      <div style={{
                        padding: '12px 18px',
                        borderRadius: isOwnMessage ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        background: isOwnMessage ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' : 'var(--bg-secondary)',
                        color: isOwnMessage ? '#fff' : 'var(--text-primary)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        boxShadow: 'var(--shadow-sm)',
                        border: isOwnMessage ? 'none' : '1.5px solid var(--border-color)'
                      }}>
                        {msg.text}
                      </div>
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--text-light)',
                        alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                        paddingRight: isOwnMessage ? '4px' : '0',
                        paddingLeft: !isOwnMessage ? '4px' : '0'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Dummy actions for startup look */}
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px' }} title="Attach file">
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder="Type a message..."
                className="form-control"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flexGrow: 1, borderRadius: '12px', padding: '12px 16px' }}
                required
              />

              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '4px' }} title="Add emoji">
                <Smile size={18} />
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '45px', height: '45px', padding: 0, borderRadius: '12px', flexShrink: 0 }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <MessageSquare size={52} style={{ margin: '0 auto', color: '#2563EB', opacity: 0.8 }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Select a conversation</h3>
            <p style={{ fontSize: '14px', maxWidth: '320px', lineHeight: 1.5 }}>Choose a matched Owner or Tenant from the sidebar to coordinate your lease terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
