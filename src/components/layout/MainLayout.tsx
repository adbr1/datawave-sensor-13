
import { ReactNode } from "react";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const MainLayout = ({ 
  children, 
  title = "DataWave Sensor", 
  className 
}: MainLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header title={title} />
      <main className={cn(
        "container max-w-7xl mx-auto pt-20 pb-10 px-3 md:px-4 lg:px-6", 
        isMobile ? "pt-16" : "pt-24",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
