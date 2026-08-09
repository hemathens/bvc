# 🚀 Deployment Guide - BVC-KU Vehicle Booking System

## 📌 Important Reference Numbers
- **HOD Approval:** 1122
- **Transport Office:** 2580
- **Principal's Office:** 1947

---

## 🎯 Choose Your Deployment Path

### Path A: Simple Static Deployment (No Database)
**Time:** 5 minutes  
**Complexity:** Easy  
**Best for:** Testing, demo, small teams

### Path B: Full Backend with Database
**Time:** 15-30 minutes  
**Complexity:** Medium  
**Best for:** Production use, multiple users

---

## 📍 PATH A: Static Deployment

### Step 1: Files Required
```
vehicle-booking-register-4.html
styles.css
app.js
```

### Step 2: Deployment Options

#### Option A1: GitHub Pages (Free)
```bash
# 1. Create GitHub repository
git init
git add vehicle-booking-register-4.html styles.css app.js
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vehicle-booking.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to repository Settings → Pages → Select "main" branch → Save
# Your site will be at: https://YOUR_USERNAME.github.io/vehicle-booking/vehicle-booking-register-4.html
```

#### Option A2: Netlify (Free)
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy --prod

# Follow prompts to deploy
```

#### Option A3: Simple File Server
```bash
# Just open the file
# Double-click: vehicle-booking-register-4.html
# Or use Python:
python -m http.server 8000
# Then open: http://localhost:8000/vehicle-booking-register-4.html
```

**⚠️ Limitation:** Data stored in browser only. Not shared across devices/browsers.

---

## 📍 PATH B: Full Backend Deployment

### Step 1: Prerequisites Check
```bash
# Check Node.js (need 14+)
node --version

# If not installed, download from: https://nodejs.org/
```

### Step 2: Prepare Files

**Update HTML to use backend version:**
```html
<!-- In vehicle-booking-register-4.html, change line: -->
<script src="app.js"></script>
<!-- To: -->
<script src="app-with-api.js"></script>
```

### Step 3: Local Setup
```bash
# Navigate to project folder
cd d:\Hem\kkdeployment

# Install dependencies
npm install

# Start server
npm start

# Test in browser
# Open: http://localhost:3000
```

### Step 4: Production Deployment

#### Option B1: Railway (Easiest, Free tier available)

1. **Create account:** https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. Railway auto-detects Node.js and deploys
4. Your app URL: `https://your-app.railway.app`

**Or via CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Option B2: Heroku (Popular)

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create bvc-ku-vehicle-booking

# 4. Deploy
git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 5. Open app
heroku open
```

#### Option B3: DigitalOcean (More control)

```bash
# 1. Create Droplet (Ubuntu 22.04)
# 2. SSH into server
ssh root@your_server_ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Upload files (use SFTP or git clone)
git clone YOUR_REPO_URL
cd YOUR_REPO_NAME

# 6. Install dependencies
npm install

# 7. Start with PM2
pm2 start server.js --name vehicle-booking
pm2 save
pm2 startup

# 8. Configure Nginx (optional, for custom domain)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/vehicle-booking

