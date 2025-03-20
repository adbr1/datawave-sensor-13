
import { Clock } from "lucide-react";
import SensorCard from "./SensorCard";
import { useEffect, useState } from "react";

interface TimeDisplayProps {
  className?: string;
  animationDelay?: string;
}

const TimeDisplay = ({ 
  className,
  animationDelay = 'animation-delay-400'
}: TimeDisplayProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format time as HH:MM:SS
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(currentTime);
  
  // Format date as Day, Month DD, YYYY
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(currentTime);

  return (
    <SensorCard 
      title="Current Time" 
      icon={<Clock className="h-4 w-4" />}
      className={className}
      animationDelay={animationDelay}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-4xl font-light text-sensor-info">
          {formattedTime}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {formattedDate}
        </span>
      </div>
    </SensorCard>
  );
};

export default TimeDisplay;
