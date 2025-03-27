
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import SensorSettings from "@/components/settings/SensorSettings";
import FishMealsSettings from "@/components/settings/FishMealsSettings";
import NotificationsSettings from "@/components/settings/NotificationsSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle, Undo2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Settings = () => {
  const { settings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("sensor");
  const isMobile = useIsMobile();

  const handleResetSettings = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
      resetSettings();
      toast.success("Paramètres réinitialisés avec succès");
    }
  };

  return (
    <MainLayout title="Réglages">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre système de surveillance
          </p>
        </div>

        <Tabs 
          defaultValue="sensor" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="animate-fade-in animation-delay-100"
        >
          <div className="sticky top-16 z-10 pb-4 bg-background/80 backdrop-blur-sm">
            <TabsList className={`w-full ${isMobile ? 'grid grid-cols-3 gap-1' : ''}`}>
              <TabsTrigger value="sensor">Capteurs</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="fish">Alimentation</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sensor" className="space-y-6 mt-2">
            <SensorSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6 mt-2">
            <NotificationsSettings />
          </TabsContent>
          
          <TabsContent value="fish" className="space-y-6 mt-2">
            <FishMealsSettings />
          </TabsContent>
        </Tabs>

        <div className="mt-12 border-t pt-6 flex justify-between items-center animate-fade-in animation-delay-700">
          <Button
            variant="outline" 
            onClick={handleResetSettings}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Undo2 className="h-4 w-4" />
            <span>Réinitialiser les paramètres</span>
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Version: 1.0.0
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
