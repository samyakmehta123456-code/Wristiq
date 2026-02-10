/**
 * Kitchen Display Page
 */

const KitchenPage = {
    timerIntervals: {},

    render() {
        const orders = DataService.getOrders().filter(o =>
            o.status === 'pending' || o.status === 'preparing'
        );

        return `
            <div class="kitchen-page">
                <div class="orders-header" style="margin-bottom: var(--spacing-6);">
                    <div>
                        <h2 style="margin: 0;">Kitchen Display</h2>
                        <p style="color: var(--text-secondary); margin: var(--spacing-2) 0 0 0;">
                            ${orders.length} active order${orders.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-3);">
                        <button class="btn" onclick="KitchenPage.refresh()">🔄 Refresh</button>
                    </div>
                </div>

                ${orders.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">👨‍🍳</div>
                        <div class="empty-title">No Active Orders</div>
                        <div class="empty-text">Waiting for new orders...</div>
                    </div>
                ` : `
                    <div class="kitchen-grid">
                        ${orders.map(order => this.renderKitchenCard(order)).join('')}
                    </div>
                `}
            </div>
        `;
    },

    renderKitchenCard(order) {
        const elapsed = this.getElapsedMinutes(order.createdAt);
        const isUrgent = elapsed > 15;
        const timerClass = elapsed > 20 ? 'danger' : elapsed > 10 ? 'warning' : '';

        return `
            <div class="kitchen-card ${isUrgent ? 'urgent' : ''}" data-order-id="${order.id}">
                <div class="kitchen-card-header">
                    <div>
                        <div class="kitchen-order-num">#${order.orderNumber.split('-')[1]}</div>
                        <span class="status-${order.status}">${order.status}</span>
                    </div>
                    <div class="kitchen-timer ${timerClass}" id="timer-${order.id}">
                        ${Helpers.getElapsedTime(order.createdAt)}
                    </div>
                </div>
                <div class="kitchen-items">
                    ${order.items.map(item => `
                        <div class="kitchen-item">
                            <span class="kitchen-item-qty">${item.quantity}</span>
                            ${item.icon || '🍽️'} ${item.name}
                        </div>
                    `).join('')}
                </div>
                ${order.notes ? `
                    <div style="padding: var(--spacing-3) var(--spacing-4); background: var(--warning-900); color: var(--warning-300); font-size: var(--font-size-sm);">
                        📝 ${order.notes}
                    </div>
                ` : ''}
                ${order.wristbandId ? `
                    <div style="padding: var(--spacing-3) var(--spacing-4); background: var(--bg-tertiary); font-size: var(--font-size-sm); display: flex; align-items: center; gap: var(--spacing-2);">
                        📿 Wristband: <span style="color: var(--primary-400);">${order.wristbandId}</span>
                    </div>
                ` : ''}
                <div class="kitchen-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-primary" style="flex: 1;" onclick="KitchenPage.startPreparing('${order.id}')">
                            👨‍🍳 Start Preparing
                        </button>
                    ` : `
                        <button class="btn btn-success" style="flex: 1;" onclick="KitchenPage.markReady('${order.id}')">
                            ✅ Mark Ready & Notify
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    getElapsedMinutes(startTime) {
        const start = new Date(startTime);
        const now = new Date();
        return Math.floor((now - start) / 60000);
    },

    startPreparing(orderId) {
        DataService.updateOrderStatus(orderId, 'preparing');
        Helpers.showToast('Order preparation started', 'info');
        this.refresh();
        App.updateOrdersBadge();
    },

    async markReady(orderId) {
        const order = DataService.getOrderById(orderId);
        DataService.updateOrderStatus(orderId, 'ready');
        Helpers.showToast('Order marked as ready!', 'success');

        // Notify customer via wristband
        if (order.wristbandId) {
            const devices = BluetoothService.getConnectedDevices();
            const device = devices.find(d =>
                d.name === order.wristbandId ||
                d.id.includes(order.wristbandId.replace('WB-', ''))
            );

            if (device) {
                await BluetoothService.sendVibration(device.id, 1);
            }
            Helpers.showToast('📳 Customer notified via wristband!', 'success');
        }

        this.refresh();
        App.updateOrdersBadge();
    },

    refresh() {
        App.renderPage('kitchen');
    },

    startTimers() {
        // Clear existing intervals
        Object.values(this.timerIntervals).forEach(clearInterval);
        this.timerIntervals = {};

        // Update timers every second
        const orders = DataService.getOrders().filter(o =>
            o.status === 'pending' || o.status === 'preparing'
        );

        orders.forEach(order => {
            const timerEl = document.getElementById(`timer-${order.id}`);
            if (timerEl) {
                this.timerIntervals[order.id] = setInterval(() => {
                    const elapsed = this.getElapsedMinutes(order.createdAt);
                    timerEl.textContent = Helpers.getElapsedTime(order.createdAt);
                    timerEl.className = `kitchen-timer ${elapsed > 20 ? 'danger' : elapsed > 10 ? 'warning' : ''}`;

                    // Update card urgency
                    const card = document.querySelector(`[data-order-id="${order.id}"]`);
                    if (card) {
                        if (elapsed > 15) {
                            card.classList.add('urgent');
                        }
                    }
                }, 1000);
            }
        });
    },

    init() {
        // Start timer updates after render
        setTimeout(() => this.startTimers(), 100);

        // Auto-refresh every 10 seconds
        this.refreshInterval = setInterval(() => {
            if (App.currentPage === 'kitchen') {
                this.refresh();
            }
        }, 10000);
    },

    destroy() {
        Object.values(this.timerIntervals).forEach(clearInterval);
        this.timerIntervals = {};

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
};

window.KitchenPage = KitchenPage;
