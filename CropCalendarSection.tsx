import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Sprout, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  BANGLA_MONTH_HINTS,
  CROP_CALENDAR_DATA,
  MONTH_LABELS,
} from '../catalog/cropCalendarData';
import { Translations } from '../catalog/i18n';
import { AppLanguage, CropCalendarItem } from '../types/agri';

interface CropCalendarSectionProps {
  t: Translations;
  lang: AppLanguage;
}

function addDays(dateStr: string, days: number): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2] + days);
  }
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateLocal(date: Date, lang: AppLanguage): string {
  const locale = lang === 'bn' ? 'bn-BD' : lang === 'hi' ? 'hi-IN' : 'en-GB';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const CropCalendarSection: React.FC<CropCalendarSectionProps> = ({ t, lang }) => {
  const { playTrack } = useAudioPlayer();

  const currentMonthIndex = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIndex);
  const [selectedCropId, setSelectedCropId] = useState<string>(CROP_CALENDAR_DATA[0].id);
  const [plantingDate, setPlantingDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [showFullMatrix, setShowFullMatrix] = useState(false);

  const selectedCrop: CropCalendarItem = useMemo(
    () => CROP_CALENDAR_DATA.find((c) => c.id === selectedCropId) ?? CROP_CALENDAR_DATA[0],
    [selectedCropId]
  );

  const plantThisMonth = useMemo(
    () => CROP_CALENDAR_DATA.filter((c) => c.plantingMonths.includes(selectedMonth)),
    [selectedMonth]
  );

  const harvestThisMonth = useMemo(
    () => CROP_CALENDAR_DATA.filter((c) => c.harvestMonths.includes(selectedMonth)),
    [selectedMonth]
  );

  const scheduleCalculation = useMemo(() => {
    const harvestStart = addDays(plantingDate, selectedCrop.durationDaysMin);
    const harvestEnd = addDays(plantingDate, selectedCrop.durationDaysMax);

    const sowDateObj = addDays(plantingDate, 0);
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sowMidnight = new Date(
      sowDateObj.getFullYear(),
      sowDateObj.getMonth(),
      sowDateObj.getDate()
    );
    const diffDays = Math.round(
      (todayMidnight.getTime() - sowMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );

    const milestones = selectedCrop.milestones.map((m) => ({
      ...m,
      targetDate: addDays(plantingDate, m.dayOffset),
      completed: diffDays >= m.dayOffset,
    }));

    return {
      harvestStart,
      harvestEnd,
      diffDays,
      milestones,
    };
  }, [plantingDate, selectedCrop]);

  const handleListenSchedule = () => {
    const startText = formatDateLocal(scheduleCalculation.harvestStart, lang);
    const endText = formatDateLocal(scheduleCalculation.harvestEnd, lang);
    const sowText = formatDateLocal(addDays(plantingDate, 0), lang);
    const nextStep =
      scheduleCalculation.milestones.find((m) => !m.completed) ??
      scheduleCalculation.milestones[scheduleCalculation.milestones.length - 1];

    const script =
      lang === 'bn'
        ? `${selectedCrop.cropName.bn} ফসলের রোপণ ও কর্তন পরিকল্পনা। আপনি যদি ${sowText} তারিখে রোপণ করেন, তবে ${selectedCrop.durationDaysMin} থেকে ${selectedCrop.durationDaysMax} দিনের মধ্যে অর্থাৎ ${startText} থেকে ${endText} তারিখের মধ্যে ফসল তোলার উপযুক্ত হবে। পরবর্তী গুরুত্বপূর্ণ কাজ (${nextStep.dayOffset} দিনে): ${nextStep.title.bn}। ${nextStep.action.bn}`
        : lang === 'hi'
        ? `${selectedCrop.cropName.hi} फसल योजना। यदि आप ${sowText} को बुवाई करते हैं, तो ${selectedCrop.durationDaysMin} से ${selectedCrop.durationDaysMax} दिनों में यानी ${startText} से ${endText} के बीच कटाई के लिए तैयार होगी। अगला मुख्य चरण (${nextStep.dayOffset} दिन): ${nextStep.title.hi}। ${nextStep.action.hi}`
        : `${selectedCrop.cropName.en} planting and harvest plan. If sown on ${sowText}, expect harvest in ${selectedCrop.durationDaysMin} to ${selectedCrop.durationDaysMax} days, between ${startText} and ${endText}. Next milestone at day ${nextStep.dayOffset}: ${nextStep.title.en}. ${nextStep.action.en}`;

    playTrack({
      id: `calendar-${selectedCrop.id}-${plantingDate}-${lang}`,
      title: `${selectedCrop.cropName[lang]} · ${t.calendar.plannerTitle}`,
      subtitle: `${startText} – ${endText}`,
      text: script,
      language: lang,
    });
  };

  const months = MONTH_LABELS[lang];

  return (
    <section
      id="calendar"
      className="scroll-mt-20 border-b border-stone-200 bg-[#F7F8F5] py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
            {t.calendar.sectionTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            {t.calendar.sectionSubtitle}
          </p>
        </div>

        {/* Monthly Advisor Selector */}
        <div className="mt-7 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">{t.calendar.advisorMonthLabel}</h3>
              <p className="mt-0.5 text-xs text-stone-500">
                {months[selectedMonth - 1]} ({BANGLA_MONTH_HINTS[selectedMonth - 1]})
              </p>
            </div>

            {/* Mobile: clean dropdown; Desktop: crisp month selector */}
            <div className="sm:hidden">
              <label htmlFor="calendar-month-select" className="sr-only">
                {t.calendar.advisorMonthLabel}
              </label>
              <select
                id="calendar-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="min-h-[44px] w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-sm font-semibold text-stone-900 focus:border-emerald-800 focus:outline-none"
              >
                {months.map((label, idx) => (
                  <option key={label} value={idx + 1}>
                    {label} ({BANGLA_MONTH_HINTS[idx]})
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1">
              {months.map((label, idx) => {
                const monthNum = idx + 1;
                const active = selectedMonth === monthNum;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-emerald-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {/* Plant This Month */}
            <div className="rounded-lg border border-stone-200 bg-[#F7F8F5] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <Sprout className="h-4 w-4 text-emerald-800 shrink-0" />
                <span>{t.calendar.plantNowTitle}</span>
                <span className="ml-auto font-mono-tabular text-xs text-stone-500">
                  {plantThisMonth.length}
                </span>
              </div>
              {plantThisMonth.length === 0 ? (
                <p className="mt-3 text-xs text-stone-600">{t.calendar.noPlantMonth}</p>
              ) : (
                <div className="mt-3 divide-y divide-stone-200">
                  {plantThisMonth.map((crop) => {
                    const active = crop.id === selectedCropId;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setSelectedCropId(crop.id)}
                        className={`flex w-full items-start justify-between gap-3 rounded-md px-2 py-2.5 text-left transition-colors ${
                          active ? 'bg-emerald-100/70 text-emerald-950' : 'hover:text-emerald-900'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-stone-900 leading-snug">
                            {crop.cropName[lang]}
                          </div>
                          <div className="mt-0.5 text-xs text-stone-600 leading-relaxed">
                            {crop.plantingWindowText[lang]}
                          </div>
                        </div>
                        <span className="shrink-0 pt-0.5 font-mono-tabular text-xs font-semibold text-emerald-800">
                          {crop.durationDaysMin}–{crop.durationDaysMax}d
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Harvest This Month */}
            <div className="rounded-lg border border-stone-200 bg-[#F7F8F5] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
                <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{t.calendar.harvestNowTitle}</span>
                <span className="ml-auto font-mono-tabular text-xs text-stone-500">
                  {harvestThisMonth.length}
                </span>
              </div>
              {harvestThisMonth.length === 0 ? (
                <p className="mt-3 text-xs text-stone-600">{t.calendar.noHarvestMonth}</p>
              ) : (
                <div className="mt-3 divide-y divide-stone-200">
                  {harvestThisMonth.map((crop) => {
                    const active = crop.id === selectedCropId;
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => setSelectedCropId(crop.id)}
                        className={`flex w-full items-start justify-between gap-3 rounded-md px-2 py-2.5 text-left transition-colors ${
                          active ? 'bg-amber-100/70 text-amber-950' : 'hover:text-amber-900'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-stone-900 leading-snug">
                            {crop.cropName[lang]}
                          </div>
                          <div className="mt-0.5 text-xs text-stone-600 leading-relaxed">
                            {crop.harvestWindowText[lang]}
                          </div>
                        </div>
                        <span className="shrink-0 pt-0.5 font-mono-tabular text-xs font-semibold text-amber-800">
                          {crop.seasonLabel[lang]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sowing-to-Harvest Calculator + Milestones */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6 lg:col-span-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <h3 className="text-base font-bold text-stone-900">{t.calendar.plannerTitle}</h3>
              <button
                type="button"
                onClick={handleListenSchedule}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
              >
                <Volume2 className="h-3.5 w-3.5 shrink-0" />
                <span>{t.calendar.listenPlanBtn}</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="calendar-crop-select"
                  className="block text-xs font-semibold text-stone-700"
                >
                  {t.calendar.selectCropLabel}
                </label>
                <select
                  id="calendar-crop-select"
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-900 focus:border-emerald-800 focus:outline-none"
                >
                  {CROP_CALENDAR_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cropName[lang]} ({c.seasonLabel[lang]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="calendar-sow-date"
                  className="block text-xs font-semibold text-stone-700"
                >
                  {t.calendar.plantingDateLabel}
                </label>
                <input
                  id="calendar-sow-date"
                  type="date"
                  value={plantingDate}
                  onChange={(e) => {
                    if (e.target.value) setPlantingDate(e.target.value);
                  }}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono-tabular text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="text-xs font-semibold text-emerald-900">
                  {t.calendar.expectedHarvestLabel}
                </div>
                <div className="mt-1 font-mono-tabular text-base font-bold text-emerald-950">
                  {formatDateLocal(scheduleCalculation.harvestStart, lang)} –{' '}
                  {formatDateLocal(scheduleCalculation.harvestEnd, lang)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-700">
                  <span>
                    {t.calendar.durationLabel}:{' '}
                    <strong className="font-mono-tabular">
                      {selectedCrop.durationDaysMin}–{selectedCrop.durationDaysMax}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {scheduleCalculation.diffDays < 0
                      ? t.calendar.notPlantedYetMsg
                      : scheduleCalculation.diffDays >= selectedCrop.durationDaysMin
                      ? t.calendar.readyToHarvestMsg
                      : `${t.calendar.currentProgressLabel}: ${scheduleCalculation.diffDays} ${t.calendar.daysElapsedSuffix}`}
                  </span>
                </div>
              </div>

              <dl className="divide-y divide-stone-200 border-t border-stone-200 text-xs">
                <div className="py-2.5">
                  <dt className="font-semibold text-stone-500">{t.calendar.soilLabel}</dt>
                  <dd className="mt-0.5 text-stone-800">{selectedCrop.soilAndPh[lang]}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="font-semibold text-stone-500">{t.calendar.spacingLabel}</dt>
                  <dd className="mt-0.5 text-stone-800">{selectedCrop.spacingAndSeedRate[lang]}</dd>
                </div>
                <div className="py-2.5 pb-0">
                  <dt className="font-semibold text-stone-500">{selectedCrop.variety[lang]}</dt>
                  <dd className="mt-0.5 text-stone-700">{selectedCrop.plantingWindowText[lang]}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
              <h3 className="text-base font-bold text-stone-900">{t.calendar.milestonesTitle}</h3>
              <span className="text-xs font-medium text-stone-500">
                {selectedCrop.cropName[lang]}
              </span>
            </div>

            <div className="mt-4 divide-y divide-stone-200">
              {scheduleCalculation.milestones.map((step) => (
                <div
                  key={step.dayOffset}
                  className="flex flex-col gap-2 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-800" />
                      ) : (
                        <Clock className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">
                        {step.title[lang]}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                        {step.action[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="pl-8 sm:pl-0 shrink-0 sm:text-right">
                    <div className="font-mono-tabular text-xs font-bold text-emerald-950">
                      {formatDateLocal(step.targetDate, lang)}
                    </div>
                    <div className="mt-0.5 font-mono-tabular text-xs text-stone-500">
                      Day +{step.dayOffset}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible 12-Month Visual Crop Matrix */}
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">{t.calendar.matrixTitle}</h3>
              {showFullMatrix && (
                <div className="mt-1.5 flex items-center gap-4 text-xs text-stone-700">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-emerald-700 inline-block" />
                    {t.calendar.matrixPlantLegend}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-xs bg-amber-500 inline-block" />
                    {t.calendar.matrixHarvestLegend}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFullMatrix((prev) => !prev)}
              aria-expanded={showFullMatrix}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 whitespace-nowrap shrink-0"
            >
              <span>{showFullMatrix ? t.calendar.hideMatrixBtn : t.calendar.showMatrixBtn}</span>
              {showFullMatrix ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showFullMatrix && (
            <div className="mt-4 overflow-x-auto border-t border-stone-200 pt-4">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="sticky left-0 z-10 bg-white py-2.5 pr-4 font-semibold shadow-[2px_0_0_0_rgba(231,229,228,0.6)]">
                    {t.calendar.cropCol}
                  </th>
                  {months.map((m, i) => (
                    <th
                      key={m}
                      className={`px-1 py-2.5 text-center font-semibold ${
                        i + 1 === currentMonthIndex ? 'text-emerald-900 underline underline-offset-4' : ''
                      }`}
                    >
                      {m}
                    </th>
                  ))}
                  <th className="py-2.5 pl-4 font-semibold">{t.calendar.harvestCol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {CROP_CALENDAR_DATA.map((crop) => {
                  const isSelected = crop.id === selectedCropId;
                  return (
                    <tr
                      key={crop.id}
                      onClick={() => setSelectedCropId(crop.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70' : 'hover:bg-stone-50'
                      }`}
                    >
                      <td
                        className={`sticky left-0 z-10 py-3 pr-4 shadow-[2px_0_0_0_rgba(231,229,228,0.6)] ${
                          isSelected ? 'bg-emerald-50' : 'bg-white'
                        }`}
                      >
                        <div className="font-semibold text-stone-900">{crop.cropName[lang]}</div>
                        <div className="text-xs text-stone-500">{crop.seasonLabel[lang]}</div>
                      </td>
                      {months.map((m, idx) => {
                        const mNum = idx + 1;
                        const isPlant = crop.plantingMonths.includes(mNum);
                        const isHarvest = crop.harvestMonths.includes(mNum);
                        return (
                          <td key={`${crop.id}-${m}`} className="px-1 py-3 text-center">
                            {isPlant && isHarvest ? (
                              <span
                                title={`${t.calendar.matrixPlantLegend} & ${t.calendar.matrixHarvestLegend}`}
                                className="mx-auto block h-4 w-5 rounded-xs bg-gradient-to-r from-emerald-700 to-amber-500"
                              />
                            ) : isPlant ? (
                              <span
                                title={t.calendar.matrixPlantLegend}
                                className="mx-auto block h-4 w-5 rounded-xs bg-emerald-700"
                              />
                            ) : isHarvest ? (
                              <span
                                title={t.calendar.matrixHarvestLegend}
                                className="mx-auto block h-4 w-5 rounded-xs bg-amber-500"
                              />
                            ) : (
                              <span className="mx-auto block h-1.5 w-3 rounded-xs bg-stone-200" />
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 pl-4 text-stone-700">
                        {crop.harvestWindowText[lang]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </section>
  );
};
