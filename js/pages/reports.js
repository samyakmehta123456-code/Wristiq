/**
 * Reports Page
 */

const ReportsPage = {
    dateRange: 'today',

    render() {
        const stats = this.getStats();
        const popularItems = DataService.getPopularItems(10);

        return `
            <div class="reports-page">
                <!-- Header -->
                <div class="orders-header" style="margin-bottom: var(--spacing-6);">
                    <div>
                        <h2 style="margin: 0;">Reports & Analytics</h2>
                        <p style="color: var(--text-secondary); margin: var(--spacing-2) 0 0 0;">
                            Track your business performance
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-3);">
                        <select class="form-select" style="width: auto;" onchange="ReportsPage.setDateRange(this.value)">
                            <option value="today" ${this.dateRange === 'today' ? 'selected' : ''}>Today</option>
                            <option value="week" ${this.dateRange === 'week' ? 'selected' : ''}>This Week</option>
                            <option value="month" ${this.dateRange === 'month' ? 'selected' : ''}>This Month</option>
                            <option value="all" ${this.dateRange === 'all' ? 'selected' : ''}>All Time</option>
                        </select>
                        <button class="btn" onclick="ReportsPage.exportData()">
                            📥 Export Data
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="dashboard-stats" style="margin-bottom: var(--spacing-8);">
                    <div class="card stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${Helpers.formatCurrency(stats.revenue)}</div>
                        <div class="stat-label">Total Revenue</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-value">${stats.totalOrders}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${Helpers.formatCurrency(stats.avgOrderValue)}</div>
                        <div class="stat-label">Avg Order Value</div>
                    </div>
                    <div class="card stat-card">
                        <div class="stat-icon">🍽️</div>
                        <div class="stat-value">${stats.itemsSold}</div>
                        <div class="stat-label">Items Sold</div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Revenue Chart -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3 class="card-title">Revenue Overview</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderRevenueChart(stats.revenueByDay)}
                        </div>
                    </div>

                    <!-- Payment Methods -->
                    <div class="card report-card">
                        <div class="card-header">
                            <h3 class="card-title">Payment Methods</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderPaymentStats(stats.paymentMethods)}
                        </div>
                    </div>
                </div>

                <!-- Popular Items -->
                <div class="card" style="margin-top: var(--spacing-6);">
                    <div class="card-header">
                        <h3 class="card-title">🏆 Top Selling Items</h3>
                    </div>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${popularItems.map((item, index) => {
            const category = DataService.getCategoryById(item.categoryId);
            return `
                                        <tr>
                                            <td>
                                                <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${index < 3 ? 'linear-gradient(135deg, var(--accent-500), var(--accent-700))' : 'var(--bg-tertiary)'}; border-radius: var(--radius-md); font-weight: var(--font-weight-bold);">
                                                    ${index + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                                                    <div style="width: 40px; height: 40px; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-tertiary); flex-shrink: 0;">
                                                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
                                                    </div>
                                                    <span style="font-weight: var(--font-weight-medium);">${item.name}</span>
                                                </div>
                                            </td>
                                            <td>${category ? `${category.icon} ${category.name}` : '-'}</td>
                                            <td style="font-weight: var(--font-weight-semibold);">${item.orderCount || 0}</td>
                                            <td style="color: var(--accent-400); font-weight: var(--font-weight-semibold);">
                                                ${Helpers.formatCurrency((item.orderCount || 0) * item.price)}
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    getStats() {
        const orders = this.getFilteredOrders();
        const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

        // Calculate revenue by day
        const revenueByDay = {};
        paidOrders.forEach(order => {
            const date = order.createdAt.slice(0, 10);
            revenueByDay[date] = (revenueByDay[date] || 0) + order.total;
        });

        // Calculate payment methods
        const paymentMethods = { cash: 0, card: 0, upi: 0 };
        paidOrders.forEach(order => {
            if (order.paymentMethod) {
                paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + order.total;
            }
        });

        // Calculate items sold
        let itemsSold = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                itemsSold += item.quantity;
            });
        });

        return {
            totalOrders: orders.length,
            revenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
            avgOrderValue: paidOrders.length > 0 ? paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length : 0,
            itemsSold,
            revenueByDay,
            paymentMethods
        };
    },

    getFilteredOrders() {
        const orders = DataService.getOrders();
        const now = new Date();

        switch (this.dateRange) {
            case 'today':
                const today = now.toISOString().slice(0, 10);
                return orders.filter(o => o.createdAt.slice(0, 10) === today);
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orders.filter(o => new Date(o.createdAt) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return orders.filter(o => new Date(o.createdAt) >= monthAgo);
            default:
                return orders;
        }
    },

    renderRevenueChart(revenueByDay) {
        const days = Object.entries(revenueByDay).slice(-7);

        if (days.length === 0) {
            return `
                <div class="chart-placeholder">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">📈</div>
                        <div>No revenue data for this period</div>
                    </div>
                </div>
            `;
        }

        const maxRevenue = Math.max(...days.map(d => d[1]));

        return `
            <div style="display: flex; align-items: flex-end; gap: var(--spacing-4); height: 200px; padding: var(--spacing-4);">
                ${days.map(([date, revenue]) => {
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            const dayName = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
            return `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-2);">
                            <div style="font-size: var(--font-size-xs); color: var(--text-tertiary);">
                                ${Helpers.formatCurrency(revenue)}
                            </div>
                            <div style="width: 100%; height: ${height}%; min-height: 4px; background: linear-gradient(180deg, var(--primary-500), var(--accent-500)); border-radius: var(--radius-md);"></div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">${dayName}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderPaymentStats(paymentMethods) {
        const total = Object.values(paymentMethods).reduce((a, b) => a + b, 0);

        if (total === 0) {
            return `
                <div class="chart-placeholder">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: var(--spacing-4);">💳</div>
                        <div>No payment data for this period</div>
                    </div>
                </div>
            `;
        }

        const methods = [
            { key: 'cash', label: 'Cash', icon: '💵', color: 'var(--success-500)' },
            { key: 'card', label: 'Card', icon: '💳', color: 'var(--primary-500)' },
            { key: 'upi', label: 'UPI', icon: '📱', color: 'var(--accent-500)' }
        ];

        return `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
                ${methods.map(method => {
            const value = paymentMethods[method.key] || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return `
                        <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                            <span style="font-size: 1.5rem;">${method.icon}</span>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-1);">
                                    <span>${method.label}</span>
                                    <span style="color: var(--text-secondary);">${Helpers.formatCurrency(value)} (${percentage.toFixed(1)}%)</span>
                                </div>
                                <div class="progress" style="height: 8px;">
                                    <div class="progress-bar" style="width: ${percentage}%; background: ${method.color};"></div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    setDateRange(range) {
        this.dateRange = range;
        App.renderPage('reports');
    },

    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `pos-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
        Helpers.showToast('Data exported successfully!', 'success');
    },

    init() {
        this.dateRange = 'today';
    },

    destroy() { }
};

window.ReportsPage = ReportsPage;
