
import { useCallback, useMemo } from "react";
import { useBluetoothDevice } from "./useBluetoothDevice";
import { useSimulatedDevice } from "./useSimulatedDevice";
import { useSettings } from "@/contexts/SettingsContext";
import { ConnectionStatus } from "@/types/sensorTypes";

export function useDeviceConnection() {
  const { settings } = useSettings();
  const bluetoothDevice = useBluetoothDevice();
  const simulatedDevice = useSimulatedDevice();
  
  // Sélectionne le bon gestionnaire en fonction du mode développeur
  const activeDevice = useMemo(() => {
    return settings.developerMode ? simulatedDevice : bluetoothDevice;
  }, [settings.developerMode, simulatedDevice, bluetoothDevice]);
  
  // Connect à l'appareil approprié
  const connect = useCallback(async () => {
    return activeDevice.connect();
  }, [activeDevice]);
  
  // Déconnecte l'appareil actif
  const disconnect = useCallback(() => {
    return activeDevice.disconnect();
  }, [activeDevice]);
  
  // Bascule l'état de la lampe
  const toggleLamp = useCallback(async () => {
    return activeDevice.toggleLamp();
  }, [activeDevice]);

  return {
    connect,
    disconnect,
    toggleLamp,
    status: activeDevice.status,
    sensorData: activeDevice.sensorData,
    isSupported: activeDevice.isSupported,
    isSimulated: settings.developerMode,
    device: activeDevice.device
  };
}
