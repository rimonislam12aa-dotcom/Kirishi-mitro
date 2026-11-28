import React from 'react';
import { Translations } from '../catalog/i18n';
import { getRouteHref } from '../lib/appRouter';
import { AppLanguage, AppPageTab } from '../types/agri';

interface HeaderProps {
  t: Translations;
  lang: AppLanguage;
  activePage: AppPageTab;
  onSelectPage: (page: AppPageTab) => void;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  lang,
  activePage,
  onSelectPage,
  onOpenScanner,
}) => {
  const navItems: { id: AppPageTab; label: string }[] = [
    {
      id: 'home',
      label: t.nav.home,
    },
    {
      id: 'crops',
      label:
        lang === 'bn'
          ? 'ফসলের পরামর্শ'
          : lang === 'hi'
          ? 'फसल सलाह'
          : 'Crop Advisory',
    },
    {
      id: 'profile',
      label: lang === 'bn' ? 'প্রোফাইল' : lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
    },
  ];

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, id: AppPageTab) => {
    e.preventDefault();
    onSelectPage(id);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 sm:gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href={getRouteHref('home', null)}
          onClick={(e) => handleTabClick(e, 'home')}
          className="text-lg sm:text-xl font-bold tracking-tight text-[#255D28] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2E7D32]"
        >
          {t.brandName}
        </a>

        {/* Zone 2: 3 concise single-line text nav links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-600"
        >
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <a
                key={item.id}
                href={getRouteHref(item.id, null)}
                onClick={(e) => handleTabClick(e, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#2E7D32] hover:underline underline-offset-4 ${
                  isActive ? 'text-[#2E7D32] font-semibold underline' : ''
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenScanner}
            className="min-h-[40px] rounded-xl bg-[#2E7D32] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#256628] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]"
          >
            {t.nav.scanner}
          </button>
        </div>
      </div>
    </header>
  );
};
