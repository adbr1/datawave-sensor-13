
import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Bell, Thermometer, Waves, Lightbulb } from "lucide-react";

export const SensorSettings = () => {
  const { settings, updateSettings } = useSettings();
  
  // État local pour les curseurs (sliders)
  const [tempMin, setTempMin] = useState(settings.temperatureAlerts.minThreshold);
  const [tempMax, setTempMax] = useState(settings.temperatureAlerts.maxThreshold);
  const [turbidityThreshold, setTurbidityThreshold] = useState(settings.turbidityAlerts.threshold);
  const [autoTempThreshold, setAutoTempThreshold] = useState(settings.lampAutomation.temperatureThreshold);
  const [autoTurbThreshold, setAutoTurbThreshold] = useState(settings.lampAutomation.turbidityThreshold);
  
  // Gestionnaires pour les alertes de température
  const handleTempAlertsToggle = (checked: boolean) => {
    updateSettings({
      temperatureAlerts: {
        ...settings.temperatureAlerts,
        enabled: checked
      }
    });
  };
  
  const handleTempMinChange = (value: number[]) => {
    setTempMin(value[0]);
    updateSettings({
      temperatureAlerts: {
        ...settings.temperatureAlerts,
        minThreshold: value[0]
      }
    });
  };
  
  const handleTempMaxChange = (value: number[]) => {
    setTempMax(value[0]);
    updateSettings({
      temperatureAlerts: {
        ...settings.temperatureAlerts,
        maxThreshold: value[0]
      }
    });
  };
  
  // Gestionnaires pour les alertes de turbidité
  const handleTurbidityAlertsToggle = (checked: boolean) => {
    updateSettings({
      turbidityAlerts: {
        ...settings.turbidityAlerts,
        enabled: checked
      }
    });
  };
  
  const handleTurbidityThresholdChange = (value: number[]) => {
    setTurbidityThreshold(value[0]);
    updateSettings({
      turbidityAlerts: {
        ...settings.turbidityAlerts,
        threshold: value[0]
      }
    });
  };
  
  // Gestionnaires pour l'automatisation de la lampe
  const handleLampAutoToggle = (checked: boolean) => {
    updateSettings({
      lampAutomation: {
        ...settings.lampAutomation,
        enabled: checked
      }
    });
  };
  
  const handleTempTriggerToggle = (checked: boolean) => {
    updateSettings({
      lampAutomation: {
        ...settings.lampAutomation,
        temperatureTriggered: checked
      }
    });
  };
  
  const handleTempTriggerChange = (value: number[]) => {
    setAutoTempThreshold(value[0]);
    updateSettings({
      lampAutomation: {
        ...settings.lampAutomation,
        temperatureThreshold: value[0]
      }
    });
  };
  
  const handleTurbTriggerToggle = (checked: boolean) => {
    updateSettings({
      lampAutomation: {
        ...settings.lampAutomation,
        turbidityTriggered: checked
      }
    });
  };
  
  const handleTurbTriggerChange = (value: number[]) => {
    setAutoTurbThreshold(value[0]);
    updateSettings({
      lampAutomation: {
        ...settings.lampAutomation,
        turbidityThreshold: value[0]
      }
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Alertes de température */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              <CardTitle>Alertes de température</CardTitle>
            </div>
            <Switch 
              checked={settings.temperatureAlerts.enabled}
              onCheckedChange={handleTempAlertsToggle}
            />
          </div>
          <CardDescription>
            Configurez les seuils d'alerte pour la température
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Seuil minimum</Label>
              <span className="text-muted-foreground">{tempMin}°C</span>
            </div>
            <Slider 
              defaultValue={[tempMin]} 
              min={0} 
              max={30} 
              step={0.5} 
              onValueChange={handleTempMinChange}
              disabled={!settings.temperatureAlerts.enabled}
            />
            <p className="text-xs text-muted-foreground">Vous recevrez une alerte si la température descend sous ce seuil</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Seuil maximum</Label>
              <span className="text-muted-foreground">{tempMax}°C</span>
            </div>
            <Slider 
              defaultValue={[tempMax]} 
              min={20} 
              max={50} 
              step={0.5} 
              onValueChange={handleTempMaxChange}
              disabled={!settings.temperatureAlerts.enabled}
            />
            <p className="text-xs text-muted-foreground">Vous recevrez une alerte si la température dépasse ce seuil</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Alertes de turbidité */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-blue-500" />
              <CardTitle>Alertes de turbidité</CardTitle>
            </div>
            <Switch 
              checked={settings.turbidityAlerts.enabled}
              onCheckedChange={handleTurbidityAlertsToggle}
            />
          </div>
          <CardDescription>
            Configurez le seuil d'alerte pour la turbidité de l'eau
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Seuil d'alerte</Label>
              <span className="text-muted-foreground">{turbidityThreshold} NTU</span>
            </div>
            <Slider 
              defaultValue={[turbidityThreshold]} 
              min={0} 
              max={20} 
              step={0.5} 
              onValueChange={handleTurbidityThresholdChange}
              disabled={!settings.turbidityAlerts.enabled}
            />
            <p className="text-xs text-muted-foreground">Vous recevrez une alerte si la turbidité dépasse ce seuil</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Automatisation de la lampe */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>Automatisation de la lampe</CardTitle>
            </div>
            <Switch 
              checked={settings.lampAutomation.enabled}
              onCheckedChange={handleLampAutoToggle}
            />
          </div>
          <CardDescription>
            Configurez l'activation automatique de la lampe en fonction des conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Déclencheur par température */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer par température</Label>
                <p className="text-xs text-muted-foreground">La lampe s'allume quand la température dépasse le seuil</p>
              </div>
              <Switch 
                checked={settings.lampAutomation.temperatureTriggered}
                onCheckedChange={handleTempTriggerToggle}
                disabled={!settings.lampAutomation.enabled}
              />
            </div>
            
            {settings.lampAutomation.temperatureTriggered && (
              <div className="space-y-2 pl-2 border-l-2 border-muted ml-2">
                <div className="flex justify-between items-center">
                  <Label>Seuil de température</Label>
                  <span className="text-muted-foreground">{autoTempThreshold}°C</span>
                </div>
                <Slider 
                  defaultValue={[autoTempThreshold]} 
                  min={15} 
                  max={40} 
                  step={0.5} 
                  onValueChange={handleTempTriggerChange}
                  disabled={!settings.lampAutomation.enabled || !settings.lampAutomation.temperatureTriggered}
                />
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Déclencheur par turbidité */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer par turbidité</Label>
                <p className="text-xs text-muted-foreground">La lampe s'allume quand la turbidité dépasse le seuil</p>
              </div>
              <Switch 
                checked={settings.lampAutomation.turbidityTriggered}
                onCheckedChange={handleTurbTriggerToggle}
                disabled={!settings.lampAutomation.enabled}
              />
            </div>
            
            {settings.lampAutomation.turbidityTriggered && (
              <div className="space-y-2 pl-2 border-l-2 border-muted ml-2">
                <div className="flex justify-between items-center">
                  <Label>Seuil de turbidité</Label>
                  <span className="text-muted-foreground">{autoTurbThreshold} NTU</span>
                </div>
                <Slider 
                  defaultValue={[autoTurbThreshold]} 
                  min={0} 
                  max={15} 
                  step={0.5} 
                  onValueChange={handleTurbTriggerChange}
                  disabled={!settings.lampAutomation.enabled || !settings.lampAutomation.turbidityTriggered}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorSettings;
