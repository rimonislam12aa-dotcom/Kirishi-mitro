import React from 'react';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Radar,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { CROP_SUB_ROUTE_MAP, getRouteHref } from '../lib/appRouter';
import {
  AgroTimeAdvisory,
  AppLanguage,
  CropCalendarItem,
  CropFeatureRouteId,
} from '../types/agri';

interface HomeFeatureRoutesGridProps {
  lang: AppLanguage;
  tipsCount: number;
  bookmarkedTipsCount: number;
  cropsCount: number;
  activeCrop: CropCalendarItem;
  activeCropElapsedDays: number;
  diagnosesCount: number;
  pendingScansCount: number;
  districtName: string;
  yieldPredictionsCount: number;
  currentTimeAdvisory: AgroTimeAdvisory;
  onOpenSubRoute: (routeId: CropFeatureRouteId) => void;
}

export const HomeFeatureRoutesGrid: React.FC<HomeFeatureRoutesGridProps> = ({
  lang,
  tipsCount,
  bookmarkedTipsCount,
  cropsCount,
  activeCrop,
  activeCropElapsedDays,
  diagnosesCount,
  pendingScansCount,
  districtName,
  yieldPredictionsCount,
  currentTimeAdvisory,
  onOpenSubRoute,
}) => {
  const sectionHeader =
    lang === 'bn'
      ? {
          eyebrow: 'দ্রুত কৃষি নেভিগেশন',
          title: 'মূল কৃষি সেবাসমূহ',
          subtitle:
            'যেকোনো কার্ডে ট্যাপ করলে প্যারেন্ট-চাইল্ড রাউটের মাধ্যমে সেই সেবার সম্পূর্ণ বিস্তারিত সাব-পেজ খুলবে।',
        }
      : lang === 'hi'
      ? {
          eyebrow: 'त्वरित कृषि नेविगेशन',
          title: 'मुख्य कृषि सेवाएं',
          subtitle:
            'किसी भी कार्ड पर टैप करें और समर्पित सब-पेज में लाइव डेटा व टूल्स खोलें।',
        }
      : {
          eyebrow: 'Quick Farm Navigation',
          title: 'Core Farming Services',
          subtitle:
            'Select any card to open its dedicated parent-child detail route with full live tools.',
        };

  const cards: {
    id: CropFeatureRouteId;
    metaText: string;
    icon: React.ReactNode;
    accentBg: string;
    accentText: string;
    colSpanClass: string;
  }[] = [
    {
      id: 'cultivation-tips',
      metaText:
        lang === 'bn'
          ? `${tipsCount}টি টিপস · ${bookmarkedTipsCount}টি সংরক্ষিত`
          : lang === 'hi'
          ? `${tipsCount} टिप्स · ${bookmarkedTipsCount} सहेजे गए`
          : `${tipsCount} guides · ${bookmarkedTipsCount} saved`,
      icon: <Sprout className="h-5 w-5" />,
      accentBg: 'bg-[#EEF4EA]',
      accentText: 'text-[#2E7D32]',
      colSpanClass: 'lg:col-span-2',
    },
    {
      id: 'crop-calendar',
      metaText:
        lang === 'bn'
          ? `${cropsCount}টি ফসল · ${activeCrop.cropName[lang]} (${Math.max(0, activeCropElapsedDays)} দিন)`
          : lang === 'hi'
          ? `${cropsCount} फसलें · ${activeCrop.cropName[lang]} (${Math.max(0, activeCropElapsedDays)} दिन)`
          : `${cropsCount} crops · ${activeCrop.cropName[lang]} (${Math.max(0, activeCropElapsedDays)}d)`,
      icon: <CalendarDays className="h-5 w-5" />,
      accentBg: 'bg-[#EEF4EA]',
      accentText: 'text-[#4D6A1F]',
      colSpanClass: 'lg:col-span-2',
    },
    {
      id: 'disease-scanner',
      metaText:
        pendingScansCount > 0
          ? lang === 'bn'
            ? `${diagnosesCount}টি স্ক্যান · ${pendingScansCount}টি অপেক্ষমাণ`
            : lang === 'hi'
            ? `${diagnosesCount} स्कैन · ${pendingScansCount} लंबित`
            : `${diagnosesCount} scans · ${pendingScansCount} queued`
          : lang === 'bn'
          ? `${diagnosesCount}টি স্ক্যান সংরক্ষিত · এআই ও অফলাইন`
          : lang === 'hi'
          ? `${diagnosesCount} स्कैन सहेजे गए · AI व ऑफलाइन`
          : `${diagnosesCount} saved · AI & Offline`,
      icon: <Camera className="h-5 w-5" />,
      accentBg: 'bg-[#EEF4EA]',
      accentText: 'text-[#2E7D32]',
      colSpanClass: 'lg:col-span-2',
    },
    {
      id: 'yield-pest-radar',
      metaText:
        lang === 'bn'
          ? `${districtName} · ${yieldPredictionsCount}টি ফলন পূর্বাভাস`
          : lang === 'hi'
          ? `${districtName} · ${yieldPredictionsCount} उपज पूर्वानुमान`
          : `${districtName} · ${yieldPredictionsCount} forecasts`,
      icon: <Radar className="h-5 w-5" />,
      accentBg: 'bg-[#EEF4EA]',
      accentText: 'text-[#4D6A1F]',
      colSpanClass: 'lg:col-span-3',
    },
    {
      id: 'field-assistant',
      metaText: `${currentTimeAdvisory.timeRangeLabel[lang]} · ${currentTimeAdvisory.spraySafety.headline[lang]}`,
      icon: <ShieldCheck className="h-5 w-5" />,
      accentBg: 'bg-[#EEF4EA]',
      accentText: 'text-[#2E7D32]',
      colSpanClass: 'lg:col-span-3',
    },
  ];

  return (
    <section
      aria-label={sectionHeader.title}
      className="border-b border-zinc-200 bg-white py-7 sm:py-9"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#4D6A1F]">
              {sectionHeader.eyebrow}
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl text-balance">
              {sectionHeader.title}
            </h2>
          </div>
          <p className="max-w-xl text-xs sm:text-sm text-zinc-600">
            {sectionHeader.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cards.map((card) => {
            const meta = CROP_SUB_ROUTE_MAP[card.id];
            const href = getRouteHref('crops', card.id);
            return (
              <a
                key={card.id}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenSubRoute(card.id);
                }}
                className={`${card.colSpanClass} group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-[#F8F9F7] p-5 transition-all duration-150 hover:border-[#2E7D32] hover:bg-white hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.accentBg} ${card.accentText} transition-colors group-hover:bg-[#2E7D32] group-hover:text-white`}
                    >
                      {card.icon}
                    </div>
                    <span className="font-mono-tabular text-[11px] font-medium text-zinc-500">
                      {meta.path}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-zinc-900 group-hover:text-[#255D28]">
                    {meta.title[lang]}
                  </h3>

                  <p className="mt-1 font-mono-tabular text-xs font-semibold text-[#4D6A1F]">
                    {card.metaText}
                  </p>

                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600">
                    {meta.subtitle[lang]}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-200/80 pt-3 text-xs font-semibold text-[#2E7D32]">
                  <span className="whitespace-nowrap">{meta.ctaLabel[lang]}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
