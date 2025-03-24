
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useDeviceConnection } from "@/hooks/useDeviceConnection";
import { ConnectionStatus } from "@/types/sensorTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  HelpCircle, 
  Info, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Settings 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSettings } from "@/contexts/SettingsContext";

// Schéma de validation du formulaire
const connectionSchema = z.object({
  ipAddress: z.string()
    .min(7, "L'adresse IP est requise")
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Format d'adresse IP invalide"),
  port: z.string()
    .min(1, "Le port est requis")
    .regex(/^\d+$/, "Le port doit être un nombre")
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

const Connect = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [lastUsedIP, setLastUsedIP] = useState<string>("");
  const [lastUsedPort, setLastUsedPort] = useState<string>("");
  const { 
    connect, 
    disconnect, 
    status, 
    isSupported,
    device,
    isSimulated,
    isConnecting
  } = useDeviceConnection();

  // Formulaire de connexion
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      ipAddress: "192.168.1.1",
      port: "81"
    },
  });

  // Charger les dernières valeurs utilisées depuis le localStorage
  useEffect(() => {
    const savedIP = localStorage.getItem("lastUsedIP");
    const savedPort = localStorage.getItem("lastUsedPort");
    
    if (savedIP) {
      form.setValue("ipAddress", savedIP);
      setLastUsedIP(savedIP);
    }
    
    if (savedPort) {
      form.setValue("port", savedPort);
      setLastUsedPort(savedPort);
    }
  }, [form]);

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

  // Gérer la soumission du formulaire
  const onSubmit = async (values: ConnectionFormValues) => {
    const { ipAddress, port } = values;
    
    // Sauvegarder les valeurs pour une utilisation future
    localStorage.setItem("lastUsedIP", ipAddress);
    localStorage.setItem("lastUsedPort", port);
    setLastUsedIP(ipAddress);
    setLastUsedPort(port);
    
    // Tentative de connexion
    const success = await connect(ipAddress, port);
    
    if (!success && !isSimulated) {
      // La connexion a échoué
      form.setError("root", { 
        message: "Impossible de se connecter. Vérifiez l'adresse IP et le port." 
      });
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
        </Button>
        
        <Card className="glassmorphism animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Connexion à l'ESP32</CardTitle>
            <CardDescription>
              Connectez-vous à votre capteur ESP32 via WebSocket pour commencer le monitoring
              {isSimulated && <span className="text-sensor-info ml-2">(Mode Simulation Activé)</span>}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <DeviceConnection
              status={status}
              onConnect={() => form.handleSubmit(onSubmit)()}
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
            
            {!isSimulated && status !== ConnectionStatus.CONNECTED && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ipAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse IP</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input placeholder="81" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.formState.errors.root && (
                    <div className="text-sm text-sensor-error flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{form.formState.errors.root.message}</span>
                    </div>
                  )}
                  
                  {lastUsedIP && lastUsedPort && (
                    <div className="flex flex-col space-y-2 p-3 bg-secondary/20 rounded-md text-sm">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-sensor-info" />
                        <span>Dernière connexion utilisée:</span>
                      </div>
                      <code className="text-xs bg-secondary/30 p-1 rounded">
                        ws://{lastUsedIP}:{lastUsedPort}
                      </code>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={!isSupported || isConnecting || status === ConnectionStatus.CONNECTING} 
                    className="w-full hover-elevate"
                  >
                    {isConnecting 
                      ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Connexion...</> 
                      : "Se connecter"
                    }
                  </Button>
                </form>
              </Form>
            )}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="help">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Comment se connecter à mon ESP32 ?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Pour vous connecter à votre ESP32, vous devez:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Assurez-vous que votre ESP32 est allumé et connecté au même réseau WiFi que votre appareil</li>
                      <li>L'ESP32 doit être programmé pour exposer un serveur WebSocket</li>
                      <li>Entrez l'adresse IP locale de votre ESP32 (par exemple: 192.168.1.100)</li>
                      <li>Entrez le port sur lequel le serveur WebSocket est exposé (généralement 81)</li>
                    </ol>
                    
                    <div className="p-3 bg-secondary/20 rounded-md">
                      <p className="text-xs font-medium mb-1">Exemple de code Arduino pour l'ESP32:</p>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-secondary/30 p-2 rounded">
{`#include <WiFi.h>
#include <WebSocketsServer.h>

const char* ssid = "Votre_WiFi";
const char* password = "Mot_De_Passe";

WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connexion au WiFi...");
  }
  
  Serial.println("Connecté au WiFi");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  // Gérer les événements WebSocket ici
}`}
                      </pre>
                    </div>
                    
                    <p className="text-muted-foreground">
                      Une fois connecté, vous pourrez voir les données des capteurs en temps réel.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="troubleshooting">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Résolution des problèmes
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                    <li>Si vous utilisez HTTPS (URL commence par https://), vous devez utiliser WSS (WebSocket Sécurisé) sur l'ESP32</li>
                    <li>Vérifiez que le pare-feu de votre réseau autorise les connexions sur le port utilisé</li>
                    <li>Assurez-vous que votre ESP32 est bien connecté au réseau WiFi</li>
                    <li>Vérifiez que l'adresse IP de l'ESP32 n'a pas changé (utilisez des IP statiques)</li>
                    <li>Si vous êtes en mode développement local, essayez le <button 
                      onClick={() => navigate("/settings")}
                      className="text-sensor-info underline inline-flex items-center"
                    >
                      <Settings className="h-3 w-3 mr-1" /> mode simulation
                    </button></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="https">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-sensor-error" />
                    Erreur de connexion HTTPS
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Si vous accédez à cette application via HTTPS et que vous rencontrez des erreurs de sécurité, c'est parce que les navigateurs modernes empêchent les connexions WebSocket non sécurisées (ws://) depuis des pages HTTPS.
                    </p>
                    
                    <div className="p-3 bg-red-100/20 border border-red-200 rounded-md">
                      <p className="text-xs font-medium mb-1 text-sensor-error">Solutions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                        <li>Utilisez cette application en HTTP plutôt qu'en HTTPS</li>
                        <li>Configurez votre ESP32 pour utiliser un WebSocket sécurisé (WSS)</li>
                        <li>Utilisez le mode simulation pour tester l'application</li>
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          
          <CardFooter>
            {!isSimulated && status !== ConnectionStatus.CONNECTED && (
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={!isSupported || isConnecting || status === ConnectionStatus.CONNECTING} 
                className="w-full hover-elevate"
              >
                {isConnecting 
                  ? <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Recherche en cours...</> 
                  : status === ConnectionStatus.CONNECTED 
                    ? <><Check className="h-4 w-4 mr-2" /> Connecté</> 
                    : "Se connecter à l'ESP32"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Connect;
