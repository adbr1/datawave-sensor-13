
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});
  
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

  // Fonction pour vérifier les alertes de température
  const checkTemperatureAlerts = useCallback(() => {
    if (!settings.temperatureAlerts.enabled || activeDevice.status !== ConnectionStatus.CONNECTED) return;
    
    const temp = activeDevice.sensorData.temperature;
    const minTemp = settings.temperatureAlerts.minThreshold;
    const maxTemp = settings.temperatureAlerts.maxThreshold;
    const now = Date.now();
    
    // Empêche les alertes trop fréquentes (au plus une par minute)
    if (now - (lastAlertTime.temperature || 0) < 60000) return;
    
    if (temp < minTemp) {
      toast({
        title: "Alerte de température",
        description: `Température basse: ${temp}°C (seuil: ${minTemp}°C)`,
        variant: "destructive",
      });
      setLastAlertTime(prev => ({ ...prev, temperature: now }));
    } else if (temp > maxTemp) {
      toast({
        title: "Alerte de température",
        description: `Température élevée: ${temp}°C (seuil: ${maxTemp}°C)`,
        variant: "destructive",
      });
      setLastAlertTime(prev => ({ ...prev, temperature: now }));
    }
  }, [activeDevice, settings.temperatureAlerts, lastAlertTime]);
  
  // Fonction pour vérifier les alertes de turbidité
  const checkTurbidityAlerts = useCallback(() => {
    if (!settings.turbidityAlerts.enabled || activeDevice.status !== ConnectionStatus.CONNECTED) return;
    
    const turbidity = activeDevice.sensorData.turbidity;
    const threshold = settings.turbidityAlerts.threshold;
    const now = Date.now();
    
    // Empêche les alertes trop fréquentes (au plus une par minute)
    if (now - (lastAlertTime.turbidity || 0) < 60000) return;
    
    if (turbidity > threshold) {
      toast({
        title: "Alerte de turbidité",
        description: `Turbidité élevée: ${turbidity} NTU (seuil: ${threshold} NTU)`,
        variant: "destructive",
      });
      setLastAlertTime(prev => ({ ...prev, turbidity: now }));
    }
  }, [activeDevice, settings.turbidityAlerts, lastAlertTime]);
  
  // Fonction pour gérer l'automatisation de la lampe
  const checkLampAutomation = useCallback(() => {
    if (!settings.lampAutomation.enabled || activeDevice.status !== ConnectionStatus.CONNECTED) return;
    
    const { temperature, turbidity, lampStatus } = activeDevice.sensorData;
    const { 
      temperatureTriggered, 
      temperatureThreshold, 
      turbidityTriggered, 
      turbidityThreshold 
    } = settings.lampAutomation;
    
    let shouldActivateLamp = false;
    
    // Vérifie les conditions d'activation
    if (temperatureTriggered && temperature > temperatureThreshold) {
      shouldActivateLamp = true;
    }
    
    if (turbidityTriggered && turbidity > turbidityThreshold) {
      shouldActivateLamp = true;
    }
    
    // Active ou désactive la lampe si nécessaire
    if (shouldActivateLamp && !lampStatus) {
      toggleLamp();
      toast({
        title: "Automatisation de lampe",
        description: "La lampe a été activée automatiquement",
      });
    } else if (!shouldActivateLamp && lampStatus) {
      toggleLamp();
      toast({
        title: "Automatisation de lampe",
        description: "La lampe a été désactivée automatiquement",
      });
    }
  }, [activeDevice, settings.lampAutomation, toggleLamp]);
  
  // Vérifie les alertes et automatisations lorsque les données sont mises à jour
  useEffect(() => {
    if (activeDevice.status === ConnectionStatus.CONNECTED) {
      checkTemperatureAlerts();
      checkTurbidityAlerts();
      checkLampAutomation();
    }
  }, [
    activeDevice.status, 
    activeDevice.sensorData, 
    checkTemperatureAlerts, 
    checkTurbidityAlerts, 
    checkLampAutomation
  ]);

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
