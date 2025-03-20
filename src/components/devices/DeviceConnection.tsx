
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  BluetoothSearching 
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
}

const DeviceConnection = ({
  status,
  onConnect,
  onDisconnect,
  isSupported,
  deviceName,
  className,
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
        return "Connected";
      case ConnectionStatus.CONNECTING:
        return "Connecting...";
      case ConnectionStatus.ERROR:
        return "Connection Error";
      default:
        return "Disconnected";
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
            disabled={!isSupported || status === ConnectionStatus.CONNECTING}
            className="animate-fade-in"
            size="sm"
          >
            Connect
          </Button>
        )}

        {status === ConnectionStatus.CONNECTED && (
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="animate-fade-in"
            size="sm"
          >
            Disconnect
          </Button>
        )}

        {!isSupported && (
          <p className="text-xs text-sensor-error animate-fade-in">
            Web Bluetooth is not supported in this browser.
          </p>
        )}
      </div>
    </div>
  );
};

export default DeviceConnection;
