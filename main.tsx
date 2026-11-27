import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { AppErrorBoundary } from './components/ErrorBoundary';
import './index.css';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __pwaSwRegistered?: boolean;
    __krishiMounted?: boolean;
  }
}

// Capture beforeinstallprompt immediately before React mounts so early events are never lost
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.__deferredInstallPrompt = event as BeforeInstallPromptEvent;
  window.dispatchEvent(new CustomEvent('krishi-pwa-prompt-ready'));
});

window.addEventListener('appinstalled', () => {
  window.__deferredInstallPrompt = null;
  window.dispatchEvent(new CustomEvent('krishi-pwa-installed'));
});

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol !== 'file:') {
  try {
    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          window.__pwaSwRegistered = true;
          window.dispatchEvent(new CustomEvent('krishi-pwa-sw-ready'));
        }
      },
    });
  } catch {
    // Ignore restricted WebView serviceWorker errors
  }
}

window.__krishiMounted = true;
createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
