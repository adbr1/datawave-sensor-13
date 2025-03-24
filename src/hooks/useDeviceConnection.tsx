
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWebSocketDevice } from "./useWebSocketDevice";
import { useSimulatedDevice } from "./useSimulatedDevice";
import { useSettings } from "@/contexts/SettingsContext";
import { ConnectionStatus } from "@/types/sensorTypes";
import { toast } from "sonner";

export function useDeviceConnection() {
  const { settings } = useSettings();
  const webSocketDevice = useWebSocketDevice();
  const simulatedDevice = useSimulatedDevice();
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<Record<string, number>>({});
  const [lastScheduleCheck, setLastScheduleCheck] = useState<number>(0);
  
  // Sélectionne le bon gestionnaire en fonction du mode développeur
  const activeDevice = useMemo(() => {
    return settings.developerMode ? simulatedDevice : webSocketDevice;
  }, [settings.developerMode, simulatedDevice, webSocketDevice]);
  
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
        toast.success(settings.developerMode 
          ? "Mode simulation activé" 
          : "Connecté à l'appareil ESP32");
      }
      
      return result;
    } catch (error) {
      setIsConnecting(false);
      console.error("Erreur de connexion:", error);
      
      toast.error(`Erreur de connexion: ${error instanceof Error ? error.message : String(error)}`);
      
      return false;
    }
  }, [activeDevice, isConnecting, settings.developerMode]);
  
  // Déconnecte l'appareil actif
  const disconnect = useCallback(() => {
    const result = activeDevice.disconnect();
    
    if (result) {
      toast.success("Déconnecté de l'appareil");
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
      toast.error(`Alerte de température: Température basse: ${temp}°C (seuil: ${minTemp}°C)`);
      setLastAlertTime(prev => ({ ...prev, temperature: now }));
    } else if (temp > maxTemp) {
      toast.error(`Alerte de température: Température élevée: ${temp}°C (seuil: ${maxTemp}°C)`);
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
      toast.error(`Alerte de turbidité: Turbidité élevée: ${turbidity} NTU (seuil: ${threshold} NTU)`);
      setLastAlertTime(prev => ({ ...prev, turbidity: now }));
    }
  }, [activeDevice, settings.turbidityAlerts, lastAlertTime]);
  
  // Nouvelle fonction pour gérer l'automatisation par horaire
  const checkScheduleAutomation = useCallback(() => {
    if (!settings.lampAutomation.enabled || 
        !settings.lampAutomation.scheduleMode || 
        activeDevice.status !== ConnectionStatus.CONNECTED) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Convertir les heures programmées en minutes depuis minuit
    const [onHours, onMinutes] = settings.lampAutomation.scheduleOn.split(':').map(Number);
    const [offHours, offMinutes] = settings.lampAutomation.scheduleOff.split(':').map(Number);
    
    const onTime = onHours * 60 + onMinutes;
    const offTime = offHours * 60 + offMinutes;
    
    const { lampStatus } = activeDevice.sensorData;
    
    // Si l'heure actuelle est entre l'heure d'allumage et d'extinction
    const isTimeToBeOn = onTime <= offTime 
      ? (currentTime >= onTime && currentTime < offTime)  // Même jour
      : (currentTime >= onTime || currentTime < offTime); // Sur deux jours (ex: 22:00 à 06:00)
    
    // Ne vérifie que toutes les minutes pour éviter trop d'appels
    if (now.getTime() - lastScheduleCheck < 60000) return;
    setLastScheduleCheck(now.getTime());
    
    if (isTimeToBeOn && !lampStatus) {
      toggleLamp();
      toast.success("Lampe activée automatiquement selon l'horaire programmé");
    } else if (!isTimeToBeOn && lampStatus) {
      toggleLamp();
      toast.success("Lampe désactivée automatiquement selon l'horaire programmé");
    }
  }, [activeDevice, settings.lampAutomation, toggleLamp, lastScheduleCheck]);
  
  // Fonction pour gérer l'automatisation de la lampe
  const checkSensorAutomation = useCallback(() => {
    if (!settings.lampAutomation.enabled || 
        settings.lampAutomation.scheduleMode || 
        activeDevice.status !== ConnectionStatus.CONNECTED) return;
    
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
      toast.success("La lampe a été activée automatiquement suite aux mesures");
    } else if (!shouldActivateLamp && lampStatus) {
      toggleLamp();
      toast.success("La lampe a été désactivée automatiquement suite aux mesures");
    }
  }, [activeDevice, settings.lampAutomation, toggleLamp]);
  
  // Vérifie les alertes et automatisations lorsque les données sont mises à jour
  useEffect(() => {
    if (activeDevice.status === ConnectionStatus.CONNECTED) {
      checkTemperatureAlerts();
      checkTurbidityAlerts();
      checkScheduleAutomation();
      checkSensorAutomation();
    }
  }, [
    activeDevice.status, 
    activeDevice.sensorData, 
    checkTemperatureAlerts, 
    checkTurbidityAlerts, 
    checkScheduleAutomation,
    checkSensorAutomation
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
