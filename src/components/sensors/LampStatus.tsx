
import { Lightbulb, LightbulbOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import SensorCard from "./SensorCard";

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
  return (
    <SensorCard 
      title="Lamp Status" 
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
          disabled={!isConnected}
          variant={isOn ? "outline" : "default"}
          className="transition-all duration-300"
        >
          {isOn ? "Turn Off" : "Turn On"}
        </Button>
      </div>
    </SensorCard>
  );
};

export default LampStatus;
