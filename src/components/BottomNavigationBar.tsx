import React from 'react';
import { Home, Sprout, User } from 'lucide-react';
import { Translations } from '../catalog/i18n';
import { AppLanguage, AppPageTab } from '../types/agri';

interface BottomNavigationBarProps {
  t: Translations;
  lang: AppLanguage;
  activePage: AppPageTab;
  onSelectPage: (page: AppPageTab) => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  t,
  lang,
  activePage,
  onSelectPage,
}) => {
  const tabs: {
    id: AppPageTab;
    label: string;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'home',
      label: t.nav.home,
      renderIcon: (active) => (
        <Home className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.85} />
      ),
    },
    {
      id: 'crops',
      label:
        lang === 'bn'
          ? 'ফসলের পরামর্শ'
          : lang === 'hi'
          ? 'फसल सलाह'
          : 'Crop Advisory',
      renderIcon: (active) => (
        <Sprout className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.85} />
      ),
    },
    {
      id: 'profile',
      label: lang === 'bn' ? 'প্রোফাইল' : lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
      renderIcon: (active) => (
        <User className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 1.85} />
      ),
    },
  ];

  return (
    <nav
      aria-label={
        lang === 'bn'
          ? 'প্রধান বটম নেভিগেশন'
          : lang === 'hi'
          ? 'मुख्य नेविगेशन'
          : 'Primary Bottom Navigation'
      }
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="mx-auto grid max-w-3xl grid-cols-3 items-stretch px-2 sm:px-6"
      >
        {tabs.map((tab) => {
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectPage(tab.id)}
              className={`group relative flex min-h-[58px] sm:min-h-[60px] flex-col items-center justify-center gap-1 px-2 py-1.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2E7D32] ${
                isActive
                  ? 'text-[#255D28]'
                  : 'text-zinc-600 hover:bg-zinc-50/90 hover:text-zinc-900'
              }`}
            >
              {/* Top active bar indicator (FarmRise-style clean accent strip) */}
              <span
                aria-hidden="true"
                className={`absolute top-0 h-[3px] w-12 rounded-b-full transition-opacity duration-150 ${
                  isActive ? 'bg-[#2E7D32] opacity-100' : 'opacity-0'
                }`}
              />

              <span
                className={`flex h-7 w-12 items-center justify-center rounded-xl transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#EEF4EA] text-[#2E7D32]'
                    : 'text-zinc-500 group-hover:text-zinc-800'
                }`}
              >
                {tab.renderIcon(isActive)}
              </span>

              <span
                className={`max-w-full truncate text-[11px] sm:text-xs leading-tight whitespace-nowrap ${
                  isActive ? 'font-bold text-[#255D28]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
