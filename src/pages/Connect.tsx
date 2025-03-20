
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useDeviceConnection } from "@/hooks/useDeviceConnection";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BluetoothSearching, Check, HelpCircle, Info, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Connect = () => {
  const navigate = useNavigate();
  const { 
    connect, 
    disconnect, 
    status, 
    isSupported,
    device,
    isSimulated,
    isConnecting
  } = useDeviceConnection();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED) {
      // Petite temporisation pour permettre à l'utilisateur de voir l'état connecté
      const timer = setTimeout(() => {
        navigate("/");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const handleConnectClick = async () => {
    const success = await connect();
    
    if (success) {
      // La redirection sera gérée par l'effet ci-dessus
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
        </Button>
        
        <Card className="glassmorphism animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Connexion à l'ESP32</CardTitle>
            <CardDescription>
              Connectez-vous à votre capteur ESP32 via Bluetooth pour commencer le monitoring
              {isSimulated && <span className="text-sensor-info ml-2">(Mode Simulation Activé)</span>}
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
                isConnecting={isConnecting}
              />
              
              {status === ConnectionStatus.CONNECTED && (
                <div className="flex items-center space-x-2 text-sm text-sensor-success animate-fade-in">
                  <Check className="h-4 w-4" />
                  <span>Connexion réussie ! Redirection vers le tableau de bord...</span>
                </div>
              )}
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="compatibility">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Compatibilité navigateur
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    Le Web Bluetooth est supporté par Chrome, Edge et Opera. Il n'est pas supporté par Safari ou Firefox.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="help">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Résolution des problèmes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Assurez-vous que votre ESP32 est allumé et à proximité</li>
                    <li>Vérifiez que le Bluetooth est activé sur votre appareil</li>
                    <li>Si vous ne voyez pas votre appareil, essayez de le redémarrer</li>
                    <li>Utilisez un navigateur compatible (Chrome, Edge ou Opera)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleConnectClick} 
              disabled={!isSupported || isConnecting || status === ConnectionStatus.CONNECTED} 
              className="w-full hover-elevate"
            >
              {isConnecting 
                ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Recherche en cours...</> 
                : status === ConnectionStatus.CONNECTED 
                  ? <><Check className="h-4 w-4 mr-2" /> Connecté</> 
                  : "Se connecter à l'ESP32"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Connect;
