
import { useState, useEffect, useCallback, useRef } from "react";
import { SensorData, ConnectionStatus } from "@/types/sensorTypes";
import { useSettings } from "@/contexts/SettingsContext";

const INITIAL_SIMULATED_DATA: SensorData = {
  temperature: 22.5,
  turbidity: 5.0,
  timestamp: new Date(),
  lampStatus: false,
};

// Limites des valeurs simulées pour qu'elles restent réalistes
const SIMULATION_LIMITS = {
  temperature: { min: 15, max: 35, variation: 0.5 },
  turbidity: { min: 0, max: 10, variation: 0.3 },
};

export function useSimulatedDevice() {
  const { settings } = useSettings();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SIMULATED_DATA);
  const simulationInterval = useRef<number | null>(null);

  // Génère une variation aléatoire dans une plage donnée
  const getRandomVariation = (amplitude: number) => {
    return (Math.random() * 2 - 1) * amplitude;
  };

  // Génère de nouvelles données simulées
  const generateSimulatedData = useCallback(() => {
    setSensorData(prev => {
      // Calcule les nouvelles valeurs en ajoutant une petite variation aléatoire
      let newTemp = prev.temperature + getRandomVariation(SIMULATION_LIMITS.temperature.variation);
      let newTurb = prev.turbidity + getRandomVariation(SIMULATION_LIMITS.turbidity.variation);
      
      // Garde les valeurs dans les limites définies
      newTemp = Math.min(Math.max(newTemp, SIMULATION_LIMITS.temperature.min), SIMULATION_LIMITS.temperature.max);
      newTurb = Math.min(Math.max(newTurb, SIMULATION_LIMITS.turbidity.min), SIMULATION_LIMITS.turbidity.max);
      
      return {
        temperature: parseFloat(newTemp.toFixed(1)),
        turbidity: parseFloat(newTurb.toFixed(1)),
        timestamp: new Date(),
        lampStatus: prev.lampStatus,
      };
    });
  }, []);

  // Démarre la simulation
  const connect = useCallback(() => {
    if (!settings.developerMode) return false;
    
    setStatus(ConnectionStatus.CONNECTING);
    
    // Simule un délai de connexion
    setTimeout(() => {
      setStatus(ConnectionStatus.CONNECTED);
      
      // Configure la mise à jour périodique des données
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
      
      simulationInterval.current = window.setInterval(() => {
        generateSimulatedData();
      }, settings.refreshRate);
    }, 1000);
    
    return true;
  }, [settings.developerMode, settings.refreshRate, generateSimulatedData]);

  // Arrête la simulation
  const disconnect = useCallback(() => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    
    setStatus(ConnectionStatus.DISCONNECTED);
    setSensorData(INITIAL_SIMULATED_DATA);
    
    return true;
  }, []);

  // Bascule l'état de la lampe
  const toggleLamp = useCallback(() => {
    setSensorData(prev => ({
      ...prev,
      lampStatus: !prev.lampStatus,
    }));
    
    return true;
  }, []);

  // Arrête la simulation lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  // Ajuste le taux de rafraîchissement si le paramètre change
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED && simulationInterval.current) {
      clearInterval(simulationInterval.current);
      
      simulationInterval.current = window.setInterval(() => {
        generateSimulatedData();
      }, settings.refreshRate);
    }
  }, [settings.refreshRate, status, generateSimulatedData]);

  return {
    connect,
    disconnect,
    toggleLamp,
    status,
    sensorData,
    isSupported: true,
    device: settings.developerMode ? { name: "ESP32 Simulé" } : null,
  };
}
