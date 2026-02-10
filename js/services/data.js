/**
 * Data Service
 * Manages all application data and provides CRUD operations
 */

const DataService = {
    /**
     * Initialize with sample data if empty
     */
    init() {
        // Initialize categories
        if (!Storage.load(Storage.KEYS.CATEGORIES)) {
            this.initCategories();
        }

        // Initialize menu items
        if (!Storage.load(Storage.KEYS.MENU_ITEMS)) {
            this.initMenuItems();
        }

        // Initialize orders array
        if (!Storage.load(Storage.KEYS.ORDERS)) {
            Storage.save(Storage.KEYS.ORDERS, []);
        }

        // Initialize customers array
        if (!Storage.load(Storage.KEYS.CUSTOMERS)) {
            Storage.save(Storage.KEYS.CUSTOMERS, []);
        }
    },

    /**
     * Initialize default categories
     */
    initCategories() {
        const categories = [
            { id: 'cat_1', name: 'Starters', icon: '🥗', order: 1 },
            { id: 'cat_2', name: 'Main Course', icon: '🍛', order: 2 },
            { id: 'cat_3', name: 'Beverages', icon: '🍹', order: 3 },
            { id: 'cat_4', name: 'Desserts', icon: '🍰', order: 4 },
            { id: 'cat_5', name: 'Snacks', icon: '🍟', order: 5 }
        ];
        Storage.save(Storage.KEYS.CATEGORIES, categories);
    },

    /**
     * Initialize sample menu items
     */
    initMenuItems() {
        const items = [
            { id: 'item_1', name: 'Paneer Tikka', price: 280, categoryId: 'cat_1', stock: 25, image: 'images/paneer_tikka.png', description: 'Grilled cottage cheese with spices' },
            { id: 'item_2', name: 'Chicken Wings', price: 320, categoryId: 'cat_1', stock: 30, image: 'images/chicken_wings.png', description: 'Crispy fried chicken wings' },
            { id: 'item_3', name: 'Veg Spring Rolls', price: 180, categoryId: 'cat_1', stock: 40, image: 'images/spring_rolls.png', description: 'Crispy vegetable rolls' },
            { id: 'item_4', name: 'Butter Chicken', price: 380, categoryId: 'cat_2', stock: 20, image: 'images/butter_chicken.png', description: 'Creamy tomato chicken curry' },
            { id: 'item_5', name: 'Dal Makhani', price: 260, categoryId: 'cat_2', stock: 25, image: 'images/dal_makhani.png', description: 'Creamy black lentils' },
            { id: 'item_6', name: 'Biryani', price: 320, categoryId: 'cat_2', stock: 30, image: 'images/biryani.png', description: 'Aromatic rice with spices' },
            { id: 'item_7', name: 'Naan Bread', price: 60, categoryId: 'cat_2', stock: 100, image: 'images/naan_bread.png', description: 'Freshly baked garlic naan' },
            { id: 'item_8', name: 'Mojito', price: 180, categoryId: 'cat_3', stock: 50, image: 'images/mojito.png', description: 'Refreshing mint cocktail' },
            { id: 'item_9', name: 'Beer', price: 250, categoryId: 'cat_3', stock: 100, image: 'images/beer.png', description: 'Chilled premium beer' },
            { id: 'item_10', name: 'Fresh Juice', price: 120, categoryId: 'cat_3', stock: 100, image: 'images/fresh_juice.png', description: 'Fresh orange juice' },
            { id: 'item_11', name: 'Gulab Jamun', price: 120, categoryId: 'cat_4', stock: 40, image: 'images/gulab_jamun.png', description: 'Sweet milk dumplings in syrup' },
            { id: 'item_12', name: 'Chocolate Brownie', price: 180, categoryId: 'cat_4', stock: 50, image: 'images/brownie.png', description: 'Rich brownie with ice cream' }
        ];
        Storage.save(Storage.KEYS.MENU_ITEMS, items);
    },

    // ================== CATEGORIES ==================

    getCategories() {
        return Storage.load(Storage.KEYS.CATEGORIES, []);
    },

    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    },

    addCategory(category) {
        const categories = this.getCategories();
        category.id = 'cat_' + Storage.generateId();
        category.order = categories.length + 1;
        categories.push(category);
        Storage.save(Storage.KEYS.CATEGORIES, categories);
        return category;
    },

    updateCategory(id, updates) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updates };
            Storage.save(Storage.KEYS.CATEGORIES, categories);
            return categories[index];
        }
        return null;
    },

    deleteCategory(id) {
        let categories = this.getCategories();
        categories = categories.filter(c => c.id !== id);
        Storage.save(Storage.KEYS.CATEGORIES, categories);
    },

    // ================== MENU ITEMS ==================

    getMenuItems() {
        return Storage.load(Storage.KEYS.MENU_ITEMS, []);
    },

    getMenuItemById(id) {
        const items = this.getMenuItems();
        return items.find(i => i.id === id);
    },

    getMenuItemsByCategory(categoryId) {
        const items = this.getMenuItems();
        return items.filter(i => i.categoryId === categoryId);
    },

    addMenuItem(item) {
        const items = this.getMenuItems();
        item.id = 'item_' + Storage.generateId();
        item.createdAt = new Date().toISOString();
        items.push(item);
        Storage.save(Storage.KEYS.MENU_ITEMS, items);
        return item;
    },

    updateMenuItem(id, updates) {
        const items = this.getMenuItems();
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            Storage.save(Storage.KEYS.MENU_ITEMS, items);
            return items[index];
        }
        return null;
    },

    deleteMenuItem(id) {
        let items = this.getMenuItems();
        items = items.filter(i => i.id !== id);
        Storage.save(Storage.KEYS.MENU_ITEMS, items);
    },

    updateStock(itemId, quantity) {
        const items = this.getMenuItems();
        const index = items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            items[index].stock = Math.max(0, items[index].stock + quantity);
            Storage.save(Storage.KEYS.MENU_ITEMS, items);
            return items[index];
        }
        return null;
    },

    // ================== ORDERS ==================

    getOrders() {
        return Storage.load(Storage.KEYS.ORDERS, []);
    },

    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    },

    getOrdersByStatus(status) {
        const orders = this.getOrders();
        return orders.filter(o => o.status === status);
    },

    getActiveOrders() {
        const orders = this.getOrders();
        return orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    },

    createOrder(orderData) {
        const orders = this.getOrders();

        // Auto-create or update customer if name is provided
        let customerId = orderData.customerId || null;
        const customerName = orderData.customerName?.trim() || 'Walk-in Customer';

        if (customerName && customerName !== 'Walk-in Customer') {
            customerId = this.findOrCreateCustomer(customerName, orderData.total);
        }

        const order = {
            id: 'order_' + Storage.generateId(),
            orderNumber: Helpers.generateOrderNumber(),
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax || orderData.subtotal * 0.05,
            total: orderData.total,
            status: 'pending',
            customerId: customerId,
            customerName: customerName,
            wristbandId: orderData.wristbandId || null,
            paymentMethod: null,
            paymentStatus: 'unpaid',
            notes: orderData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Reduce stock for each item
        order.items.forEach(item => {
            this.updateStock(item.id, -item.quantity);
        });

        orders.unshift(order); // Add to beginning
        Storage.save(Storage.KEYS.ORDERS, orders);

        return order;
    },

    /**
     * Find existing customer by name or create new one
     * Automatically updates visit count and total spent
     */
    findOrCreateCustomer(name, orderTotal) {
        const customers = this.getCustomers();
        const normalizedName = name.toLowerCase().trim();

        // Find existing customer by name (case-insensitive)
        let existingCustomer = customers.find(c =>
            c.name.toLowerCase().trim() === normalizedName
        );

        if (existingCustomer) {
            // Update existing customer stats
            existingCustomer.totalOrders = (existingCustomer.totalOrders || 0) + 1;
            existingCustomer.totalSpent = (existingCustomer.totalSpent || 0) + orderTotal;
            existingCustomer.lastVisit = new Date().toISOString();
            Storage.save(Storage.KEYS.CUSTOMERS, customers);
            return existingCustomer.id;
        } else {
            // Create new customer
            const newCustomer = {
                id: 'cust_' + Storage.generateId(),
                name: name.trim(),
                phone: '',
                email: '',
                notes: '',
                totalOrders: 1,
                totalSpent: orderTotal,
                lastVisit: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            customers.push(newCustomer);
            Storage.save(Storage.KEYS.CUSTOMERS, customers);
            return newCustomer.id;
        }
    },

    updateOrder(id, updates) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
            Storage.save(Storage.KEYS.ORDERS, orders);
            return orders[index];
        }
        return null;
    },

    updateOrderStatus(id, status) {
        return this.updateOrder(id, { status });
    },

    completePayment(orderId, paymentMethod) {
        return this.updateOrder(orderId, {
            paymentMethod,
            paymentStatus: 'paid',
            paidAt: new Date().toISOString()
        });
    },

    // ================== CUSTOMERS ==================

    getCustomers() {
        return Storage.load(Storage.KEYS.CUSTOMERS, []);
    },

    getCustomerById(id) {
        const customers = this.getCustomers();
        return customers.find(c => c.id === id);
    },

    addCustomer(customerData) {
        const customers = this.getCustomers();
        const customer = {
            id: 'cust_' + Storage.generateId(),
            name: customerData.name,
            phone: customerData.phone || '',
            email: customerData.email || '',
            notes: customerData.notes || '',
            totalOrders: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString()
        };
        customers.push(customer);
        Storage.save(Storage.KEYS.CUSTOMERS, customers);
        return customer;
    },

    updateCustomer(id, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            Storage.save(Storage.KEYS.CUSTOMERS, customers);
            return customers[index];
        }
        return null;
    },

    getCustomerOrders(customerId) {
        const orders = this.getOrders();
        return orders.filter(o => o.customerId === customerId);
    },

    // ================== STATISTICS ==================

    getTodayStats() {
        const orders = this.getOrders();
        const today = new Date().toISOString().slice(0, 10);

        const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === today);
        const paidOrders = todayOrders.filter(o => o.paymentStatus === 'paid');

        return {
            totalOrders: todayOrders.length,
            activeOrders: todayOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
            completedOrders: todayOrders.filter(o => o.status === 'completed').length,
            revenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
            avgOrderValue: paidOrders.length > 0 ? paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length : 0
        };
    },

    getLowStockItems(threshold = 10) {
        const items = this.getMenuItems();
        return items.filter(i => i.stock <= threshold).sort((a, b) => a.stock - b.stock);
    },

    getPopularItems(limit = 5) {
        const orders = this.getOrders();
        const itemCounts = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity;
            });
        });

        const items = this.getMenuItems();
        return items
            .map(item => ({ ...item, orderCount: itemCounts[item.id] || 0 }))
            .sort((a, b) => b.orderCount - a.orderCount)
            .slice(0, limit);
    }
};

// Initialize and make globally available
window.DataService = DataService;
