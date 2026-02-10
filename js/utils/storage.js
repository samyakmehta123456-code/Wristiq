/**
 * Local Storage Utility Functions
 * Handles all data persistence for the POS system
 */

const Storage = {
    // Storage keys
    KEYS: {
        MENU_ITEMS: 'pos_menu_items',
        CATEGORIES: 'pos_categories',
        ORDERS: 'pos_orders',
        CUSTOMERS: 'pos_customers',
        INVENTORY: 'pos_inventory',
        WRISTBANDS: 'pos_wristbands',
        SETTINGS: 'pos_settings',
        MODIFIERS: 'pos_modifiers'
    },

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    /**
     * Clear all POS data from localStorage
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    /**
     * Generate a unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Export all data as JSON
     */
    exportData() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            data[name] = this.load(key);
        });
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data from JSON
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(this.KEYS).forEach(([name, key]) => {
                if (data[name]) {
                    this.save(key, data[name]);
                }
            });
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
};

// Make globally available
window.Storage = Storage;
