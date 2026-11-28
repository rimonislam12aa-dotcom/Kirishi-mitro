import React from 'react';
import { Calendar, Camera, CloudSun, Radar, Sprout } from 'lucide-react';
import { Translations } from '../catalog/i18n';
import { NavSection } from '../types/agri';

interface HeaderProps {
  t: Translations;
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

export const Header: React.FC<HeaderProps> = ({ t, activeSection, onNavigate }) => {
  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'weather', label: t.nav.weather, icon: <CloudSun className="h-5 w-5" /> },
    { id: 'calendar', label: t.nav.calendar, icon: <Calendar className="h-5 w-5" /> },
    { id: 'scanner', label: t.nav.scanner, icon: <Camera className="h-5 w-5" /> },
    { id: 'yield-radar', label: t.nav.yieldRadar, icon: <Radar className="h-5 w-5" /> },
    { id: 'tips', label: t.nav.tips, icon: <Sprout className="h-5 w-5" /> },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: NavSection) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <>
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 sm:gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#weather"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-lg sm:text-xl font-bold tracking-tight text-[#255D28] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2E7D32]"
          >
            {t.brandName}
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-3.5 lg:gap-7 text-xs lg:text-sm font-medium text-zinc-600"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleLinkClick(e, item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#2E7D32] hover:underline underline-offset-4 ${
                  activeSection === item.id ? 'text-[#2E7D32] font-semibold underline' : ''
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 Primary CTA Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="min-h-[40px] rounded-xl bg-[#2E7D32] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#256628] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32]"
            >
              {t.nav.scanner}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb-Zone Navigation with safe-area support */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-30 grid min-h-[60px] grid-cols-5 border-t border-zinc-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navItems.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 transition-colors ${
                active ? 'text-[#2E7D32] font-semibold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.icon}
              <span className="max-w-full px-0.5 text-center text-[11px] leading-tight break-words">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
