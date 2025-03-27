
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for push notifications
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Erreur pendant l\'enregistrement du service worker:', error);
    }
  }
};

// Initialize the application
const initialize = async () => {
  await registerServiceWorker();
  
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

initialize();
