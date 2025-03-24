
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "sonner";
import { ConnectionStatus, SensorData } from "@/types/sensorTypes";
import { useSettings } from "@/contexts/SettingsContext";

const INITIAL_SENSOR_DATA: SensorData = {
  temperature: 0,
  turbidity: 0,
  timestamp: new Date(),
  lampStatus: false,
};

// L'URL du serveur WebSocket
const WS_SERVER_URL = "ws://192.168.1.10:81"; // À modifier selon votre configuration

export function useWebSocketDevice() {
  const { settings } = useSettings();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [isSupported, setIsSupported] = useState<boolean>(true); // WebSocket est supporté par tous les navigateurs modernes
  const [device, setDevice] = useState<{ name: string } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Vérifier si WebSocket est supporté
  useEffect(() => {
    if (typeof WebSocket === 'undefined') {
      setIsSupported(false);
    }
  }, []);
  
  // Se connecter au serveur WebSocket
  const connect = useCallback(async () => {
    if (!isSupported) {
      toast.error("WebSocket n'est pas supporté par votre navigateur");
      return false;
    }
    
    try {
      setStatus(ConnectionStatus.CONNECTING);
      
      // Fermer toute connexion existante
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Créer une nouvelle connexion WebSocket
      const socket = new WebSocket(WS_SERVER_URL);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setStatus(ConnectionStatus.CONNECTED);
        setDevice({ name: "ESP32 WebSocket" });
        toast.success("Connecté au serveur WebSocket");
        
        // Demander les données initiales
        socket.send(JSON.stringify({ command: "getData" }));
      };
      
      socket.onclose = () => {
        setStatus(ConnectionStatus.DISCONNECTED);
        setDevice(null);
        toast.error("Déconnecté du serveur WebSocket");
      };
      
      socket.onerror = (error) => {
        console.error("Erreur WebSocket:", error);
        setStatus(ConnectionStatus.ERROR);
        toast.error("Erreur de connexion WebSocket");
        return false;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Mise à jour des données des capteurs
          if (data.type === "sensorData") {
            setSensorData({
              temperature: data.temperature,
              turbidity: data.turbidity,
              lampStatus: data.lampStatus,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error("Erreur lors du traitement des données:", error);
        }
      };
      
      // Attendre que la connexion soit établie ou échoue
      return new Promise<boolean>((resolve) => {
        const timeoutId = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            toast.error("Délai de connexion dépassé");
            socket.close();
            resolve(false);
          }
        }, settings.connectionTimeout * 1000);
        
        socket.onopen = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };
        
        socket.onerror = () => {
          clearTimeout(timeoutId);
          resolve(false);
        };
      });
      
    } catch (error) {
      console.error("Erreur lors de la connexion WebSocket:", error);
      setStatus(ConnectionStatus.ERROR);
      toast.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, [isSupported, settings.connectionTimeout]);
  
  // Déconnexion du WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setStatus(ConnectionStatus.DISCONNECTED);
      setSensorData(INITIAL_SENSOR_DATA);
      setDevice(null);
      toast.success("Déconnecté du serveur WebSocket");
      return true;
    }
    return false;
  }, []);
  
  // Basculer l'état de la lampe
  const toggleLamp = useCallback(async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        const newStatus = !sensorData.lampStatus;
        socketRef.current.send(JSON.stringify({ 
          command: "setLamp", 
          status: newStatus 
        }));
        
        // Optimistic update
        setSensorData(prev => ({
          ...prev,
          lampStatus: newStatus,
        }));
        
        return true;
      } catch (error) {
        console.error("Erreur lors du basculement de la lampe:", error);
        return false;
      }
    }
    return false;
  }, [sensorData.lampStatus]);
  
  // Nettoyer la connexion WebSocket lors du démontage du composant
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);
  
  // Envoyer une commande ping périodique pour maintenir la connexion
  useEffect(() => {
    if (status !== ConnectionStatus.CONNECTED || !socketRef.current) return;
    
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ command: "ping" }));
      }
    }, 30000); // Ping toutes les 30 secondes
    
    return () => clearInterval(pingInterval);
  }, [status]);

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
