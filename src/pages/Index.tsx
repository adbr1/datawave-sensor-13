
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TemperatureDisplay from "@/components/sensors/TemperatureDisplay";
import TurbidityDisplay from "@/components/sensors/TurbidityDisplay";
import LampStatus from "@/components/sensors/LampStatus";
import TimeDisplay from "@/components/sensors/TimeDisplay";
import FishMealInfo from "@/components/sensors/FishMealInfo";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useDeviceConnection } from "@/hooks/useDeviceConnection";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { 
    connect, 
    disconnect, 
    toggleLamp, 
    status, 
    sensorData, 
    isSupported,
    device,
    isSimulated,
    isConnecting
  } = useDeviceConnection();

  const isConnected = status === ConnectionStatus.CONNECTED;

  // Essaie de se reconnecter automatiquement au démarrage si l'ESP n'est pas connecté
  useEffect(() => {
    // On tente de connecter seulement si on n'est pas déjà connecté ou en cours de connexion
    if (status === ConnectionStatus.DISCONNECTED && !isConnecting && !isConnected) {
      // On essaie de se connecter avec les paramètres existants (mode simulé ou dernière adresse IP/port)
      connect();
    }
  }, [status, connect, isConnecting, isConnected]);

  const handleConnect = async () => {
    // Si l'appareil n'est pas connecté, on tente de le connecter directement
    if (status === ConnectionStatus.DISCONNECTED) {
      const success = await connect();
      
      // Si la connexion échoue et que ce n'est pas le mode simulé, on va à la page de connexion
      if (!success && !isSimulated) {
        navigate("/connect");
      }
    } else if (status === ConnectionStatus.CONNECTED) {
      // Si déjà connecté, on déconnecte
      disconnect();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col space-y-4 md:space-y-8 animate-fade-in">
          <section className="text-center max-w-3xl mx-auto px-2">
            <h1 className={`font-light tracking-tight mb-2 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              Tableau de bord DataWave
            </h1>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Surveillance en temps réel de vos capteurs aquatiques ESP32
              {isSimulated && <span className="text-sensor-info ml-2">(Mode Simulation)</span>}
            </p>
          </section>

          <section className="glassmorphism rounded-xl md:rounded-2xl p-4 md:p-6 animate-scale-in">
            <div className="flex items-center justify-between gap-2 md:gap-4 flex-wrap">
              <DeviceConnection
                status={status}
                onConnect={handleConnect}
                onDisconnect={disconnect}
                isSupported={isSupported}
                deviceName={device?.name || null}
                isConnecting={isConnecting}
              />
            </div>
          </section>

          {isConnected ? (
            <section className={`grid gap-3 md:gap-6 ${isMobile 
              ? 'grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}>
              <TemperatureDisplay 
                temperature={sensorData.temperature} 
                animationDelay="animation-delay-100"
                className={isMobile ? "col-span-1" : ""}
              />
              <TurbidityDisplay 
                turbidity={sensorData.turbidity} 
                animationDelay="animation-delay-200"
                className={isMobile ? "col-span-1" : ""}
              />
              <LampStatus 
                isOn={sensorData.lampStatus} 
                onToggle={toggleLamp} 
                isConnected={isConnected}
                animationDelay="animation-delay-300"
                className={isMobile ? "col-span-1" : ""}
              />
              <TimeDisplay 
                animationDelay="animation-delay-400"
                className={isMobile ? "col-span-1" : ""}
              />
              <FishMealInfo
                animationDelay="animation-delay-500"
                className={isMobile ? "col-span-2" : ""}
              />
            </section>
          ) : (
            <section className="glassmorphism rounded-xl md:rounded-2xl p-6 md:p-10 text-center animate-fade-in">
              <h2 className="text-xl md:text-2xl font-light mb-3 md:mb-4">Aucun appareil connecté</h2>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                {isConnecting 
                  ? "Tentative de connexion en cours..." 
                  : "Connectez-vous à votre ESP32 pour commencer à surveiller les données en temps réel."}
              </p>
              <Button 
                onClick={handleConnect}
                size={isMobile ? "default" : "lg"}
                className="animate-fade-in hover-elevate"
                disabled={isConnecting || !isSupported}
              >
                {isConnecting 
                  ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Connexion...</>
                  : "Se connecter à un appareil"
                }
              </Button>
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
