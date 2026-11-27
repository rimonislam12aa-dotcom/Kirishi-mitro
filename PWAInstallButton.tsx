import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Laptop,
  Share,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import { Translations } from '../catalog/i18n';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { QrCodeDisplay } from './QrCodeDisplay';

const APP_ICON_SVG =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='none'%3E%3Crect width='512' height='512' rx='112' fill='%2314532D'/%3E%3Ccircle cx='348' cy='158' r='56' fill='%23FACC15'/%3E%3Cpath d='M138 358C138 228 228 148 358 148C358 278 278 358 148 358H138Z' fill='%234ADE80'/%3E%3Cpath d='M138 358C194 302 254 242 332 174' stroke='%2314532D' stroke-width='20' stroke-linecap='round'/%3E%3C/svg%3E";

interface PWAInstallButtonProps {
  t: Translations;
  variant?: 'toolbar' | 'drawer' | 'banner' | 'hero';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  t,
  variant = 'toolbar',
}) => {
  const {
    isInstallable,
    isInstalled,
    justInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    isInIframe,
    swReady,
    chromeIntentUrl,
    install,
  } = usePWAInstall();

  const [showGuideModal, setShowGuideModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-open install sheet when farmer arrives from iframe via ?install=1
  useEffect(() => {
    if (variant !== 'toolbar' || isInstalled || isInIframe || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('install') === '1') {
      setShowGuideModal(true);
      url.searchParams.delete('install');
      window.history.replaceState({}, '', url.toString());
    }
  }, [variant, isInstalled, isInIframe]);

  useEffect(() => {
    if (!showGuideModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowGuideModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuideModal]);

  if (justInstalled) {
    if (variant === 'banner') {
      return (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2.5">
          <div className="mx-auto flex max-w-7xl items-center gap-2 text-xs font-semibold text-emerald-900 sm:px-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
            <span>{t.pwaInstall.installedLabel}</span>
          </div>
        </div>
      );
    }

    if (variant === 'hero') {
      return (
        <div className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-900/60 px-5 py-2.5 text-sm font-semibold text-emerald-100 whitespace-nowrap shrink-0">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{t.pwaInstall.installedLabel}</span>
        </div>
      );
    }

    return (
      <div
        role="status"
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900 whitespace-nowrap shrink-0"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
        <span>{t.pwaInstall.installedLabel}</span>
      </div>
    );
  }

  // Automatically suppress install UI when running inside an installed standalone app
  if (isInstalled) {
    return null;
  }

  if (variant === 'banner' && bannerDismissed) {
    return null;
  }

  const buildInstallUrl = (): string => {
    if (typeof window === 'undefined') return '/';
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('install', '1');
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const standaloneUrl = buildInstallUrl();
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '/';

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setShowGuideModal(false);
        return;
      }
      if (outcome === 'dismissed') {
        return;
      }
    }
    setShowGuideModal(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback selection if clipboard permission is blocked
    }
  };

  const handleShareToPhone = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t.brandName,
          text: t.pwaInstall.bannerTitle,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or share unsupported in iframe -> copy fallback
      }
    }
    await handleCopyUrl();
  };

  return (
    <>
      {variant === 'hero' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-950/70 px-5 py-2.5 text-sm font-semibold text-emerald-100 backdrop-blur-xs transition-colors hover:bg-emerald-900/90 whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>{isInstallable ? t.pwaInstall.buttonDirectLabel : t.pwaInstall.buttonLabel}</span>
        </button>
      )}

      {variant === 'toolbar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 whitespace-nowrap shrink-0"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>{isInstallable ? t.pwaInstall.buttonDirectLabel : t.pwaInstall.buttonLabel}</span>
        </button>
      )}

      {variant === 'drawer' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-emerald-800 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-100"
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span>{isInstallable ? t.pwaInstall.directInstallNow : t.pwaInstall.buttonLabel}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="border-b border-emerald-200 bg-emerald-50/90">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={APP_ICON_SVG}
                alt={t.brandName}
                className="h-9 w-9 rounded-lg border border-emerald-200 bg-white object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-snug">
                  {t.pwaInstall.bannerTitle}
                </p>
                <p className="text-xs text-emerald-800 leading-snug">
                  {t.pwaInstall.bannerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isInstallable ? t.pwaInstall.directInstallNow : t.pwaInstall.buttonLabel}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label={t.pwaInstall.closeBtn}
                className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-emerald-900 hover:bg-emerald-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGuideModal(false);
            }
          }}
        >
          <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-stone-200 bg-white p-4 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={APP_ICON_SVG}
                  alt={t.brandName}
                  className="h-10 w-10 rounded-lg border border-stone-200 object-cover shrink-0"
                />
                <div>
                  <h3 id="pwa-install-modal-title" className="text-base font-bold text-stone-900">
                    {t.pwaInstall.modalTitle}
                  </h3>
                  {swReady && (
                    <p className="mt-0.5 text-xs font-medium text-emerald-800">
                      {t.pwaInstall.offlineReadyNote}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label={t.pwaInstall.closeBtn}
                className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-stone-700">
              {t.pwaInstall.modalSubtitle}
            </p>

            {isInstallable && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-800"
                >
                  <Download className="h-4 w-4" />
                  <span>{t.pwaInstall.directInstallNow}</span>
                </button>
              </div>
            )}

            {isInIframe && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-xs leading-relaxed text-amber-950">
                  {t.pwaInstall.iframeNotice}
                </p>
                <a
                  href={standaloneUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>{t.pwaInstall.openStandaloneTab}</span>
                </a>
              </div>
            )}

            {isInAppBrowser && chromeIntentUrl && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-xs leading-relaxed text-amber-950">
                  {t.pwaInstall.inAppBrowserNotice}
                </p>
                <a
                  href={chromeIntentUrl}
                  className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>{t.pwaInstall.openInChromeBtn}</span>
                </a>
              </div>
            )}

            {/* Direct Link Share, Fast-Scan QR & Copy for Mobile Installation */}
            <div className="mt-4 space-y-3">
              <QrCodeDisplay t={t} variant="compact" />

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                <p className="text-xs font-bold text-emerald-950">{t.pwaInstall.phoneShareTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                  {t.pwaInstall.phoneShareDesc}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-800 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-50"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                        <span>{t.pwaInstall.copiedMsg}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                        <span>{t.pwaInstall.copyLinkBtn}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleShareToPhone}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <Share2 className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.pwaInstall.shareLinkBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div
                className={`rounded-lg border p-3.5 ${
                  isAndroid
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Smartphone className="h-4 w-4 text-emerald-900 shrink-0" />
                  <span>{t.pwaInstall.androidTitle}</span>
                </div>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-relaxed text-stone-700">
                  {t.pwaInstall.androidSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div
                className={`rounded-lg border p-3.5 ${
                  isIOS
                    ? 'border-emerald-300 bg-emerald-50/70'
                    : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Share className="h-4 w-4 text-emerald-900 shrink-0" />
                  <span>{t.pwaInstall.iosTitle}</span>
                </div>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-relaxed text-stone-700">
                  {t.pwaInstall.iosSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Laptop className="h-4 w-4 text-emerald-900 shrink-0" />
                  <span>{t.pwaInstall.desktopTitle}</span>
                </div>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-xs leading-relaxed text-stone-700">
                  {t.pwaInstall.desktopSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              {t.pwaInstall.closeBtn}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
