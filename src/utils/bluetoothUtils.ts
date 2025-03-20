
import { BluetoothServiceConfig, DEFAULT_ESP32_SERVICE } from "../types/sensorTypes";

// Check if the browser supports Web Bluetooth API
export const isBleSupported = (): boolean => {
  return (
    typeof navigator !== 'undefined' && 
    navigator.bluetooth !== undefined
  );
};

// Request device and try to connect
export const requestDevice = async (
  config: BluetoothServiceConfig = DEFAULT_ESP32_SERVICE
): Promise<BluetoothDevice | null> => {
  if (!isBleSupported()) {
    throw new Error("Web Bluetooth API is not supported in this browser");
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [config.serviceUUID] }],
      optionalServices: [config.serviceUUID]
    });
    
    device.addEventListener('gattserverdisconnected', () => {
      console.log('Device disconnected');
    });

    return device;
  } catch (error) {
    console.error('Error requesting Bluetooth device:', error);
    return null;
  }
};

// Connect to the device and get the service
export const connectToDevice = async (
  device: BluetoothDevice, 
  config: BluetoothServiceConfig = DEFAULT_ESP32_SERVICE
): Promise<BluetoothRemoteGATTService | null> => {
  if (!device || !device.gatt) {
    throw new Error("Invalid Bluetooth device");
  }

  try {
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(config.serviceUUID);
    return service;
  } catch (error) {
    console.error('Error connecting to device:', error);
    return null;
  }
};

// Read a characteristic from the service
export const readCharacteristic = async (
  service: BluetoothRemoteGATTService,
  characteristicUUID: string
): Promise<DataView | null> => {
  try {
    const characteristic = await service.getCharacteristic(characteristicUUID);
    const value = await characteristic.readValue();
    return value;
  } catch (error) {
    console.error(`Error reading characteristic ${characteristicUUID}:`, error);
    return null;
  }
};

// Subscribe to characteristic notifications
export const subscribeToCharacteristic = async (
  service: BluetoothRemoteGATTService,
  characteristicUUID: string,
  callback: (event: Event) => void
): Promise<BluetoothRemoteGATTCharacteristic | null> => {
  try {
    const characteristic = await service.getCharacteristic(characteristicUUID);
    
    // Add notification event listener
    characteristic.addEventListener('characteristicvaluechanged', callback);
    
    // Start notifications
    await characteristic.startNotifications();
    
    return characteristic;
  } catch (error) {
    console.error(`Error subscribing to characteristic ${characteristicUUID}:`, error);
    return null;
  }
};

// Parse temperature data from DataView (assuming little-endian float32)
export const parseTemperatureData = (dataView: DataView): number => {
  return parseFloat(dataView.getFloat32(0, true).toFixed(1));
};

// Parse turbidity data from DataView (assuming little-endian float32)
export const parseTurbidityData = (dataView: DataView): number => {
  return parseFloat(dataView.getFloat32(0, true).toFixed(2));
};

// Parse lamp status from DataView (assuming 1 byte boolean)
export const parseLampStatusData = (dataView: DataView): boolean => {
  return dataView.getUint8(0) === 1;
};

// Toggle lamp status by writing to characteristic
export const toggleLampStatus = async (
  service: BluetoothRemoteGATTService,
  characteristicUUID: string,
  status: boolean
): Promise<boolean> => {
  try {
    const characteristic = await service.getCharacteristic(characteristicUUID);
    const value = new Uint8Array([status ? 1 : 0]);
    await characteristic.writeValue(value);
    return true;
  } catch (error) {
    console.error('Error toggling lamp status:', error);
    return false;
  }
};

// Disconnect from device
export const disconnectDevice = (device: BluetoothDevice | null): void => {
  if (device && device.gatt && device.gatt.connected) {
    device.gatt.disconnect();
  }
};
