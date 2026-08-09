// BVC-KU Transport System - Modern Frontend with Backend Integration
class ModernTransportApp {
    constructor() {
        this.currentPage = 'home';
        this.useBackend = false;
        this.apiUrl = 'http://localhost:3000/api';
        this.bookings = [];
        this.init();
    }

    async init() {
        this.useBackend = await this.detectBackend();
        console.log(`Mode: ${this.useBackend ? 'Backend API' : 'LocalStorage'}`);
        
        if (!this.useBackend) {
            this.bookings = this.loadFromStorage();
        }
        
        this.setupClock();
        this.setupNavigation();
        
        const hash = window.location.hash.slice(1) || 'home';
        this.loadPage(hash);
    }

    async detectBackend() {
        try {
            const response = await fetch(`${this.apiUrl}/health`, { signal: AbortSignal.timeout(2000) });
            return response.ok;
        } catch {
            return false;
        }
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const ist = new Date(now.getTime() + istOffset);
            const timeString = ist.toISOString().slice(11, 19);
            
            // Mobile clock
            const mobileClock = document.getElementById('ist-clock');
            if (mobileClock) {
                mobileClock.textContent = timeString + ' IST';
            }
            
            // Desktop clock
            const desktopClock = document.getElementById('desktop-clock');
            if (desktopClock) {
                const options = {timeZone:'Asia/Kolkata', hour12:true, hour:'numeric', minute:'numeric'};
                const time = new Intl.DateTimeFormat('en-US', options).format(new Date());
                desktopClock.textContent = 'IST ' + time;
            }
        };
        setInterval(updateClock, 1000);
        updateClock();
    }

    setupNavigation() {
        // Mobile navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                window.location.hash = page;
                this.loadPage(page);
            });
        });

        // Desktop navigation
        document.querySelectorAll('.desktop-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                window.location.hash = page;
                this.loadPage(page);
            });
        });

        window.addEventListener('hashchange', () => {
            this.loadPage(window.location.hash.slice(1) || 'home');
        });
    }

    loadPage(page) {
        this.currentPage = page;
        
        // Update mobile nav
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('text-primary-container', 'font-semibold');
            } else {
                link.classList.remove('text-primary-container', 'font-semibold');
            }
        });

        // Update desktop nav
        document.querySelectorAll('.desktop-nav-link').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');
                link.classList.remove('text-on-surface-variant');
            } else {
                link.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold');
                link.classList.add('text-on-surface-variant');
            }
        });

        const content = document.getElementById('app-content');
        
        switch(page) {
            case 'book':
                this.renderBookingPage(content);
                break;
            case 'dashboard':
                this.renderDashboard(content);
                break;
            case 'bookings':
                this.renderBookingsList(content);
                break;
            default:
                this.renderHome(content);
        }
    }

    getTodayIST() {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const ist = new Date(now.getTime() + istOffset);
        return ist.toISOString().split('T')[0];
    }

    renderHome(container) {
        container.innerHTML = `
<div class="flex flex-col w-full gap-section-gap px-md pb-md">
    <section class="flex flex-col gap-lg pt-xl">
        <div class="flex flex-col gap-xs">
            <h1 class="font-display-lg text-display-lg text-primary">Efficient Transport<br/>for BVC-KU</h1>
            <p class="font-body-lg text-body-lg text-on-surface-variant max-w-sm">Manage institutional vehicles and medical transport with ease.</p>
        </div>
        <div class="grid grid-cols-2 gap-md">
            <button onclick="app.loadPage('book')" class="bg-primary-container text-on-primary-container rounded-xl py-md px-lg font-label-md text-label-md flex flex-col items-center justify-center gap-sm shadow-md transition-transform hover:-translate-y-1 active:translate-y-0">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add_circle</span>
                <span>Book a Vehicle</span>
            </button>
            <button onclick="app.loadPage('bookings')" class="bg-surface-container-high text-on-surface rounded-xl py-md px-lg font-label-md text-label-md flex flex-col items-center justify-center gap-sm shadow-sm transition-transform hover:-translate-y-1 active:translate-y-0">
                <span class="material-symbols-outlined">history</span>
                <span>View My Bookings</span>
            </button>
        </div>
    </section>
    <section class="flex flex-col gap-md">
        <h2 class="font-title-md text-title-md text-on-surface">Live Status</h2>
        <div class="flex flex-col gap-sm">
            <div class="bg-surface-container rounded-xl p-card-padding flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-md">
                    <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">directions_car</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="font-label-sm text-label-sm text-on-surface-variant">Staff Cars Available</span>
                        <span class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">2</span>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="font-label-sm text-label-sm text-on-surface-variant">Total Today</span>
                    <span class="font-title-md text-title-md text-on-surface" id="today-total">0</span>
                </div>
            </div>
            <div class="bg-error-container text-on-error-container rounded-xl p-card-padding flex items-center gap-md shadow-sm">
                <div class="w-10 h-10 rounded-full bg-on-error-container/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-error" style="font-variation-settings: 'FILL' 1;">emergency</span>
                </div>
                <div class="flex flex-col">
                    <span class="font-label-sm text-label-sm opacity-80">Ambulance Status</span>
                    <span class="font-title-md text-title-md">1 Available</span>
                </div>
            </div>
        </div>
    </section>
    <section class="flex flex-col gap-md">
        <div class="flex items-center justify-between">
            <h2 class="font-title-md text-title-md text-on-surface">Approval References</h2>
            <span class="material-symbols-outlined text-on-surface-variant">info</span>
        </div>
        <div class="bg-surface-container rounded-xl p-xs shadow-sm flex flex-col">
            <div class="flex items-center justify-between p-md bg-surface rounded-lg mb-[2px]">
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary-container">person</span>
                    <span class="font-body-md text-body-md text-on-surface">HOD</span>
                </div>
                <span class="font-label-md text-label-md text-on-surface-variant tabular-nums">1122</span>
            </div>
            <div class="flex items-center justify-between p-md bg-surface rounded-lg mb-[2px]">
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary-container">local_shipping</span>
                    <span class="font-body-md text-body-md text-on-surface">Transport</span>
                </div>
                <span class="font-label-md text-label-md text-on-surface-variant tabular-nums">2580</span>
            </div>
            <div class="flex items-center justify-between p-md bg-surface rounded-lg">
                <div class="flex items-center gap-sm">
                    <span class="material-symbols-outlined text-primary-container">account_balance</span>
                    <span class="font-body-md text-body-md text-on-surface">Principal</span>
                </div>
                <span class="font-label-md text-label-md text-on-surface-variant tabular-nums">1947</span>
            </div>
        </div>
    </section>
</div>
        `;
        
        this.updateHomeStats();
    }

    async updateHomeStats() {
        const today = this.getTodayIST();
        let todayBookings = [];
        
        if (this.useBackend) {
            try {
                const response = await fetch(`${this.apiUrl}/bookings?date=${today}`);
                todayBookings = await response.json();
            } catch (e) {
                console.error('Error fetching stats:', e);
            }
        } else {
            todayBookings = this.bookings.filter(b => b.bookingDate === today);
        }
        
        const totalEl = document.getElementById('today-total');
        if (totalEl) {
            totalEl.textContent = todayBookings.length;
        }
    }


    renderBookingPage(container) {
        const today = this.getTodayIST();
        container.innerHTML = `
<div class="flex flex-col w-full pb-20">
    <div class="px-md py-lg flex flex-col gap-sm">
        <h1 class="font-headline-lg-mobile text-on-surface">Book a Vehicle</h1>
        <p class="font-body-md text-on-surface-variant">Complete the details below to request a transport vehicle.</p>
    </div>
    <form class="flex flex-col gap-lg px-md" id="booking-form">
        <div class="sticky top-16 z-40 bg-primary-container text-on-primary-container rounded-lg p-md flex items-start gap-sm shadow-md mb-md">
            <span class="material-symbols-outlined mt-xs">info</span>
            <p class="font-label-md">End time must be after start time. Dates are in IST.</p>
        </div>
        
        <section class="bg-surface-container rounded-xl p-card-padding flex flex-col gap-md shadow-sm">
            <h2 class="font-title-md text-on-surface flex items-center gap-sm">
                <span class="material-symbols-outlined text-primary-container">person</span>
                Requester Details
            </h2>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant" for="requesterName">Requester Name *</label>
                <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="requesterName" name="requesterName" placeholder="Enter full name" required type="text"/>
            </div>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant" for="department">Department *</label>
                <select class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="department" name="department" required>
                    <option value="">Select department</option>
                    <option value="HOD">HOD</option>
                    <option value="Transport Office">Transport Office</option>
                    <option value="Principal's Office">Principal's Office</option>
                    <option value="Administration">Administration</option>
                    <option value="Academic">Academic</option>
                    <option value="Medical">Medical</option>
                </select>
            </div>
        </section>
        
        <section class="bg-surface-container rounded-xl p-card-padding flex flex-col gap-md shadow-sm">
            <h2 class="font-title-md text-on-surface flex items-center gap-sm">
                <span class="material-symbols-outlined text-secondary">directions_car</span>
                Trip Details
            </h2>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant">Vehicle Type *</label>
                <div class="grid grid-cols-1 gap-sm">
                    <label class="flex items-center p-md bg-surface-container-lowest rounded-lg outline outline-1 outline-outline-variant cursor-pointer has-[:checked]:outline-secondary has-[:checked]:outline-2">
                        <input class="peer sr-only" name="vehicleType" required type="radio" value="Staff Car 1"/>
                        <div class="flex flex-col flex-1 ml-sm">
                            <span class="font-label-md text-on-surface">Staff Car 1</span>
                            <span class="font-label-sm text-on-surface-variant">Standard sedan (Max 4 pax)</span>
                        </div>
                        <span class="material-symbols-outlined text-outline peer-checked:text-secondary opacity-0 peer-checked:opacity-100">check_circle</span>
                    </label>
                    <label class="flex items-center p-md bg-surface-container-lowest rounded-lg outline outline-1 outline-outline-variant cursor-pointer has-[:checked]:outline-secondary has-[:checked]:outline-2">
                        <input class="peer sr-only" name="vehicleType" type="radio" value="Staff Car 2"/>
                        <div class="flex flex-col flex-1 ml-sm">
                            <span class="font-label-md text-on-surface">Staff Car 2</span>
                            <span class="font-label-sm text-on-surface-variant">SUV (Max 6 pax)</span>
                        </div>
                        <span class="material-symbols-outlined text-outline peer-checked:text-secondary opacity-0 peer-checked:opacity-100">check_circle</span>
                    </label>
                    <label class="flex items-center p-md bg-surface-container-lowest rounded-lg outline outline-1 outline-outline-variant cursor-pointer has-[:checked]:outline-secondary has-[:checked]:outline-2">
                        <input class="peer sr-only" name="vehicleType" type="radio" value="Ambulance"/>
                        <div class="flex flex-col flex-1 ml-sm">
                            <span class="font-label-md text-on-surface">Ambulance</span>
                            <span class="font-label-sm text-error font-semibold">Medical emergency only</span>
                        </div>
                        <span class="material-symbols-outlined text-outline peer-checked:text-secondary opacity-0 peer-checked:opacity-100">check_circle</span>
                    </label>
                </div>
            </div>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant" for="bookingDate">Date (IST) *</label>
                <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="bookingDate" name="bookingDate" min="${today}" required type="date"/>
            </div>
            <div class="grid grid-cols-2 gap-md">
                <div class="flex flex-col gap-sm">
                    <label class="font-label-sm text-on-surface-variant" for="startTime">Start Time *</label>
                    <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="startTime" name="startTime" required type="time"/>
                </div>
                <div class="flex flex-col gap-sm">
                    <label class="font-label-sm text-on-surface-variant" for="endTime">End Time *</label>
                    <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="endTime" name="endTime" required type="time"/>
                </div>
            </div>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant" for="destination">Destination *</label>
                <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="destination" name="destination" placeholder="Enter destination address" required type="text"/>
            </div>
            <div class="flex flex-col gap-sm">
                <label class="font-label-sm text-on-surface-variant" for="purpose">Purpose of Travel *</label>
                <textarea class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container resize-none" id="purpose" name="purpose" placeholder="Briefly describe the reason" required rows="3"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-md">
                <div class="flex flex-col gap-sm">
                    <label class="font-label-sm text-on-surface-variant" for="passengers">Passengers *</label>
                    <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="passengers" name="passengers" min="1" max="10" required type="number" value="1"/>
                </div>
                <div class="flex flex-col gap-sm">
                    <label class="font-label-sm text-on-surface-variant" for="approvalCode">Approval Code</label>
                    <input class="w-full bg-surface-container-lowest text-on-surface rounded-md px-md py-sm outline outline-1 outline-outline-variant focus:outline-2 focus:outline-primary-container" id="approvalCode" name="approvalCode" placeholder="Optional" type="text"/>
                </div>
            </div>
        </section>
        
        <div class="flex flex-col gap-md mt-sm">
            <button class="w-full bg-primary-container text-on-primary py-md rounded-lg font-label-md shadow-sm transition-transform active:translate-y-[1px] flex items-center justify-center gap-sm" type="submit">
                Submit Booking
                <span class="material-symbols-outlined text-[18px]">send</span>
            </button>
            <button class="w-full bg-transparent text-primary-container outline outline-1 outline-primary-container py-md rounded-lg font-label-md transition-colors" type="button" id="clear-form">
                Clear Form
            </button>
        </div>
    </form>
</div>
        `;
        
        this.setupBookingForm();
    }


    setupBookingForm() {
        const form = document.getElementById('booking-form');
        const clearBtn = document.getElementById('clear-form');
        
        clearBtn.addEventListener('click', () => form.reset());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            const booking = {
                id: 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase(),
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
                    const response = await fetch(`${this.apiUrl}/bookings`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(booking)
                    });
                    
                    if (!response.ok) throw new Error('Booking failed');
                } else {
                    this.bookings.push(booking);
                    this.saveToStorage();
                }
                
                this.showNotification('Booking created successfully!', 'success');
                form.reset();
                setTimeout(() => this.loadPage('bookings'), 1500);
            } catch (error) {
                this.showNotification('Error: ' + error.message, 'error');
            }
        });
    }

    renderDashboard(container) {
        const isDesktop = window.innerWidth >= 1024;
        
        if (isDesktop) {
            this.renderDesktopDashboard(container);
        } else {
            this.renderMobileDashboard(container);
        }
    }

    renderMobileDashboard(container) {
        container.innerHTML = `
<div class="flex flex-col w-full px-md pb-xl gap-lg">
    <div class="flex items-center justify-between mt-sm">
        <h1 class="font-headline-lg-mobile text-on-surface">Statistics</h1>
        <div class="bg-surface-variant rounded-full p-1 flex">
            <button class="px-3 py-1 text-label-sm font-semibold rounded-full bg-primary-container text-on-primary-container">Today</button>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-sm">
        <div class="bg-surface-container rounded-xl p-card-padding flex flex-col items-start shadow-sm">
            <span class="material-symbols-outlined text-primary-container mb-xs">confirmation_number</span>
            <span class="font-display-lg text-primary mt-sm tabular-nums" id="total-bookings">0</span>
            <span class="font-label-md text-on-surface-variant">Total Bookings</span>
        </div>
        <div class="bg-surface-container rounded-xl p-card-padding flex flex-col items-start shadow-sm">
            <span class="material-symbols-outlined text-[#b2c7bd] mb-xs">medical_services</span>
            <span class="font-display-lg text-on-surface mt-sm tabular-nums" id="ambulance-bookings">0</span>
            <span class="font-label-md text-on-surface-variant">Ambulance</span>
        </div>
        <div class="bg-surface-container rounded-xl p-card-padding flex flex-col items-start shadow-sm">
            <span class="material-symbols-outlined text-secondary-container mb-xs">directions_car</span>
            <span class="font-headline-lg text-on-surface mt-sm tabular-nums" id="staff-car-1">0</span>
            <span class="font-label-sm text-on-surface-variant">Staff Car 1</span>
        </div>
        <div class="bg-surface-container rounded-xl p-card-padding flex flex-col items-start shadow-sm">
            <span class="material-symbols-outlined text-secondary-container mb-xs">directions_car</span>
            <span class="font-headline-lg text-on-surface mt-sm tabular-nums" id="staff-car-2">0</span>
            <span class="font-label-sm text-on-surface-variant">Staff Car 2</span>
        </div>
    </div>
</div>
        `;
        
        this.updateDashboardStats();
    }

    renderDesktopDashboard(container) {


    async updateDashboardStats() {
        const today = this.getTodayIST();
        let todayBookings = [];
        
        if (this.useBackend) {
            try {
                const response = await fetch(`${this.apiUrl}/bookings?date=${today}`);
                todayBookings = await response.json();
            } catch (e) {
                console.error('Error:', e);
            }
        } else {
            todayBookings = this.bookings.filter(b => b.bookingDate === today);
        }
        
        const ambulance = todayBookings.filter(b => b.vehicleType === 'Ambulance').length;
        const car1 = todayBookings.filter(b => b.vehicleType === 'Staff Car 1').length;
        const car2 = todayBookings.filter(b => b.vehicleType === 'Staff Car 2').length;
        
        // Update all instances
        ['total-bookings', 'ambulance-bookings', 'staff-car-1', 'staff-car-2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                let value = todayBookings.length;
                if (id === 'ambulance-bookings') value = ambulance;
                if (id === 'staff-car-1') value = car1;
                if (id === 'staff-car-2') value = car2;
                
                el.textContent = value;
                el.setAttribute('data-target', value);
            }
        });
        
        // Update utilization bars (desktop only)
        const utilizationBars = document.getElementById('utilization-bars');
        if (utilizationBars) {
            const totalSlots = 10; // Available slots per day
            const ambulanceUtil = Math.min(100, (ambulance / totalSlots) * 100);
            const car1Util = Math.min(100, (car1 / totalSlots) * 100);
            const car2Util = Math.min(100, (car2 / totalSlots) * 100);
            
            utilizationBars.innerHTML = `
                ${this.createProgressBar('Ambulance', 'airport_shuttle', 'secondary', ambulanceUtil)}
                ${this.createProgressBar('Staff Car 1', 'directions_car', 'tertiary', car1Util)}
                ${this.createProgressBar('Staff Car 2', 'directions_car', 'tertiary', car2Util)}
            `;
            
            // Animate bars
            setTimeout(() => {
                document.querySelectorAll('[data-progress]').forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.transform = `scaleX(${progress / 100})`;
                });
            }, 100);
        }
    }

    createProgressBar(label, icon, color, percentage) {
        return `
<div class="flex flex-col gap-sm group">
    <div class="flex justify-between items-end">
        <div class="flex items-center gap-sm">
            <span class="material-symbols-outlined text-${color}">${icon}</span>
            <span class="font-label-md text-label-md text-on-surface">${label}</span>
        </div>
        <div class="flex items-baseline gap-xs">
            <span class="font-body-md text-body-md text-on-surface font-semibold">${Math.round(percentage)}%</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Rate</span>
        </div>
    </div>
    <div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
        <div class="h-full bg-${color} rounded-full transform origin-left transition-transform duration-1000 ease-out" data-progress="${percentage}" style="transform: scaleX(0)"></div>
    </div>
</div>
        `;
    }

    renderBookingsList(container) {
        container.innerHTML = `
<div class="flex flex-col w-full px-md pb-xl gap-lg pt-lg">
    <h1 class="font-headline-lg-mobile text-on-surface">My Bookings</h1>
    <div id="bookings-container" class="flex flex-col gap-md">
        <div class="text-center py-8 text-on-surface-variant">Loading...</div>
    </div>
</div>
        `;
        
        this.loadBookingsList();
    }

    async loadBookingsList() {
        const container = document.getElementById('bookings-container');
        let bookings = [];
        
        if (this.useBackend) {
            try {
                const response = await fetch(`${this.apiUrl}/bookings`);
                const data = await response.json();
                bookings = data.map(b => ({
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
                    status: b.status
                }));
            } catch (e) {
                console.error('Error:', e);
            }
        } else {
            bookings = this.bookings;
        }
        
        if (bookings.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-on-surface-variant">No bookings yet</div>';
            return;
        }
        
        container.innerHTML = bookings.map(b => `
<div class="bg-surface-container rounded-xl p-card-padding shadow-sm">
    <div class="flex justify-between items-start mb-md">
        <div>
            <div class="font-title-md text-on-surface">${b.vehicleType}</div>
            <div class="font-label-sm text-on-surface-variant">${b.bookingDate} • ${b.startTime} - ${b.endTime}</div>
        </div>
        <span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase">${b.status}</span>
    </div>
    <div class="space-y-2">
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-on-surface-variant">person</span>
            <span class="text-sm">${b.requesterName} (${b.department})</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
            <span class="text-sm">${b.destination}</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-on-surface-variant">description</span>
            <span class="text-sm">${b.purpose}</span>
        </div>
    </div>
</div>
        `).join('');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('vehicleBookings');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('vehicleBookings', JSON.stringify(this.bookings));
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
}

