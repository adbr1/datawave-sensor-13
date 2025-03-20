
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  BluetoothSearching,
  RefreshCw
} from "lucide-react";
import { ConnectionStatus } from "@/types/sensorTypes";
import { cn } from "@/lib/utils";

interface DeviceConnectionProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  isSupported: boolean;
  deviceName?: string | null;
  className?: string;
  isConnecting?: boolean;
}

const DeviceConnection = ({
  status,
  onConnect,
  onDisconnect,
  isSupported,
  deviceName,
  className,
  isConnecting = false,
}: DeviceConnectionProps) => {
  // Helper to get status icon
  const getStatusIcon = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return <BluetoothConnected className="h-5 w-5 text-sensor-success" />;
      case ConnectionStatus.CONNECTING:
        return <BluetoothSearching className="h-5 w-5 text-sensor-info animate-pulse" />;
      case ConnectionStatus.ERROR:
        return <BluetoothOff className="h-5 w-5 text-sensor-error" />;
      default:
        return <Bluetooth className="h-5 w-5" />;
    }
  };

  // Helper to get status label
  const getStatusLabel = () => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "Connecté";
      case ConnectionStatus.CONNECTING:
        return "Connexion...";
      case ConnectionStatus.ERROR:
        return "Erreur de connexion";
      default:
        return "Déconnecté";
    }
  };

  // Helper to get badge variant based on status
  const getBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "default";
      case ConnectionStatus.CONNECTING:
        return "secondary";
      case ConnectionStatus.ERROR:
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <Badge variant={getBadgeVariant()} className="animate-fade-in">
          {getStatusLabel()}
        </Badge>
        {deviceName && status === ConnectionStatus.CONNECTED && (
          <span className="text-sm text-muted-foreground animate-fade-in">
            ({deviceName})
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        {status !== ConnectionStatus.CONNECTED && (
          <Button
            onClick={onConnect}
            disabled={!isSupported || isConnecting || status === ConnectionStatus.CONNECTING}
            className="animate-fade-in"
            size="sm"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Connexion...
              </>
            ) : (
              "Connecter"
            )}
          </Button>
        )}

        {status === ConnectionStatus.CONNECTED && (
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="animate-fade-in"
            size="sm"
          >
            Déconnecter
          </Button>
        )}

        {!isSupported && (
          <p className="text-xs text-sensor-error animate-fade-in">
            Le Web Bluetooth n'est pas supporté par ce navigateur.
          </p>
        )}
      </div>
    </div>
  );
};

export default DeviceConnection;
