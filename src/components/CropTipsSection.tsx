import React, { useMemo, useState } from 'react';
import { Bookmark, ChevronDown, ChevronUp, Search, Sprout, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Translations } from '../catalog/i18n';
import { AppLanguage, CropTip } from '../types/agri';

interface CropTipsSectionProps {
  t: Translations;
  lang: AppLanguage;
  tips: CropTip[];
  onToggleBookmark: (tipId: string) => Promise<void>;
}

export const CropTipsSection: React.FC<CropTipsSectionProps> = ({
  t,
  lang,
  tips,
  onToggleBookmark,
}) => {
  const { playTrack } = useAudioPlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'kharif' | 'rabi' | 'zaid'>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [expandedTipId, setExpandedTipId] = useState<string | null>(tips[0]?.id ?? null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const filteredTips = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tips.filter((tip) => {
      if (bookmarkedOnly && !tip.bookmarked) return false;
      if (seasonFilter !== 'all' && tip.seasonKey !== seasonFilter && tip.seasonKey !== 'all') {
        return false;
      }
      if (!q) return true;
      return (
        tip.title[lang].toLowerCase().includes(q) ||
        tip.cropName[lang].toLowerCase().includes(q) ||
        tip.summary[lang].toLowerCase().includes(q)
      );
    });
  }, [tips, searchQuery, seasonFilter, bookmarkedOnly, lang]);

  const handleListenTip = (tip: CropTip) => {
    playTrack({
      id: tip.id,
      title: `${tip.cropName[lang]} · ${tip.title[lang]}`,
      subtitle: tip.seasonLabel[lang],
      text: tip.audioScript[lang],
      language: lang,
    });
  };

  return (
    <section id="tips" className="scroll-mt-20 border-b border-stone-200 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
              {t.tips.sectionTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600">{t.tips.sectionSubtitle}</p>
          </div>

          {/* Search & Interactive Filter Controls */}
          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.tips.searchPlaceholder}
                className="min-h-[42px] w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-stone-100 p-1">
              {(['all', 'rabi', 'kharif', 'zaid'] as const).map((season) => (
                <button
                  key={season}
                  type="button"
                  onClick={() => setSeasonFilter(season)}
                  className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    seasonFilter === season
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {season === 'all' ? t.tips.allSeasons : t.tips.seasons[season]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBookmarkedOnly((prev) => !prev)}
              className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                bookmarkedOnly
                  ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              {t.tips.bookmarkedOnly}
            </button>
          </div>
        </div>

        {/* Crop Tips Grid */}
        {filteredTips.length === 0 ? (
          <p className="mt-8 text-sm text-stone-500">{t.tips.noTipsMatch}</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTips.map((tip) => {
              const isExpanded = expandedTipId === tip.id;
              const showFallback = !tip.imageUrl || brokenImages[tip.id];

              return (
                <article
                  key={tip.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-[#F4F5F2] p-5"
                >
                  <div>
                    {tip.imageUrl && (
                      <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                        {showFallback ? (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-900/10 to-stone-200 text-emerald-900">
                            <Sprout className="h-8 w-8" />
                            <span className="mt-2 text-xs font-semibold">{tip.cropName[lang]}</span>
                          </div>
                        ) : (
                          <img
                            src={tip.imageUrl}
                            alt={tip.title[lang]}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={() => setBrokenImages((prev) => ({ ...prev, [tip.id]: true }))}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Clean Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="font-semibold text-emerald-900">{tip.cropName[lang]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tip.seasonLabel[lang]}</span>
                    </div>

                    <h3 className="mt-1.5 text-lg font-bold leading-snug text-stone-900">
                      {tip.title[lang]}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{tip.summary[lang]}</p>

                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t border-stone-200 pt-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-stone-800">{t.tips.stepsTitle}</h4>
                          <ul className="mt-1.5 space-y-1.5 text-xs sm:text-sm leading-relaxed text-stone-700">
                            {tip.steps[lang].map((step, i) => (
                              <li key={i}>
                                {i + 1}. {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="border-t border-stone-200 pt-3">
                          <h4 className="text-xs sm:text-sm font-semibold text-emerald-950">
                            {t.tips.fertilizerTitle}
                          </h4>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-700">
                            {tip.fertilizerNote[lang]}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Bar */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleListenTip(tip)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#2E7D32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#256628] whitespace-nowrap shrink-0"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        {t.tips.listenTip}
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBookmark(tip.id)}
                        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          tip.bookmarked
                            ? 'border-[#2E7D32]/30 bg-[#EEF4EA] text-[#1E5622]'
                            : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        {tip.bookmarked ? t.tips.bookmarkSaved : t.tips.bookmarkAdd}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                      aria-expanded={isExpanded}
                      aria-label={tip.title[lang]}
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
