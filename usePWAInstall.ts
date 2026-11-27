import { useCallback, useEffect, useState } from 'react';
import type { BeforeInstallPromptEvent } from '../main';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window !== 'undefined' ? (window.__deferredInstallPrompt ?? null) : null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [swReady, setSwReady] = useState(() =>
    typeof window !== 'undefined' ? Boolean(window.__pwaSwRegistered) : false
  );

  useEffect(() => {
    const checkStandalone = () => {
      const standaloneMatch =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standaloneMatch);
    };

    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    const androidMatch = /android/.test(userAgent);
    setIsAndroid(androidMatch);
    setIsInAppBrowser(
      /(fban|fbav|fb_iab|instagram|whatsapp|line|micromessenger|imo|\bwv\b)/i.test(userAgent)
    );

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    if (window.__deferredInstallPrompt) {
      setDeferredPrompt(window.__deferredInstallPrompt);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (reg) setSwReady(true);
        })
        .catch(() => {
          // Ignore SW lookup failures
        });
    }

    const syncPromptFromWindow = () => {
      if (window.__deferredInstallPrompt) {
        setDeferredPrompt(window.__deferredInstallPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const bipEvent = e as BeforeInstallPromptEvent;
      window.__deferredInstallPrompt = bipEvent;
      setDeferredPrompt(bipEvent);
    };

    const handleAppInstalled = () => {
      window.__deferredInstallPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setJustInstalled(true);
    };

    const handleSwReady = () => setSwReady(true);

    const displayMedia = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = () => checkStandalone();
    displayMedia.addEventListener?.('change', handleDisplayChange);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('krishi-pwa-prompt-ready', syncPromptFromWindow);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('krishi-pwa-installed', handleAppInstalled);
    window.addEventListener('krishi-pwa-sw-ready', handleSwReady);

    return () => {
      displayMedia.removeEventListener?.('change', handleDisplayChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('krishi-pwa-prompt-ready', syncPromptFromWindow);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('krishi-pwa-installed', handleAppInstalled);
      window.removeEventListener('krishi-pwa-sw-ready', handleSwReady);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = deferredPrompt ?? window.__deferredInstallPrompt ?? null;
    if (!promptEvent) {
      return 'unavailable';
    }
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        window.__deferredInstallPrompt = null;
        setDeferredPrompt(null);
        setIsInstalled(true);
        setJustInstalled(true);
        return 'accepted';
      }
      return 'dismissed';
    } catch {
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const chromeIntentUrl =
    typeof window !== 'undefined' && isAndroid
      ? `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=${window.location.protocol.replace(
          ':',
          ''
        )};package=com.android.chrome;end`
      : null;

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    justInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    isInIframe,
    swReady,
    chromeIntentUrl,
    install,
  };
}
