import React from 'react';
import {
  CalendarDays,
  Eye,
  Radio,
  RefreshCw,
  Repeat,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Translations } from '../catalog/i18n';
import { AppLanguage, VisitorStats } from '../types/agri';
import { QrCodeDisplay } from './QrCodeDisplay';

interface VisitorCounterProps {
  t: Translations;
  lang?: AppLanguage;
  stats: VisitorStats | null;
  variant?: 'compact' | 'card';
  isLiveConnected?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const VisitorCounter: React.FC<VisitorCounterProps> = ({
  t,
  lang = 'bn',
  stats,
  variant = 'card',
  isLiveConnected = false,
  isRefreshing = false,
  onRefresh,
}) => {
  const totalVisits = stats?.totalVisits ?? 0;
  const todayVisits = stats?.todayVisits ?? 0;
  const uniqueVisitors = stats?.uniqueVisitors ?? 0;
  const todayUniqueVisitors = stats?.todayUniqueVisitors ?? Math.min(todayVisits, uniqueVisitors);
  const returningVisits = stats?.returningVisits ?? Math.max(0, totalVisits - uniqueVisitors);
  const avgViewsPerVisitor =
    stats?.avgViewsPerVisitor ??
    (uniqueVisitors > 0 ? Math.round((totalVisits / uniqueVisitors) * 10) / 10 : 0);
  const activeNow = stats?.activeNow ?? 1;

  const uniqueSharePct =
    totalVisits > 0 ? Math.min(100, Math.max(0, Math.round((uniqueVisitors / totalVisits) * 100))) : 100;
  const returnSharePct = Math.max(0, 100 - uniqueSharePct);

  const localeCode = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
  const formattedLastVisit = stats?.lastVisitAt
    ? new Date(stats.lastVisitAt).toLocaleTimeString(localeCode, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  if (variant === 'compact') {
    return (
      <div
        title={t.visitors.sectionTitle}
        className="flex items-center gap-2 border-l border-stone-200 pl-3 text-xs text-stone-700"
      >
        <Eye className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
        <span>{t.visitors.totalVisits}:</span>
        <span className="font-mono-tabular font-bold text-stone-900">
          {stats ? totalVisits.toLocaleString() : '—'}
        </span>
        <span aria-hidden="true" className="hidden sm:inline text-stone-300">
          ·
        </span>
        <span className="hidden sm:inline">{t.visitors.uniqueVisitors}:</span>
        <span className="hidden sm:inline font-mono-tabular font-bold text-emerald-900">
          {stats ? uniqueVisitors.toLocaleString() : '—'}
        </span>
        <span aria-hidden="true" className="hidden md:inline text-stone-300">
          ·
        </span>
        <span className="hidden md:inline">{t.visitors.activeNow}:</span>
        <span className="hidden md:inline font-mono-tabular font-bold text-emerald-900">
          {stats ? activeNow.toLocaleString() : '—'}
        </span>
      </div>
    );
  }

  return (
    <section
      aria-label={t.visitors.sectionTitle}
      className="border-t border-stone-200 bg-[#F7F8F5] py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          {/* Left 7 Columns: Real-Time Separated Total Views & Unique Visitors */}
          <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 sm:p-5 lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Users className="h-4 w-4 text-emerald-900 shrink-0" />
                    <span>{t.visitors.sectionTitle}</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                    {t.visitors.sectionSubtitle}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    <Radio
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isLiveConnected ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    />
                    <span className={isLiveConnected ? 'text-emerald-900 font-semibold' : 'text-stone-500'}>
                      {isLiveConnected ? t.visitors.liveRealtimeLabel : t.visitors.offlineCacheLabel}
                    </span>
                  </div>

                  {onRefresh && (
                    <button
                      type="button"
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-50 whitespace-nowrap"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>{t.visitors.refreshCount}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Separated Counters: Total Views vs Unique Visitors */}
              <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-[#F7F8F5] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                      <TrendingUp className="h-4 w-4 text-emerald-900 shrink-0" />
                      <span>{t.visitors.totalVisits}</span>
                    </div>
                    <span className="text-xs text-stone-500">{t.visitors.totalVisitsHint}</span>
                  </div>
                  <div className="mt-2 font-mono-tabular text-3xl font-bold tracking-tight text-stone-950">
                    {stats ? totalVisits.toLocaleString() : '—'}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                    <span>{t.visitors.todayVisits}:</span>
                    <span className="font-mono-tabular font-semibold text-stone-900">
                      {stats ? todayVisits.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                      <UserCheck className="h-4 w-4 text-emerald-900 shrink-0" />
                      <span>{t.visitors.uniqueVisitors}</span>
                    </div>
                    <span className="text-xs text-emerald-900/80">
                      {t.visitors.uniqueVisitorsHint}
                    </span>
                  </div>
                  <div className="mt-2 font-mono-tabular text-3xl font-bold tracking-tight text-emerald-950">
                    {stats ? uniqueVisitors.toLocaleString() : '—'}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-900">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                    <span>{t.visitors.todayUnique}:</span>
                    <span className="font-mono-tabular font-semibold text-emerald-950">
                      {stats ? todayUniqueVisitors.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Real-Time Breakdown: Returning Views, Avg/Visitor, Active Now */}
              <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 leading-snug">
                    <Repeat className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                    <span>{t.visitors.returningVisits}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-bold text-stone-900">
                    {stats ? returningVisits.toLocaleString() : '—'}
                  </div>
                </div>

                <div className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 leading-snug">
                    <Eye className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
                    <span>{t.visitors.avgViewsLabel}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-bold text-stone-900">
                    {stats ? `${avgViewsPerVisitor}×` : '—'}
                  </div>
                </div>

                <div className="col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-900 leading-snug">
                    <Radio className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                    <span>{t.visitors.activeNow}</span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-lg font-bold text-emerald-950">
                    {stats ? activeNow.toLocaleString() : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Unique vs Returning Share Bar + Last Update Timestamp */}
            <div className="mt-5 border-t border-stone-200 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                <div className="flex items-center gap-3">
                  <span>
                    {t.visitors.ratioUniqueLabel}:{' '}
                    <strong className="font-mono-tabular text-emerald-950">{uniqueSharePct}%</strong>
                  </span>
                  <span aria-hidden="true" className="text-stone-300">
                    ·
                  </span>
                  <span>
                    {t.visitors.ratioReturnLabel}:{' '}
                    <strong className="font-mono-tabular text-stone-900">{returnSharePct}%</strong>
                  </span>
                </div>
                <div className="text-stone-500">
                  {t.visitors.lastUpdated}:{' '}
                  <span className="font-mono-tabular text-stone-700">{formattedLastVisit}</span>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-stone-200"
              >
                <div
                  className="bg-emerald-800 transition-all duration-300"
                  style={{ width: `${uniqueSharePct}%` }}
                />
                <div
                  className="bg-stone-400 transition-all duration-300"
                  style={{ width: `${returnSharePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Optimized Fast-Scan QR Code Display */}
          <div className="h-full lg:col-span-5">
            <QrCodeDisplay t={t} variant="card" />
          </div>
        </div>
      </div>
    </section>
  );
};
