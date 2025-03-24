
export interface AppSettings {
  developerMode: boolean;
  bluetoothAutoConnect: boolean;
  notificationsEnabled: boolean;
  temperatureUnit: "celsius" | "fahrenheit";
  darkMode: boolean;
  refreshRate: number; // milliseconds
  connectionTimeout: number; // seconds
  language: "fr" | "en";
  // Nouveaux paramètres pour les alertes et automatisations
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
  darkMode: false,
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
    temperatureTriggered: false,
    temperatureThreshold: 28,
    turbidityTriggered: false,
    turbidityThreshold: 7
  }
};
