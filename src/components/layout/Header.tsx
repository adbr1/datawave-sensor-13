
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  className?: string;
}

const Header = ({ title, className }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent",
        className
      )}
    >
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center"
        >
          <span className="text-xl font-semibold tracking-tight">
            {title}
          </span>
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            to="/connect" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Connect
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
