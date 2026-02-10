/**
 * Inventory Page
 */

const InventoryPage = {
    sortBy: 'stock',
    sortOrder: 'asc',

    render() {
        const items = this.getSortedItems();
        const lowStockItems = items.filter(i => i.stock <= 10 && i.stock > 0);
        const outOfStockItems = items.filter(i => i.stock === 0);

        return `
            <div class="inventory-page">
                <!-- Header -->
                <div class="inventory-header">
                    <div>
                        <h2 style="margin: 0;">Inventory Management</h2>
                        <p style="color: var(--text-secondary); margin: var(--spacing-2) 0 0 0;">
                            Track and manage your stock levels
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-3);">
                        <button class="btn" onclick="InventoryPage.bulkRestock()">
                            📦 Bulk Restock
                        </button>
                    </div>
                </div>

                <!-- Alert Cards -->
                <div class="inventory-alerts">
                    <div class="alert-card danger">
                        <div style="font-size: 2rem;">❌</div>
                        <div>
                            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">${outOfStockItems.length}</div>
                            <div style="color: var(--text-secondary);">Out of Stock</div>
                        </div>
                    </div>
                    <div class="alert-card warning">
                        <div style="font-size: 2rem;">⚠️</div>
                        <div>
                            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">${lowStockItems.length}</div>
                            <div style="color: var(--text-secondary);">Low Stock (&le;10)</div>
                        </div>
                    </div>
                    <div class="alert-card" style="background: var(--success-900); border-color: var(--success-600);">
                        <div style="font-size: 2rem;">✅</div>
                        <div>
                            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">${items.filter(i => i.stock > 10).length}</div>
                            <div style="color: var(--text-secondary);">Well Stocked</div>
                        </div>
                    </div>
                </div>

                <!-- Inventory Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">All Items</h3>
                        <div style="display: flex; gap: var(--spacing-3); align-items: center;">
                            <select class="form-select" style="width: auto;" onchange="InventoryPage.setSortBy(this.value)">
                                <option value="stock" ${this.sortBy === 'stock' ? 'selected' : ''}>Sort by Stock</option>
                                <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Sort by Name</option>
                                <option value="category" ${this.sortBy === 'category' ? 'selected' : ''}>Sort by Category</option>
                            </select>
                            <button class="btn btn-sm" onclick="InventoryPage.toggleSortOrder()">
                                ${this.sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => {
            const category = DataService.getCategoryById(item.categoryId);
            let statusClass = 'badge-success';
            let statusText = 'In Stock';

            if (item.stock === 0) {
                statusClass = 'badge-danger';
                statusText = 'Out of Stock';
            } else if (item.stock <= 10) {
                statusClass = 'badge-warning';
                statusText = 'Low Stock';
            }

            return `
                                        <tr>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                                                    <span style="font-size: 1.5rem;">${item.icon || '🍽️'}</span>
                                                    <span style="font-weight: var(--font-weight-medium);">${item.name}</span>
                                                </div>
                                            </td>
                                            <td>${category ? `${category.icon} ${category.name}` : '-'}</td>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                                                    <div class="progress" style="width: 100px; height: 8px;">
                                                        <div class="progress-bar" style="width: ${Math.min(100, item.stock)}%; background: ${item.stock === 0 ? 'var(--danger-500)' : item.stock <= 10 ? 'var(--warning-500)' : 'var(--success-500)'}"></div>
                                                    </div>
                                                    <span style="font-weight: var(--font-weight-semibold); min-width: 30px;">${item.stock}</span>
                                                </div>
                                            </td>
                                            <td><span class="badge ${statusClass}">${statusText}</span></td>
                                            <td>
                                                <div style="display: flex; gap: var(--spacing-2);">
                                                    <button class="btn btn-sm btn-success" onclick="InventoryPage.quickRestock('${item.id}', 10)">+10</button>
                                                    <button class="btn btn-sm" onclick="InventoryPage.quickRestock('${item.id}', 25)">+25</button>
                                                    <button class="btn btn-sm" onclick="InventoryPage.customRestock('${item.id}')">Custom</button>
                                                </div>
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

    getSortedItems() {
        const items = DataService.getMenuItems();

        return items.sort((a, b) => {
            let comparison = 0;

            switch (this.sortBy) {
                case 'stock':
                    comparison = a.stock - b.stock;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'category':
                    comparison = (a.categoryId || '').localeCompare(b.categoryId || '');
                    break;
            }

            return this.sortOrder === 'asc' ? comparison : -comparison;
        });
    },

    setSortBy(sortBy) {
        this.sortBy = sortBy;
        App.renderPage('inventory');
    },

    toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        App.renderPage('inventory');
    },

    quickRestock(itemId, quantity) {
        DataService.updateStock(itemId, quantity);
        Helpers.showToast(`Added ${quantity} to stock`, 'success');
        App.renderPage('inventory');
    },

    customRestock(itemId) {
        const item = DataService.getMenuItemById(itemId);

        const content = `
            <div style="text-align: center; margin-bottom: var(--spacing-6);">
                <div style="font-size: 3rem;">${item.icon}</div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold);">${item.name}</div>
                <div style="color: var(--text-secondary);">Current Stock: ${item.stock}</div>
            </div>
            <div class="form-group">
                <label class="form-label">Quantity to Add</label>
                <input type="number" class="form-input" id="custom-qty" placeholder="Enter quantity" autofocus>
            </div>
            <div style="display: flex; gap: var(--spacing-3); margin-top: var(--spacing-6);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-success" style="flex: 1;" onclick="InventoryPage.applyCustomRestock('${itemId}')">
                    Add Stock
                </button>
            </div>
        `;

        Helpers.showModal('Custom Restock', content);
    },

    applyCustomRestock(itemId) {
        const qty = parseInt(document.getElementById('custom-qty').value) || 0;
        if (qty <= 0) {
            Helpers.showToast('Please enter a valid quantity', 'warning');
            return;
        }

        DataService.updateStock(itemId, qty);
        Helpers.closeModal();
        Helpers.showToast(`Added ${qty} to stock`, 'success');
        App.renderPage('inventory');
    },

    bulkRestock() {
        const lowStockItems = DataService.getMenuItems().filter(i => i.stock <= 10);

        if (lowStockItems.length === 0) {
            Helpers.showToast('All items are well stocked!', 'info');
            return;
        }

        const content = `
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-6);">
                Add stock to all low-stock items (${lowStockItems.length} items with ≤10 stock)
            </p>
            <div class="form-group">
                <label class="form-label">Quantity to add to each item</label>
                <input type="number" class="form-input" id="bulk-qty" value="25">
            </div>
            <div style="max-height: 200px; overflow-y: auto; margin-bottom: var(--spacing-4);">
                ${lowStockItems.map(item => `
                    <div class="list-item" style="padding: var(--spacing-2);">
                        <span>${item.icon} ${item.name}</span>
                        <span class="badge badge-warning">${item.stock} left</span>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: var(--spacing-3);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="InventoryPage.applyBulkRestock()">
                    Restock All
                </button>
            </div>
        `;

        Helpers.showModal('Bulk Restock', content);
    },

    applyBulkRestock() {
        const qty = parseInt(document.getElementById('bulk-qty').value) || 0;
        if (qty <= 0) {
            Helpers.showToast('Please enter a valid quantity', 'warning');
            return;
        }

        const lowStockItems = DataService.getMenuItems().filter(i => i.stock <= 10);
        lowStockItems.forEach(item => {
            DataService.updateStock(item.id, qty);
        });

        Helpers.closeModal();
        Helpers.showToast(`Restocked ${lowStockItems.length} items!`, 'success');
        App.renderPage('inventory');
    },

    init() {
        this.sortBy = 'stock';
        this.sortOrder = 'asc';
    },

    destroy() { }
};

window.InventoryPage = InventoryPage;
