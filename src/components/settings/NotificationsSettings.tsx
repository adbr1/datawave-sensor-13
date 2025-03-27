
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  BellRing, 
  Smartphone, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Send,
  ShieldAlert,
  Bell,
  BellOff
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NotificationsSettings = () => {
  const { settings, updateSettings } = useSettings();
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    unsubscribeFromPush,
    sendTestNotification
  } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // When component mounts, check permissions
  useEffect(() => {
    if (isSupported && permission === 'granted' && !settings.notificationsEnabled) {
      updateSettings({ notificationsEnabled: true });
    } else if (permission !== 'granted' && settings.notificationsEnabled) {
      updateSettings({ notificationsEnabled: false });
    }
  }, [isSupported, permission, settings.notificationsEnabled, updateSettings]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      setIsRequesting(true);
      const granted = await requestPermission();
      setIsRequesting(false);
      
      if (!granted) return;
    } 
    else if (!enabled && permission === 'granted') {
      await unsubscribeFromPush();
    }
    
    updateSettings({ notificationsEnabled: enabled });
  };

  const handleTestNotification = () => {
    sendTestNotification();
    setTestSent(true);
    
    // Reset the test sent state after 10 seconds
    setTimeout(() => setTestSent(false), 10000);
    
    toast.success("Notification de test envoyée", {
      description: "Vérifiez si vous avez reçu la notification"
    });
  };

  // Different card appearances based on permission status
  const getStatusColors = () => {
    if (permission === 'granted') return "border-green-100 bg-green-50";
    if (permission === 'denied') return "border-red-100 bg-red-50";
    return "border-blue-100 bg-blue-50";
  };

  return (
    <div className="space-y-6">
      <Card className={`transition-all duration-500 ${permission === 'granted' ? 'border-green-200' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            {settings.notificationsEnabled ? (
              <BellRing className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 mr-2 text-muted-foreground" />
            )}
            Notifications Push
          </CardTitle>
          <CardDescription>
            Recevez des alertes même lorsque l'application est fermée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Navigateur non compatible</AlertTitle>
              <AlertDescription className="text-amber-700">
                Votre navigateur ne prend pas en charge les notifications push. Essayez d'utiliser 
                Chrome, Edge ou Firefox pour profiter de cette fonctionnalité.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">Activer les notifications</span>
                  <span className="text-sm text-muted-foreground">
                    Soyez alerté des changements critiques de température et turbidité
                  </span>
                </div>
                <Switch 
                  checked={settings.notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isRequesting || (!settings.notificationsEnabled && permission === 'denied')}
                />
              </div>

              {permission === 'denied' && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Accès bloqué</AlertTitle>
                  <AlertDescription className="text-sm">
                    Les notifications ont été bloquées dans votre navigateur. Pour les activer, 
                    consultez les paramètres de votre navigateur et recherchez la section "Notifications".
                  </AlertDescription>
                </Alert>
              )}

              {permission === 'granted' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Notifications activées</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Vous recevrez des notifications push pour les alertes importantes.
                  </AlertDescription>
                </Alert>
              )}

              {isRequesting && (
                <div className="flex items-center justify-center py-2">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Demande d'autorisation...</span>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          {isSupported && permission === 'granted' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2"
              onClick={handleTestNotification}
              disabled={isRequesting || testSent}
            >
              {testSent ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Notification envoyée</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Envoyer une notification de test</span>
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Types d'alertes
          </CardTitle>
          <CardDescription>
            Choisissez les événements qui déclenchent l'envoi de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Température hors limites</span>
                <span className="text-sm text-muted-foreground">
                  Notification si la température sort des seuils définis
                </span>
              </div>
              <Switch 
                checked={settings.temperatureAlerts.enabled}
                onCheckedChange={(checked) => updateSettings({
                  temperatureAlerts: {
                    ...settings.temperatureAlerts,
                    enabled: checked
                  }
                })}
                disabled={!settings.notificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Turbidité élevée</span>
                <span className="text-sm text-muted-foreground">
                  Notification si la turbidité dépasse le seuil défini
                </span>
              </div>
              <Switch 
                checked={settings.turbidityAlerts.enabled}
                onCheckedChange={(checked) => updateSettings({
                  turbidityAlerts: {
                    ...settings.turbidityAlerts,
                    enabled: checked
                  }
                })}
                disabled={!settings.notificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Rappel des repas</span>
                <span className="text-sm text-muted-foreground">
                  Notification avant chaque repas programmé
                </span>
              </div>
              <Switch 
                checked={settings.fishMeals.enabled}
                onCheckedChange={(checked) => updateSettings({
                  fishMeals: {
                    ...settings.fishMeals,
                    enabled: checked
                  }
                })}
                disabled={!settings.notificationsEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;
