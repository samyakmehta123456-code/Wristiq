/**
 * New Order Page
 */

const NewOrderPage = {
    cart: [],
    selectedCategory: null,
    assignedWristband: null,
    customerName: '',

    render() {
        const categories = DataService.getCategories();
        const items = this.selectedCategory
            ? DataService.getMenuItemsByCategory(this.selectedCategory)
            : DataService.getMenuItems();

        return `
            <div class="order-layout">
                <!-- Menu Section -->
                <div class="menu-section">
                    <div class="search-box" style="margin-bottom: var(--spacing-4);">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="form-input search-input" placeholder="Search menu items..." id="menu-search" oninput="NewOrderPage.filterItems(this.value)">
                    </div>

                    <!-- Categories -->
                    <div class="menu-categories">
                        <button class="menu-category ${!this.selectedCategory ? 'active' : ''}" onclick="NewOrderPage.selectCategory(null)">
                            All Items
                        </button>
                        ${categories.map(cat => `
                            <button class="menu-category ${this.selectedCategory === cat.id ? 'active' : ''}" onclick="NewOrderPage.selectCategory('${cat.id}')">
                                ${cat.icon} ${cat.name}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Menu Items Grid -->
                    <div class="menu-items" id="menu-items-grid">
                        ${items.map(item => `
                            <div class="menu-item-card ${item.stock === 0 ? 'out-of-stock' : ''}" 
                                 onclick="NewOrderPage.addToCart('${item.id}')"
                                 data-item-id="${item.id}"
                                 data-item-name="${item.name.toLowerCase()}">
                                <div class="menu-item-image">
                                    ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : `<span class="menu-item-icon">${item.icon || '🍽️'}</span>`}
                                </div>
                                <div class="menu-item-name">${item.name}</div>
                                <div class="menu-item-price">${Helpers.formatCurrency(item.price)}</div>
                                <div class="menu-item-stock">
                                    ${item.stock === 0 ? '❌ Out of Stock' : `📦 ${item.stock} available`}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Cart Section -->
                <div class="cart-section">
                    <div class="cart-header">
                        <h3 class="cart-title">🛒 Current Order</h3>
                        ${this.cart.length > 0 ? `
                            <button class="btn btn-ghost btn-sm" onclick="NewOrderPage.clearCart()">Clear</button>
                        ` : ''}
                    </div>

                    <div class="cart-items" id="cart-items">
                        ${this.cart.length === 0 ? `
                            <div class="cart-empty">
                                <div class="cart-empty-icon">🛒</div>
                                <div>Cart is empty</div>
                                <div style="font-size: var(--font-size-sm); margin-top: var(--spacing-2);">
                                    Click on items to add them
                                </div>
                            </div>
                        ` : `
                            ${this.cart.map((item, index) => `
                                <div class="cart-item">
                                    <div class="cart-item-info">
                                        <div class="cart-item-name">${item.name}</div>
                                        <div class="cart-item-price">${Helpers.formatCurrency(item.price)} each</div>
                                    </div>
                                    <div class="cart-item-controls">
                                        <button class="qty-btn" onclick="NewOrderPage.updateQuantity(${index}, -1)">−</button>
                                        <span class="cart-item-qty">${item.quantity}</span>
                                        <button class="qty-btn" onclick="NewOrderPage.updateQuantity(${index}, 1)">+</button>
                                        <span class="cart-item-remove" onclick="NewOrderPage.removeFromCart(${index})">🗑️</span>
                                    </div>
                                </div>
                            `).join('')}
                        `}
                    </div>

                    ${this.cart.length > 0 ? `
                        <!-- Wristband Assignment -->
                        <div class="wristband-section">
                            <div class="wristband-header">
                                <span class="wristband-title">📿 Wristband</span>
                                ${this.assignedWristband ? `
                                    <button class="btn btn-ghost btn-sm" onclick="NewOrderPage.removeWristband()">Remove</button>
                                ` : `
                                    <button class="btn btn-sm btn-primary" onclick="NewOrderPage.assignWristband()">Assign</button>
                                `}
                            </div>
                            ${this.assignedWristband ? `
                                <div class="wristband-assigned">
                                    <span>📿</span>
                                    <span class="wristband-id">${this.assignedWristband}</span>
                                    <span class="badge badge-success">Connected</span>
                                </div>
                            ` : `
                                <div style="font-size: var(--font-size-sm); color: var(--text-tertiary);">
                                    Assign a wristband to notify customer when order is ready
                                </div>
                            `}
                        </div>

                        <!-- Customer Name -->
                        <div style="padding: 0 var(--spacing-4); margin-bottom: var(--spacing-4);">
                            <input type="text" class="form-input" placeholder="Customer Name (optional)" 
                                   value="${this.customerName}" 
                                   onchange="NewOrderPage.customerName = this.value">
                        </div>

                        <!-- Cart Footer -->
                        <div class="cart-footer">
                            <div class="cart-summary">
                                <div class="cart-row">
                                    <span>Subtotal</span>
                                    <span>${Helpers.formatCurrency(this.getSubtotal())}</span>
                                </div>
                                <div class="cart-row">
                                    <span>Tax (5%)</span>
                                    <span>${Helpers.formatCurrency(this.getTax())}</span>
                                </div>
                                <div class="cart-total">
                                    <span>Total</span>
                                    <span>${Helpers.formatCurrency(this.getTotal())}</span>
                                </div>
                            </div>
                            <button class="btn btn-accent btn-lg" style="width: 100%;" onclick="NewOrderPage.placeOrder()">
                                Place Order
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        App.renderPage('new-order');
    },

    filterItems(query) {
        const cards = document.querySelectorAll('.menu-item-card');
        const lowerQuery = query.toLowerCase();
        cards.forEach(card => {
            const name = card.dataset.itemName;
            card.style.display = name.includes(lowerQuery) ? 'block' : 'none';
        });
    },

    addToCart(itemId) {
        const item = DataService.getMenuItemById(itemId);
        if (!item || item.stock === 0) return;

        const existingIndex = this.cart.findIndex(i => i.id === itemId);
        if (existingIndex !== -1) {
            if (this.cart[existingIndex].quantity < item.stock) {
                this.cart[existingIndex].quantity++;
            } else {
                Helpers.showToast('Maximum available quantity reached', 'warning');
                return;
            }
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: 1
            });
        }

        App.renderPage('new-order');
        Helpers.showToast(`Added ${item.name} to cart`, 'success');
    },

    updateQuantity(index, change) {
        const item = this.cart[index];
        const menuItem = DataService.getMenuItemById(item.id);
        const newQty = item.quantity + change;

        if (newQty <= 0) {
            this.removeFromCart(index);
        } else if (newQty <= menuItem.stock) {
            this.cart[index].quantity = newQty;
            App.renderPage('new-order');
        } else {
            Helpers.showToast('Maximum available quantity reached', 'warning');
        }
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        App.renderPage('new-order');
    },

    clearCart() {
        this.cart = [];
        this.assignedWristband = null;
        this.customerName = '';
        App.renderPage('new-order');
    },

    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getTax() {
        return this.getSubtotal() * 0.05;
    },

    getTotal() {
        return this.getSubtotal() + this.getTax();
    },

    async assignWristband() {
        // Only real Bluetooth connections are supported
        if (!BluetoothService.isSupported) {
            Helpers.showToast('Bluetooth not supported in this browser. Use Chrome on a compatible device.', 'error');
            return;
        }

        try {
            const device = await BluetoothService.scanForDevices();
            if (device) {
                const deviceId = await BluetoothService.connect(device);
                if (deviceId) {
                    this.assignedWristband = device.name || deviceId;
                    App.renderPage('new-order');
                    return;
                }
            }
            // No device selected or connection failed
            Helpers.showToast('Failed to connect wristband. Make sure the wristband is powered on and nearby.', 'warning');
        } catch (error) {
            console.error('Wristband connection error:', error);
            Helpers.showToast('Wristband connection failed', 'error');
        }
    },

    removeWristband() {
        this.assignedWristband = null;
        App.renderPage('new-order');
    },

    async placeOrder() {
        if (this.cart.length === 0) {
            Helpers.showToast('Cart is empty', 'warning');
            return;
        }

        const order = DataService.createOrder({
            items: this.cart,
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            total: this.getTotal(),
            customerName: this.customerName || 'Walk-in Customer',
            wristbandId: this.assignedWristband
        });

        // Clear cart
        this.cart = [];
        this.assignedWristband = null;
        this.customerName = '';

        Helpers.showToast(`Order #${order.orderNumber.split('-')[1]} created!`, 'success');
        App.updateOrdersBadge();
        App.navigateTo('orders');
    },

    init() {
        this.cart = [];
        this.selectedCategory = null;
        this.assignedWristband = null;
        this.customerName = '';
    },

    destroy() { }
};

window.NewOrderPage = NewOrderPage;
