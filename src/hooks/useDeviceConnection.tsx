
import { useCallback, useMemo, useState } from "react";
import { useBluetoothDevice } from "./useBluetoothDevice";
import { useSimulatedDevice } from "./useSimulatedDevice";
import { useSettings } from "@/contexts/SettingsContext";
import { ConnectionStatus } from "@/types/sensorTypes";
import { toast } from "@/components/ui/use-toast";

export function useDeviceConnection() {
  const { settings } = useSettings();
  const bluetoothDevice = useBluetoothDevice();
  const simulatedDevice = useSimulatedDevice();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Sélectionne le bon gestionnaire en fonction du mode développeur
  const activeDevice = useMemo(() => {
    return settings.developerMode ? simulatedDevice : bluetoothDevice;
  }, [settings.developerMode, simulatedDevice, bluetoothDevice]);
  
  // Connect à l'appareil approprié avec gestion des états de connexion
  const connect = useCallback(async () => {
    // Empêche les tentatives de connexion multiples
    if (isConnecting || activeDevice.status === ConnectionStatus.CONNECTED) {
      return false;
    }
    
    setIsConnecting(true);
    
    try {
      const result = await activeDevice.connect();
      setIsConnecting(false);
      
      if (result) {
        toast({
          title: "Connexion réussie",
          description: settings.developerMode 
            ? "Mode simulation activé" 
            : "Connecté à l'appareil ESP32",
        });
      }
      
      return result;
    } catch (error) {
      setIsConnecting(false);
      console.error("Erreur de connexion:", error);
      
      toast({
        title: "Erreur de connexion",
        description: `${error}`,
        variant: "destructive",
      });
      
      return false;
    }
  }, [activeDevice, isConnecting, settings.developerMode]);
  
  // Déconnecte l'appareil actif
  const disconnect = useCallback(() => {
    const result = activeDevice.disconnect();
    
    if (result) {
      toast({
        title: "Déconnexion réussie",
        description: "Déconnecté de l'appareil",
      });
    }
    
    return result;
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
    device: activeDevice.device,
    isConnecting
  };
}
