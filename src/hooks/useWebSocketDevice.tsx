
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

export function useWebSocketDevice() {
  const { settings } = useSettings();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [device, setDevice] = useState<{ name: string } | null>(null);
  const [serverAddress, setServerAddress] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  
  // Vérifier si WebSocket est supporté
  useEffect(() => {
    if (typeof WebSocket === 'undefined') {
      setIsSupported(false);
    }
  }, []);
  
  // Se connecter au serveur WebSocket
  const connect = useCallback(async (ipAddress?: string, port?: string) => {
    if (!isSupported) {
      toast.error("WebSocket n'est pas supporté par votre navigateur");
      return false;
    }
    
    // Si déjà connecté, retourner true
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return true;
    }
    
    try {
      setStatus(ConnectionStatus.CONNECTING);
      
      // Fermer toute connexion existante
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // Construire l'URL du WebSocket
      let wsServerUrl = "";
      
      // Utiliser l'adresse IP et le port fournis, ou les paramètres stockés
      if (ipAddress && port) {
        // Vérifier si on est en HTTPS, utiliser wss:// dans ce cas
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        wsServerUrl = `${protocol}${ipAddress}:${port}`;
        setServerAddress(`${ipAddress}:${port}`);
      } else if (settings.lastIpAddress && settings.lastPort) {
        // Utiliser les dernières valeurs stockées
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        wsServerUrl = `${protocol}${settings.lastIpAddress}:${settings.lastPort}`;
        setServerAddress(`${settings.lastIpAddress}:${settings.lastPort}`);
      } else {
        toast.error("Adresse IP ou port manquant");
        setStatus(ConnectionStatus.DISCONNECTED);
        return false;
      }
      
      console.log("Tentative de connexion au WebSocket:", wsServerUrl);
      
      // Créer une nouvelle connexion WebSocket
      const socket = new WebSocket(wsServerUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setStatus(ConnectionStatus.CONNECTED);
        setDevice({ name: `ESP32 (${serverAddress || wsServerUrl})` });
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
  }, [isSupported, settings.connectionTimeout, serverAddress, settings.lastIpAddress, settings.lastPort]);
  
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
    device,
    serverAddress
  };
}
