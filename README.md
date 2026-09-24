# 🏠 RentMate Finder

An AI-powered Rent & Flatmate Finder built for the Indian rental market. This platform helps owners list rooms and tenants find suitable accommodation using an AI compatibility scoring system.

---

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://rent-mate-finder.vercel.app |
| Backend (Render) | https://rentmate-backend-vvrp.onrender.com |

> Replace the above URLs after deploying the project.

---

## ✨ Features

### 👤 Owner
- Register & Login
- Create Room Listings
- Edit & Delete Listings
- Upload Room Photos
- Mark Listing as Filled
- View Tenant Interest Requests
- Accept or Decline Requests
- Real-time Chat with Accepted Tenants

### 🏠 Tenant
- Register & Login
- Create Room Preference Profile
- Browse Available Rooms
- Filter Rooms by City & Budget
- View AI Compatibility Score
- Send Interest Requests
- Chat with Owners after Request Acceptance

### 🛡️ Admin
- Manage Users
- Manage Listings
- View Platform Activity

### 🤖 AI Compatibility
- AI Compatibility Score
- AI Match Explanation
- Rule-Based Fallback when AI is unavailable

### 📩 Other Features
- JWT Authentication
- Role-Based Authorization
- MongoDB Database
- WebSocket Real-Time Chat
- Email Notifications

---

## 🛠️ Tech Stack

### Frontend
- React
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### Authentication
- JWT

### AI
- Google Gemini API

### Real-Time Communication
- WebSocket

### Email Service
- Nodemailer

---

## 📂 Project Structure

```
RentMate-Finder
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── socket
│   ├── utils
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/your-username/RentMate-Finder.git
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Frontend

Hosted on **Vercel**

**Live URL:**

```
https://rent-mate-finder.vercel.app/

```

### Backend

Hosted on **Render**

**API URL:**

```
https://rentmate-backend-vvrp.onrender.com

```

### Database

Hosted on **MongoDB Atlas**
```

---

## 🔐 Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email

EMAIL_PASS=your_email_password
```

---

## 📡 API Modules

- Authentication
- Room Listings
- Tenant Profiles
- AI Compatibility
- Interest Requests
- Chat
- Notifications
- Admin

---

## 🗄️ Database Collections

- Users
- Listings
- Tenant Profiles
- Compatibility Scores
- Interest Requests
- Messages
- Notifications

---

## 📸 Screenshots

Add screenshots of the following pages after completing the project:

- Landing Page
- Owner Dashboard
- Tenant Dashboard
- Admin Dashboard
- Room Listings
- AI Compatibility Results
- Chat Page

---

## 🚀 Deployment

### Frontend

Deploy using **Vercel**

### Backend

Deploy using **Render**

### Database

Use **MongoDB Atlas**

---

## 📋 Assignment Deliverables

- Complete Source Code
- README.md
- .env.example
- API Documentation
- Database Schema
- Hosted Application
- System Design Document

---

## 👩‍💻 Developer

**Anushka Dixit**

B.Tech Computer Science & Engineering (CSE)

Babu Banarasi Das Nothern Indian Institute Of Technology

---

## 📄 License

This project is developed for educational and academic purposes.