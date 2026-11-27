import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, Maximize2, QrCode, Share2, X } from 'lucide-react';
import { Translations } from '../catalog/i18n';

interface QrCodeDisplayProps {
  t: Translations;
  variant?: 'card' | 'compact';
}

const QUIET_ZONE_MODULES = 4;

interface QrSvgMatrixProps {
  value: string;
  sizePx: number;
  label: string;
}

const QrSvgMatrix: React.FC<QrSvgMatrixProps> = ({ value, sizePx, label }) => {
  const { viewBoxSize, pathData } = useMemo(() => {
    try {
      // ECC 'M' balances strong error recovery with fewer modules (larger squares = faster camera lock)
      const qr = QRCode.create(value || 'https://example.com', {
        errorCorrectionLevel: 'M',
      });
      const count = qr.modules.size;
      const total = count + QUIET_ZONE_MODULES * 2;
      const segments: string[] = [];

      for (let r = 0; r < count; r += 1) {
        let runStart = -1;
        for (let c = 0; c <= count; c += 1) {
          const isDark = c < count && Boolean(qr.modules.get(r, c));
          if (isDark && runStart === -1) {
            runStart = c;
          } else if (!isDark && runStart !== -1) {
            const x = runStart + QUIET_ZONE_MODULES;
            const y = r + QUIET_ZONE_MODULES;
            const w = c - runStart;
            segments.push(`M${x} ${y}h${w}v1h-${w}z`);
            runStart = -1;
          }
        }
      }

      return {
        viewBoxSize: total,
        pathData: segments.join(''),
      };
    } catch {
      return { viewBoxSize: 29, pathData: '' };
    }
  }, [value]);

  return (
    <div
      className="inline-flex max-w-full items-center justify-center rounded-xl border border-stone-200 bg-white p-2 shadow-xs"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <svg
        role="img"
        aria-label={label}
        width={sizePx}
        height={sizePx}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        shapeRendering="crispEdges"
        className="block h-auto max-w-full select-none"
      >
        <rect x="0" y="0" width={viewBoxSize} height={viewBoxSize} fill="#FFFFFF" />
        <path d={pathData} fill="#000000" />
      </svg>
    </div>
  );
};

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ t, variant = 'card' }) => {
  const [linkMode, setLinkMode] = useState<'direct' | 'install'>('direct');
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const targetUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://krishi-mitra.app/';
    const cleanBase = `${window.location.origin}${window.location.pathname}`;
    if (linkMode === 'install') {
      const url = new URL(cleanBase);
      url.searchParams.set('install', '1');
      return url.toString();
    }
    return cleanBase;
  }, [linkMode]);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t.brandName,
          text: t.pwaInstall.bannerTitle,
          url: targetUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    await handleCopy();
  };

  const handleDownloadPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(targetUrl, {
        width: 1024,
        margin: QUIET_ZONE_MODULES,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `krishi-mitra-qr-${linkMode}.png`;
      link.click();
    } catch {
      // Ignore export error
    }
  };

  return (
    <>
      <div
        className={
          variant === 'card'
            ? 'flex h-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 sm:p-5'
            : 'rounded-xl border border-emerald-200 bg-white p-4'
        }
      >
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                <QrCode className="h-4 w-4 text-emerald-900 shrink-0" />
                <span>{t.qr.sectionTitle}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-stone-600">{t.qr.sectionSubtitle}</p>
            </div>
          </div>

          {/* Link Mode Selector (Shortest URL = larger modules for fastest lock) */}
          <div className="mt-3 inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setLinkMode('direct')}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                linkMode === 'direct'
                  ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.qr.shortLinkMode}
            </button>
            <button
              type="button"
              onClick={() => setLinkMode('install')}
              className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                linkMode === 'install'
                  ? 'bg-white text-emerald-950 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.qr.installLinkMode}
            </button>
          </div>
        </div>

        {/* High-Contrast Unobstructed QR Plate */}
        <div className="mt-4 flex flex-col items-center rounded-xl border border-stone-200 bg-[#F7F8F5] px-4 py-5">
          <QrSvgMatrix
            value={targetUrl}
            sizePx={variant === 'card' ? 220 : 192}
            label={`${t.brandName} QR Code`}
          />
          <p className="mt-3 text-center text-xs sm:text-sm font-medium text-stone-800">{t.qr.scanHint}</p>
          <p className="mt-1 text-center text-xs text-stone-600">{t.qr.fastScanBadge}</p>
          <p className="mt-1 max-w-full truncate font-mono-tabular text-xs text-stone-500">
            {targetUrl}
          </p>
        </div>

        {/* Functional QR Actions */}
        <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 text-center"
          >
            <Maximize2 className="h-3.5 w-3.5 shrink-0" />
            <span>{t.qr.zoomBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 text-center"
          >
            <Download className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
            <span>{t.qr.downloadPngBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 text-center"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                <span>{t.qr.copiedMsg}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                <span>{t.qr.copyUrlBtn}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-50 text-center"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
            <span>{t.qr.shareBtn}</span>
          </button>
        </div>
      </div>

      {/* High-Contrast Fullscreen QR Modal */}
      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-fullscreen-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setZoomOpen(false);
            }
          }}
        >
          <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 text-center shadow-2xl">
            <div className="flex items-start justify-between gap-3 text-left">
              <div>
                <h3 id="qr-fullscreen-title" className="text-base font-bold text-stone-900">
                  {t.qr.fullscreenTitle}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">{t.qr.fullscreenHint}</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                aria-label={t.qr.closeBtn}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex justify-center">
              <QrSvgMatrix value={targetUrl} sizePx={300} label={`${t.brandName} Large QR Code`} />
            </div>

            <p className="mt-3 truncate font-mono-tabular text-xs text-stone-500">{targetUrl}</p>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>{t.qr.downloadPngBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                {t.qr.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
