
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { 
  ConnectionStatus, 
  SensorData, 
  BluetoothServiceConfig,
  DEFAULT_ESP32_SERVICE
} from "@/types/sensorTypes";
import {
  isBleSupported,
  requestDevice,
  connectToDevice,
  readCharacteristic,
  subscribeToCharacteristic,
  parseTemperatureData,
  parseTurbidityData,
  parseLampStatusData,
  toggleLampStatus,
  disconnectDevice
} from "@/utils/bluetoothUtils";

const INITIAL_SENSOR_DATA: SensorData = {
  temperature: 0,
  turbidity: 0,
  timestamp: new Date(),
  lampStatus: false,
};

export function useBluetoothDevice() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [service, setService] = useState<BluetoothRemoteGATTService | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Check if BLE is supported
  useEffect(() => {
    setIsSupported(isBleSupported());
  }, []);
  
  // Handle device disconnection
  useEffect(() => {
    if (!device) return;
    
    const handleDisconnect = () => {
      setStatus(ConnectionStatus.DISCONNECTED);
      setService(null);
      toast({
        title: "Device Disconnected",
        description: "The connection to your ESP32 device was lost.",
        variant: "destructive",
      });
    };
    
    device.addEventListener('gattserverdisconnected', handleDisconnect);
    
    return () => {
      device.removeEventListener('gattserverdisconnected', handleDisconnect);
    };
  }, [device]);

  // Connect to a device
  const connect = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Web Bluetooth is not supported in this browser.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setStatus(ConnectionStatus.CONNECTING);
      
      // Request the device
      const selectedDevice = await requestDevice();
      if (!selectedDevice) {
        setStatus(ConnectionStatus.ERROR);
        toast({
          title: "Connection Failed",
          description: "Could not find a compatible ESP32 device.",
          variant: "destructive",
        });
        return false;
      }
      
      setDevice(selectedDevice);
      
      // Connect to the device
      const gattService = await connectToDevice(selectedDevice);
      if (!gattService) {
        setStatus(ConnectionStatus.ERROR);
        toast({
          title: "Connection Error",
          description: "Failed to connect to the ESP32 service.",
          variant: "destructive",
        });
        return false;
      }
      
      setService(gattService);
      setStatus(ConnectionStatus.CONNECTED);
      
      // Initial read of all sensor values
      await readAllSensorValues(gattService);
      
      // Subscribe to notifications
      await subscribeToSensorUpdates(gattService);
      
      toast({
        title: "Connected",
        description: "Successfully connected to ESP32 device.",
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      setStatus(ConnectionStatus.ERROR);
      toast({
        title: "Connection Error",
        description: `${error}`,
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported]);

  // Read all sensor values
  const readAllSensorValues = async (
    gattService: BluetoothRemoteGATTService,
    config: BluetoothServiceConfig = DEFAULT_ESP32_SERVICE
  ) => {
    // Read temperature
    const tempData = await readCharacteristic(gattService, config.temperatureCharUUID);
    
    // Read turbidity
    const turbData = await readCharacteristic(gattService, config.turbidityCharUUID);
    
    // Read lamp status
    const lampData = await readCharacteristic(gattService, config.lampStatusCharUUID);
    
    // Update state with all new values
    if (tempData && turbData && lampData) {
      setSensorData(prev => ({
        ...prev,
        temperature: parseTemperatureData(tempData),
        turbidity: parseTurbidityData(turbData),
        lampStatus: parseLampStatusData(lampData),
        timestamp: new Date(),
      }));
    }
  };

  // Subscribe to sensor updates
  const subscribeToSensorUpdates = async (
    gattService: BluetoothRemoteGATTService,
    config: BluetoothServiceConfig = DEFAULT_ESP32_SERVICE
  ) => {
    // Subscribe to temperature notifications
    await subscribeToCharacteristic(
      gattService,
      config.temperatureCharUUID,
      (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          setSensorData(prev => ({
            ...prev,
            temperature: parseTemperatureData(value),
            timestamp: new Date(),
          }));
        }
      }
    );
    
    // Subscribe to turbidity notifications
    await subscribeToCharacteristic(
      gattService,
      config.turbidityCharUUID,
      (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          setSensorData(prev => ({
            ...prev,
            turbidity: parseTurbidityData(value),
            timestamp: new Date(),
          }));
        }
      }
    );
    
    // Subscribe to lamp status notifications
    await subscribeToCharacteristic(
      gattService,
      config.lampStatusCharUUID,
      (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          setSensorData(prev => ({
            ...prev,
            lampStatus: parseLampStatusData(value),
            timestamp: new Date(),
          }));
        }
      }
    );
  };

  // Toggle lamp status
  const toggleLamp = useCallback(async () => {
    if (!service) return false;
    
    try {
      const newStatus = !sensorData.lampStatus;
      const success = await toggleLampStatus(
        service, 
        DEFAULT_ESP32_SERVICE.lampStatusCharUUID, 
        newStatus
      );
      
      if (success) {
        setSensorData(prev => ({
          ...prev,
          lampStatus: newStatus,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling lamp:', error);
      return false;
    }
  }, [service, sensorData]);

  // Disconnect from device
  const disconnect = useCallback(() => {
    if (!device) return;
    
    disconnectDevice(device);
    setStatus(ConnectionStatus.DISCONNECTED);
    setService(null);
    setSensorData(INITIAL_SENSOR_DATA);
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from ESP32 device.",
    });
  }, [device]);

  return {
    connect,
    disconnect,
    toggleLamp,
    status,
    sensorData,
    isSupported,
    device
  };
}
