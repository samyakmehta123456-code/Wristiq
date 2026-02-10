/**
 * Dashboard Page
 */

const DashboardPage = {
    render() {
        const stats = DataService.getTodayStats();
        const lowStockItems = DataService.getLowStockItems(10);
        const activeOrders = DataService.getActiveOrders().slice(0, 5);
        const popularItems = DataService.getPopularItems(5);

        return `
            <div class="dashboard">
                <!-- Stats Cards -->
                <div class="dashboard-stats">
                    <div class="card stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${Helpers.formatCurrency(stats.revenue)}</div>
                        <div class="stat-label">Today's Revenue</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-value">${stats.totalOrders}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-value">${stats.activeOrders}</div>
                        <div class="stat-label">Active Orders</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${Helpers.formatCurrency(stats.avgOrderValue)}</div>
                        <div class="stat-label">Avg Order Value</div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Left Column -->
                    <div class="dashboard-left">
                        <!-- Active Orders -->
                        <div class="card" style="margin-bottom: var(--spacing-6);">
                            <div class="card-header">
                                <h3 class="card-title">Active Orders</h3>
                                <a href="#" class="btn btn-sm" data-page="orders">View All</a>
                            </div>
                            <div class="card-body">
                                ${activeOrders.length === 0 ? `
                                    <div class="empty-state" style="padding: var(--spacing-8);">
                                        <div class="empty-icon">📋</div>
                                        <div class="empty-title">No Active Orders</div>
                                        <div class="empty-text">New orders will appear here</div>
                                    </div>
                                ` : `
                                    <div class="orders-mini-list">
                                        ${activeOrders.map(order => `
                                            <div class="list-item" onclick="App.navigateTo('orders')">
                                                <div class="avatar">#${order.orderNumber.split('-')[1]}</div>
                                                <div class="list-item-content">
                                                    <div class="list-item-title">${order.customerName}</div>
                                                    <div class="list-item-subtitle">${order.items.length} items • ${Helpers.formatCurrency(order.total)}</div>
                                                </div>
                                                <span class="status-${order.status}">${order.status}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Popular Items -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Popular Items</h3>
                            </div>
                            <div class="card-body">
                                ${popularItems.map((item, index) => `
                                    <div class="list-item">
                                        <div class="avatar" style="background: linear-gradient(135deg, var(--accent-500), var(--accent-700));">
                                            ${index + 1}
                                        </div>
                                        <div class="list-item-content">
                                            <div class="list-item-title">${item.icon} ${item.name}</div>
                                            <div class="list-item-subtitle">${item.orderCount || 0} orders</div>
                                        </div>
                                        <span style="font-weight: var(--font-weight-semibold); color: var(--accent-400);">
                                            ${Helpers.formatCurrency(item.price)}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div class="dashboard-right">
                        <!-- Quick Actions -->
                        <div class="card" style="margin-bottom: var(--spacing-6);">
                            <div class="card-header">
                                <h3 class="card-title">Quick Actions</h3>
                            </div>
                            <div class="card-body">
                                <div style="display: grid; gap: var(--spacing-3);">
                                    <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="App.navigateTo('new-order')">
                                        ➕ New Order
                                    </button>
                                    <button class="btn btn-lg" style="width: 100%;" onclick="App.navigateTo('kitchen')">
                                        👨‍🍳 Kitchen Display
                                    </button>
                                    <button class="btn btn-lg" style="width: 100%;" onclick="App.navigateTo('menu')">
                                        📖 Manage Menu
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Low Stock Alert -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">⚠️ Low Stock Items</h3>
                            </div>
                            <div class="card-body">
                                ${lowStockItems.length === 0 ? `
                                    <div style="text-align: center; padding: var(--spacing-6); color: var(--text-tertiary);">
                                        <div style="font-size: 2rem; margin-bottom: var(--spacing-2);">✅</div>
                                        <div>All items well stocked</div>
                                    </div>
                                ` : `
                                    ${lowStockItems.map(item => `
                                        <div class="list-item">
                                            <span class="stock-indicator ${item.stock === 0 ? 'out' : 'low'}"></span>
                                            <div class="list-item-content">
                                                <div class="list-item-title">${item.icon} ${item.name}</div>
                                            </div>
                                            <span class="badge ${item.stock === 0 ? 'badge-danger' : 'badge-warning'}">
                                                ${item.stock} left
                                            </span>
                                        </div>
                                    `).join('')}
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        // Auto-refresh dashboard every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (App.currentPage === 'dashboard') {
                App.renderPage('dashboard');
            }
        }, 30000);
    },

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
};

window.DashboardPage = DashboardPage;
