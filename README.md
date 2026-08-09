# BVC-KU Transport & Ambulance Booking System

## 📋 Overview

Modern, production-ready vehicle booking system for BVC-KU with IST timezone support.

**Approval Reference Numbers:**
- HOD Approval: **1122**
- Transport Office: **2580**
- Principal's Office: **1947**

## 🚀 Features

✅ Modern HTML5 responsive design  
✅ Mobile-friendly interface  
✅ IST (Indian Standard Time) timezone handling  
✅ Real-time booking conflict detection  
✅ Today's statistics dashboard  
✅ Filter by vehicle type and date  
✅ Dual storage: LocalStorage + Backend API  
✅ Production-ready with SQLite database  

## 📦 Deployment Options

### Option 1: Static Hosting (No Backend)

**Best for:** Quick demo, offline use, small teams

**Files needed:**
- `vehicle-booking-register-4.html`
- `styles.css`
- `app.js` (uses LocalStorage)

**Deploy to:**
- GitHub Pages
- Netlify
- Vercel
- Any static file hosting

**Steps:**
1. Upload the three files above
2. Open `vehicle-booking-register-4.html` in browser
3. Data stored in browser's LocalStorage

**Limitations:**
- Data is browser-specific (not shared across devices)
- No central database
- Limited to single browser usage

---

### Option 2: Backend with SQLite (Recommended)

**Best for:** Single server deployment, small to medium teams

**Files needed:**
- `vehicle-booking-register-4.html`
- `styles.css`
- `app-with-api.js` (rename to `app.js` OR change HTML script tag)
- `server.js`
- `package.json`

**Requirements:**
- Node.js 14+ installed
- npm or yarn

**Setup Steps:**

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# http://localhost:3000
```

**For Production:**
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "vehicle-booking"
pm2 save
pm2 startup
```

**Database:** SQLite file (`bookings.db`) created automatically

---

### Option 3: Backend with PostgreSQL/MySQL (Enterprise)

**Best for:** Large organizations, multi-server deployments

**Upgrade Steps:**

1. Install database client:
```bash
# For PostgreSQL
npm install pg

# For MySQL
npm install mysql2
```

2. Update `server.js` database connection:

```javascript
// PostgreSQL Example
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'vehicle_booking',
  user: 'your_user',
  password: 'your_password'
});

// MySQL Example
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'vehicle_booking'
});
```

3. Create database schema:

```sql
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  requester_name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT NOT NULL,
  passengers INTEGER DEFAULT 1,
  approval_code VARCHAR(50),
  status VARCHAR(20) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_booking_date ON bookings(booking_date);
CREATE INDEX idx_vehicle_type ON bookings(vehicle_type);
```

---

## 🌐 Cloud Deployment Options

### Heroku
```bash
# 1. Create Procfile
echo "web: node server.js" > Procfile

# 2. Deploy
heroku create bvc-ku-booking
git push heroku main
```

### AWS EC2
```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 3. Clone/upload files
# 4. Install dependencies
npm install

# 5. Start with PM2
npm install -g pm2
pm2 start server.js
```

### DigitalOcean App Platform
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set run command: `npm start`
4. Deploy

### Railway
1. Connect repository
2. Railway auto-detects Node.js
3. Deploy automatically

---

## 🔧 Configuration

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

### API URL (for frontend)
Edit `app-with-api.js`:
```javascript
this.apiUrl = 'http://your-domain.com/api'; // Change URL
```

### Environment Variables
Create `.env` file:
```
PORT=3000
NODE_ENV=production
DATABASE_URL=your_database_url
```

Install dotenv:
```bash
npm install dotenv
```

Add to `server.js`:
```javascript
require('dotenv').config();
```

---

## 📱 IST Timezone Configuration

The system automatically handles IST (UTC+5:30):

- All dates/times displayed in IST
- "Today's Statistics" based on IST date
- Current time clock shows IST
- Date picker minimum set to today (IST)

**Manual timezone adjustment** (if needed):
Edit `app.js` or `app-with-api.js`:
```javascript
// Change IST offset (currently 5.5 hours)
const istOffset = 5.5 * 60 * 60 * 1000; // Modify 5.5 for different timezone
```

---

## 🧪 Testing

### Test LocalStorage Version
1. Open `vehicle-booking-register-4.html` directly in browser
2. Create a booking
3. Refresh page - booking should persist

### Test Backend Version
```bash
# Start server
npm start

# Test API health
curl http://localhost:3000/api/health

# Create test booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TEST123",
    "requesterName": "Test User",
    "department": "HOD",
    "vehicleType": "Staff Car 1",
    "bookingDate": "2026-08-10",
    "startTime": "10:00",
    "endTime": "12:00",
    "destination": "City Hospital",
    "purpose": "Medical supplies",
    "passengers": 2,
    "approvalCode": "1122",
    "status": "confirmed",
    "createdAt": "2026-08-08T10:00:00Z"
  }'

# Get all bookings
curl http://localhost:3000/api/bookings

# Get today's statistics
curl http://localhost:3000/api/statistics/today
```

---

## 📊 API Documentation

### Endpoints

**GET** `/api/health`  
Health check

**GET** `/api/bookings?vehicle={type}&date={YYYY-MM-DD}`  
Get all bookings (with optional filters)

**GET** `/api/bookings/:id`  
Get single booking by ID

**POST** `/api/bookings`  
Create new booking

**PUT** `/api/bookings/:id`  
Update booking status

**DELETE** `/api/bookings/:id`  
Delete booking

**GET** `/api/statistics/today`  
Get today's statistics (IST)

---

## 🔒 Security Recommendations

1. **Add Authentication:**
```bash
npm install express-session passport
```

2. **Add HTTPS:**
```bash
npm install helmet
```

3. **Rate Limiting:**
```bash
npm install express-rate-limit
```

4. **Input Validation:**
```bash
npm install express-validator
```

5. **CORS Configuration:**
Edit `server.js`:
```javascript
app.use(cors({
  origin: 'https://your-domain.com'
}));
```

---

## 🐛 Troubleshooting

**Issue:** Backend not connecting  
**Solution:** Check if port 3000 is available, try different port

**Issue:** Bookings not saving  
**Solution:** Check browser console for errors, verify localStorage is enabled

**Issue:** Wrong timezone showing  
**Solution:** Verify IST offset in code (5.5 hours)

**Issue:** Database locked (SQLite)  
**Solution:** Only one write at a time, or upgrade to PostgreSQL

---

## 📞 Support

For issues, contact:
- HOD Approval: 1122
- Transport Office: 2580
- Principal's Office: 1947

---

## 📄 License

MIT License - BVC-KU Internal Use

---

## 🎯 Quick Start Summary

**For Demo/Testing:**
```bash
# Just open in browser
vehicle-booking-register-4.html
```

**For Production:**
```bash
npm install
npm start
# Open http://localhost:3000
```

**For Cloud Deployment:**
1. Choose cloud provider (Heroku/AWS/Railway/etc.)
2. Push code to repository
3. Configure environment variables
4. Deploy

---

## ✅ Deployment Checklist

- [ ] Choose deployment option (Static/SQLite/PostgreSQL)
- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Test locally (`npm start`)
- [ ] Set up database (if using backend)
- [ ] Configure domain/hosting
- [ ] Enable HTTPS
- [ ] Add authentication (if needed)
- [ ] Set up backups (for production database)
- [ ] Configure monitoring/logging
- [ ] Test all features
- [ ] Train users
- [ ] Go live!
#   b v c  
 #   b v c  
 