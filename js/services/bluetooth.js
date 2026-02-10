/**
 * Bluetooth Low Energy (BLE) Service
 * Handles wristband communication using Web Bluetooth API
 */

const BluetoothService = {
    // State
    isSupported: false,
    isEnabled: false,
    connectedDevices: new Map(),
    listeners: [],

    // BLE UUIDs - These would match your ESP32 firmware
    SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
    CHARACTERISTIC_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',

    /**
     * Initialize Bluetooth service
     */
    init() {
        this.isSupported = 'bluetooth' in navigator;
        if (!this.isSupported) {
            console.warn('Web Bluetooth API is not supported in this browser');
        }
        this.updateStatus();
    },

    /**
     * Check if Bluetooth is available
     */
    async checkAvailability() {
        if (!this.isSupported) return false;

        try {
            const available = await navigator.bluetooth.getAvailability();
            this.isEnabled = available;
            this.updateStatus();
            return available;
        } catch (error) {
            console.error('Bluetooth availability check failed:', error);
            return false;
        }
    },

    /**
     * Scan for nearby wristbands
     */
    async scanForDevices() {
        if (!this.isSupported) {
            Helpers.showToast('Bluetooth not supported in this browser', 'error');
            return null;
        }

        try {
            this.updateStatus('scanning');

            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { services: [this.SERVICE_UUID] },
                    { namePrefix: 'WB-' } // Wristband prefix
                ],
                optionalServices: [this.SERVICE_UUID]
            });

            return device;
        } catch (error) {
            if (error.name === 'NotFoundError') {
                Helpers.showToast('No wristbands found nearby', 'warning');
            } else {
                console.error('Scan error:', error);
                Helpers.showToast('Bluetooth scan failed', 'error');
            }
            this.updateStatus();
            return null;
        }
    },

    /**
     * Connect to a wristband
     * @param {BluetoothDevice} device - Device to connect to
     */
    async connect(device) {
        if (!device) return null;

        try {
            console.log('Connecting to', device.name);

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(this.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

            // Store connection
            this.connectedDevices.set(device.id, {
                device,
                server,
                service,
                characteristic,
                connectedAt: new Date()
            });

            // Listen for disconnection
            device.addEventListener('gattserverdisconnected', () => {
                this.onDisconnected(device.id);
            });

            this.updateStatus();
            Helpers.showToast(`Connected to ${device.name}`, 'success');

            return device.id;
        } catch (error) {
            console.error('Connection error:', error);
            Helpers.showToast('Failed to connect to wristband', 'error');
            return null;
        }
    },

    /**
     * Disconnect from a wristband
     * @param {string} deviceId - Device ID to disconnect
     */
    async disconnect(deviceId) {
        const connection = this.connectedDevices.get(deviceId);
        if (!connection) return;

        try {
            connection.server.disconnect();
            this.connectedDevices.delete(deviceId);
            this.updateStatus();
            Helpers.showToast('Wristband disconnected', 'info');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    },

    /**
     * Send vibration signal to wristband
     * @param {string} deviceId - Device ID to vibrate
     * @param {number} pattern - Vibration pattern (1-5)
     */
    async sendVibration(deviceId, pattern = 1) {
        const connection = this.connectedDevices.get(deviceId);

        if (!connection) {
            console.error('Device not connected:', deviceId);
            return false;
        }

        try {
            // Send vibration command
            // Format: V<pattern> (e.g., V1, V2, V3)
            const command = new TextEncoder().encode(`V${pattern}`);
            await connection.characteristic.writeValue(command);

            console.log('Vibration sent to', deviceId);
            return true;
        } catch (error) {
            console.error('Failed to send vibration:', error);
            Helpers.showToast('Failed to notify wristband', 'error');
            return false;
        }
    },

    /**
     * Handle device disconnection
     * @param {string} deviceId - Disconnected device ID
     */
    onDisconnected(deviceId) {
        this.connectedDevices.delete(deviceId);
        this.updateStatus();
        console.log('Device disconnected:', deviceId);

        // Notify listeners
        this.notifyListeners('disconnected', deviceId);
    },

    /**
     * Get all connected devices
     */
    getConnectedDevices() {
        return Array.from(this.connectedDevices.entries()).map(([id, conn]) => ({
            id,
            name: conn.device.name,
            connectedAt: conn.connectedAt
        }));
    },

    /**
     * Check if a device is connected
     * @param {string} deviceId - Device ID to check
     */
    isConnected(deviceId) {
        return this.connectedDevices.has(deviceId);
    },

    /**
     * Update bluetooth status in UI
     * @param {string} status - Status (connected, disconnected, scanning)
     */
    updateStatus(status) {
        const statusEl = document.getElementById('bluetooth-status');
        if (!statusEl) return;

        const count = this.connectedDevices.size;
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');

        if (status === 'scanning') {
            dot.className = 'status-dot scanning';
            text.textContent = 'Scanning...';
        } else if (count > 0) {
            dot.className = 'status-dot connected';
            text.textContent = `${count} Wristband${count > 1 ? 's' : ''} Connected`;
        } else {
            dot.className = 'status-dot disconnected';
            text.textContent = 'No Wristbands';
        }

        // Notify listeners
        this.notifyListeners('statusChange', { count, status });
    },

    /**
     * Add event listener
     * @param {function} callback - Callback function
     */
    addListener(callback) {
        this.listeners.push(callback);
    },

    /**
     * Remove event listener
     * @param {function} callback - Callback function
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    },

    /**
     * Notify all listeners
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    },

    /**
     * Check if any wristband is actually connected (real Bluetooth)
     * @param {string} wristbandId - Wristband ID to check
     */
    isRealDeviceConnected(wristbandId) {
        if (!wristbandId) return false;

        // Check if this is a real connected device
        const connection = this.connectedDevices.get(wristbandId);
        return connection && !connection.isSimulated;
    }
};

// Initialize and make globally available
window.BluetoothService = BluetoothService;
