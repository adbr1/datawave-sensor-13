
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Settings, Menu, X, BellRing } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";

interface HeaderProps {
  title: string;
  className?: string;
}

const Header = ({
  title,
  className
}: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    isSupported,
    permission,
    requestPermission
  } = useNotifications();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleRequestNotifications = async () => {
    if (isSupported && permission !== 'granted') {
      await requestPermission();
    }
  };

  return <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent", className)}>
      <div className="container max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center z-20">
          <span className={cn("font-semibold tracking-tight transition-all", isMobile ? "text-lg" : "text-xl")}>
            {title}
          </span>
        </Link>
        
        {isMobile ? <>
            <button onClick={toggleMobileMenu} className="z-20 p-2" aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {mobileMenuOpen && <div className="fixed inset-0 bg-white/95 z-10 flex flex-col items-center justify-center">
                <nav className="flex flex-col items-center space-y-8">
                  <Link to="/" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/connect" className="text-lg font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Connect
                  </Link>
                  <Link to="/settings" className="text-lg font-medium hover:text-primary transition-colors flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <Settings className="h-5 w-5 mr-2" />
                    Paramètres
                  </Link>
                  
                  {isSupported && permission !== 'granted' && !settings.notificationsEnabled && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        handleRequestNotifications();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <BellRing className="h-4 w-4" />
                      Activer les notifications
                    </Button>
                  )}
                </nav>
              </div>}
          </> : <nav className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/connect" className="text-sm font-medium hover:text-primary transition-colors">
              Connect
            </Link>
            <Link to="/settings" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
              <Settings className="h-4 w-4 mr-1" />
              Paramètres
            </Link>
            
            {isSupported && permission !== 'granted' && !settings.notificationsEnabled && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleRequestNotifications}
              >
                <BellRing className="h-4 w-4" />
                Activer les notifications
              </Button>
            )}
          </nav>}
      </div>
    </header>;
};

export default Header;
