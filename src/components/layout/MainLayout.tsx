
import { ReactNode } from "react";
import Header from "./Header";
import { cn } from "@/lib/utils";

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header title={title} />
      <main className={cn("container max-w-7xl pt-24 pb-10 px-4 mx-auto", className)}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
