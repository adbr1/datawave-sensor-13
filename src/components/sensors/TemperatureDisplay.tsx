
import { Thermometer } from "lucide-react";
import SensorCard from "./SensorCard";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface TemperatureDisplayProps {
  temperature: number;
  className?: string;
  animationDelay?: string;
}

const TemperatureDisplay = ({ 
  temperature, 
  className,
  animationDelay = 'animation-delay-100'
}: TemperatureDisplayProps) => {
  const { settings } = useSettings();
  
  // Convertir la température si nécessaire
  const displayTemp = settings.temperatureUnit === "fahrenheit" 
    ? (temperature * 9/5) + 32
    : temperature;
  
  // Determine color based on temperature range and alert thresholds
  const getTemperatureColor = (temp: number): string => {
    if (settings.temperatureAlerts.enabled) {
      if (temp < settings.temperatureAlerts.minThreshold) return "text-blue-500";
      if (temp > settings.temperatureAlerts.maxThreshold) return "text-red-500";
    }
    
    if (temp < 5) return "text-blue-500";
    if (temp > 30) return "text-red-500";
    return "text-sensor-info";
  };

  const tempColor = getTemperatureColor(temperature);
  
  // Vérifie si la température est en dehors des seuils
  const isAlertActive = settings.temperatureAlerts.enabled && (
    temperature < settings.temperatureAlerts.minThreshold || 
    temperature > settings.temperatureAlerts.maxThreshold
  );

  // Texte d'état
  const getTemperatureStatus = (temp: number): string => {
    if (settings.temperatureAlerts.enabled) {
      if (temp < settings.temperatureAlerts.minThreshold) return "Trop basse";
      if (temp > settings.temperatureAlerts.maxThreshold) return "Trop élevée";
    }
    
    if (temp < 5) return "Froide";
    if (temp > 30) return "Chaude";
    return "Normale";
  };

  return (
    <SensorCard 
      title="Température" 
      icon={<Thermometer className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
      alert={isAlertActive}
    >
      <div className="flex flex-col items-center justify-center">
        <span className={cn(
          "text-4xl font-light transition-colors duration-300", 
          tempColor,
          isAlertActive && "animate-pulse"
        )}>
          {displayTemp.toFixed(1)}°{settings.temperatureUnit === "fahrenheit" ? "F" : "C"}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {getTemperatureStatus(temperature)}
          {isAlertActive && (
            <span className="ml-1 text-red-500">⚠️</span>
          )}
        </span>
        
        {settings.temperatureAlerts.enabled && (
          <div className="w-full mt-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Min: {settings.temperatureAlerts.minThreshold}°C</span>
              <span>Max: {settings.temperatureAlerts.maxThreshold}°C</span>
            </div>
          </div>
        )}
      </div>
    </SensorCard>
  );
};

export default TemperatureDisplay;