# Add this config:
server {
    listen 80;
    server_name your_domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/vehicle-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option B4: AWS EC2 (Enterprise)

```bash
# 1. Launch EC2 instance (Amazon Linux 2 or Ubuntu)
# 2. Configure Security Group (allow ports 22, 80, 443, 3000)
# 3. Connect via SSH
ssh -i your-key.pem ec2-user@your-instance-ip

# 4. Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 5. Clone repository
git clone YOUR_REPO_URL
cd YOUR_REPO_NAME

# 6. Install dependencies
npm install

# 7. Use PM2
sudo npm install -g pm2
pm2 start server.js
pm2 startup
pm2 save

# 8. Configure domain (optional)
# Use Route 53 for DNS, ALB for load balancing
```

#### Option B5: Vercel (For Next.js conversion)

If you want serverless deployment, convert to Next.js:
```bash
npx create-next-app vehicle-booking --use-npm
# Move files and adapt code
vercel deploy
```

---

## 🗄️ Database Upgrade Path

### Current: SQLite (included)
- ✅ Zero configuration
- ✅ Perfect for single server
- ⚠️ Limited concurrent writes

### Upgrade to PostgreSQL (recommended for production)

**Step 1: Install PostgreSQL**
```bash
# Local
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql

# Or use cloud:
# - Heroku Postgres (free tier)
# - AWS RDS
# - DigitalOcean Managed Database
# - Supabase (free tier)
```

**Step 2: Update package.json**
```bash
npm install pg
```

**Step 3: Update server.js**
```javascript
// Replace SQLite code with:
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/vehicle_booking',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Update all db.run/db.get/db.all to use pool.query
// Example:
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY booking_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Step 4: Create tables**
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
CREATE INDEX idx_status ON bookings(status);
```

---

## 🔒 Security Hardening

### 1. Add Authentication
```bash
npm install express-session passport passport-local bcrypt
```

### 2. Enable HTTPS
```bash
# Use Let's Encrypt (free SSL)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Environment Variables
Create `.env` file:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your_random_secret_key_here
ALLOWED_ORIGINS=https://your-domain.com
```

Load in server.js:
```javascript
require('dotenv').config();
```

### 4. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring & Logging

### Option 1: PM2 Built-in Monitoring
```bash
pm2 monit
pm2 logs
pm2 list
```

### Option 2: External Services
- **Sentry** (error tracking)
- **LogRocket** (session replay)
- **DataDog** (full monitoring)
- **New Relic** (performance monitoring)

---

## 🔄 Backup Strategy

### SQLite Backup
```bash
# Automated daily backup
crontab -e

# Add this line (runs at 2 AM daily):
0 2 * * * cp /path/to/bookings.db /path/to/backups/bookings-$(date +\%Y\%m\%d).db
```

### PostgreSQL Backup
```bash
# Daily backup
pg_dump vehicle_booking > backup.sql

# Automated:
crontab -e
0 2 * * * pg_dump vehicle_booking > /backups/vehicle_booking-$(date +\%Y\%m\%d).sql
```

---

## ✅ Pre-Launch Checklist

- [ ] Test all forms and validations
- [ ] Verify IST timezone is correct
- [ ] Test booking conflict detection
- [ ] Test on mobile devices
- [ ] Check statistics are accurate
- [ ] Test filter functionality
- [ ] Verify database backups work
- [ ] Set up monitoring/alerts
- [ ] Configure domain and SSL
- [ ] Add authentication (if needed)
- [ ] Load test with multiple users
- [ ] Create user documentation
- [ ] Train administrators
- [ ] Plan maintenance window

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module 'express'"
```bash
Solution: npm install
```

### Issue: "Port 3000 already in use"
```bash
Solution: Change PORT in server.js or:
lsof -ti:3000 | xargs kill -9
```

### Issue: Database locked
```bash
Solution: SQLite limitation. Upgrade to PostgreSQL for concurrent writes
```

### Issue: Wrong timezone showing
```bash
Solution: Verify IST offset (5.5 hours) in app.js
```

### Issue: Bookings not persisting
```bash
Solution: Check localStorage is enabled OR backend is running
```

---

## 📞 Support Contacts

- HOD Approval: **1122**
- Transport Office: **2580**
- Principal's Office: **1947**

---

## 🎓 Recommended Learning Path

1. **Week 1:** Deploy static version, test with users
2. **Week 2:** Set up backend locally, test API
3. **Week 3:** Deploy to cloud (Railway/Heroku)
4. **Week 4:** Add authentication and monitoring
5. **Week 5:** Migrate to PostgreSQL if needed
6. **Week 6:** Full production launch

---

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/guide)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)

---

**Last Updated:** August 8, 2026  
**Version:** 1.0.0  
**System:** BVC-KU Vehicle Booking Register
