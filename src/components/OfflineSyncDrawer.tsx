import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Translations } from '../catalog/i18n';
import {
  clearAudioCache,
  clearWeatherCache,
  exportOfflineBackupJson,
  formatStorageBytes,
  getOfflineStorageHealth,
  importOfflineBackupJson,
} from '../lib/offlineArchitecture';
import { OfflineDbStats, OfflinePendingScan, OfflineStorageHealth } from '../types/agri';
import { PWAInstallButton } from './PWAInstallButton';

interface OfflineSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  t: Translations;
  stats: OfflineDbStats;
  pendingScans: OfflinePendingScan[];
  isOnline: boolean;
  isSyncing: boolean;
  onSyncNow: (processScans?: boolean) => Promise<void>;
  onDataMutated: () => Promise<void>;
}

export const OfflineSyncDrawer: React.FC<OfflineSyncDrawerProps> = ({
  open,
  onClose,
  t,
  stats,
  pendingScans,
  isOnline,
  isSyncing,
  onSyncNow,
  onDataMutated,
}) => {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [storageHealth, setStorageHealth] = useState<OfflineStorageHealth | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFeedbackMsg(null);
    setErrorMsg(null);
    getOfflineStorageHealth()
      .then((h) => setStorageHealth(h))
      .catch(() => {});

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, stats, onClose]);

  if (!open) return null;

  const handleExport = async () => {
    const json = await exportOfflineBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishi-mitra-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFeedbackMsg(null);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await importOfflineBackupJson(String(reader.result));
        await onDataMutated();
        setFeedbackMsg(t.offlineDrawer.importSuccessMsg);
      } catch {
        setErrorMsg(t.offlineDrawer.importErrorMsg);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAudio = async () => {
    await clearAudioCache();
    await onDataMutated();
    setErrorMsg(null);
    setFeedbackMsg(t.offlineDrawer.clearAudioDoneMsg);
  };

  const handleClearWeather = async () => {
    await clearWeatherCache();
    await onDataMutated();
    setErrorMsg(null);
    setFeedbackMsg(t.offlineDrawer.clearWeatherDoneMsg);
  };

  const statRows: { label: string; value: string | number }[] = [
    { label: t.offlineDrawer.tipsCount, value: stats.cropTipsCount },
    { label: t.offlineDrawer.marketCount, value: stats.marketPricesCount },
    { label: t.offlineDrawer.diagnosesCount, value: stats.diagnosesCount },
    { label: t.offlineDrawer.pendingScansCount, value: stats.pendingScansCount },
    { label: t.offlineDrawer.pendingPricesCount, value: stats.pendingPricesCount },
    { label: t.offlineDrawer.audioCached, value: stats.audioCachedCount },
    {
      label: t.offlineDrawer.weatherCached,
      value: stats.hasWeatherCache ? t.offlineDrawer.yes : t.offlineDrawer.no,
    },
  ];

  const syncTimeDisplay = stats.lastSyncAt
    ? new Date(stats.lastSyncAt).toLocaleString()
    : t.offlineDrawer.neverSynced;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.offlineDrawer.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/50 backdrop-blur-xs"
    >
      <div className="flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col justify-between bg-white p-4 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <Database className="h-5 w-5 text-emerald-900 shrink-0" />
              <h3 className="text-lg font-bold text-stone-900">{t.offlineDrawer.title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.offlineDrawer.close}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-stone-600">{t.offlineDrawer.subtitle}</p>

          {/* 1. Storage Overview & Quota */}
          <section className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-700">
              <HardDrive className="h-4 w-4 text-emerald-900" />
              {t.offlineDrawer.storageOverviewTitle}
            </h4>

            {storageHealth && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>{t.offlineDrawer.storageUsedLabel}</span>
                  <span className="font-mono-tabular font-semibold text-stone-900">
                    {formatStorageBytes(storageHealth.usedBytes)}
                    {storageHealth.quotaBytes ? ` / ${formatStorageBytes(storageHealth.quotaBytes)}` : ''}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-emerald-800 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(4, storageHealth.usagePercent ?? 8))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <dl className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
              {statRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-stone-600">{row.label}</dt>
                  <dd className="font-mono-tabular font-semibold text-stone-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-2.5 text-xs text-stone-500">
              <span>{t.offlineDrawer.lastSyncLabel}</span>
              <span className="font-mono-tabular">{syncTimeDisplay}</span>
            </div>
          </section>

          {/* 2. Quick Sync & Offline Queue */}
          <section className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-700">
              {t.offlineDrawer.syncAndQueueTitle}
            </h4>
            <button
              type="button"
              onClick={() => onSyncNow(true)}
              disabled={!isOnline || isSyncing}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing
                ? t.status.syncing
                : pendingScans.length > 0
                ? `${t.offlineDrawer.processQueueBtn} (${pendingScans.length})`
                : t.status.syncNow}
            </button>
          </section>

          {/* 3. Backup, Restore & Cleanup */}
          <section className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-700">
              {t.offlineDrawer.dataBackupTitle}
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Download className="h-4 w-4 text-emerald-900 shrink-0" />
                <span>{t.offlineDrawer.exportJson}</span>
              </button>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Upload className="h-4 w-4 text-emerald-900 shrink-0" />
                <span>{t.offlineDrawer.importJsonBtn}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleClearAudio}
                disabled={stats.audioCachedCount === 0}
                className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-45"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.offlineDrawer.clearAudioBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleClearWeather}
                disabled={!stats.hasWeatherCache}
                className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-45"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.offlineDrawer.clearWeatherBtn}</span>
              </button>
            </div>

            {feedbackMsg && (
              <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </p>
            )}
            {errorMsg && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                {errorMsg}
              </p>
            )}
          </section>

          <PWAInstallButton t={t} variant="drawer" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-[44px] w-full rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {t.offlineDrawer.close}
        </button>
      </div>
    </div>
  );
};
