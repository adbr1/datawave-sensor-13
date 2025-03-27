
// Ce code optionnel est utilisé pour enregistrer un service worker.
// register() n'est pas appelé par défaut.

// Cela permet à l'application de charger plus rapidement sur les visites suivantes en production et donne
// des capacités hors ligne. Cependant, cela signifie également que les développeurs (et les utilisateurs)
// ne verront les mises à jour déployées que lors des visites suivantes à une page, après que toutes les
// onglets existants ouverts sur la page ont été fermés, depuis les ressources précédemment
// mises en cache sont mises à jour en arrière-plan.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] est l'adresse IPv6 localhost.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 est considéré comme localhost pour IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config): void {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // Le constructeur d'URL est disponible dans tous les navigateurs qui prennent en charge SW.
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Notre service worker ne fonctionnera pas si PUBLIC_URL est sur une origine différente
      // de celle sur laquelle notre page est servie. Cela peut arriver si un CDN est utilisé pour
      // servir des actifs; voir https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isLocalhost) {
        // Cela s'exécute en développement ou sur localhost. Vérifions si un service worker existe toujours ou non.
        checkValidServiceWorker(swUrl, config);

        // Ajout de quelques informations supplémentaires de journalisation concernant le chargement de l'application.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Cette application Web est d\'abord servie en cache, puis en réseau. ' +
              'Pour en savoir plus: https://cra.link/PWA'
          );
        });
      } else {
        // Ce n'est pas localhost. Enregistrons simplement le service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // À ce stade, l'ancien contenu aura été purgé et
              // le nouveau contenu aura été ajouté au cache.
              console.log(
                'Un nouveau contenu est disponible et sera utilisé lorsque tous ' +
                  'les onglets existants pour cette page sont fermés.'
              );

              // Exécuter le callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // À ce stade, tout a été mis en cache.
              console.log('Le contenu est mis en cache pour une utilisation hors ligne.');

              // Exécuter le callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Erreur pendant l\'enregistrement du service worker:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  // Vérifiez si le service worker peut être trouvé. S'il ne peut pas être rechargé, rechargez la page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // S'assurer que le service worker existe et que nous obtenons réellement un fichier JS.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Aucun service worker trouvé. Probablement une application différente. Rechargez la page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker trouvé. Procédez normalement.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('Aucune connexion Internet trouvée. L\'application s\'exécute en mode hors ligne.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
