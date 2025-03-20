
import { Waves } from "lucide-react";
import SensorCard from "./SensorCard";
import { cn } from "@/lib/utils";

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
  // Determine color based on turbidity range (in NTU)
  const getTurbidityColor = (turb: number): string => {
    if (turb < 1) return "text-sensor-success"; // Clear water
    if (turb < 5) return "text-sensor-info"; // Slightly turbid
    if (turb < 20) return "text-sensor-warning"; // Moderately turbid
    return "text-sensor-error"; // Very turbid
  };

  const turbColor = getTurbidityColor(turbidity);
  
  // Get water quality label
  const getWaterQualityLabel = (turb: number): string => {
    if (turb < 1) return "Clear";
    if (turb < 5) return "Slightly Turbid";
    if (turb < 20) return "Moderately Turbid";
    return "Very Turbid";
  };

  return (
    <SensorCard 
      title="Turbidity" 
      icon={<Waves className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
    >
      <div className="flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-light transition-colors duration-300", turbColor)}>
          {turbidity} NTU
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {getWaterQualityLabel(turbidity)}
        </span>
      </div>
    </SensorCard>
  );
};

export default TurbidityDisplay;
