/**
 * Menu Management Page
 */

const MenuPage = {
    selectedCategory: null,
    editingItem: null,

    render() {
        const categories = DataService.getCategories();
        const items = this.selectedCategory
            ? DataService.getMenuItemsByCategory(this.selectedCategory)
            : DataService.getMenuItems();

        return `
            <div class="menu-management">
                <!-- Header -->
                <div class="menu-management-header">
                    <div>
                        <h2 style="margin: 0;">Menu Management</h2>
                        <p style="color: var(--text-secondary); margin: var(--spacing-2) 0 0 0;">
                            ${items.length} items in menu
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-3);">
                        <button class="btn" onclick="MenuPage.showAddCategory()">
                            📁 Add Category
                        </button>
                        <button class="btn btn-primary" onclick="MenuPage.showAddItem()">
                            ➕ Add Item
                        </button>
                    </div>
                </div>

                <!-- Categories -->
                <div class="card" style="margin-bottom: var(--spacing-6);">
                    <div class="card-header">
                        <h3 class="card-title">Categories</h3>
                    </div>
                    <div class="card-body">
                        <div class="categories-list">
                            <div class="category-tag ${!this.selectedCategory ? 'active' : ''}" onclick="MenuPage.selectCategory(null)">
                                All Items
                            </div>
                            ${categories.map(cat => `
                                <div class="category-tag ${this.selectedCategory === cat.id ? 'active' : ''}" onclick="MenuPage.selectCategory('${cat.id}')">
                                    ${cat.icon} ${cat.name}
                                    <span class="delete-btn" onclick="event.stopPropagation(); MenuPage.deleteCategory('${cat.id}')">✕</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Menu Items Table -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Menu Items</h3>
                        <div class="search-box" style="width: 300px;">
                            <span class="search-icon">🔍</span>
                            <input type="text" class="form-input search-input" placeholder="Search items..." oninput="MenuPage.filterItems(this.value)">
                        </div>
                    </div>
                    <div class="table-wrapper">
                        <table class="table" id="menu-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => {
            const category = DataService.getCategoryById(item.categoryId);
            return `
                                        <tr data-item-name="${item.name.toLowerCase()}">
                                            <td>
                                                <div style="display: flex; align-items: center; gap: var(--spacing-3);">
                                                    <div style="width: 50px; height: 50px; border-radius: var(--radius-md); overflow: hidden; background: var(--bg-tertiary); flex-shrink: 0;">
                                                        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 1.5rem;">${item.icon || '🍽️'}</span>`}
                                                    </div>
                                                    <div>
                                                        <div style="font-weight: var(--font-weight-medium);">${item.name}</div>
                                                        <div style="font-size: var(--font-size-xs); color: var(--text-tertiary);">${item.description || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${category ? `${category.icon} ${category.name}` : '-'}</td>
                                            <td style="font-weight: var(--font-weight-semibold); color: var(--accent-400);">
                                                ${Helpers.formatCurrency(item.price)}
                                            </td>
                                            <td>
                                                <div style="display: flex; align-items: center; gap: var(--spacing-2);">
                                                    <span class="stock-indicator ${item.stock === 0 ? 'out' : item.stock <= 10 ? 'low' : 'good'}"></span>
                                                    ${item.stock}
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge ${item.stock === 0 ? 'badge-danger' : 'badge-success'}">
                                                    ${item.stock === 0 ? 'Out of Stock' : 'Available'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style="display: flex; gap: var(--spacing-2);">
                                                    <button class="btn btn-sm" onclick="MenuPage.showEditItem('${item.id}')">✏️</button>
                                                    <button class="btn btn-sm" onclick="MenuPage.showRestockItem('${item.id}')">📦</button>
                                                    <button class="btn btn-sm btn-danger" onclick="MenuPage.deleteItem('${item.id}')">🗑️</button>
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

    selectCategory(categoryId) {
        this.selectedCategory = categoryId;
        App.renderPage('menu');
    },

    filterItems(query) {
        const rows = document.querySelectorAll('#menu-table tbody tr');
        const lowerQuery = query.toLowerCase();
        rows.forEach(row => {
            const name = row.dataset.itemName;
            row.style.display = name.includes(lowerQuery) ? '' : 'none';
        });
    },

    showAddCategory() {
        const content = `
            <div class="form-group">
                <label class="form-label">Category Name</label>
                <input type="text" class="form-input" id="category-name" placeholder="e.g., Appetizers">
            </div>
            <div class="form-group">
                <label class="form-label">Icon (emoji)</label>
                <input type="text" class="form-input" id="category-icon" placeholder="e.g., 🥗" maxlength="2">
            </div>
            <div style="display: flex; gap: var(--spacing-3); margin-top: var(--spacing-6);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="MenuPage.addCategory()">Add Category</button>
            </div>
        `;
        Helpers.showModal('Add Category', content);
    },

    addCategory() {
        const name = document.getElementById('category-name').value.trim();
        const icon = document.getElementById('category-icon').value.trim() || '📁';

        if (!name) {
            Helpers.showToast('Please enter a category name', 'warning');
            return;
        }

        DataService.addCategory({ name, icon });
        Helpers.closeModal();
        Helpers.showToast('Category added!', 'success');
        App.renderPage('menu');
    },

    async deleteCategory(categoryId) {
        const confirmed = await Helpers.confirm('Delete this category? Items in this category will become uncategorized.', 'Delete Category');
        if (confirmed) {
            DataService.deleteCategory(categoryId);
            if (this.selectedCategory === categoryId) {
                this.selectedCategory = null;
            }
            Helpers.showToast('Category deleted', 'info');
            App.renderPage('menu');
        }
    },

    showAddItem() {
        this.editingItem = null;
        this.showItemForm();
    },

    showEditItem(itemId) {
        this.editingItem = DataService.getMenuItemById(itemId);
        this.showItemForm();
    },

    showItemForm() {
        const categories = DataService.getCategories();
        const item = this.editingItem;

        const content = `
            <div class="form-group">
                <label class="form-label">Item Name *</label>
                <input type="text" class="form-input" id="item-name" placeholder="e.g., Butter Chicken" value="${item?.name || ''}">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4);">
                <div class="form-group">
                    <label class="form-label">Price (₹) *</label>
                    <input type="number" class="form-input" id="item-price" placeholder="0" value="${item?.price || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Stock Quantity</label>
                    <input type="number" class="form-input" id="item-stock" placeholder="0" value="${item?.stock || 0}">
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4);">
                <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select class="form-select" id="item-category">
                        <option value="">Select Category</option>
                        ${categories.map(cat => `
                            <option value="${cat.id}" ${item?.categoryId === cat.id ? 'selected' : ''}>
                                ${cat.icon} ${cat.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Icon (emoji)</label>
                    <input type="text" class="form-input" id="item-icon" placeholder="e.g., 🍛" maxlength="2" value="${item?.icon || ''}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="item-description" placeholder="Brief description of the item">${item?.description || ''}</textarea>
            </div>
            <div style="display: flex; gap: var(--spacing-3); margin-top: var(--spacing-6);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="MenuPage.saveItem()">
                    ${item ? 'Update Item' : 'Add Item'}
                </button>
            </div>
        `;

        Helpers.showModal(item ? 'Edit Menu Item' : 'Add Menu Item', content);
    },

    saveItem() {
        const name = document.getElementById('item-name').value.trim();
        const price = parseFloat(document.getElementById('item-price').value);
        const stock = parseInt(document.getElementById('item-stock').value) || 0;
        const categoryId = document.getElementById('item-category').value;
        const icon = document.getElementById('item-icon').value.trim() || '🍽️';
        const description = document.getElementById('item-description').value.trim();

        if (!name || !price || !categoryId) {
            Helpers.showToast('Please fill in all required fields', 'warning');
            return;
        }

        const itemData = { name, price, stock, categoryId, icon, description };

        if (this.editingItem) {
            DataService.updateMenuItem(this.editingItem.id, itemData);
            Helpers.showToast('Item updated!', 'success');
        } else {
            DataService.addMenuItem(itemData);
            Helpers.showToast('Item added!', 'success');
        }

        Helpers.closeModal();
        App.renderPage('menu');
    },

    showRestockItem(itemId) {
        const item = DataService.getMenuItemById(itemId);

        const content = `
            <div style="text-align: center; margin-bottom: var(--spacing-6);">
                <div style="font-size: 3rem;">${item.icon}</div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold);">${item.name}</div>
                <div style="color: var(--text-secondary);">Current Stock: ${item.stock}</div>
            </div>
            <div class="form-group">
                <label class="form-label">Add Stock Quantity</label>
                <input type="number" class="form-input" id="restock-qty" placeholder="Enter quantity to add" value="10">
            </div>
            <div style="display: flex; gap: var(--spacing-3); margin-top: var(--spacing-6);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-success" style="flex: 1;" onclick="MenuPage.restockItem('${itemId}')">
                    Add Stock
                </button>
            </div>
        `;

        Helpers.showModal('Restock Item', content);
    },

    restockItem(itemId) {
        const qty = parseInt(document.getElementById('restock-qty').value) || 0;
        if (qty <= 0) {
            Helpers.showToast('Please enter a valid quantity', 'warning');
            return;
        }

        DataService.updateStock(itemId, qty);
        Helpers.closeModal();
        Helpers.showToast(`Added ${qty} to stock!`, 'success');
        App.renderPage('menu');
    },

    async deleteItem(itemId) {
        const confirmed = await Helpers.confirm('Are you sure you want to delete this item?', 'Delete Item');
        if (confirmed) {
            DataService.deleteMenuItem(itemId);
            Helpers.showToast('Item deleted', 'info');
            App.renderPage('menu');
        }
    },

    init() {
        this.selectedCategory = null;
        this.editingItem = null;
    },

    destroy() { }
};

window.MenuPage = MenuPage;
