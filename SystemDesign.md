# System Design - RentMate Finder

## Project Overview

RentMate Finder is a web application developed to help owners list rooms and tenants find suitable rental rooms. The application uses AI to calculate a compatibility score between a room listing and a tenant's preferences. It also provides real-time chat and email notifications after a request is accepted.

---

## System Architecture

The project follows a client-server architecture.

- **Frontend:** React
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Real-time Chat:** WebSocket
- **AI:** Google Gemini API

The frontend communicates with the backend using REST APIs. The backend handles user authentication, room listings, AI matching, chat, and email notifications. All application data is stored in MongoDB.

---

## AI Compatibility

The AI matching system compares the tenant's preferences with the room listing.

It checks:
- Preferred Location
- Budget
- Room Type
- Furnishing Status

Based on these details, the AI generates:
- Compatibility Score (0–100)
- Short explanation

The score and explanation are saved in the database so they do not need to be generated again every time.

If the AI service is unavailable, the application automatically switches to a simple rule-based matching system using location and budget.

---

## Database Design

The application stores data in the following collections:

- Users
- Room Listings
- Tenant Profiles
- Compatibility Scores
- Interest Requests
- Messages
- Notifications

This structure keeps the data organized and easy to manage.

---

## Chat System

When a tenant sends an interest request and the owner accepts it, a real-time chat becomes available.

The chat is implemented using WebSockets.

All messages are stored in MongoDB so users can view previous conversations.

---

## Email Notifications

The application sends email notifications for important events:

- Owner receives an email when a tenant with a high compatibility score sends an interest request.
- Tenant receives an email when the owner accepts or declines the request.

---

## Security

The application includes basic security features:

- Passwords are encrypted before storing.
- JWT authentication is used for login.
- Role-based access is implemented for Owner, Tenant, and Admin.
- Protected routes prevent unauthorized access.

---

## Conclusion

RentMate Finder is a simple and efficient rental platform that combines AI-based matching, secure authentication, real-time communication, and role-based access to improve the room rental experience for both owners and tenants.