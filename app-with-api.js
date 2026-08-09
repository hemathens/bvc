// ===========================
// Vehicle Booking System with Backend API
// IST (Indian Standard Time) Support
// ===========================

class BookingSystem {
  constructor() {
    // Configuration: Set to true to use backend API, false for localStorage
    this.useBackend = this.detectBackend();
    this.apiUrl = 'http://localhost:3000/api';
    this.bookings = [];
    this.init();
  }

  // Detect if backend is available
  async detectBackend() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return response.ok;
    } catch (error) {
      console.log('Backend not available, using localStorage');
      return false;
    }
  }

  // Get current date in IST timezone
  getTodayIST() {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    return istTime.toISOString().split('T')[0];
  }

  // Get current IST datetime
  getCurrentISTDateTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
  }

  // Initialize the application
  async init() {
    this.useBackend = await this.detectBackend();
    console.log(`Using ${this.useBackend ? 'Backend API' : 'LocalStorage'} for data storage`);
    
    if (!this.useBackend) {
      this.bookings = this.loadBookings();
    }
    
    this.setupEventListeners();
    this.setMinDate();
    await this.renderBookings();
    await this.updateStatistics();
    
    // Set default filter date to today (IST)
    const todayIST = this.getTodayIST();
    document.getElementById('filterDate').value = todayIST;
    
    // Display current IST time in header
    this.displayCurrentTime();
    setInterval(() => this.displayCurrentTime(), 60000);
  }

  // Display current IST time
  displayCurrentTime() {
    const currentTime = this.getCurrentISTDateTime();
    const timeString = currentTime.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    const dateString = currentTime.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    
    let timeDisplay = document.getElementById('currentTimeDisplay');
    if (!timeDisplay) {
      timeDisplay = document.createElement('div');
      timeDisplay.id = 'currentTimeDisplay';
      timeDisplay.style.cssText = 'margin-top: 10px; font-size: 14px; opacity: 0.9;';
      document.querySelector('.approval-refs').insertAdjacentElement('afterend', timeDisplay);
    }
    timeDisplay.innerHTML = `<strong>Current Time (IST):</strong> ${dateString}, ${timeString}`;
  }

  // Set minimum date to today (IST)
  setMinDate() {
    const todayIST = this.getTodayIST();
    document.getElementById('bookingDate').setAttribute('min', todayIST);
  }

  // Setup event listeners
  setupEventListeners() {
    document.getElementById('bookingForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e);
    });

    document.getElementById('filterVehicle').addEventListener('change', () => {
      this.renderBookings();
    });

    document.getElementById('filterDate').addEventListener('change', () => {
      this.renderBookings();
    });

    this.setupFormValidation();
  }

  setupFormValidation() {
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');

    endTime.addEventListener('change', () => {
      if (startTime.value && endTime.value) {
        if (endTime.value <= startTime.value) {
          endTime.setCustomValidity('End time must be after start time');
        } else {
          endTime.setCustomValidity('');
        }
      }
    });

    startTime.addEventListener('change', () => {
      if (startTime.value && endTime.value) {
        if (endTime.value <= startTime.value) {
          endTime.setCustomValidity('End time must be after start time');
        } else {
          endTime.setCustomValidity('');
        }
      }
    });
  }

  // Handle form submission
  async handleFormSubmit(e) {
    const formData = new FormData(e.target);
    const booking = {
      id: this.generateId(),
      requesterName: formData.get('requesterName'),
      department: formData.get('department'),
      vehicleType: formData.get('vehicleType'),
      bookingDate: formData.get('bookingDate'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      destination: formData.get('destination'),
      purpose: formData.get('purpose'),
      passengers: formData.get('passengers'),
      approvalCode: formData.get('approvalCode') || 'N/A',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    try {
      if (this.useBackend) {
        await this.createBookingAPI(booking);
      } else {
        if (this.checkConflict(booking)) {
          if (!confirm('Warning: This vehicle is already booked during this time period. Do you want to proceed anyway?')) {
            return;
          }
        }
        this.bookings.push(booking);
        this.saveBookings();
      }

      await this.renderBookings();
      await this.updateStatistics();
      this.showNotification('Booking created successfully!', 'success');
      e.target.reset();
    } catch (error) {
      if (error.message.includes('conflict')) {
        if (confirm('Warning: This vehicle is already booked during this time period. Do you want to proceed anyway?')) {
          // User confirmed, could implement override logic here
        }
      } else {
        this.showNotification('Error creating booking: ' + error.message, 'error');
      }
    }
  }

  // API Methods
  async createBookingAPI(booking) {
    const response = await fetch(`${this.apiUrl}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return await response.json();
  }

  async fetchBookingsAPI(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.apiUrl}/bookings?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return await response.json();
  }

  async deleteBookingAPI(id) {
    const response = await fetch(`${this.apiUrl}/bookings/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete booking');
    }

    return await response.json();
  }

  async fetchStatisticsAPI() {
    const response = await fetch(`${this.apiUrl}/statistics/today`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  }

  // Check for booking conflicts (localStorage only)
  checkConflict(newBooking) {
    return this.bookings.some(booking => {
      if (booking.vehicleType !== newBooking.vehicleType) return false;
      if (booking.bookingDate !== newBooking.bookingDate) return false;
      
      const existingStart = booking.startTime;
      const existingEnd = booking.endTime;
      const newStart = newBooking.startTime;
      const newEnd = newBooking.endTime;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  generateId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Render bookings list
  async renderBookings() {
    const container = document.getElementById('bookingsList');
    const filterVehicle = document.getElementById('filterVehicle').value;
    const filterDate = document.getElementById('filterDate').value;

    let filteredBookings;

    try {
      if (this.useBackend) {
        const filters = {};
        if (filterVehicle !== 'all') filters.vehicle = filterVehicle;
        if (filterDate) filters.date = filterDate;
        
        const apiBookings = await this.fetchBookingsAPI(filters);
        // Convert snake_case from API to camelCase for frontend
        filteredBookings = apiBookings.map(b => ({
          id: b.id,
          requesterName: b.requester_name,
          department: b.department,
          vehicleType: b.vehicle_type,
          bookingDate: b.booking_date,
          startTime: b.start_time,
          endTime: b.end_time,
          destination: b.destination,
          purpose: b.purpose,
          passengers: b.passengers,
          approvalCode: b.approval_code,
          status: b.status,
          createdAt: b.created_at
        }));
      } else {
        filteredBookings = this.bookings;

        if (filterVehicle !== 'all') {
          filteredBookings = filteredBookings.filter(b => b.vehicleType === filterVehicle);
        }

        if (filterDate) {
          filteredBookings = filteredBookings.filter(b => b.bookingDate === filterDate);
        }

        filteredBookings.sort((a, b) => {
          const dateCompare = new Date(b.bookingDate) - new Date(a.bookingDate);
          if (dateCompare !== 0) return dateCompare;
          return b.startTime.localeCompare(a.startTime);
        });
      }

      if (filteredBookings.length === 0) {
        container.innerHTML = '<div class="no-bookings-message">No bookings found matching the selected filters.</div>';
        return;
      }

      container.innerHTML = filteredBookings.map(booking => this.createBookingCard(booking)).join('');

      container.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const bookingId = e.target.dataset.id;
          this.deleteBooking(bookingId);
        });
      });
    } catch (error) {
      console.error('Error rendering bookings:', error);
      container.innerHTML = '<div class="no-bookings-message">Error loading bookings. Please try again.</div>';
    }
  }

  createBookingCard(booking) {
    const formattedDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="booking-card">
        <div class="booking-header">
          <div class="booking-vehicle">${booking.vehicleType}</div>
          <div class="booking-status status-${booking.status}">${booking.status}</div>
        </div>
        <div class="booking-details">
          <div class="booking-detail">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value">${booking.id}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Requester</span>
            <span class="detail-value">${booking.requesterName}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Department</span>
            <span class="detail-value">${booking.department}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Date</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Time</span>
            <span class="detail-value">${this.formatTime(booking.startTime)} - ${this.formatTime(booking.endTime)}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Destination</span>
            <span class="detail-value">${booking.destination}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Purpose</span>
            <span class="detail-value">${booking.purpose}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Passengers</span>
            <span class="detail-value">${booking.passengers}</span>
          </div>
          <div class="booking-detail">
            <span class="detail-label">Approval Code</span>
            <span class="detail-value">${booking.approvalCode}</span>
          </div>
        </div>
        <div class="booking-actions">
          <button class="btn btn-danger" data-id="${booking.id}">Cancel Booking</button>
        </div>
      </div>
    `;
  }

  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  async deleteBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      if (this.useBackend) {
        await this.deleteBookingAPI(id);
      } else {
        this.bookings = this.bookings.filter(b => b.id !== id);
        this.saveBookings();
      }

      await this.renderBookings();
      await this.updateStatistics();
      this.showNotification('Booking cancelled successfully!', 'success');
    } catch (error) {
      this.showNotification('Error cancelling booking: ' + error.message, 'error');
    }
  }

  // Update statistics (IST-based)
  async updateStatistics() {
    try {
      let totalBookings, staffCarBookings, ambulanceBookings;

      if (this.useBackend) {
        const stats = await this.fetchStatisticsAPI();
        totalBookings = stats.total;
        staffCarBookings = stats.staffCars;
        ambulanceBookings = stats.ambulance;
      } else {
        const todayIST = this.getTodayIST();
        const todayBookings = this.bookings.filter(b => b.bookingDate === todayIST);

        totalBookings = todayBookings.length;
        staffCarBookings = todayBookings.filter(b => 
          b.vehicleType === 'Staff Car 1' || b.vehicleType === 'Staff Car 2'
        ).length;
        ambulanceBookings = todayBookings.filter(b => 
          b.vehicleType === 'Ambulance'
        ).length;
      }

      document.getElementById('totalBookings').textContent = totalBookings;
      document.getElementById('staffCarBookings').textContent = staffCarBookings;
      document.getElementById('ambulanceBookings').textContent = ambulanceBookings;
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 3000);
  }

  // LocalStorage methods
  saveBookings() {
    try {
      localStorage.setItem('vehicleBookings', JSON.stringify(this.bookings));
    } catch (e) {
      console.error('Error saving bookings:', e);
      this.showNotification('Error saving booking data', 'error');
    }
  }

  loadBookings() {
    try {
      const saved = localStorage.getItem('vehicleBookings');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading bookings:', e);
      return [];
    }
  }
}

// Initialize the booking system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new BookingSystem();
});
