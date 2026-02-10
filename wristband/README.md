# ESP32 Wristband Setup Guide

## Overview
This guide explains how to build and program the Bluetooth wristband that works with the Restaurant POS system.

## Hardware Requirements

### Components Needed
| Component | Description | Approx. Cost |
|-----------|-------------|--------------|
| ESP32 Development Board | ESP32-WROOM-32 or similar | ₹350-500 |
| Vibration Motor (Coin Type) | 3V DC vibration motor | ₹30-50 |
| Li-Po Battery | 3.7V 500mAh or similar | ₹150-200 |
| Battery Charging Module | TP4056 USB charging | ₹30-50 |
| Slide Switch | For power on/off | ₹10 |
| Wristband Enclosure | 3D printed or silicone | Varies |

**Total Cost per Wristband: ₹570-810 (~$8-10)**

## Wiring Diagram

```
ESP32 Wristband Wiring
=====================

Battery (+) ──┬── Slide Switch ── TP4056 B+ ── ESP32 3V3
              │
Battery (-) ──┴── TP4056 B- ── ESP32 GND


ESP32 GPIO Connections:
- GPIO 23 ──── Vibration Motor (+)
- GND ──────── Vibration Motor (-)
- GPIO 2 ───── Built-in LED (already on board)


         ┌─────────────────────┐
         │       ESP32         │
         │                     │
         │   GPIO23 ──► Motor  │
         │   GPIO2  ──► LED    │
         │   3V3    ──► VCC    │
         │   GND    ──► GND    │
         │                     │
         └─────────────────────┘
               ▲
               │
         ┌─────┴─────┐
         │  TP4056   │
         │  Charger  │
         └─────┬─────┘
               │
         ┌─────┴─────┐
         │  Battery  │
         │  3.7V     │
         └───────────┘
```

## Software Setup

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support
1. Open Arduino IDE
2. Go to **File > Preferences**
3. Add this URL to "Additional Board Manager URLs":
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Go to **Tools > Board > Boards Manager**
5. Search for "esp32" and install **ESP32 by Espressif Systems**

### 3. Select Board
1. Go to **Tools > Board > ESP32 Arduino**
2. Select **ESP32 Dev Module**

### 4. Upload Firmware
1. Open `wristband_firmware.ino` in Arduino IDE
2. Change `DEVICE_NAME` to a unique ID for each wristband:
   ```cpp
   #define DEVICE_NAME "WB-001"  // Change for each wristband
   ```
3. Connect ESP32 via USB
4. Select the correct COM port in **Tools > Port**
5. Click **Upload** (arrow button)

## Testing

### Serial Monitor Test
1. Open **Tools > Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   Starting BLE Wristband...
   BLE Wristband ready!
   Device name: WB-001
   ```

### Bluetooth Pairing Test
1. Open the POS app in Chrome browser
2. Click on "New Order"
3. Add items to cart
4. Click "Assign" wristband button
5. Select your wristband from the list (WB-001)
6. The wristband should vibrate once on connection

### Vibration Test
1. Create and complete an order
2. When marked "Ready", click "Notify Customer"
3. The wristband should vibrate

## Vibration Patterns

| Pattern | Command | Description |
|---------|---------|-------------|
| 1 | V1 | Single medium vibration (default) |
| 2 | V2 | Double short vibrations |
| 3 | V3 | Triple short vibrations |
| 4 | V4 | Long vibration |
| 5 | V5 | SOS pattern (urgent) |

## Troubleshooting

### Wristband not appearing in Bluetooth scan
- Make sure the ESP32 is powered on
- Check that no other device is connected to it
- Restart the ESP32

### Cannot upload firmware
- Check USB cable (use a data cable, not charge-only)
- Install USB-to-Serial drivers if needed
- Try holding the BOOT button while uploading

### Vibration not working
- Check wiring to GPIO 23
- Test motor independently with 3V
- Check motor polarity

### Bluetooth connection drops
- Move closer to the POS device
- Check battery level
- Reduce interference from other BLE devices

## Battery Life Estimation

With a 500mAh battery:
- Standby (advertising): ~20-30 hours
- Connected but idle: ~15-20 hours
- Active use: ~8-12 hours

## Enclosure Ideas

1. **3D Printed Case**: Design a custom case using Tinkercad or Fusion 360
2. **Silicone Band**: Use a generic smartwatch band with custom holder
3. **Wristband Pouch**: Simple fabric pouch attached to a velcro strap

## Production Notes

For producing multiple wristbands:
1. Program each with a unique `DEVICE_NAME` (WB-001, WB-002, etc.)
2. Label each wristband with its ID
3. Keep a log of wristband IDs for inventory management
