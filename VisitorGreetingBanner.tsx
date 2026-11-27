import React, { useEffect, useMemo, useState } from 'react';
import { Moon, Sun, Sunrise, Sunset, Volume2, X } from 'lucide-react';
import { Translations } from '../catalog/i18n';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AppLanguage, VisitorStats } from '../types/agri';

interface VisitorGreetingBannerProps {
  t: Translations;
  lang: AppLanguage;
  districtName?: string;
  visitorStats: VisitorStats | null;
}

const VISIT_COUNT_KEY = 'krishi_mitra_visit_count';
const GREETING_DISMISSED_KEY = 'krishi_mitra_greeting_dismissed';
const GREETING_COUNTED_SESSION_KEY = 'krishi_mitra_greeting_session_counted';

export const VisitorGreetingBanner: React.FC<VisitorGreetingBannerProps> = ({
  t,
  lang,
  districtName,
  visitorStats,
}) => {
  const { playTrack } = useAudioPlayer();
  const [visitNumber, setVisitNumber] = useState<number>(1);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(GREETING_DISMISSED_KEY) === '1') {
        setDismissed(true);
      }

      const rawCount = Number(window.localStorage.getItem(VISIT_COUNT_KEY) || '0');
      const alreadyCountedThisSession =
        window.sessionStorage.getItem(GREETING_COUNTED_SESSION_KEY) === '1';

      let resolvedCount = Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 0;
      if (!alreadyCountedThisSession) {
        resolvedCount += 1;
        window.localStorage.setItem(VISIT_COUNT_KEY, String(resolvedCount));
        window.sessionStorage.setItem(GREETING_COUNTED_SESSION_KEY, '1');
      }
      setVisitNumber(Math.max(1, resolvedCount));
    } catch {
      setVisitNumber(1);
    }
  }, []);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      return { text: t.greeting.morning, Icon: Sunrise };
    }
    if (hour >= 12 && hour < 17) {
      return { text: t.greeting.afternoon, Icon: Sun };
    }
    if (hour >= 17 && hour < 20) {
      return { text: t.greeting.evening, Icon: Sunset };
    }
    return { text: t.greeting.night, Icon: Moon };
  }, [t.greeting]);

  if (dismissed) {
    return null;
  }

  const isFirstVisit = visitNumber <= 1;
  const bodyMessage = isFirstVisit ? t.greeting.firstVisitMessage : t.greeting.returningMessage;
  const visitStatusLabel = isFirstVisit
    ? t.greeting.firstVisitBadge
    : `${t.greeting.visitOrdinalPrefix} ${visitNumber.toLocaleString()}${t.greeting.visitOrdinalSuffix}`;
  const GreetingIcon = timeGreeting.Icon;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(GREETING_DISMISSED_KEY, '1');
    } catch {
      // Ignore sessionStorage restrictions
    }
  };

  const handleSpeakGreeting = () => {
    const areaSentence = districtName
      ? lang === 'bn'
        ? ` আপনার নির্বাচিত এলাকা ${districtName}।`
        : lang === 'hi'
        ? ` आपका चुना हुआ क्षेत्र ${districtName} है।`
        : ` Your selected area is ${districtName}.`
      : '';
    playTrack({
      id: `visitor-greeting-${lang}`,
      title: timeGreeting.text,
      subtitle: t.brandName,
      text: `${timeGreeting.text}। ${bodyMessage}${areaSentence}`,
      language: lang,
    });
  };

  return (
    <section
      aria-label={timeGreeting.text}
      className="border-b border-stone-200 bg-[#F7F8F5] pt-5 pb-2"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-900">
              <GreetingIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-600">
                <span className="font-semibold text-emerald-900">{visitStatusLabel}</span>
                {districtName && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">
                      ·
                    </span>
                    <span>
                      {t.greeting.regionReadyPrefix}:{' '}
                      <strong className="font-semibold text-stone-800">{districtName}</strong>
                    </span>
                  </>
                )}
                {visitorStats && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">
                      ·
                    </span>
                    <span>
                      {t.visitors.uniqueVisitors}:{' '}
                      <strong className="font-mono-tabular font-semibold text-stone-900">
                        {visitorStats.uniqueVisitors.toLocaleString()}
                      </strong>
                    </span>
                  </>
                )}
              </div>

              <h2 className="mt-1 text-base font-bold text-stone-950 sm:text-lg">
                {timeGreeting.text}
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-stone-600 sm:text-sm">
                {bodyMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSpeakGreeting}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-emerald-800 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-100 whitespace-nowrap"
            >
              <Volume2 className="h-3.5 w-3.5 text-emerald-900 shrink-0" />
              <span>{t.greeting.listenGreeting}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t.greeting.dismissLabel}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
