
import { Waves } from "lucide-react";
import SensorCard from "./SensorCard";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface TurbidityDisplayProps {
  turbidity: number;
  className?: string;
  animationDelay?: string;
}

const TurbidityDisplay = ({ 
  turbidity, 
  className,
  animationDelay = 'animation-delay-200'
}: TurbidityDisplayProps) => {
  const { settings } = useSettings();
  
  // Determine color based on turbidity range (in NTU)
  const getTurbidityColor = (turb: number): string => {
    if (settings.turbidityAlerts.enabled && turb >= settings.turbidityAlerts.threshold) {
      return "text-sensor-error";
    }
    
    if (turb < 1) return "text-sensor-success"; // Clear water
    if (turb < 5) return "text-sensor-info"; // Slightly turbid
    if (turb < 20) return "text-sensor-warning"; // Moderately turbid
    return "text-sensor-error"; // Very turbid
  };

  const turbColor = getTurbidityColor(turbidity);
  
  // Vérifie si la turbidité est au-dessus du seuil
  const isAlertActive = settings.turbidityAlerts.enabled && 
    turbidity >= settings.turbidityAlerts.threshold;
  
  // Get water quality label
  const getWaterQualityLabel = (turb: number): string => {
    if (turb < 1) return "Claire";
    if (turb < 5) return "Légèrement trouble";
    if (turb < 20) return "Modérément trouble";
    return "Très trouble";
  };

  return (
    <SensorCard 
      title="Turbidité" 
      icon={<Waves className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
      alert={isAlertActive}
    >
      <div className="flex flex-col items-center justify-center">
        <span className={cn(
          "text-4xl font-light transition-colors duration-300", 
          turbColor,
          isAlertActive && "animate-pulse"
        )}>
          {turbidity} NTU
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {getWaterQualityLabel(turbidity)}
          {isAlertActive && (
            <span className="ml-1 text-red-500">⚠️</span>
          )}
        </span>
        
        {settings.turbidityAlerts.enabled && (
          <div className="w-full mt-2 text-xs text-muted-foreground">
            <div className="flex justify-center">
              <span>Seuil: {settings.turbidityAlerts.threshold} NTU</span>
            </div>
          </div>
        )}
      </div>
    </SensorCard>
  );
};

export default TurbidityDisplay;
