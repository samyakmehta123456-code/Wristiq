/**
 * Helper Utility Functions
 */

const Helpers = {
    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: INR)
     */
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @param {object} options - Intl.DateTimeFormat options
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(new Date(date));
    },

    /**
     * Format time
     * @param {Date|string} date - Date to format
     */
    formatTime(date) {
        return new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date));
    },

    /**
     * Format date and time
     * @param {Date|string} date - Date to format
     */
    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    /**
     * Calculate time elapsed
     * @param {Date|string} startTime - Start time
     * @returns {string} - Formatted elapsed time
     */
    getElapsedTime(startTime) {
        const start = new Date(startTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000);

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    },

    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Generate order number
     */
    generateOrderNumber() {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const orders = Storage.load(Storage.KEYS.ORDERS, []);
        const todayOrders = orders.filter(o => o.orderNumber && o.orderNumber.startsWith(dateStr));
        const count = todayOrders.length + 1;
        return `${dateStr}-${count.toString().padStart(4, '0')}`;
    },

    /**
     * Get initials from name
     * @param {string} name - Full name
     */
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Max length
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    },

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in ms
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Show modal
     * @param {string} title - Modal title
     * @param {string} content - Modal body content (HTML)
     * @param {object} options - Modal options
     */
    showModal(title, content, options = {}) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = title;
        modalBody.innerHTML = content;

        if (options.size) {
            modal.className = `modal modal-${options.size}`;
        } else {
            modal.className = 'modal';
        }

        overlay.classList.add('active');

        return new Promise((resolve) => {
            window.modalResolve = resolve;
        });
    },

    /**
     * Close modal
     * @param {any} result - Result to return
     */
    closeModal(result = null) {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');

        if (window.modalResolve) {
            window.modalResolve(result);
            window.modalResolve = null;
        }
    },

    /**
     * Confirm dialog
     * @param {string} message - Confirmation message
     * @param {string} title - Dialog title
     */
    async confirm(message, title = 'Confirm') {
        const content = `
            <p style="margin-bottom: var(--spacing-6); color: var(--text-secondary);">${message}</p>
            <div class="modal-footer" style="padding: 0; border: none;">
                <button class="btn" onclick="Helpers.closeModal(false)">Cancel</button>
                <button class="btn btn-primary" onclick="Helpers.closeModal(true)">Confirm</button>
            </div>
        `;
        return this.showModal(title, content);
    }
};

// Make globally available
window.Helpers = Helpers;
