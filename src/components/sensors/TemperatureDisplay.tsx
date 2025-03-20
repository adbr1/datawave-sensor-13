
import { Thermometer } from "lucide-react";
import SensorCard from "./SensorCard";
import { cn } from "@/lib/utils";

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
  // Determine color based on temperature range
  const getTemperatureColor = (temp: number): string => {
    if (temp < 5) return "text-blue-500";
    if (temp > 30) return "text-red-500";
    return "text-sensor-info";
  };

  const tempColor = getTemperatureColor(temperature);

  return (
    <SensorCard 
      title="Temperature" 
      icon={<Thermometer className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
    >
      <div className="flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-light transition-colors duration-300", tempColor)}>
          {temperature}°C
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {temperature < 5 
            ? "Cold" 
            : temperature > 30 
              ? "Hot" 
              : "Normal"}
        </span>
      </div>
    </SensorCard>
  );
};

export default TemperatureDisplay;
