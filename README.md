# 🏦 SecureBank Web App

A Wells Fargo-style banking platform with real email OTP verification.

**Stack:** Node.js · Express · Nodemailer · Vanilla HTML/CSS/JS  
**Hosting:** [Render.com](https://render.com) (free)

---

## How It Works

1. User fills in Name + Email → clicks **Verify**
2. Server generates a 6-digit OTP → emails it to the **OWNER_EMAIL**
3. Site owner shares OTP with user (call, SMS, WhatsApp, etc.)
4. User enters OTP → server verifies → redirected to Dashboard

---

## Local Setup

### 1 · Install dependencies
```bash
cd banking-app
npm install
```

### 2 · Get a Gmail App Password
> ⚠️ You **cannot** use your normal Gmail password — Google requires an App Password.

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already on)
3. Search for **"App Passwords"** in the search bar
4. Click **Create** → choose **Mail** → click **Create**
5. Copy the 16-character password shown (e.g. `abcd efgh ijkl mnop`)

### 3 · Create your `.env` file
```bash
# Copy the template
copy .env.example .env
```
Open `.env` and fill in:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
OWNER_EMAIL=target-admin-email@example.com
PORT=3000
```

### 4 · Run locally
```bash
node server.js
```
Open → **http://localhost:3000**

---

## Deploy to Render.com (Free Hosting)

### Step 1 · Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit – SecureBank app"
```
Create a new repo on [github.com](https://github.com/new) then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/securebank-app.git
git push -u origin main
```

### Step 2 · Connect to Render
1. Go to [render.com](https://render.com) → **Sign up free**
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — everything is pre-configured

### Step 3 · Add Environment Variables in Render
In the Render dashboard → **Environment** tab, add:

| Key | Value |
|---|---|
| `GMAIL_USER` | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | *(your 16-char app password)* |
| `OWNER_EMAIL` | `target-admin-email@example.com` |

### Step 4 · Deploy
Click **Deploy** — Render will build and start your app.  
Your live URL will be: `https://securebank-app.onrender.com` (or similar)

---

## Customizing the "Get Started" Button

In `js/app.js`, find this line and replace the URL:
```js
gsBtn?.addEventListener('click', () => window.open('https://www.wellsfargo.com', '_blank'));
```

---

## Project Structure
```
banking-app/
├── server.js          ← Express backend (API + static server)
├── package.json
├── .env.example       ← Copy → .env and fill credentials
├── .env               ← ⚠️ Never commit this
├── .gitignore
├── render.yaml        ← Render.com deploy config
├── index.html         ← Landing page
├── signup.html        ← Signup + OTP flow
├── dashboard.html     ← Banking dashboard
├── css/styles.css
└── js/app.js          ← Frontend logic
```
