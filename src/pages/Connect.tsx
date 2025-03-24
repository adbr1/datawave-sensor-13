
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Wifi, 
  Server,
  ArrowRight, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import DeviceConnection from "@/components/devices/DeviceConnection";
import { useDeviceConnection } from "@/hooks/useDeviceConnection";
import { useSettings } from "@/contexts/SettingsContext";
import { ConnectionStatus } from "@/types/sensorTypes";

// Schéma de validation pour le formulaire
const formSchema = z.object({
  ipAddress: z.string()
    .min(7, "L'adresse IP est trop courte")
    .max(45, "L'adresse IP est trop longue")
    .regex(/^[0-9a-zA-Z.-:]+$/, "Format d'adresse IP invalide"),
  port: z.string()
    .min(2, "Le port est trop court")
    .max(5, "Le port est trop long")
    .regex(/^\d+$/, "Le port doit être numérique"),
  developerMode: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const Connect = () => {
  const navigate = useNavigate();
  const { 
    connect, 
    disconnect, 
    status, 
    isSupported,
    device,
    isConnecting,
    isSimulated,
    serverAddress
  } = useDeviceConnection();
  
  const { settings, updateSettings } = useSettings();
  const [lastServerAddress, setLastServerAddress] = useState<string>("");
  
  // Récupérer l'adresse IP et le port à partir de l'adresse du serveur
  const getIpAndPort = (address: string) => {
    if (!address) return { ip: "", port: "" };
    
    const parts = address.split(':');
    if (parts.length === 2) {
      return { ip: parts[0], port: parts[1] };
    }
    
    // IPv6 avec port
    const ipv6Match = address.match(/\[(.*)\]:(.*)$/);
    if (ipv6Match) {
      return { ip: ipv6Match[1], port: ipv6Match[2] };
    }
    
    return { ip: address, port: "" };
  };
  
  // Initialiser le formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ipAddress: serverAddress ? getIpAndPort(serverAddress).ip : settings.lastIpAddress || "",
      port: serverAddress ? getIpAndPort(serverAddress).port : settings.lastPort || "81",
      developerMode: settings.developerMode,
    },
  });
  
  // Mettre à jour le formulaire lorsque l'adresse du serveur change
  useEffect(() => {
    if (serverAddress && serverAddress !== lastServerAddress) {
      const { ip, port } = getIpAndPort(serverAddress);
      form.setValue("ipAddress", ip);
      form.setValue("port", port);
      setLastServerAddress(serverAddress);
    }
  }, [serverAddress, form, lastServerAddress]);
  
  // Sauvegarde les informations de connexion
  const saveConnectionInfo = (data: FormValues) => {
    // Mettre à jour les paramètres
    updateSettings({
      lastIpAddress: data.ipAddress,
      lastPort: data.port,
      developerMode: data.developerMode
    });
  };
  
  // Traitement du formulaire
  const onSubmit = async (data: FormValues) => {
    // Si le mode développeur est activé, on utilise le simulateur
    if (data.developerMode) {
      saveConnectionInfo(data);
      
      // Tente de se connecter en mode simulé
      const success = await connect();
      
      if (success) {
        toast.success("Mode simulation activé");
        // Retour à la page d'accueil
        navigate("/");
      }
      return;
    }
    
    // Mode normal: connexion WebSocket
    saveConnectionInfo(data);
    
    const success = await connect(data.ipAddress, data.port);
    
    if (success) {
      toast.success(`Connecté à ${data.ipAddress}:${data.port}`);
      // Retour à la page d'accueil
      navigate("/");
    }
  };
  
  // Bascule du mode développeur
  const toggleDeveloperMode = (checked: boolean) => {
    form.setValue("developerMode", checked);
    
    // Si on active le mode développeur, on déconnecte l'appareil actuel
    if (checked && status === ConnectionStatus.CONNECTED && !isSimulated) {
      disconnect();
    }
  };
  
  // Déconnecter et revenir à l'accueil
  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  };
  
  // Vérifie si une connexion est en cours
  const isConnectionInProgress = 
    status === ConnectionStatus.CONNECTING || 
    isConnecting;
  
  return (
    <MainLayout title="Connexion ESP32">
      <div className="container max-w-4xl animate-fade-in">
        <h1 className="text-3xl font-semibold mb-1">Connexion ESP32</h1>
        <p className="text-muted-foreground mb-6">
          Connectez-vous à votre ESP32 via WebSocket
        </p>
        
        <div className="grid gap-6">
          {/* État de la connexion */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                État de la connexion
              </CardTitle>
              <CardDescription>
                Statut actuel de la connexion à votre ESP32
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceConnection
                status={status}
                onConnect={() => {
                  const values = form.getValues();
                  onSubmit(values);
                }}
                onDisconnect={handleDisconnect}
                isSupported={isSupported}
                deviceName={device?.name || null}
                isConnecting={isConnecting}
              />
            </CardContent>
          </Card>
          
          {/* Paramètres de connexion */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Paramètres de connexion
              </CardTitle>
              <CardDescription>
                Configurez la connexion à votre ESP32
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    {/* Mode développeur */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="developerMode"
                        checked={form.watch("developerMode")}
                        onCheckedChange={toggleDeveloperMode}
                      />
                      <Label htmlFor="developerMode">Mode simulation</Label>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {form.watch("developerMode") 
                          ? "Activé" 
                          : "Désactivé"}
                      </div>
                    </div>
                    
                    {/* Description du mode */}
                    <div className="rounded-md bg-muted p-3">
                      {form.watch("developerMode") ? (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-sensor-success flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Mode simulation activé.</strong> Les données des capteurs seront simulées. Parfait pour le développement et les tests sans matériel.
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Mode réel activé.</strong> Vous aurez besoin d'un ESP32 configuré comme serveur WebSocket. Assurez-vous qu'il est allumé et accessible sur votre réseau local.
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Champs de configuration WebSocket (masqués en mode développeur) */}
                    {!form.watch("developerMode") && (
                      <>
                        <FormField
                          control={form.control}
                          name="ipAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse IP</FormLabel>
                              <FormControl>
                                <Input placeholder="192.168.1.100" {...field} />
                              </FormControl>
                              <FormDescription>
                                L'adresse IP de votre ESP32 sur le réseau local
                              </FormDescription>
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
                              <FormDescription>
                                Le port WebSocket configuré sur votre ESP32 (généralement 81)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isConnectionInProgress || !form.formState.isValid || status === ConnectionStatus.CONNECTED}
                  >
                    {isConnectionInProgress ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connexion en cours...
                      </span>
                    ) : status === ConnectionStatus.CONNECTED ? (
                      <span className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Connecté
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {form.watch("developerMode") 
                          ? "Démarrer la simulation" 
                          : "Se connecter à l'ESP32"}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Note: Pour le mode WebSocket, assurez-vous que votre ESP32 est configuré pour fonctionner comme un serveur WebSocket. Si vous êtes en HTTPS, votre ESP32 doit également supporter le protocole WSS.
              </p>
            </CardFooter>
          </Card>
          
          {/* Aide à la connexion */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Besoin d'aide?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Si vous rencontrez des problèmes de connexion:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Vérifiez que votre ESP32 est bien alimenté</li>
                  <li>Assurez-vous que l'ESP32 et votre appareil sont sur le même réseau WiFi</li>
                  <li>Vérifiez que le serveur WebSocket est bien configuré sur l'ESP32</li>
                  <li>Vérifiez l'adresse IP et le port dans les paramètres</li>
                  <li>En cas de problème persistant, utilisez le mode simulation pour tester l'application</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Connect;
