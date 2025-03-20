
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useDeviceConnection } from "@/hooks/useDeviceConnection";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BluetoothSearching, Check, HelpCircle, Info, RefreshCw, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import { Link } from "react-router-dom";

const Connect = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
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

  const enableDeveloperMode = () => {
    updateSettings({ ...settings, developerMode: true });
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
              
              {!isSupported && !isSimulated && (
                <div className="flex flex-col space-y-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md text-sm">
                  <div className="flex items-center text-orange-700 font-medium">
                    <Info className="h-4 w-4 mr-2" />
                    Le Bluetooth n'est pas disponible
                  </div>
                  <p className="text-orange-600">
                    Votre navigateur ne supporte pas le Web Bluetooth ou le Bluetooth est désactivé.
                  </p>
                  <div className="flex space-x-2 mt-1">
                    <Button size="sm" variant="outline" onClick={enableDeveloperMode}>
                      <Terminal className="h-3.5 w-3.5 mr-1" />
                      Activer le mode simulation
                    </Button>
                    <Link to="/settings">
                      <Button size="sm" variant="outline">
                        Paramètres
                      </Button>
                    </Link>
                  </div>
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
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <Badge variant="outline">Chrome</Badge>
                      <Check className="h-4 w-4 ml-2 text-green-500" />
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline">Edge</Badge>
                      <Check className="h-4 w-4 ml-2 text-green-500" />
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline">Opera</Badge>
                      <Check className="h-4 w-4 ml-2 text-green-500" />
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline">Firefox</Badge>
                      <BluetoothOff className="h-4 w-4 ml-2 text-red-500" />
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline">Safari</Badge>
                      <BluetoothOff className="h-4 w-4 ml-2 text-red-500" />
                    </div>
                  </div>
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
                    <li>Vérifiez que le Bluetooth est activé sur votre appareil</li>
                    <li>Assurez-vous que votre ESP32 est allumé et à proximité</li>
                    <li>Vérifiez que vous utilisez un navigateur compatible (Chrome, Edge ou Opera)</li>
                    <li>Sur Windows, vérifiez que le mode avion est désactivé</li>
                    <li>Redémarrez votre appareil ESP32 et essayez à nouveau</li>
                    <li>Essayez d'activer le <Link to="/settings" className="text-blue-500 hover:underline">mode développeur</Link> dans les paramètres pour simuler les données sans Bluetooth</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              onClick={handleConnectClick} 
              disabled={!isSupported && !isSimulated || isConnecting || status === ConnectionStatus.CONNECTED} 
              className="w-full hover-elevate"
            >
              {isConnecting 
                ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Recherche en cours...</> 
                : status === ConnectionStatus.CONNECTED 
                  ? <><Check className="h-4 w-4 mr-2" /> Connecté</> 
                  : "Se connecter à l'ESP32"}
            </Button>
            
            {!isSimulated && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={enableDeveloperMode}
                className="text-xs"
              >
                <Terminal className="h-3.5 w-3.5 mr-1" />
                Activer le mode simulation
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Connect;
