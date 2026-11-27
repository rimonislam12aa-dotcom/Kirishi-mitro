import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Volume2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Translations } from '../catalog/i18n';
import {
  getMarketPrices,
  initializeOfflineDatabase,
  MarketSyncMeta,
  mergeServerMarketPrices,
  saveMarketSyncMeta,
  saveMarketPrice,
} from '../lib/offlineDb';
import { AppLanguage, MarketPrice } from '../types/agri';

interface MarketPricesSectionProps {
  t: Translations;
  lang: AppLanguage;
  isOnline: boolean;
  districtName?: string;
  prices: MarketPrice[];
  syncMeta: MarketSyncMeta;
  onPricesChange: (next: MarketPrice[]) => void;
  onSyncMetaChange: (meta: MarketSyncMeta) => void;
}

export const MarketPricesSection: React.FC<MarketPricesSectionProps> = ({
  t,
  lang,
  isOnline,
  districtName = 'Dhaka',
  prices,
  syncMeta,
  onPricesChange,
  onSyncMetaChange,
}) => {
  const { playTrack } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'grain' | 'vegetable' | 'spice' | 'fruit'>('all');
  const [showReportForm, setShowReportForm] = useState(false);

  const [editingEntry, setEditingEntry] = useState<MarketPrice | null>(null);
  const [cropNameInput, setCropNameInput] = useState('');
  const [marketNameInput, setMarketNameInput] = useState('');
  const [priceKgInput, setPriceKgInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState<'BDT' | 'INR'>('BDT');
  const [trendInput, setTrendInput] = useState<'up' | 'down' | 'stable' | 'auto'>('auto');
  const [categoryInput, setCategoryInput] = useState<'grain' | 'vegetable' | 'spice' | 'fruit'>('vegetable');
  const [isSaving, setIsSaving] = useState(false);

  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getCropLabel = (item: MarketPrice) => {
    if (lang === 'bn') return item.cropNameBn;
    if (lang === 'hi') return item.cropNameHi;
    return item.cropNameEn;
  };

  const formatMoney = (amount: number, currency: 'BDT' | 'INR') => {
    const symbol = currency === 'INR' ? '₹' : '৳';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const locale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-US';
    return d.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredPrices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return prices.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.cropNameBn.toLowerCase().includes(q) ||
        p.cropNameHi.toLowerCase().includes(q) ||
        p.cropNameEn.toLowerCase().includes(q) ||
        p.marketName.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    });
  }, [prices, searchQuery, categoryFilter]);

  const handleListenMarket = () => {
    const topItems = filteredPrices.slice(0, 6);
    if (topItems.length === 0) return;

    const lines = topItems.map((item) => {
      const name = getCropLabel(item);
      const curr =
        item.currency === 'INR'
          ? lang === 'bn'
            ? 'রুপি'
            : lang === 'hi'
            ? 'रुपये'
            : 'rupees'
          : lang === 'bn'
          ? 'টাকা'
          : lang === 'hi'
          ? 'टका'
          : 'taka';
      if (lang === 'bn') {
        return `${item.marketName}-এ ${name} প্রতি কেজি ${item.pricePerKg} ${curr} এবং প্রতি মণ ${item.pricePerMaund} ${curr}।`;
      }
      if (lang === 'hi') {
        return `${item.marketName} में ${name} ${item.pricePerKg} ${curr} प्रति किलो और ${item.pricePerMaund} ${curr} प्रति मन है।`;
      }
      return `${name} at ${item.marketName} is ${item.pricePerKg} ${curr} per kg.`;
    });

    playTrack({
      id: `market-summary-${lang}`,
      title: t.market.sectionTitle,
      subtitle: `${topItems.length} crops`,
      text: lines.join(' '),
      language: lang,
    });
  };

  const handleRefreshLivePrices = async () => {
    if (!isOnline) {
      setStatusNotice({ type: 'error', text: t.market.refreshErrorMsg });
      return;
    }

    setIsRefreshingLive(true);
    setStatusNotice(null);
    try {
      const res = await fetch('/api/market-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          action: 'refresh',
          district: districtName,
          language: lang,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;
      if (res.status === 404 || res.status === 405 || !contentType.includes('application/json')) {
        await initializeOfflineDatabase();
        const localPrices = await getMarketPrices();
        onPricesChange(localPrices);
        const nextMeta: MarketSyncMeta = {
          lastSyncAt: new Date().toISOString(),
          sources: syncMeta.sources,
        };
        await saveMarketSyncMeta(nextMeta);
        onSyncMetaChange(nextMeta);
        setStatusNotice({
          type: 'success',
          text:
            lang === 'bn'
              ? 'স্থানীয় বাজারদর ডাটাবেজ হালনাগাদ হয়েছে। আপনি চাইলে নিচের বোতাম থেকে নিজ এলাকার নতুন দরও যোগ করতে পারেন।'
              : lang === 'hi'
              ? 'स्थानीय मंडी भाव डेटाबेस अपडेट हो गया है। आप नीचे दिए बटन से अपने क्षेत्र का नया भाव भी जोड़ सकते हैं।'
              : 'Refreshed local market database cleanly. You can also submit updated local mandi rates anytime.',
        });
        return;
      }

      if (!res.ok || !data || !Array.isArray(data.updates)) {
        throw new Error(data?.error || t.market.refreshErrorMsg);
      }

      const merged = await mergeServerMarketPrices(data.updates);
      onPricesChange(merged);

      const nextMeta: MarketSyncMeta = {
        lastSyncAt: data.lastAutoRefreshAt || new Date().toISOString(),
        sources: Array.isArray(data.sources) ? data.sources : [],
      };
      await saveMarketSyncMeta(nextMeta);
      onSyncMetaChange(nextMeta);
      setStatusNotice({ type: 'success', text: t.market.refreshSuccessMsg });
    } catch (err: unknown) {
      setStatusNotice({
        type: 'error',
        text: err instanceof Error && err.message ? err.message : t.market.refreshErrorMsg,
      });
    } finally {
      setIsRefreshingLive(false);
    }
  };

  const openNewForm = () => {
    setEditingEntry(null);
    setCropNameInput('');
    setMarketNameInput('');
    setPriceKgInput('');
    setCurrencyInput('BDT');
    setTrendInput('auto');
    setCategoryInput('vegetable');
    setShowReportForm(true);
    setStatusNotice(null);
  };

  const openEditRowForm = (item: MarketPrice) => {
    setEditingEntry(item);
    setCropNameInput(getCropLabel(item));
    setMarketNameInput(item.marketName);
    setPriceKgInput(String(item.pricePerKg));
    setCurrencyInput(item.currency);
    setTrendInput('auto');
    setCategoryInput(item.category);
    setShowReportForm(true);
    setStatusNotice(null);
  };

  const handleSubmitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(priceKgInput);
    if (!cropNameInput.trim() || !marketNameInput.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }
    setIsSaving(true);
    setStatusNotice(null);

    const roundedPrice = Math.round(numericPrice * 10) / 10;
    const priorPrice = editingEntry ? editingEntry.pricePerKg : roundedPrice;
    const autoTrend: 'up' | 'down' | 'stable' =
      trendInput !== 'auto'
        ? trendInput
        : roundedPrice > priorPrice
        ? 'up'
        : roundedPrice < priorPrice
        ? 'down'
        : 'stable';

    const newEntry: MarketPrice = {
      id: editingEntry?.id ?? `mkt_${Date.now()}`,
      cropId: editingEntry?.cropId ?? cropNameInput.trim().toLowerCase().replace(/\s+/g, '-'),
      category: categoryInput,
      cropNameBn: editingEntry && lang !== 'bn' ? editingEntry.cropNameBn : cropNameInput.trim(),
      cropNameHi: editingEntry && lang !== 'hi' ? editingEntry.cropNameHi : cropNameInput.trim(),
      cropNameEn: editingEntry && lang !== 'en' ? editingEntry.cropNameEn : cropNameInput.trim(),
      marketName: marketNameInput.trim(),
      district: editingEntry?.district ?? districtName,
      pricePerKg: roundedPrice,
      pricePerMaund: Math.round(roundedPrice * 40),
      previousPricePerKg: priorPrice,
      trend: autoTrend,
      currency: currencyInput,
      updatedAt: new Date().toISOString(),
      reportedBy: 'Local Market Update',
      sourceLabel: t.market.farmerReportBadge,
      isLiveVerified: false,
      syncStatus: isOnline ? 'synced' : 'pending',
    };

    if (isOnline) {
      try {
        const res = await fetch('/api/market-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.update) {
            Object.assign(newEntry, data.update, { syncStatus: 'synced' as const });
          }
        } else {
          newEntry.syncStatus = 'pending';
        }
      } catch {
        newEntry.syncStatus = 'pending';
      }
    }

    const updated = await saveMarketPrice(newEntry);
    onPricesChange(updated);
    setEditingEntry(null);
    setCropNameInput('');
    setMarketNameInput('');
    setPriceKgInput('');
    setShowReportForm(false);
    setIsSaving(false);
    setStatusNotice({ type: 'success', text: t.market.updateSuccessMsg });
  };

  const trendBadge = (trend: MarketPrice['trend']) => {
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {t.market.trendUp}
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800">
          <ArrowDownRight className="h-3.5 w-3.5" />
          {t.market.trendDown}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600">
        <Minus className="h-3.5 w-3.5" />
        {t.market.trendStable}
      </span>
    );
  };

  return (
    <section id="market" className="scroll-mt-20 border-b border-stone-200 bg-[#F7F8F5] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
              {t.market.sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">{t.market.sectionSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefreshLivePrices}
              disabled={isRefreshingLive}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshingLive ? 'animate-spin' : ''}`} />
              {isRefreshingLive ? t.market.refreshingLive : t.market.refreshLiveBtn}
            </button>

            <button
              type="button"
              onClick={handleListenMarket}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Volume2 className="h-4 w-4 text-emerald-900" />
              {t.market.listenMarket}
            </button>

            <button
              type="button"
              onClick={() => (showReportForm ? setShowReportForm(false) : openNewForm())}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 text-emerald-900" />
              {showReportForm ? t.market.closeForm : t.market.reportPriceBtn}
            </button>
          </div>
        </div>

        {/* Live Sync Schedule & Freshness Metadata Strip */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
              <Clock className="h-3.5 w-3.5 text-emerald-800" />
              {t.market.lastMarketSyncLabel}:{' '}
              <span className="font-mono-tabular">
                {formatTimestamp(syncMeta.lastSyncAt || prices[0]?.updatedAt)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t.market.autoSyncNote}
            </span>
          </div>

          {syncMeta.sources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-700">{t.market.sourcesTitle}:</span>
              {syncMeta.sources.slice(0, 2).map((src) => (
                <a
                  key={src.uri}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-900 hover:underline underline-offset-2 max-w-[260px] sm:max-w-xs truncate"
                >
                  <span className="truncate">{src.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {statusNotice && (
          <p
            className={`mt-3 text-xs font-semibold ${
              statusNotice.type === 'success' ? 'text-emerald-800' : 'text-amber-800'
            }`}
          >
            {statusNotice.text}
          </p>
        )}

        {/* Inline Edit / Add Local Market Price Form */}
        {showReportForm && (
          <form
            onSubmit={handleSubmitPrice}
            className="mt-5 rounded-xl border border-emerald-200 bg-white p-4 sm:p-6 shadow-xs"
          >
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                {editingEntry ? t.market.editingPriceTitle : t.market.addNewPriceTitle}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowReportForm(false);
                  setEditingEntry(null);
                }}
                className="text-xs font-medium text-stone-500 hover:text-stone-900"
              >
                {t.market.closeForm}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="mkt-crop">
                  {t.market.cropNameLabel}
                </label>
                <input
                  id="mkt-crop"
                  type="text"
                  required
                  value={cropNameInput}
                  onChange={(e) => setCropNameInput(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="mkt-name">
                  {t.market.marketNameLabel}
                </label>
                <input
                  id="mkt-name"
                  type="text"
                  required
                  value={marketNameInput}
                  onChange={(e) => setMarketNameInput(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="mkt-price">
                  {t.market.priceKgLabel}
                </label>
                <input
                  id="mkt-price"
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={priceKgInput}
                  onChange={(e) => setPriceKgInput(e.target.value)}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 px-3 font-mono-tabular text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="mkt-curr">
                  {t.market.currencyLabel}
                </label>
                <select
                  id="mkt-curr"
                  value={currencyInput}
                  onChange={(e) => setCurrencyInput(e.target.value as 'BDT' | 'INR')}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm"
                >
                  <option value="BDT">৳ BDT</option>
                  <option value="INR">₹ INR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700" htmlFor="mkt-trend">
                  {t.market.trendLabel}
                </label>
                <select
                  id="mkt-trend"
                  value={trendInput}
                  onChange={(e) => setTrendInput(e.target.value as 'up' | 'down' | 'stable' | 'auto')}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="up">{t.market.trendUp}</option>
                  <option value="stable">{t.market.trendStable}</option>
                  <option value="down">{t.market.trendDown}</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(['grain', 'vegetable', 'spice', 'fruit'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryInput(cat)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      categoryInput === cat
                        ? 'bg-emerald-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {t.market.categories[cat]}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[42px] rounded-lg bg-emerald-900 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {t.market.submitPrice}
              </button>
            </div>
          </form>
        )}

        {/* Filter Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.market.searchPlaceholder}
              className="min-h-[42px] w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-200/70 p-1">
            {(['all', 'grain', 'vegetable', 'spice', 'fruit'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.market.categories[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile & Tablet Card View (Zero Horizontal Scroll or Clipped Buttons) */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
          {filteredPrices.map((item) => {
            const delta = Math.round((item.pricePerKg - item.previousPricePerKg) * 10) / 10;
            const symbol = item.currency === 'INR' ? '₹' : '৳';
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-bold text-stone-900">{getCropLabel(item)}</div>
                    <div className="mt-0.5 text-xs text-stone-600">{item.marketName}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-stone-500">
                      <span>{t.market.categories[item.category]}</span>
                      {item.isLiveVerified && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-emerald-800">{t.market.verifiedLiveBadge}</span>
                        </>
                      )}
                      {item.syncStatus === 'pending' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-amber-800">{t.market.pendingSyncTag}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono-tabular">
                    <div className="text-lg font-bold text-emerald-950">
                      {formatMoney(item.pricePerKg, item.currency)}
                      <span className="text-xs font-normal text-stone-500"> /kg</span>
                    </div>
                    <div className="text-xs text-stone-600">
                      {t.market.perMaund}: {formatMoney(item.pricePerMaund, item.currency)}
                    </div>
                    {delta !== 0 && (
                      <div
                        className={`mt-0.5 text-xs font-semibold ${
                          delta > 0 ? 'text-emerald-800' : 'text-red-700'
                        }`}
                      >
                        {delta > 0 ? `+${symbol}${delta}` : `-${symbol}${Math.abs(delta)}`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    {trendBadge(item.trend)}
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular">{formatTimestamp(item.updatedAt)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditRowForm(item)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-950 whitespace-nowrap shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t.market.quickUpdateBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop High-Legibility Market Table */}
        <div className="mt-5 hidden overflow-x-auto rounded-xl border border-stone-200 bg-white lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold text-stone-600">
                <th className="px-5 py-3.5">{t.market.cropNameLabel}</th>
                <th className="px-5 py-3.5">{t.market.marketNameLabel}</th>
                <th className="px-5 py-3.5 text-right">{t.market.perKg}</th>
                <th className="px-5 py-3.5 text-right">{t.market.perMaund}</th>
                <th className="px-5 py-3.5 text-right">{t.market.trendLabel}</th>
                <th className="px-5 py-3.5 text-right">{t.market.quickUpdateBtn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {filteredPrices.map((item) => {
                const delta = Math.round((item.pricePerKg - item.previousPricePerKg) * 10) / 10;
                const symbol = item.currency === 'INR' ? '₹' : '৳';
                return (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-stone-900">{getCropLabel(item)}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
                        <span>{t.market.categories[item.category]}</span>
                        {item.isLiveVerified && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-emerald-800">{t.market.verifiedLiveBadge}</span>
                          </>
                        )}
                        {item.syncStatus === 'pending' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-amber-800">{t.market.pendingSyncTag}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-stone-800">{item.marketName}</div>
                      <div className="mt-0.5 font-mono-tabular text-xs text-stone-500">
                        {formatTimestamp(item.updatedAt)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono-tabular">
                      <div className="font-bold text-stone-900">
                        {formatMoney(item.pricePerKg, item.currency)}
                      </div>
                      {delta !== 0 && (
                        <div
                          className={`text-xs font-medium ${
                            delta > 0 ? 'text-emerald-800' : 'text-red-700'
                          }`}
                        >
                          {delta > 0 ? `+${symbol}${delta}` : `-${symbol}${Math.abs(delta)}`}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono-tabular text-stone-700">
                      {formatMoney(item.pricePerMaund, item.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right">{trendBadge(item.trend)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openEditRowForm(item)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700 hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-950 whitespace-nowrap"
                      >
                        <Pencil className="h-3 w-3" />
                        {t.market.quickUpdateBtn}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
