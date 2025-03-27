
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BellRing, Smartphone, RefreshCw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/components/ui/use-toast";

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
    else {
      updateSettings({ ...settings, notificationsEnabled: enabled });
    }
  };

  const handleTestNotification = () => {
    sendTestNotification();
    toast({
      title: "Notification envoyée",
      description: "Une notification de test a été envoyée à votre appareil.",
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellRing className="h-5 w-5 mr-2" />
          Notifications Push
        </CardTitle>
        <CardDescription>
          Recevez des alertes même lorsque l'application est fermée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-800">
            <p className="text-sm">
              Votre navigateur ne prend pas en charge les notifications push. Essayez d'utiliser 
              un navigateur moderne comme Chrome, Edge ou Firefox.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">Activer les notifications</span>
                <span className="text-sm text-muted-foreground">
                  Recevez des alertes sur les changements critiques de température et de turbidité
                </span>
              </div>
              <Switch 
                checked={settings.notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
                disabled={isRequesting || (!settings.notificationsEnabled && permission === 'denied')}
              />
            </div>

            {permission === 'denied' && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
                <p className="text-sm">
                  Les notifications ont été bloquées. Pour les activer, vous devez modifier les 
                  paramètres de notification dans votre navigateur.
                </p>
              </div>
            )}

            {settings.notificationsEnabled && (
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Notifications push activées</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestNotification}
                  >
                    Tester
                  </Button>
                </div>
              </div>
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
    </Card>
  );
};

export default NotificationsSettings;
