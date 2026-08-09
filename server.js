// ===========================
// Vehicle Booking System - Backend Server
// Node.js + Express + SQLite
// ===========================

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Initialize SQLite Database
const db = new sqlite3.Database('./bookings.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Create tables if they don't exist
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      requester_name TEXT NOT NULL,
      department TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      destination TEXT NOT NULL,
      purpose TEXT NOT NULL,
      passengers INTEGER DEFAULT 1,
      approval_code TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Database table initialized');
    }
  });
}

// ===========================
// API Endpoints
// ===========================

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const { vehicle, date } = req.query;
  
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];
  
  if (vehicle && vehicle !== 'all') {
    query += ' AND vehicle_type = ?';
    params.push(vehicle);
  }
  
  if (date) {
    query += ' AND booking_date = ?';
    params.push(date);
  }
  
  query += ' ORDER BY booking_date DESC, start_time DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json(row);
  });
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const {
    id,
    requesterName,
    department,
    vehicleType,
    bookingDate,
    startTime,
    endTime,
    destination,
    purpose,
    passengers,
    approvalCode,
    status,
    createdAt
  } = req.body;
  
  // Validate required fields
  if (!requesterName || !department || !vehicleType || !bookingDate || 
      !startTime || !endTime || !destination || !purpose) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  
  // Check for conflicts
  const conflictQuery = `
    SELECT * FROM bookings 
    WHERE vehicle_type = ? 
    AND booking_date = ? 
    AND (
      (start_time < ? AND end_time > ?) OR
      (start_time < ? AND end_time > ?) OR
      (start_time >= ? AND end_time <= ?)
    )
  `;
  
  db.get(conflictQuery, [
    vehicleType, bookingDate,
    endTime, startTime,
    endTime, startTime,
    startTime, endTime
  ], (err, conflict) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (conflict) {
      res.status(409).json({ 
        error: 'Booking conflict exists',
        conflict: conflict 
      });
      return;
    }
    
    // Insert new booking
    const insertQuery = `
      INSERT INTO bookings (
        id, requester_name, department, vehicle_type, booking_date,
        start_time, end_time, destination, purpose, passengers,
        approval_code, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      id,
      requesterName,
      department,
      vehicleType,
      bookingDate,
      startTime,
      endTime,
      destination,
      purpose,
      passengers || 1,
      approvalCode || 'N/A',
      status || 'confirmed',
      createdAt
    ], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        message: 'Booking created successfully',
        id: id
      });
    });
  });
});

// Update a booking
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }
  
  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      res.json({ message: 'Booking updated successfully' });
    }
  );
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted successfully' });
  });
});

// Get statistics for today (IST)
app.get('/api/statistics/today', (req, res) => {
  // Get today's date in IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const todayIST = istTime.toISOString().split('T')[0];
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM bookings WHERE booking_date = ?',
    staffCars: `SELECT COUNT(*) as count FROM bookings 
                WHERE booking_date = ? 
                AND (vehicle_type = 'Staff Car 1' OR vehicle_type = 'Staff Car 2')`,
    ambulance: `SELECT COUNT(*) as count FROM bookings 
                WHERE booking_date = ? 
                AND vehicle_type = 'Ambulance'`
  };
  
  const stats = {};
  let completed = 0;
  
  Object.keys(queries).forEach(key => {
    db.get(queries[key], [todayIST], (err, row) => {
      if (err) {
        console.error('Error fetching statistics:', err.message);
        stats[key] = 0;
      } else {
        stats[key] = row.count;
      }
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json(stats);
      }
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Serve the main HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'modern-index.html'));
});

app.get('/classic', (req, res) => {
  res.sendFile(path.join(__dirname, 'vehicle-booking-register-4.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
