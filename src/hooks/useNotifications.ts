
import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from '@/components/ui/use-toast';

const SERVER_VAPID_PUBLIC_KEY = 'BJtus6bWCVMRQ7EFKGpWnqErNMJWRZO6YHJbCEPo7lsC-KCWnkiEOUYXdHSNZTRXDXX7h7Yl0wnJaDtcmBjQtA4'; // Clé pub VAPID factice, à remplacer en production

export function useNotifications() {
  const { settings, updateSettings } = useSettings();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Vérifier si les notifications sont supportées
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Enregistrer ou mettre à jour le statut d'abonnement
  useEffect(() => {
    if (isSupported && permission === 'granted' && settings.notificationsEnabled) {
      subscribeUserToPush();
    }
  }, [isSupported, permission, settings.notificationsEnabled]);

  // Demander l'autorisation des notifications
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        updateSettings({ ...settings, notificationsEnabled: true });
        await subscribeUserToPush();
        return true;
      } else {
        toast({
          title: 'Notifications refusées',
          description: 'Vous ne recevrez pas de notifications push.',
          variant: 'destructive',
        });
        updateSettings({ ...settings, notificationsEnabled: false });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande d\'autorisation de notification:', error);
      return false;
    }
  };

  // S'abonner aux notifications push
  const subscribeUserToPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Vérifier si l'utilisateur est déjà abonné
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return true;
      }
      
      // Créer un nouvel abonnement
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(SERVER_VAPID_PUBLIC_KEY),
      });
      
      setSubscription(newSubscription);
      
      // Ici, dans une application réelle, vous enverriez l'abonnement à votre serveur
      console.log('Abonnement push créé:', JSON.stringify(newSubscription));
      
      return true;
    } catch (error) {
      console.error('Impossible de s\'abonner aux notifications push:', error);
      return false;
    }
  };

  // Se désabonner des notifications push
  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        updateSettings({ ...settings, notificationsEnabled: false });
        
        // Ici, vous informeriez votre serveur de la désinscription
        console.log('Désinscription des notifications push réussie');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la désinscription des notifications push:', error);
      return false;
    }
  };

  // Fonction pour envoyer une notification test locale
  const sendTestNotification = () => {
    if (permission !== 'granted') {
      toast({
        title: 'Permission requise',
        description: 'Vous devez d\'abord autoriser les notifications.',
        variant: 'destructive',
      });
      return;
    }

    const options = {
      body: 'Ceci est une notification de test de DataWave Sensor.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
    };

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Test de Notification', options);
    });
  };

  // Utilitaire pour convertir la clé VAPID au format approprié
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    unsubscribeFromPush,
    sendTestNotification
  };
}
