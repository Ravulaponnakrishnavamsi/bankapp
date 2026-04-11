# SecureBank – High Performance OTP App (Clean Refactor)

A professional, high-speed banking web app focused on instant OTP verification using Node.js/Express and In-Memory storage. 

> [!IMPORTANT]
> **Firebase Removal complete**: This project no longer uses Firebase or MongoDB. It is designed for maximum speed and simplicity using server memory.

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- Gmail Account (for sending OTPs)

### 2. Environment Variables (.env)
Create a `.env` file in the root directory:
```env
PORT=5000
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
OWNER_EMAIL=recipient-email@gmail.com
JWT_SECRET=any-random-long-string
```

### 3. Install & Start
```bash
npm install
npm run dev
```

## 🌍 Deployment on Render (Step-by-Step)

If the OTP system is not working on your live URL, follow these exact steps to fix it:

1.  **Login to Render**: Go to your [Render Dashboard](https://dashboard.render.com).
2.  **Select your Web Service**: Click on `securebank-app`.
3.  **Go to Environment Settings**: Click **"Environment"** in the left sidebar.
4.  **Update Variables**: Ensure the following keys are **exactly** correct:
    -   `GMAIL_USER`: Your sending Gmail.
    -   `GMAIL_APP_PASSWORD`: The 16-character password (no spaces).
    -   `OWNER_EMAIL`: The email where you want to receive OTPs.
    -   `JWT_SECRET`: (Add this) Any random string.
    -   *Delete `FIREBASE_SERVICE_ACCOUNT`* as it is no longer used.
5.  **Save Changes**: Click "Save Changes". Render will automatically restart your app.

## 📁 Project Structure (Senior Architect Level)
- `/src/controllers` - Auth logic (Send/Verify OTPs).
- `/src/routes` - API Route definitions.
- `/src/utils` - Mailer and Memory Store helpers.
- `server.js` - Optimized entry point.

## 📜 How to Commit Changes
1. `git add .`
2. `git commit -m "feat: senior refactor - firebase removed - high speed memory auth"`
3. `git push origin main`
