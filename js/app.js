/**
 * Main Application - Restaurant POS
 */

const App = {
    currentPage: 'dashboard',
    pages: {
        'dashboard': DashboardPage,
        'new-order': NewOrderPage,
        'orders': OrdersPage,
        'kitchen': KitchenPage,
        'menu': MenuPage,
        'inventory': InventoryPage,
        'customers': CustomersPage,
        'reports': ReportsPage
    },
    pageTitles: {
        'dashboard': 'Dashboard',
        'new-order': 'New Order',
        'orders': 'Orders',
        'kitchen': 'Kitchen Display',
        'menu': 'Menu Management',
        'inventory': 'Inventory',
        'customers': 'Customers',
        'reports': 'Reports'
    },

    /**
     * Initialize the application
     */
    init() {
        console.log('🍽️ RestaurantPOS Initializing...');

        // Initialize services
        DataService.init();
        BluetoothService.init();

        // Setup event listeners
        this.setupEventListeners();

        // Start clock
        this.startClock();

        // Render initial page
        this.navigateTo('dashboard');

        // Update orders badge
        this.updateOrdersBadge();

        console.log('✅ RestaurantPOS Ready!');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close modal on overlay click
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    Helpers.closeModal();
                }
            });
        }

        // Modal close button
        const modalClose = document.getElementById('modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                Helpers.closeModal();
            });
        }

        // Bluetooth toggle
        const bluetoothToggle = document.getElementById('bluetooth-toggle');
        if (bluetoothToggle) {
            bluetoothToggle.addEventListener('click', async () => {
                if (BluetoothService.isSupported) {
                    const device = await BluetoothService.scanForDevices();
                    if (device) {
                        await BluetoothService.connect(device);
                    }
                } else {
                    // Create simulated device
                    BluetoothService.createSimulatedDevice();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + N = New Order
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.navigateTo('new-order');
            }
            // Alt + O = Orders
            if (e.altKey && e.key === 'o') {
                e.preventDefault();
                this.navigateTo('orders');
            }
            // Alt + K = Kitchen
            if (e.altKey && e.key === 'k') {
                e.preventDefault();
                this.navigateTo('kitchen');
            }
            // Escape = Close modal
            if (e.key === 'Escape') {
                Helpers.closeModal();
            }
        });
    },

    /**
     * Navigate to a page
     * @param {string} pageName - Page to navigate to
     */
    navigateTo(pageName) {
        // Destroy current page if needed
        if (this.currentPage && this.pages[this.currentPage]?.destroy) {
            this.pages[this.currentPage].destroy();
        }

        this.currentPage = pageName;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Update page title
        const titleEl = document.getElementById('page-title');
        if (titleEl) {
            titleEl.textContent = this.pageTitles[pageName] || 'Page';
        }

        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }

        // Render the page
        this.renderPage(pageName);

        // Initialize page if needed
        if (this.pages[pageName]?.init) {
            this.pages[pageName].init();
        }
    },

    /**
     * Render a page
     * @param {string} pageName - Page to render
     */
    renderPage(pageName) {
        const container = document.getElementById('page-container');
        const page = this.pages[pageName];

        if (container && page) {
            container.innerHTML = page.render();
        }
    },

    /**
     * Update orders badge count
     */
    updateOrdersBadge() {
        const badge = document.getElementById('active-orders-badge');
        if (badge) {
            const activeOrders = DataService.getActiveOrders();
            badge.textContent = activeOrders.length;
            badge.style.display = activeOrders.length > 0 ? 'inline-flex' : 'none';
        }
    },

    /**
     * Start the clock in header
     */
    startClock() {
        const updateClock = () => {
            const timeEl = document.getElementById('header-time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make globally available
window.App = App;
