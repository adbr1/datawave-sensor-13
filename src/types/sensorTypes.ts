
export interface SensorData {
  temperature: number;
  turbidity: number;
  timestamp: Date;
  lampStatus: boolean;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export interface BluetoothServiceConfig {
  // Service and characteristic UUIDs
  serviceUUID: string;
  temperatureCharUUID: string;
  turbidityCharUUID: string;
  lampStatusCharUUID: string;
  timeCharUUID: string;
}

// Default UUIDs for ESP32 service - these would be matched with your ESP32 code
export const DEFAULT_ESP32_SERVICE: BluetoothServiceConfig = {
  serviceUUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  temperatureCharUUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
  turbidityCharUUID: '90c5aff9-1abe-4e61-94d3-e8b8c4a02024',
  lampStatusCharUUID: 'fc68debd-c9a8-4c7e-af1d-2d4da5a2ecb3',
  timeCharUUID: '2af6d254-8c56-4793-a8d4-24c86013c4f0',
};
