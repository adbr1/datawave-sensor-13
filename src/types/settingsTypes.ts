
export interface AppSettings {
  developerMode: boolean;
  bluetoothAutoConnect: boolean;
  notificationsEnabled: boolean;
  temperatureUnit: "celsius" | "fahrenheit";
  darkMode: boolean;
  refreshRate: number; // milliseconds
  connectionTimeout: number; // seconds
  language: "fr" | "en";
}

export const DEFAULT_SETTINGS: AppSettings = {
  developerMode: false,
  bluetoothAutoConnect: false,
  notificationsEnabled: true,
  temperatureUnit: "celsius",
  darkMode: false,
  refreshRate: 1000,
  connectionTimeout: 30,
  language: "fr"
};
