
export interface AppSettings {
  developerMode: boolean;
  bluetoothAutoConnect: boolean;
  notificationsEnabled: boolean;
  temperatureUnit: "celsius" | "fahrenheit";
  refreshRate: number; // milliseconds
  connectionTimeout: number; // seconds
  language: "fr" | "en";
  // Paramètres pour les alertes et automatisations
  temperatureAlerts: {
    enabled: boolean;
    minThreshold: number;
    maxThreshold: number;
  };
  turbidityAlerts: {
    enabled: boolean;
    threshold: number;
  };
  lampAutomation: {
    enabled: boolean;
    // Nouvelle configuration basée sur l'horaire
    scheduleMode: boolean;
    scheduleOn: string; // Format "HH:MM"
    scheduleOff: string; // Format "HH:MM"
    // Anciens paramètres (conservés pour compatibilité)
    temperatureTriggered: boolean;
    temperatureThreshold: number;
    turbidityTriggered: boolean;
    turbidityThreshold: number;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  developerMode: false,
  bluetoothAutoConnect: false,
  notificationsEnabled: true,
  temperatureUnit: "celsius",
  refreshRate: 1000,
  connectionTimeout: 30,
  language: "fr",
  // Valeurs par défaut pour les alertes et automatisations
  temperatureAlerts: {
    enabled: false,
    minThreshold: 15,
    maxThreshold: 30
  },
  turbidityAlerts: {
    enabled: false,
    threshold: 5
  },
  lampAutomation: {
    enabled: false,
    // Valeurs par défaut pour l'horaire
    scheduleMode: true,
    scheduleOn: "08:00",
    scheduleOff: "20:00",
    // Anciens paramètres
    temperatureTriggered: false,
    temperatureThreshold: 28,
    turbidityTriggered: false,
    turbidityThreshold: 7
  }
};