// Initialize app
const app = new ModernTransportApp();
        container.innerHTML = `
<div class="flex flex-col w-full p-xl gap-section-gap max-w-[1200px] mx-auto relative overflow-hidden">
    <div class="absolute top-0 right-0 w-96 h-96 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
    <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
    
    <section class="flex flex-col gap-lg z-10 relative">
        <div class="flex flex-row justify-between items-end">
            <div class="flex flex-col gap-sm">
                <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Overview</p>
                <h1 class="font-display-lg text-display-lg text-on-surface">Statistics Dashboard</h1>
            </div>
            <div class="flex bg-surface-container rounded-full p-1 shadow-sm">
                <button class="px-md py-sm rounded-full bg-primary text-on-primary font-label-md text-label-md transition-colors">Today</button>
                <button class="px-md py-sm rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">This Week</button>
            </div>
        </div>
        
        <div class="grid grid-cols-4 gap-lg">
            <div class="bg-surface-container-lowest p-card-padding rounded-xl shadow-md flex flex-col gap-md transition-transform hover:-translate-y-1 group">
                <div class="flex justify-between items-start">
                    <div class="p-2 bg-primary-fixed rounded-lg text-on-primary-fixed group-hover:bg-primary group-hover:text-on-primary transition-colors">
                        <span class="material-symbols-outlined">receipt_long</span>
                    </div>
                    <span class="font-label-sm text-label-sm text-surface-tint bg-primary-fixed-dim/20 px-2 py-1 rounded-full">+12%</span>
                </div>
                <div class="flex flex-col gap-xs mt-auto pt-lg border-t border-surface-container">
                    <span class="font-label-md text-label-md text-on-surface-variant">Total Bookings</span>
                    <span class="font-headline-lg text-headline-lg text-on-surface counter" data-target="0" id="total-bookings">0</span>
                </div>
            </div>
            
            <div class="bg-surface-container-lowest p-card-padding rounded-xl shadow-md flex flex-col gap-md transition-transform hover:-translate-y-1 group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-transparent via-secondary-fixed/10 to-transparent pointer-events-none"></div>
                <div class="flex justify-between items-start relative z-10">
                    <div class="p-2 bg-secondary-fixed rounded-lg text-on-secondary-fixed group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                        <span class="material-symbols-outlined">airport_shuttle</span>
                    </div>
                    <span class="font-label-sm text-label-sm text-secondary bg-secondary-fixed/40 px-2 py-1 rounded-full">+5%</span>
                </div>
                <div class="flex flex-col gap-xs mt-auto pt-lg border-t border-surface-container relative z-10">
                    <span class="font-label-md text-label-md text-on-surface-variant">Ambulance Uses</span>
                    <span class="font-headline-lg text-headline-lg text-on-surface counter" data-target="0" id="ambulance-bookings">0</span>
                </div>
            </div>
            
            <div class="bg-surface-container-lowest p-card-padding rounded-xl shadow-md flex flex-col gap-md transition-transform hover:-translate-y-1 group">
                <div class="flex justify-between items-start">
                    <div class="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                        <span class="material-symbols-outlined">directions_car</span>
                    </div>
                    <span class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">-2%</span>
                </div>
                <div class="flex flex-col gap-xs mt-auto pt-lg border-t border-surface-container">
                    <span class="font-label-md text-label-md text-on-surface-variant">Staff Car 1</span>
                    <span class="font-headline-lg text-headline-lg text-on-surface counter" data-target="0" id="staff-car-1">0</span>
                </div>
            </div>
            
            <div class="bg-surface-container-lowest p-card-padding rounded-xl shadow-md flex flex-col gap-md transition-transform hover:-translate-y-1 group">
                <div class="flex justify-between items-start">
                    <div class="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                        <span class="material-symbols-outlined">directions_car</span>
                    </div>
                    <span class="font-label-sm text-label-sm text-surface-tint bg-primary-fixed-dim/20 px-2 py-1 rounded-full">+8%</span>
                </div>
                <div class="flex flex-col gap-xs mt-auto pt-lg border-t border-surface-container">
                    <span class="font-label-md text-label-md text-on-surface-variant">Staff Car 2</span>
                    <span class="font-headline-lg text-headline-lg text-on-surface counter" data-target="0" id="staff-car-2">0</span>
                </div>
            </div>
        </div>
    </section>
    
    <section class="grid grid-cols-12 gap-lg relative z-10" id="desktop-dashboard-charts">
        <div class="col-span-8 bg-surface-container-lowest rounded-xl shadow-md p-card-padding flex flex-col gap-lg">
            <div class="flex justify-between items-center">
                <h2 class="font-title-md text-title-md text-on-surface">Vehicle Utilization</h2>
            </div>
            <div class="flex flex-col gap-md" id="utilization-bars">
                <!-- Progress bars will be inserted here -->
            </div>
            <div class="mt-auto pt-lg border-t border-surface-container">
                <div class="flex justify-between items-center text-on-surface-variant">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider">Peak Hours</span>
                    <span class="font-label-md text-label-md">08:00 - 10:00 & 16:00 - 18:00</span>
                </div>
            </div>
        </div>
        
        <div class="col-span-4 bg-primary text-on-primary rounded-xl shadow-xl p-card-padding flex flex-col relative overflow-hidden">
            <svg class="absolute inset-0 w-full h-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor"></path>
                <path d="M0 50 C 40 100 60 100 100 50 Z" fill="currentColor"></path>
            </svg>
            <div class="relative z-10 flex flex-col h-full">
                <h2 class="font-title-md text-title-md mb-xl">Efficiency Score</h2>
                <div class="flex items-center justify-center flex-1">
                    <div class="relative w-48 h-48">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-primary-fixed-dim/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
                            <path class="text-primary-fixed transition-all duration-1000 ease-out" id="efficiency-circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="0, 100" stroke-width="3"></path>
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="font-display-lg text-display-lg font-bold" id="efficiency-score">0</span>
                            <span class="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider">Excellent</span>
                        </div>
                    </div>
                </div>
                <div class="mt-xl pt-lg border-t border-primary-fixed-dim/30 flex justify-between items-center">
                    <span class="font-label-md text-label-md text-primary-fixed">+3 pts from last week</span>
                    <span class="material-symbols-outlined text-primary-fixed">trending_up</span>
                </div>
            </div>
        </div>
    </section>
</div>
        `;
        
        this.updateDashboardStats();
        setTimeout(() => this.animateDesktopDashboard(), 100);
    }

    animateDesktopDashboard() {
        // Animate counters
        document.querySelectorAll('.counter').forEach(counter => {
            const target = +counter.textContent || 0;
            if (target === 0) return;
            
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = Math.round(target);
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.round(current);
                }
            }, 30);
        });
        
        // Animate efficiency circle
        const efficiencyCircle = document.getElementById('efficiency-circle');
        const efficiencyScore = document.getElementById('efficiency-score');
        if (efficiencyCircle && efficiencyScore) {
            const score = 92; // Calculate based on data
            efficiencyCircle.style.strokeDasharray = `${score}, 100`;
            
            let current = 0;
            const timer = setInterval(() => {
                current += 2;
                if (current >= score) {
                    efficiencyScore.textContent = score;
                    clearInterval(timer);
                } else {
                    efficiencyScore.textContent = current;
                }
            }, 20);
        }
    }
