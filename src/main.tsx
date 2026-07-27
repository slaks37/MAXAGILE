import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import {LanguageProvider} from './i18n/LanguageContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // New version available
                if (registration.active) {
                  console.log('New version available. Refresh to update.');
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

// Detect online/offline status and show indicator
window.addEventListener('online', () => {
  document.body.classList.remove('is-offline');
  // Try to sync pending changes
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      if ('sync' in registration) {
        (registration as any).sync.register('sync-changes');
      }
    });
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('is-offline');
});

// Set initial status
if (!navigator.onLine) {
  document.body.classList.add('is-offline');
}
