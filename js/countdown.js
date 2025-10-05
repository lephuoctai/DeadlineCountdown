// Countdown Timer with Firebase Integration
class CountdownTimer {
    constructor() {
        this.countdownInterval = null;
        this.deadlineData = null;
        this.startTime = null;
        this.isExpired = false;
        
        // DOM elements
        this.elements = {
            title: document.getElementById('challengeTitle'),
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            statusIndicator: document.getElementById('statusIndicator'),
            progressFill: document.getElementById('progressFill'),
            deadlineDate: document.getElementById('deadlineDate'),
            totalTime: document.getElementById('totalTime'),
            completionPercent: document.getElementById('completionPercent')
        };
        
        this.init();
    }
    
    async init() {
        this.createParticles();
        await this.loadDeadlineFromFirebase();
        this.startCountdown();
    }
    
    // Create animated particles
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    // Load deadline data from Firebase
    async loadDeadlineFromFirebase() {
        try {
            if (typeof window.db === 'undefined') {
                console.log('Firebase not initialized, using default data');
                this.useDefaultData();
                return;
            }
            
            const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            // Listen for real-time updates
            const deadlineRef = doc(window.db, 'deadlines', 'current');
            onSnapshot(deadlineRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    this.deadlineData = docSnapshot.data();
                    this.updateDisplay();
                } else {
                    console.log('No deadline document found, creating default');
                    this.createDefaultDeadline();
                }
            }, (error) => {
                console.error('Error loading deadline:', error);
                this.useDefaultData();
            });
            
        } catch (error) {
            console.error('Error connecting to Firebase:', error);
            this.useDefaultData();
        }
    }
    
    // Use default data when Firebase is not available
    useDefaultData() {
        this.deadlineData = {
            name: 'Programming Challenge 2025',
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            startDate: new Date().toISOString(),
            isActive: true,
            description: 'Thử thách lập trình cuối năm'
        };
        this.updateDisplay();
    }
    
    // Create default deadline in Firebase
    async createDefaultDeadline() {
        try {
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const defaultData = {
                name: 'Programming Challenge 2025',
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                startDate: new Date().toISOString(),
                isActive: true,
                description: 'Thử thách lập trình cuối năm',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await setDoc(doc(window.db, 'deadlines', 'current'), defaultData);
            console.log('Default deadline created successfully');
        } catch (error) {
            console.error('Error creating default deadline:', error);
            this.useDefaultData();
        }
    }
    
    // Update display with current deadline data
    updateDisplay() {
        if (!this.deadlineData) return;
        
        // Update title
        this.elements.title.textContent = this.deadlineData.name || 'Programming Challenge';
        
        // Update deadline date display
        const endDate = new Date(this.deadlineData.endDate);
        this.elements.deadlineDate.textContent = endDate.toLocaleString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calculate total time and elapsed percentage
        this.startTime = new Date(this.deadlineData.startDate);
        const totalDuration = endDate - this.startTime;
        const elapsed = Date.now() - this.startTime;
        const elapsedPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        this.elements.totalTime.textContent = Math.ceil(totalDuration / (1000 * 60 * 60));
        this.elements.completionPercent.textContent = elapsedPercentage.toFixed(1) + '%';
        this.elements.progressFill.style.width = elapsedPercentage + '%';
    }
    
    // Start countdown timer
    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        this.updateCountdown(); // Initial update
    }
    
    // Update countdown display
    updateCountdown() {
        if (!this.deadlineData) return;
        
        const now = new Date().getTime();
        const endTime = new Date(this.deadlineData.endDate).getTime();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            this.handleExpired();
            return;
        }
        
        // Calculate time units
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        // Update display
        this.elements.days.textContent = this.formatTime(days);
        this.elements.hours.textContent = this.formatTime(hours);
        this.elements.minutes.textContent = this.formatTime(minutes);
        this.elements.seconds.textContent = this.formatTime(seconds);
        
        // Update status based on time remaining
        this.updateStatus(timeLeft);
        
        // Add visual effects for urgency
        this.addUrgencyEffects(timeLeft);
    }
    
    // Format time with leading zeros
    formatTime(time) {
        return time.toString().padStart(2, '0');
    }
    
    // Update status indicator
    updateStatus(timeLeft) {
        const statusText = this.elements.statusIndicator.querySelector('.status-text');
        const hours = timeLeft / (1000 * 60 * 60);
        
        if (hours > 24) {
            statusText.textContent = 'ACTIVE';
            statusText.style.color = 'var(--accent-color)';
        } else if (hours > 2) {
            statusText.textContent = 'WARNING';
            statusText.style.color = 'var(--warning-color)';
        } else {
            statusText.textContent = 'CRITICAL';
            statusText.style.color = 'var(--danger-color)';
        }
    }
    
    // Add visual effects based on urgency
    addUrgencyEffects(timeLeft) {
        const hours = timeLeft / (1000 * 60 * 60);
        
        // Critical state (less than 1 hour)
        if (hours < 1) {
            document.body.style.animation = 'urgent-pulse 1s ease-in-out infinite alternate';
            this.addCriticalCSS();
        }
        // Warning state (less than 6 hours)
        else if (hours < 6) {
            document.body.style.animation = 'warning-pulse 2s ease-in-out infinite alternate';
        }
        // Normal state
        else {
            document.body.style.animation = 'none';
        }
    }
    
    // Add critical state CSS
    addCriticalCSS() {
        if (!document.getElementById('critical-styles')) {
            const style = document.createElement('style');
            style.id = 'critical-styles';
            style.textContent = `
                @keyframes urgent-pulse {
                    0% { filter: brightness(1); }
                    100% { filter: brightness(1.2) hue-rotate(10deg); }
                }
                @keyframes warning-pulse {
                    0% { filter: brightness(1); }
                    100% { filter: brightness(1.1); }
                }
                .time-value {
                    animation: number-glow 0.5s ease-in-out infinite alternate !important;
                }
                @keyframes number-glow {
                    0% { text-shadow: 0 0 20px var(--danger-color); }
                    100% { text-shadow: 0 0 40px var(--danger-color), 0 0 60px var(--danger-color); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Handle expired countdown
    handleExpired() {
        if (this.isExpired) return;
        
        this.isExpired = true;
        
        // Stop the countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Update display to show expired state
        this.elements.days.textContent = '00';
        this.elements.hours.textContent = '00';
        this.elements.minutes.textContent = '00';
        this.elements.seconds.textContent = '00';
        
        // Update status
        const statusText = this.elements.statusIndicator.querySelector('.status-text');
        statusText.textContent = 'EXPIRED';
        statusText.style.color = 'var(--danger-color)';
        
        // Add expired state class
        document.body.classList.add('expired');
        
        // Show expired message
        this.showExpiredMessage();
        
        // Add celebration effect
        this.addExpiredEffects();
    }
    
    // Show expired message
    showExpiredMessage() {
        const message = document.createElement('div');
        message.className = 'expired-message';
        message.innerHTML = `
            <h2>⏰ DEADLINE REACHED!</h2>
            <p>The programming challenge has officially ended.</p>
            <p>Thank you for participating!</p>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--card-bg), rgba(255, 0, 64, 0.2));
            border: 2px solid var(--danger-color);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            z-index: 1000;
            animation: fade-in 1s ease-out;
        `;
        
        document.body.appendChild(message);
        
        // Remove message after 10 seconds
        setTimeout(() => {
            message.style.animation = 'fade-out 1s ease-out forwards';
            setTimeout(() => message.remove(), 1000);
        }, 10000);
    }
    
    // Add expired effects
    addExpiredEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fade-in {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes fade-out {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public method to refresh countdown
    refresh() {
        this.loadDeadlineFromFirebase();
    }
}

// Initialize countdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    const initCountdown = () => {
        if (typeof window.firebaseApp !== 'undefined' || document.readyState === 'complete') {
            window.countdown = new CountdownTimer();
        } else {
            setTimeout(initCountdown, 100);
        }
    };
    
    initCountdown();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'R' to refresh
    if (e.key === 'r' || e.key === 'R') {
        if (window.countdown) {
            window.countdown.refresh();
        }
    }
    
    // Press 'A' to go to admin
    if (e.key === 'a' || e.key === 'A') {
        window.location.href = '/admin/';
    }
});

// Auto-refresh every 30 minutes to sync with Firebase
setInterval(() => {
    if (window.countdown) {
        window.countdown.refresh();
    }
}, 30 * 60 * 1000);