// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentDeadline = null;
        this.isEditing = false;
        this.editingId = null;
        
        // DOM elements
        this.elements = {
            // Navigation
            deadlineTab: document.getElementById('deadlineTab'),
            settingsTab: document.getElementById('settingsTab'),
            deadlineSection: document.getElementById('deadlineSection'),
            settingsSection: document.getElementById('settingsSection'),
            
            // Current deadline display
            currentDeadlineCard: document.getElementById('currentDeadlineCard'),
            currentName: document.getElementById('currentName'),
            currentStartDate: document.getElementById('currentStartDate'),
            currentEndDate: document.getElementById('currentEndDate'),
            currentDescription: document.getElementById('currentDescription'),
            currentStatus: document.getElementById('currentStatus'),
            
            // Form elements
            deadlineForm: document.getElementById('deadlineForm'),
            deadlineFormElement: document.getElementById('deadlineFormElement'),
            formTitle: document.getElementById('formTitle'),
            challengeName: document.getElementById('challengeName'),
            challengeDescription: document.getElementById('challengeDescription'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            isActive: document.getElementById('isActive'),
            
            // Buttons
            createNewBtn: document.getElementById('createNewBtn'),
            editCurrentBtn: document.getElementById('editCurrentBtn'),
            deleteCurrentBtn: document.getElementById('deleteCurrentBtn'),
            closeFormBtn: document.getElementById('closeFormBtn'),
            cancelFormBtn: document.getElementById('cancelFormBtn'),
            saveBtn: document.getElementById('saveBtn'),
            
            // History and settings
            historyList: document.getElementById('historyList'),
            firebaseStatus: document.getElementById('firebaseStatus'),
            connectionStatus: document.getElementById('connectionStatus'),
            testConnectionBtn: document.getElementById('testConnectionBtn'),
            
            // Data management
            exportDataBtn: document.getElementById('exportDataBtn'),
            importDataBtn: document.getElementById('importDataBtn'),
            importFile: document.getElementById('importFile'),
            
            // Modal
            confirmModal: document.getElementById('confirmModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalMessage: document.getElementById('modalMessage'),
            modalCancelBtn: document.getElementById('modalCancelBtn'),
            modalConfirmBtn: document.getElementById('modalConfirmBtn'),
            
            // Toast container
            toastContainer: document.getElementById('toastContainer')
        };
        
        this.init();
    }
    
    async init() {
        this.createParticles();
        this.setupEventListeners();
        await this.checkFirebaseConnection();
        await this.loadCurrentDeadline();
        await this.loadDeadlineHistory();
    }
    
    // Create animated particles (reuse from main page)
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 30;
        
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
    
    // Setup event listeners
    setupEventListeners() {
        // Navigation
        this.elements.deadlineTab.addEventListener('click', () => this.showSection('deadline'));
        this.elements.settingsTab.addEventListener('click', () => this.showSection('settings'));
        
        // Form controls
        this.elements.createNewBtn.addEventListener('click', () => this.showCreateForm());
        this.elements.editCurrentBtn.addEventListener('click', () => this.showEditForm());
        this.elements.deleteCurrentBtn.addEventListener('click', () => this.confirmDelete());
        this.elements.closeFormBtn.addEventListener('click', () => this.hideForm());
        this.elements.cancelFormBtn.addEventListener('click', () => this.hideForm());
        this.elements.deadlineFormElement.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Settings
        this.elements.testConnectionBtn.addEventListener('click', () => this.testFirebaseConnection());
        this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
        this.elements.importDataBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importData(e));
        
        // Modal
        this.elements.modalCancelBtn.addEventListener('click', () => this.hideModal());
        this.elements.modalConfirmBtn.addEventListener('click', () => this.handleModalConfirm());
        
        // Theme settings
        document.querySelectorAll('input[name=\"theme\"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.changeTheme(e.target.value));
        });
        
        // Auto-refresh settings
        document.getElementById('refreshInterval').addEventListener('change', (e) => {
            this.setRefreshInterval(parseInt(e.target.value));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    // Show/hide sections
    showSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        if (section === 'deadline') {
            this.elements.deadlineTab.classList.add('active');
            this.elements.deadlineSection.style.display = 'block';
            this.elements.settingsSection.style.display = 'none';
        } else if (section === 'settings') {
            this.elements.settingsTab.classList.add('active');
            this.elements.deadlineSection.style.display = 'none';
            this.elements.settingsSection.style.display = 'block';
        }
    }
    
    // Firebase connection check
    async checkFirebaseConnection() {
        try {
            if (typeof window.db === 'undefined') {
                throw new Error('Firebase not initialized');
            }
            
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            // Try to read a document to test connection
            const testDoc = doc(window.db, 'deadlines', 'current');
            await getDoc(testDoc);
            
            this.updateConnectionStatus('connected', 'Connected');
        } catch (error) {
            console.error('Firebase connection error:', error);
            this.updateConnectionStatus('error', 'Disconnected');
        }
    }
    
    // Update Firebase connection status
    updateConnectionStatus(status, message) {
        const indicator = this.elements.firebaseStatus.querySelector('.status-indicator');
        this.elements.connectionStatus.textContent = message;
        
        indicator.className = 'status-indicator';
        if (status === 'connected') {
            indicator.classList.add('active');
        } else if (status === 'error') {
            indicator.classList.add('error');
        } else {
            indicator.classList.add('warning');
        }
    }
    
    // Test Firebase connection
    async testFirebaseConnection() {
        this.showToast('Testing Firebase connection...', 'warning');
        await this.checkFirebaseConnection();
        
        const status = this.elements.connectionStatus.textContent;
        if (status === 'Connected') {
            this.showToast('Firebase connection successful!', 'success');
        } else {
            this.showToast('Firebase connection failed!', 'error');
        }
    }
    
    // Load current deadline
    async loadCurrentDeadline() {
        try {
            if (typeof window.db === 'undefined') {
                throw new Error('Firebase not initialized');
            }
            
            const { doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const deadlineRef = doc(window.db, 'deadlines', 'current');
            onSnapshot(deadlineRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    this.currentDeadline = { id: docSnapshot.id, ...docSnapshot.data() };
                    this.displayCurrentDeadline();
                } else {
                    this.showNoDeadlineMessage();
                }
            }, (error) => {
                console.error('Error loading current deadline:', error);
                this.showToast('Error loading deadline data', 'error');
            });
            
        } catch (error) {
            console.error('Error setting up deadline listener:', error);
            this.showToast('Unable to connect to Firebase', 'error');
        }
    }
    
    // Display current deadline
    displayCurrentDeadline() {
        if (!this.currentDeadline) return;
        
        const data = this.currentDeadline;
        
        this.elements.currentName.textContent = data.name || 'Unnamed Challenge';
        this.elements.currentDescription.textContent = data.description || 'No description';
        
        // Format dates
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        
        this.elements.currentStartDate.textContent = startDate.toLocaleString('vi-VN');
        this.elements.currentEndDate.textContent = endDate.toLocaleString('vi-VN');
        
        // Update status
        const now = new Date();
        let status = 'inactive';
        let statusText = 'INACTIVE';
        
        if (data.isActive && endDate > now) {
            status = 'active';
            statusText = 'ACTIVE';
        } else if (endDate <= now) {
            status = 'expired';
            statusText = 'EXPIRED';
        }
        
        this.elements.currentStatus.className = `status-badge ${status}`;
        this.elements.currentStatus.textContent = statusText;
    }
    
    // Show no deadline message
    showNoDeadlineMessage() {
        this.elements.currentName.textContent = 'No active deadline';
        this.elements.currentStartDate.textContent = '-';
        this.elements.currentEndDate.textContent = '-';
        this.elements.currentDescription.textContent = 'Click \"NEW DEADLINE\" to create one';
        this.elements.currentStatus.className = 'status-badge inactive';
        this.elements.currentStatus.textContent = 'NO DATA';
    }
    
    // Load deadline history
    async loadDeadlineHistory() {
        try {
            if (typeof window.db === 'undefined') {
                this.elements.historyList.innerHTML = '<div class=\"loading-spinner\">Firebase not connected</div>';
                return;
            }
            
            const { collection, query, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            const historyQuery = query(
                collection(window.db, 'deadlines'),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            
            onSnapshot(historyQuery, (querySnapshot) => {
                const historyItems = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id !== 'current') {
                        historyItems.push({ id: doc.id, ...doc.data() });
                    }
                });
                
                this.displayDeadlineHistory(historyItems);
            });
            
        } catch (error) {
            console.error('Error loading deadline history:', error);
            this.elements.historyList.innerHTML = '<div class=\"loading-spinner\">Error loading history</div>';
        }
    }
    
    // Display deadline history
    displayDeadlineHistory(items) {
        if (items.length === 0) {
            this.elements.historyList.innerHTML = '<div class=\"loading-spinner\">No history available</div>';
            return;
        }
        
        const historyHTML = items.map(item => `
            <div class=\"history-item\">
                <h4>${item.name || 'Unnamed Challenge'}</h4>
                <p><strong>Start:</strong> ${new Date(item.startDate).toLocaleString('vi-VN')}</p>
                <p><strong>End:</strong> ${new Date(item.endDate).toLocaleString('vi-VN')}</p>
                <p><strong>Description:</strong> ${item.description || 'No description'}</p>
                <p><strong>Status:</strong> ${item.isActive ? 'Was Active' : 'Inactive'}</p>
            </div>
        `).join('');
        
        this.elements.historyList.innerHTML = historyHTML;
    }
    
    // Show create form
    showCreateForm() {
        this.isEditing = false;
        this.editingId = null;
        this.elements.formTitle.textContent = 'Create New Deadline';
        this.elements.saveBtn.textContent = 'CREATE DEADLINE';
        
        // Reset form
        this.elements.deadlineFormElement.reset();
        
        // Set default dates
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        this.elements.startDate.value = this.formatDateForInput(now);
        this.elements.endDate.value = this.formatDateForInput(nextWeek);
        this.elements.isActive.checked = true;
        
        this.elements.deadlineForm.style.display = 'block';
        this.elements.challengeName.focus();
    }
    
    // Show edit form
    showEditForm() {
        if (!this.currentDeadline) {
            this.showToast('No deadline to edit', 'warning');
            return;
        }
        
        this.isEditing = true;
        this.editingId = this.currentDeadline.id;
        this.elements.formTitle.textContent = 'Edit Current Deadline';
        this.elements.saveBtn.textContent = 'UPDATE DEADLINE';
        
        // Populate form with current data
        const data = this.currentDeadline;
        this.elements.challengeName.value = data.name || '';
        this.elements.challengeDescription.value = data.description || '';
        this.elements.startDate.value = this.formatDateForInput(new Date(data.startDate));
        this.elements.endDate.value = this.formatDateForInput(new Date(data.endDate));
        this.elements.isActive.checked = data.isActive || false;
        
        this.elements.deadlineForm.style.display = 'block';
        this.elements.challengeName.focus();
    }
    
    // Hide form
    hideForm() {
        this.elements.deadlineForm.style.display = 'none';
        this.isEditing = false;
        this.editingId = null;
    }
    
    // Format date for input field
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    // Handle form submission
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.elements.deadlineFormElement);
        const deadlineData = {
            name: formData.get('challengeName').trim(),
            description: formData.get('challengeDescription').trim(),
            startDate: new Date(formData.get('startDate')).toISOString(),
            endDate: new Date(formData.get('endDate')).toISOString(),
            isActive: formData.get('isActive') === 'on',
            updatedAt: new Date().toISOString()
        };
        
        // Validation
        if (!deadlineData.name) {
            this.showToast('Challenge name is required', 'error');
            return;
        }
        
        if (new Date(deadlineData.endDate) <= new Date(deadlineData.startDate)) {
            this.showToast('End date must be after start date', 'error');
            return;
        }
        
        try {
            await this.saveDeadline(deadlineData);
            this.hideForm();
            this.showToast(this.isEditing ? 'Deadline updated successfully!' : 'Deadline created successfully!', 'success');
        } catch (error) {
            console.error('Error saving deadline:', error);
            this.showToast('Error saving deadline', 'error');
        }
    }
    
    // Save deadline to Firebase
    async saveDeadline(data) {
        if (typeof window.db === 'undefined') {
            throw new Error('Firebase not initialized');
        }
        
        const { doc, setDoc, addDoc, collection } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
        
        if (!this.isEditing) {
            data.createdAt = new Date().toISOString();
        }
        
        // Save as current deadline
        await setDoc(doc(window.db, 'deadlines', 'current'), data);
        
        // Also save to history collection if it's a new deadline
        if (!this.isEditing) {
            await addDoc(collection(window.db, 'deadlines'), data);
        }
    }
    
    // Confirm delete
    confirmDelete() {
        if (!this.currentDeadline) {
            this.showToast('No deadline to delete', 'warning');
            return;
        }
        
        this.showModal(
            'Delete Deadline',
            'Are you sure you want to delete the current deadline? This action cannot be undone.',
            () => this.deleteCurrentDeadline()
        );
    }
    
    // Delete current deadline
    async deleteCurrentDeadline() {
        try {
            if (typeof window.db === 'undefined') {
                throw new Error('Firebase not initialized');
            }
            
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js');
            
            await deleteDoc(doc(window.db, 'deadlines', 'current'));
            this.showToast('Deadline deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting deadline:', error);
            this.showToast('Error deleting deadline', 'error');
        }
    }
    
    // Export data
    async exportData() {
        try {
            if (!this.currentDeadline) {
                this.showToast('No data to export', 'warning');
                return;
            }
            
            const exportData = {
                exportDate: new Date().toISOString(),
                currentDeadline: this.currentDeadline,
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `deadline-countdown-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }
    
    // Import data
    async importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.currentDeadline) {
                throw new Error('Invalid file format');
            }
            
            await this.saveDeadline(importData.currentDeadline);
            this.showToast('Data imported successfully!', 'success');
        } catch (error) {
            console.error('Error importing data:', error);
            this.showToast('Error importing data: ' + error.message, 'error');
        }
        
        // Reset file input
        e.target.value = '';
    }
    
    // Show modal
    showModal(title, message, onConfirm) {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;
        this.modalConfirmCallback = onConfirm;
        this.elements.confirmModal.style.display = 'flex';
    }
    
    // Hide modal
    hideModal() {
        this.elements.confirmModal.style.display = 'none';
        this.modalConfirmCallback = null;
    }
    
    // Handle modal confirm
    handleModalConfirm() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
        }
        this.hideModal();
    }
    
    // Show toast message
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.3s ease-out forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    // Change theme
    changeTheme(theme) {
        // This would implement theme switching
        // For now, just show a message
        this.showToast(`Theme changed to ${theme}`, 'success');
    }
    
    // Set refresh interval
    setRefreshInterval(seconds) {
        // This would implement auto-refresh functionality
        this.showToast(`Refresh interval set to ${seconds} seconds`, 'success');
    }
    
    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N: New deadline
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showCreateForm();
        }
        
        // Ctrl/Cmd + E: Edit deadline
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.showEditForm();
        }
        
        // Escape: Close forms/modals
        if (e.key === 'Escape') {
            if (this.elements.deadlineForm.style.display === 'block') {
                this.hideForm();
            } else if (this.elements.confirmModal.style.display === 'flex') {
                this.hideModal();
            }
        }
        
        // Tab switching
        if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.showSection('deadline');
        }
        if (e.key === '2' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.showSection('settings');
        }
    }
}

// Add CSS for toast-out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toast-out {
        0% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const initAdmin = () => {
        if (typeof window.firebaseApp !== 'undefined' || document.readyState === 'complete') {
            window.adminPanel = new AdminPanel();
        } else {
            setTimeout(initAdmin, 100);
        }
    };
    
    initAdmin();
});