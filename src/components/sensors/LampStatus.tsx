
import { Lightbulb, LightbulbOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import SensorCard from "./SensorCard";
import { useSettings } from "@/contexts/SettingsContext";

interface LampStatusProps {
  isOn: boolean;
  onToggle: () => void;
  isConnected: boolean;
  className?: string;
  animationDelay?: string;
}

const LampStatus = ({ 
  isOn, 
  onToggle, 
  isConnected,
  className,
  animationDelay = 'animation-delay-300'
}: LampStatusProps) => {
  const { settings } = useSettings();
  
  // Vérifie si l'automatisation de la lampe est active
  const isAutomatic = settings.lampAutomation.enabled;
  const isScheduleMode = settings.lampAutomation.scheduleMode;
  
  // Obtient les informations d'horaire ou conditions d'automatisation
  const getAutoInfo = () => {
    if (isScheduleMode) {
      return `${settings.lampAutomation.scheduleOn} - ${settings.lampAutomation.scheduleOff}`;
    } else {
      const conditions = [];
      
      if (settings.lampAutomation.temperatureTriggered) {
        conditions.push(`Temp > ${settings.lampAutomation.temperatureThreshold}°C`);
      }
      
      if (settings.lampAutomation.turbidityTriggered) {
        conditions.push(`Turb > ${settings.lampAutomation.turbidityThreshold} NTU`);
      }
      
      return conditions.join(' ou ');
    }
  };
  
  return (
    <SensorCard 
      title="Statut de la lampe" 
      icon={isOn ? <Lightbulb className="h-4 w-4 text-sensor-warning" /> : <LightbulbOff className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          {isOn ? (
            <div className="relative">
              <Lightbulb 
                size={48} 
                className="text-sensor-warning animate-pulse-gentle" 
              />
              <div className="absolute inset-0 blur-md bg-sensor-warning opacity-20 rounded-full animate-pulse-gentle" />
            </div>
          ) : (
            <LightbulbOff size={48} className="text-muted-foreground" />
          )}
        </div>
        
        <Button
          onClick={onToggle}
          disabled={!isConnected || isAutomatic}
          variant={isOn ? "outline" : "default"}
          className="transition-all duration-300"
        >
          {isOn ? "Éteindre" : "Allumer"}
        </Button>
        
        {isAutomatic && (
          <div className="text-xs text-muted-foreground text-center">
            <span className="font-semibold text-sensor-info">Mode automatique</span>
            <div className="flex items-center justify-center gap-1">
              {isScheduleMode && <Clock className="h-3 w-3" />}
              <span>{getAutoInfo()}</span>
            </div>
          </div>
        )}
      </div>
    </SensorCard>
  );
};

export default LampStatus;
