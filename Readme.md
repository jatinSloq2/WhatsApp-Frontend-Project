# 🚀 Complete WhatsApp Manager Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB running (locally or cloud)
- Redis running (optional, for future features)

---

## 🏗️ Project Structure

```
whatsapp-manager/
├── frontend/                 # Next.js 15+ Frontend
├── backend/
│   ├── shared/              # Shared utilities
│   ├── auth-service/        # Authentication service (Port 8001)
│   ├── session-service/     # WhatsApp session service (Port 8002)
│   └── api-gateway/         # API Gateway (Port 8000) - Optional
```

---

## 📦 Installation Steps

### Step 1: Clone/Create Project Structure

```bash
mkdir whatsapp-manager
cd whatsapp-manager
mkdir -p frontend backend/auth-service backend/session-service backend/shared
```

### Step 2: Setup Backend Services

#### A. Auth Service

```bash
cd backend/auth-service

# Create package.json
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken express-validator cors dotenv morgan

# Install dev dependencies
npm install --save-dev nodemon

# Create .env
cat > .env << EOF
PORT=8001
MONGODB_URI=mongodb://localhost:27017/whatsapp_manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
NODE_ENV=development
EOF
```

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Copy all the auth-service files from the artifacts I provided earlier.

#### B. Session Service

```bash
cd ../session-service

# Create package.json
npm init -y

# Install dependencies
npm install express mongoose @whiskeysockets/baileys pino qrcode-terminal socket.io jsonwebtoken cors dotenv

# Install dev dependencies
npm install --save-dev nodemon

# Create .env
cat > .env << EOF
PORT=8002
MONGODB_URI=mongodb://localhost:27017/whatsapp_manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
EOF
```

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

Copy all the session-service files from the artifacts.

### Step 3: Setup Frontend

```bash
cd ../../frontend

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install zustand axios socket.io-client react-hook-form zod @hookform/resolvers
npm install lucide-react qrcode.react react-hot-toast clsx tailwind-merge

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_SESSION_SERVICE_URL=http://localhost:8002
NEXT_PUBLIC_WS_URL=http://localhost:8002
EOF
```

Copy all the frontend files from the artifacts I provided.

---

## 🔧 Configuration

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in both `.env` files

### 2. JWT Secret

Generate secure JWT secrets:
```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update JWT_SECRET and JWT_REFRESH_SECRET in both .env files
```

---

## 🚀 Starting the Application

### Terminal 1: Auth Service
```bash
cd backend/auth-service
npm run dev
```

### Terminal 2: Session Service
```bash
cd backend/session-service
npm run dev
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

---

## ✅ Verify Installation

### 1. Check Auth Service
```bash
curl http://localhost:8001/auth/health
```

Expected: `{"status":"healthy",...}`

### 2. Check Session Service
```bash
curl http://localhost:8002/health
```

Expected: `{"status":"healthy",...}`

### 3. Check Frontend
Open browser: http://localhost:3000

---

## 🧪 Testing the Application

### 1. Register a User
```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test@1234",
    "fullName": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test@1234"
  }'
```

Save the `accessToken` from response.

### 3. Create Session
```bash
curl -X POST http://localhost:8002/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "phoneNumber": "+1234567890",
    "sessionName": "My Test Session"
  }'
```

---

## 🌐 Frontend Usage Guide

### 1. Register Account
- Visit http://localhost:3000
- Click "Get Started" or "Register"
- Fill in registration form
- Submit

### 2. Login
- Go to http://localhost:3000/login
- Enter email/username and password
- Click "Sign In"

### 3. Create WhatsApp Session
- Click "Sessions" in sidebar
- Click "New Session"
- Enter phone number (international format: +1234567890)
- Enter session name
- Click "Create Session"

### 4. Scan QR Code
- QR code will be displayed
- Open WhatsApp on your phone
- Go to Settings → Linked Devices
- Tap "Link a Device"
- Scan the QR code
- Wait for connection

### 5. Session Management
- View all sessions in "Sessions" page
- Click "Details" to see session info
- Logout or delete sessions

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default JWT secrets
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS
- [ ] Set up proper CORS policies
- [ ] Add rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use secure password policies
- [ ] Implement proper logging
- [ ] Add input validation
- [ ] Set up monitoring

---

## 📝 Environment Variables

### Auth Service (.env)
```env
PORT=8001
MONGODB_URI=mongodb://localhost:27017/whatsapp_manager
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

### Session Service (.env)
```env
PORT=8002
MONGODB_URI=mongodb://localhost:27017/whatsapp_manager
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:8001
NEXT_PUBLIC_SESSION_SERVICE_URL=http://localhost:8002
NEXT_PUBLIC_WS_URL=http://localhost:8002
```

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution:** 
- Check if MongoDB is running: `sudo systemctl status mongodb`
- Verify connection string in .env
- Try: `mongodb://localhost:27017/whatsapp_manager`

### Issue 2: JWT Token Invalid
**Solution:**
- Ensure same JWT_SECRET in both services
- Check token expiration
- Re-login to get new token

### Issue 3: CORS Error
**Solution:**
- Check CORS configuration in services
- Verify frontend URL in CORS whitelist
- Clear browser cache

### Issue 4: QR Code Not Generating
**Solution:**
- Check session-service logs
- Verify session was created successfully
- Try refreshing the QR code
- Check WebSocket connection

### Issue 5: Port Already in Use
**Solution:**
```bash
# Find process using port
lsof -i :8001

# Kill process
kill -9 <PID>

# Or use different port in .env
```

---

## 📈 Next Steps

1. ✅ Setup Complete
2. ⏭️ Add Message Service
3. ⏭️ Add Campaigns Service
4. ⏭️ Add Chatbot Service
5. ⏭️ Add Analytics
6. ⏭️ Deploy to Production

---

## 🚀 Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend:**
```bash
cd frontend
vercel
```

**Backend:**
1. Push to GitHub
2. Connect to Railway
3. Deploy services individually

### Option 2: Docker

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  auth-service:
    build: ./backend/auth-service
    ports:
      - "8001:8001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/whatsapp_manager
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  session-service:
    build: ./backend/session-service
    ports:
      - "8002:8002"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/whatsapp_manager
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_AUTH_SERVICE_URL=http://auth-service:8001
      - NEXT_PUBLIC_SESSION_SERVICE_URL=http://session-service:8002
    depends_on:
      - auth-service
      - session-service

volumes:
  mongodb_data:
```

Deploy:
```bash
docker-compose up -d
```

---

## 📚 API Documentation

Full API documentation available in the provided artifacts:
- Auth Service API: See artifact #3
- Session Service API: See artifact #2

---

## 🎉 Congratulations!

Your WhatsApp Manager is now fully set up and running!

Visit: http://localhost:3000

Need help? Check the artifacts for detailed implementation files.