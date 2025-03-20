
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TemperatureDisplay from "@/components/sensors/TemperatureDisplay";
import TurbidityDisplay from "@/components/sensors/TurbidityDisplay";
import LampStatus from "@/components/sensors/LampStatus";
import TimeDisplay from "@/components/sensors/TimeDisplay";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useBluetoothDevice } from "@/hooks/useBluetoothDevice";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { 
    connect, 
    disconnect, 
    toggleLamp, 
    status, 
    sensorData, 
    isSupported,
    device
  } = useBluetoothDevice();

  const isConnected = status === ConnectionStatus.CONNECTED;

  // Navigate to connect page when not connected
  const handleConnectClick = () => {
    navigate("/connect");
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col space-y-8 animate-fade-in">
          <section className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-light tracking-tight mb-3">
              DataWave Sensor Dashboard
            </h1>
            <p className="text-muted-foreground mb-6">
              Real-time monitoring of your ESP32 water sensor data
            </p>
          </section>

          <section className="glassmorphism rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <DeviceConnection
                status={status}
                onConnect={connect}
                onDisconnect={disconnect}
                isSupported={isSupported}
                deviceName={device?.name || null}
              />
              
              {!isConnected && (
                <Button 
                  onClick={handleConnectClick}
                  className="animate-fade-in"
                >
                  Connect Device <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </section>

          {isConnected ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TemperatureDisplay 
                temperature={sensorData.temperature} 
                animationDelay="animation-delay-100"
              />
              <TurbidityDisplay 
                turbidity={sensorData.turbidity} 
                animationDelay="animation-delay-200"
              />
              <LampStatus 
                isOn={sensorData.lampStatus} 
                onToggle={toggleLamp} 
                isConnected={isConnected}
                animationDelay="animation-delay-300"
              />
              <TimeDisplay 
                animationDelay="animation-delay-400"
              />
            </section>
          ) : (
            <section className="glassmorphism rounded-2xl p-10 text-center animate-fade-in">
              <h2 className="text-2xl font-light mb-4">No Device Connected</h2>
              <p className="text-muted-foreground mb-6">
                Connect to your ESP32 device to start monitoring sensor data in real-time.
              </p>
              <Button 
                onClick={handleConnectClick}
                size="lg"
                className="animate-fade-in hover-elevate"
              >
                Connect a Device
              </Button>
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
