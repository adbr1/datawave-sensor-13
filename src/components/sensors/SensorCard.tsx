
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SensorCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  withAnimation?: boolean;
  animationDelay?: string;
}

const SensorCard = ({ 
  title, 
  children, 
  icon, 
  className, 
  withAnimation = true,
  animationDelay = 'animation-delay-0' 
}: SensorCardProps) => {
  return (
    <div 
      className={cn(
        "sensor-card flex flex-col",
        withAnimation && "animate-fade-in",
        animationDelay,
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
};

export default SensorCard;
