/**
 * ESP32 Wristband Firmware
 * 
 * This Arduino sketch is for the ESP32 wristband that communicates
 * with the Restaurant POS system via Bluetooth Low Energy (BLE).
 * 
 * Hardware Required:
 * - ESP32 Development Board (e.g., ESP32-WROOM-32)
 * - Vibration Motor (connected to GPIO 23)
 * - LED (optional, connected to GPIO 2)
 * - 3.7V LiPo Battery (for portable use)
 * 
 * Wiring:
 * - Vibration Motor: GPIO 23 -> Motor+ -> GND
 * - LED: GPIO 2 (built-in on most ESP32 boards)
 * 
 * Library Dependencies:
 * - ESP32 BLE Arduino (included with ESP32 board package)
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ============================================
// CONFIGURATION
// ============================================

// Device name prefix - each wristband should have unique ID
#define DEVICE_NAME "WB-001"

// BLE UUIDs (must match the web app)
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Pin definitions
#define VIBRATION_PIN 23
#define LED_PIN 2

// Vibration patterns (duration in ms)
#define VIBRATE_SHORT 200
#define VIBRATE_MEDIUM 500
#define VIBRATE_LONG 1000

// ============================================
// GLOBAL VARIABLES
// ============================================

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// ============================================
// BLE SERVER CALLBACKS
// ============================================

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("Device connected!");
        
        // Flash LED to indicate connection
        for (int i = 0; i < 3; i++) {
            digitalWrite(LED_PIN, HIGH);
            delay(100);
            digitalWrite(LED_PIN, LOW);
            delay(100);
        }
    };

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("Device disconnected!");
    }
};

// ============================================
// BLE CHARACTERISTIC CALLBACKS
// ============================================

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();

        if (value.length() > 0) {
            Serial.print("Received command: ");
            for (int i = 0; i < value.length(); i++) {
                Serial.print(value[i]);
            }
            Serial.println();

            // Parse command
            if (value[0] == 'V') {
                // Vibration command: V1, V2, V3, etc.
                int pattern = 1;
                if (value.length() > 1) {
                    pattern = value[1] - '0';
                }
                handleVibration(pattern);
            }
        }
    }
};

// ============================================
// VIBRATION PATTERNS
// ============================================

void handleVibration(int pattern) {
    Serial.print("Vibration pattern: ");
    Serial.println(pattern);
    
    switch (pattern) {
        case 1:
            // Single short vibration - Order ready notification
            vibrate(VIBRATE_MEDIUM);
            break;
            
        case 2:
            // Double vibration
            vibrate(VIBRATE_SHORT);
            delay(200);
            vibrate(VIBRATE_SHORT);
            break;
            
        case 3:
            // Triple vibration - Urgent
            for (int i = 0; i < 3; i++) {
                vibrate(VIBRATE_SHORT);
                delay(150);
            }
            break;
            
        case 4:
            // Long vibration
            vibrate(VIBRATE_LONG);
            break;
            
        case 5:
            // SOS pattern (for urgent notifications)
            // 3 short, 3 long, 3 short
            for (int i = 0; i < 3; i++) {
                vibrate(VIBRATE_SHORT);
                delay(100);
            }
            delay(200);
            for (int i = 0; i < 3; i++) {
                vibrate(VIBRATE_MEDIUM);
                delay(150);
            }
            delay(200);
            for (int i = 0; i < 3; i++) {
                vibrate(VIBRATE_SHORT);
                delay(100);
            }
            break;
            
        default:
            vibrate(VIBRATE_MEDIUM);
            break;
    }
}

void vibrate(int duration) {
    digitalWrite(VIBRATION_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);  // Also flash LED
    delay(duration);
    digitalWrite(VIBRATION_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
}

// ============================================
// SETUP
// ============================================

void setup() {
    Serial.begin(115200);
    Serial.println("Starting BLE Wristband...");

    // Initialize pins
    pinMode(VIBRATION_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    
    // Initial LED flash to show device is starting
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);

    // Create BLE Device
    BLEDevice::init(DEVICE_NAME);

    // Create BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks());

    // Create BLE Service
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Create BLE Characteristic
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ   |
        BLECharacteristic::PROPERTY_WRITE  |
        BLECharacteristic::PROPERTY_NOTIFY
    );

    // Add descriptor for notifications
    pCharacteristic->addDescriptor(new BLE2902());
    
    // Set callbacks
    pCharacteristic->setCallbacks(new MyCallbacks());

    // Start the service
    pService->start();

    // Start advertising
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x0);
    BLEDevice::startAdvertising();
    
    Serial.println("BLE Wristband ready!");
    Serial.print("Device name: ");
    Serial.println(DEVICE_NAME);
    
    // Test vibration on startup
    vibrate(VIBRATE_SHORT);
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
    // Handle disconnection - restart advertising
    if (!deviceConnected && oldDeviceConnected) {
        delay(500);
        pServer->startAdvertising();
        Serial.println("Started advertising again...");
        oldDeviceConnected = deviceConnected;
    }
    
    // Handle new connection
    if (deviceConnected && !oldDeviceConnected) {
        oldDeviceConnected = deviceConnected;
    }
    
    // Small delay to prevent watchdog issues
    delay(10);
}
