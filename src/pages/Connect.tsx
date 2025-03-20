
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useBluetoothDevice } from "@/hooks/useBluetoothDevice";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BluetoothSearching, Check, HelpCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Connect = () => {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const { 
    connect, 
    disconnect, 
    status, 
    isSupported,
    device 
  } = useBluetoothDevice();

  const handleConnectClick = async () => {
    setIsConnecting(true);
    const success = await connect();
    setIsConnecting(false);
    
    if (success) {
      // Navigate back to dashboard after successful connection
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <Card className="glassmorphism animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Connect to ESP32 Device</CardTitle>
            <CardDescription>
              Connect to your ESP32 sensor via Bluetooth to start monitoring data
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <DeviceConnection
                status={status}
                onConnect={handleConnectClick}
                onDisconnect={disconnect}
                isSupported={isSupported}
                deviceName={device?.name || null}
              />
              
              {status === ConnectionStatus.CONNECTING && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-fade-in">
                  <BluetoothSearching className="h-4 w-4 animate-pulse" />
                  <span>Searching for ESP32 devices...</span>
                </div>
              )}
              
              {status === ConnectionStatus.CONNECTED && (
                <div className="flex items-center space-x-2 text-sm text-sensor-success animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span>Connected successfully! Redirecting to dashboard...</span>
                </div>
              )}
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="compatibility">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Browser Compatibility
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Web Bluetooth is supported in Chrome, Edge, and Opera. It is not supported in Safari or Firefox.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="help">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Troubleshooting
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Make sure your ESP32 device is powered on and nearby</li>
                    <li>Ensure Bluetooth is enabled on your device</li>
                    <li>If you cannot see your device, try restarting it</li>
                    <li>Use a supported browser (Chrome, Edge, or Opera)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleConnectClick} 
              disabled={!isSupported || status === ConnectionStatus.CONNECTING || status === ConnectionStatus.CONNECTED} 
              className="w-full hover-elevate"
            >
              {status === ConnectionStatus.CONNECTING 
                ? "Searching..." 
                : status === ConnectionStatus.CONNECTED 
                  ? "Connected" 
                  : "Connect to ESP32"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Connect;
