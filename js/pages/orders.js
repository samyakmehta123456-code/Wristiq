/**
 * Orders Page
 */

const OrdersPage = {
    filter: 'all',

    render() {
        const orders = this.getFilteredOrders();

        return `
            <div class="orders-page">
                <!-- Header -->
                <div class="orders-header">
                    <div class="orders-filters">
                        <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" onclick="OrdersPage.setFilter('all')">
                            All Orders
                        </button>
                        <button class="filter-btn ${this.filter === 'pending' ? 'active' : ''}" onclick="OrdersPage.setFilter('pending')">
                            ⏳ Pending
                        </button>
                        <button class="filter-btn ${this.filter === 'preparing' ? 'active' : ''}" onclick="OrdersPage.setFilter('preparing')">
                            👨‍🍳 Preparing
                        </button>
                        <button class="filter-btn ${this.filter === 'ready' ? 'active' : ''}" onclick="OrdersPage.setFilter('ready')">
                            ✅ Ready
                        </button>
                        <button class="filter-btn ${this.filter === 'completed' ? 'active' : ''}" onclick="OrdersPage.setFilter('completed')">
                            ✓ Completed
                        </button>
                    </div>
                    <button class="btn btn-primary" onclick="App.navigateTo('new-order')">
                        ➕ New Order
                    </button>
                </div>

                <!-- Orders Grid -->
                ${orders.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-title">No Orders Found</div>
                        <div class="empty-text">
                            ${this.filter === 'all' ? 'Create your first order to get started' : `No ${this.filter} orders`}
                        </div>
                        <button class="btn btn-primary" onclick="App.navigateTo('new-order')">
                            Create Order
                        </button>
                    </div>
                ` : `
                    <div class="orders-grid">
                        ${orders.map(order => this.renderOrderCard(order)).join('')}
                    </div>
                `}
            </div>
        `;
    },

    renderOrderCard(order) {
        const statusActions = this.getStatusActions(order.status);

        return `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <div class="order-number">#${order.orderNumber.split('-')[1]}</div>
                        <div class="order-time">${Helpers.formatTime(order.createdAt)}</div>
                    </div>
                    <span class="status-${order.status}">${order.status}</span>
                </div>
                <div class="order-card-body">
                    <!-- Customer Info -->
                    <div class="order-customer">
                        <div class="avatar avatar-sm">${Helpers.getInitials(order.customerName)}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: var(--font-weight-medium);">${order.customerName}</div>
                            ${order.wristbandId ? `
                                <div class="order-wristband">📿 ${order.wristbandId}</div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Order Items -->
                    <div class="order-items-list">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="order-item-row">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>${Helpers.formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="order-item-row" style="color: var(--text-tertiary);">
                                <span>+${order.items.length - 3} more items...</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Total -->
                    <div style="display: flex; justify-content: space-between; padding-top: var(--spacing-3); border-top: 1px solid var(--border-secondary); font-weight: var(--font-weight-bold);">
                        <span>Total</span>
                        <span style="color: var(--accent-400);">${Helpers.formatCurrency(order.total)}</span>
                    </div>
                </div>
                <div class="order-card-footer">
                    ${statusActions.map(action => `
                        <button class="btn ${action.class}" onclick="OrdersPage.${action.handler}('${order.id}')" style="flex: 1;">
                            ${action.icon} ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getStatusActions(status) {
        switch (status) {
            case 'pending':
                return [
                    { label: 'Start', icon: '👨‍🍳', handler: 'startPreparing', class: 'btn-primary' },
                    { label: 'Cancel', icon: '✕', handler: 'cancelOrder', class: 'btn-ghost' }
                ];
            case 'preparing':
                return [
                    { label: 'Ready', icon: '✅', handler: 'markReady', class: 'btn-success' }
                ];
            case 'ready':
                return [
                    { label: 'Notify', icon: '📳', handler: 'notifyCustomer', class: 'btn-accent' },
                    { label: 'Complete', icon: '✓', handler: 'showPayment', class: 'btn-success' }
                ];
            case 'completed':
                return [
                    { label: 'View Receipt', icon: '🧾', handler: 'viewReceipt', class: '' }
                ];
            default:
                return [];
        }
    },

    getFilteredOrders() {
        const orders = DataService.getOrders();
        if (this.filter === 'all') {
            return orders.filter(o => o.status !== 'cancelled');
        }
        return orders.filter(o => o.status === this.filter);
    },

    setFilter(filter) {
        this.filter = filter;
        App.renderPage('orders');
    },

    startPreparing(orderId) {
        DataService.updateOrderStatus(orderId, 'preparing');
        Helpers.showToast('Order moved to preparing', 'info');
        App.renderPage('orders');
        App.updateOrdersBadge();
    },

    markReady(orderId) {
        DataService.updateOrderStatus(orderId, 'ready');
        Helpers.showToast('Order is ready!', 'success');
        App.renderPage('orders');
        App.updateOrdersBadge();
    },

    async notifyCustomer(orderId) {
        const order = DataService.getOrderById(orderId);
        if (!order.wristbandId) {
            Helpers.showToast('No wristband assigned to this order', 'warning');
            return;
        }

        // Find connected device
        const devices = BluetoothService.getConnectedDevices();
        const device = devices.find(d => d.name === order.wristbandId || d.id.includes(order.wristbandId.replace('WB-', '')));

        if (!device) {
            Helpers.showToast('Wristband is not connected. Please pair the wristband first.', 'error');
            return;
        }

        // Try to send vibration to real device
        const success = await BluetoothService.sendVibration(device.id, 1);
        if (success) {
            Helpers.showToast('Wristband notified successfully!', 'success');
        } else {
            Helpers.showToast('Failed to notify wristband', 'error');
        }
    },

    showPayment(orderId) {
        const order = DataService.getOrderById(orderId);

        const content = `
            <div style="text-align: center; margin-bottom: var(--spacing-6);">
                <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">💳</div>
                <div style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--accent-400);">
                    ${Helpers.formatCurrency(order.total)}
                </div>
                <div style="color: var(--text-secondary);">Order #${order.orderNumber.split('-')[1]}</div>
            </div>
            
            <div style="margin-bottom: var(--spacing-6);">
                <label class="form-label">Payment Method</label>
                <div class="payment-methods" style="grid-template-columns: repeat(3, 1fr); gap: var(--spacing-3);">
                    <div class="payment-method selected" data-method="cash" onclick="OrdersPage.selectPaymentMethod(this)">
                        <div style="font-size: 1.5rem;">💵</div>
                        <div style="font-size: var(--font-size-sm);">Cash</div>
                    </div>
                    <div class="payment-method" data-method="card" onclick="OrdersPage.selectPaymentMethod(this)">
                        <div style="font-size: 1.5rem;">💳</div>
                        <div style="font-size: var(--font-size-sm);">Card</div>
                    </div>
                    <div class="payment-method" data-method="upi" onclick="OrdersPage.selectPaymentMethod(this)">
                        <div style="font-size: 1.5rem;">📱</div>
                        <div style="font-size: var(--font-size-sm);">UPI</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: var(--spacing-3);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-success" style="flex: 1;" onclick="OrdersPage.completePayment('${orderId}')">
                    Complete Payment
                </button>
            </div>
        `;

        Helpers.showModal('Complete Order', content);
        this.selectedPaymentMethod = 'cash';
    },

    selectPaymentMethod(element) {
        document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedPaymentMethod = element.dataset.method;
    },

    completePayment(orderId) {
        DataService.completePayment(orderId, this.selectedPaymentMethod);
        DataService.updateOrderStatus(orderId, 'completed');
        Helpers.closeModal();
        Helpers.showToast('Payment completed!', 'success');
        App.renderPage('orders');
        App.updateOrdersBadge();
    },

    async cancelOrder(orderId) {
        const confirmed = await Helpers.confirm('Are you sure you want to cancel this order?', 'Cancel Order');
        if (confirmed) {
            DataService.updateOrderStatus(orderId, 'cancelled');
            Helpers.showToast('Order cancelled', 'info');
            App.renderPage('orders');
            App.updateOrdersBadge();
        }
    },

    viewReceipt(orderId) {
        const order = DataService.getOrderById(orderId);

        const content = `
            <div style="font-family: monospace; background: var(--bg-tertiary); padding: var(--spacing-6); border-radius: var(--radius-lg);">
                <div style="text-align: center; margin-bottom: var(--spacing-4);">
                    <div style="font-size: var(--font-size-xl); font-weight: bold;">Order Receipt</div>
                    <div style="color: var(--text-tertiary);">${Helpers.formatDateTime(order.createdAt)}</div>
                </div>
                <div class="divider"></div>
                <div style="margin-bottom: var(--spacing-4);">
                    <div>Order: #${order.orderNumber}</div>
                    <div>Date: ${Helpers.formatDateTime(order.createdAt)}</div>
                    <div>Customer: ${order.customerName}</div>
                </div>
                <div class="divider"></div>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-2);">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>${Helpers.formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div class="divider"></div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Subtotal</span>
                    <span>${Helpers.formatCurrency(order.subtotal)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Tax</span>
                    <span>${Helpers.formatCurrency(order.tax)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: var(--font-size-lg); margin-top: var(--spacing-3);">
                    <span>Total</span>
                    <span>${Helpers.formatCurrency(order.total)}</span>
                </div>
                <div class="divider"></div>
                <div style="text-align: center; color: var(--text-tertiary);">
                    <div>Payment: ${order.paymentMethod?.toUpperCase() || 'N/A'}</div>
                    <div style="margin-top: var(--spacing-4);">Thank you for your visit!</div>
                </div>
            </div>
            <div style="margin-top: var(--spacing-4); text-align: center;">
                <button class="btn" onclick="window.print()">🖨️ Print Receipt</button>
            </div>
        `;

        Helpers.showModal('Receipt', content);
    },

    init() {
        this.filter = 'all';
    },

    destroy() { }
};

window.OrdersPage = OrdersPage;
