/**
 * Customers Page
 */

const CustomersPage = {
    selectedCustomer: null,
    searchQuery: '',

    render() {
        const customers = this.getFilteredCustomers();

        return `
            <div class="customers-page">
                <!-- Header -->
                <div class="orders-header" style="margin-bottom: var(--spacing-6);">
                    <div class="search-box" style="width: 300px;">
                        <span class="search-icon">🔍</span>
                        <input type="text" class="form-input search-input" placeholder="Search customers..." 
                               value="${this.searchQuery}" oninput="CustomersPage.search(this.value)">
                    </div>
                    <button class="btn btn-primary" onclick="CustomersPage.showAddCustomer()">
                        ➕ Add Customer
                    </button>
                </div>

                ${this.selectedCustomer ? this.renderCustomerDetails() : this.renderCustomersList(customers)}
            </div>
        `;
    },

    renderCustomersList(customers) {
        if (customers.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <div class="empty-title">No Customers Found</div>
                    <div class="empty-text">
                        ${this.searchQuery ? 'No customers match your search' : 'Add your first customer to get started'}
                    </div>
                    <button class="btn btn-primary" onclick="CustomersPage.showAddCustomer()">
                        Add Customer
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-auto">
                ${customers.map(customer => `
                    <div class="card" style="cursor: pointer;" onclick="CustomersPage.selectCustomer('${customer.id}')">
                        <div class="card-body" style="display: flex; align-items: center; gap: var(--spacing-4);">
                            <div class="avatar avatar-lg">${Helpers.getInitials(customer.name)}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-1);">
                                    ${customer.name}
                                </div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                                    ${customer.phone || 'No phone'}
                                </div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-tertiary);">
                                    ${customer.totalOrders || 0} orders • ${Helpers.formatCurrency(customer.totalSpent || 0)} spent
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderCustomerDetails() {
        const customer = this.selectedCustomer;
        const orders = DataService.getCustomerOrders(customer.id);

        return `
            <div class="customer-profile">
                <!-- Left: Customer Info -->
                <div>
                    <div class="card">
                        <div class="card-body customer-info">
                            <button class="btn btn-ghost btn-sm" style="position: absolute; top: var(--spacing-4); left: var(--spacing-4);" 
                                    onclick="CustomersPage.deselectCustomer()">
                                ← Back
                            </button>
                            <div class="avatar avatar-xl customer-avatar">${Helpers.getInitials(customer.name)}</div>
                            <div class="customer-name">${customer.name}</div>
                            <div style="color: var(--text-secondary); margin-bottom: var(--spacing-4);">
                                ${customer.phone || 'No phone'} • ${customer.email || 'No email'}
                            </div>
                            <div class="divider"></div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-4); text-align: center;">
                                <div>
                                    <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
                                        ${orders.length}
                                    </div>
                                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Total Orders</div>
                                </div>
                                <div>
                                    <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--accent-400);">
                                        ${Helpers.formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
                                    </div>
                                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Total Spent</div>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div style="display: flex; gap: var(--spacing-3);">
                                <button class="btn" style="flex: 1;" onclick="CustomersPage.showEditCustomer()">
                                    ✏️ Edit
                                </button>
                                <button class="btn btn-danger" style="flex: 1;" onclick="CustomersPage.deleteCustomer('${customer.id}')">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Order History -->
                <div>
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Order History</h3>
                        </div>
                        ${orders.length === 0 ? `
                            <div class="card-body">
                                <div class="empty-state" style="padding: var(--spacing-8);">
                                    <div class="empty-icon">📋</div>
                                    <div class="empty-title">No Orders Yet</div>
                                </div>
                            </div>
                        ` : `
                            <div class="table-wrapper">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders.map(order => `
                                            <tr>
                                                <td style="font-weight: var(--font-weight-medium);">#${order.orderNumber.split('-')[1]}</td>
                                                <td>${Helpers.formatDateTime(order.createdAt)}</td>
                                                <td>${order.items.length} items</td>
                                                <td style="font-weight: var(--font-weight-semibold); color: var(--accent-400);">
                                                    ${Helpers.formatCurrency(order.total)}
                                                </td>
                                                <td><span class="status-${order.status}">${order.status}</span></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    getFilteredCustomers() {
        const customers = DataService.getCustomers();
        if (!this.searchQuery) return customers;

        const query = this.searchQuery.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(query) ||
            (c.phone && c.phone.includes(query)) ||
            (c.email && c.email.toLowerCase().includes(query))
        );
    },

    search(query) {
        this.searchQuery = query;
        this.selectedCustomer = null;
        App.renderPage('customers');
    },

    selectCustomer(customerId) {
        this.selectedCustomer = DataService.getCustomerById(customerId);
        App.renderPage('customers');
    },

    deselectCustomer() {
        this.selectedCustomer = null;
        App.renderPage('customers');
    },

    showAddCustomer() {
        this.showCustomerForm();
    },

    showEditCustomer() {
        this.showCustomerForm(this.selectedCustomer);
    },

    showCustomerForm(customer = null) {
        const content = `
            <div class="form-group">
                <label class="form-label">Name *</label>
                <input type="text" class="form-input" id="customer-name" placeholder="Enter name" value="${customer?.name || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" id="customer-phone" placeholder="Enter phone number" value="${customer?.phone || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="customer-email" placeholder="Enter email" value="${customer?.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-textarea" id="customer-notes" placeholder="Any notes about this customer">${customer?.notes || ''}</textarea>
            </div>
            <div style="display: flex; gap: var(--spacing-3); margin-top: var(--spacing-6);">
                <button class="btn" style="flex: 1;" onclick="Helpers.closeModal()">Cancel</button>
                <button class="btn btn-primary" style="flex: 1;" onclick="CustomersPage.saveCustomer(${customer ? `'${customer.id}'` : 'null'})">
                    ${customer ? 'Update' : 'Add'} Customer
                </button>
            </div>
        `;

        Helpers.showModal(customer ? 'Edit Customer' : 'Add Customer', content);
    },

    saveCustomer(customerId) {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const notes = document.getElementById('customer-notes').value.trim();

        if (!name) {
            Helpers.showToast('Please enter a name', 'warning');
            return;
        }

        const customerData = { name, phone, email, notes };

        if (customerId) {
            DataService.updateCustomer(customerId, customerData);
            this.selectedCustomer = DataService.getCustomerById(customerId);
            Helpers.showToast('Customer updated!', 'success');
        } else {
            const newCustomer = DataService.addCustomer(customerData);
            this.selectedCustomer = newCustomer;
            Helpers.showToast('Customer added!', 'success');
        }

        Helpers.closeModal();
        App.renderPage('customers');
    },

    async deleteCustomer(customerId) {
        const confirmed = await Helpers.confirm('Are you sure you want to delete this customer?', 'Delete Customer');
        if (confirmed) {
            let customers = DataService.getCustomers();
            customers = customers.filter(c => c.id !== customerId);
            Storage.save(Storage.KEYS.CUSTOMERS, customers);

            this.selectedCustomer = null;
            Helpers.showToast('Customer deleted', 'info');
            App.renderPage('customers');
        }
    },

    init() {
        this.selectedCustomer = null;
        this.searchQuery = '';
    },

    destroy() { }
};

window.CustomersPage = CustomersPage;
