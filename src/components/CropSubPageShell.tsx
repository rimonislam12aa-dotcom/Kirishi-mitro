import React from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ChevronRight,
  Radar,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { CROP_SUB_ROUTE_CATALOG, CROP_SUB_ROUTE_MAP, getRouteHref } from '../lib/appRouter';
import { AppLanguage, AppPageTab, CropFeatureRouteId } from '../types/agri';

interface CropSubPageShellProps {
  lang: AppLanguage;
  activeSubRoute: CropFeatureRouteId;
  entryParent: AppPageTab;
  contextMetric: string;
  onBack: () => void;
  onNavigateParent: (parent: AppPageTab) => void;
  onSwitchSubRoute: (routeId: CropFeatureRouteId) => void;
  children: React.ReactNode;
}

const ROUTE_ICONS: Record<CropFeatureRouteId, React.ReactNode> = {
  'cultivation-tips': <Sprout className="h-4 w-4 shrink-0" />,
  'crop-calendar': <CalendarDays className="h-4 w-4 shrink-0" />,
  'disease-scanner': <Camera className="h-4 w-4 shrink-0" />,
  'yield-pest-radar': <Radar className="h-4 w-4 shrink-0" />,
  'field-assistant': <ShieldCheck className="h-4 w-4 shrink-0" />,
};

export const CropSubPageShell: React.FC<CropSubPageShellProps> = ({
  lang,
  activeSubRoute,
  entryParent,
  contextMetric,
  onBack,
  onNavigateParent,
  onSwitchSubRoute,
  children,
}) => {
  const currentMeta = CROP_SUB_ROUTE_MAP[activeSubRoute];

  const homeLabel = lang === 'bn' ? 'হোম' : lang === 'hi' ? 'होम' : 'Home';
  const cropsHubLabel =
    lang === 'bn' ? 'ফসলের পরামর্শ' : lang === 'hi' ? 'फसल सलाह' : 'Crop Advisory';
  const profileLabel = lang === 'bn' ? 'প্রোফাইল' : lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile';

  const backTargetLabel =
    entryParent === 'profile'
      ? profileLabel
      : entryParent === 'crops'
      ? cropsHubLabel
      : homeLabel;

  const backButtonText =
    lang === 'bn'
      ? `${backTargetLabel}-এ ফিরুন`
      : lang === 'hi'
      ? `${backTargetLabel} पर लौटें`
      : `Back to ${backTargetLabel}`;

  return (
    <div>
      <section className="border-b border-zinc-200 bg-white py-5 sm:py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          {/* প্যারেন্ট-চাইল্ড ব্রেডক্রাম্ব ও ফিরে যাওয়ার বাটন */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-zinc-300 bg-[#F8F9F7] px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-800 transition-colors hover:border-[#2E7D32] hover:bg-[#EEF4EA] hover:text-[#255D28] whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>{backButtonText}</span>
              </button>

              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-zinc-500 pl-1"
              >
                <a
                  href={getRouteHref('home', null)}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateParent('home');
                  }}
                  className="hover:text-[#2E7D32] hover:underline whitespace-nowrap"
                >
                  {homeLabel}
                </a>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <a
                  href={getRouteHref('crops', null)}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateParent('crops');
                  }}
                  className="hover:text-[#2E7D32] hover:underline whitespace-nowrap"
                >
                  {cropsHubLabel}
                </a>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="font-semibold text-[#255D28] whitespace-nowrap">
                  {currentMeta.title[lang]}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono-tabular">
              <span>{currentMeta.path}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#2E7D32]">{contextMetric}</span>
            </div>
          </div>

          {/* চাইল্ড সাব-পেজ শিরোনাম ও সংক্ষিপ্ত বিবরণ */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4EA] text-[#2E7D32]">
                {ROUTE_ICONS[activeSubRoute]}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-balance">
                  {currentMeta.title[lang]}
                </h1>
                <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-zinc-600">
                  {currentMeta.subtitle[lang]}
                </p>
              </div>
            </div>
          </div>

          {/* সিবলিং চাইল্ড রাউট সুইচার (অন্য সাব-পেজে সরাসরি যাওয়ার সুবিধা) */}
          <div
            role="navigation"
            aria-label={
              lang === 'bn'
                ? 'অন্যান্য কৃষি সেবা সাব-পেজ'
                : lang === 'hi'
                ? 'अन्य कृषि सेवा सब-पेज'
                : 'Related Service Routes'
            }
            className="flex flex-wrap items-center gap-2 pt-1"
          >
            {CROP_SUB_ROUTE_CATALOG.map((item) => {
              const isActive = item.id === activeSubRoute;
              return (
                <a
                  key={item.id}
                  href={getRouteHref('crops', item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!isActive) {
                      onSwitchSubRoute(item.id);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#2E7D32] bg-[#2E7D32] text-white'
                      : 'border-zinc-200 bg-[#F8F9F7] text-zinc-700 hover:border-[#2E7D32] hover:bg-[#EEF4EA] hover:text-[#255D28]'
                  }`}
                >
                  {ROUTE_ICONS[item.id]}
                  <span>{item.title[lang]}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {children}
    </div>
  );
};
