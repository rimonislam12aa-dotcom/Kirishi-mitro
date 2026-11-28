import { AppLanguage, AppPageTab, AppRouteState, CropFeatureRouteId } from '../types/agri';

export interface CropSubRouteMeta {
  id: CropFeatureRouteId;
  path: string;
  sectionId: 'tips' | 'calendar' | 'scanner' | 'yield-radar' | 'agro-service';
  title: Record<AppLanguage, string>;
  subtitle: Record<AppLanguage, string>;
  ctaLabel: Record<AppLanguage, string>;
}

export const CROP_SUB_ROUTE_CATALOG: CropSubRouteMeta[] = [
  {
    id: 'cultivation-tips',
    path: '/crops/cultivation-tips',
    sectionId: 'tips',
    title: {
      bn: 'চাষ টিপস',
      hi: 'खेती टिप्स',
      en: 'Cultivation Tips',
    },
    subtitle: {
      bn: 'মৌসুমভিত্তিক চাষাবাদ, মাটি প্রস্তুতি, সার প্রয়োগ ও বুকমার্ক করা গাইড।',
      hi: 'मौसम के अनुसार बुवाई, खाद प्रबंधन और सहेजे गए कृषि दिशानिर्देश।',
      en: 'Seasonal cultivation guides, fertilizer notes, audio briefs, and bookmarks.',
    },
    ctaLabel: {
      bn: 'টিপস খুলুন',
      hi: 'टिप्स खोलें',
      en: 'Open Tips',
    },
  },
  {
    id: 'crop-calendar',
    path: '/crops/crop-calendar',
    sectionId: 'calendar',
    title: {
      bn: 'ফসলের টিপস',
      hi: 'फसल टिप्स व कैलेंडर',
      en: 'Crop Tips & Schedule',
    },
    subtitle: {
      bn: 'প্রতিটি ফসলের ধাপভিত্তিক সময়সূচি, বৃদ্ধির দিন গণনা ও পরিচর্যা চেকলিস্ট।',
      hi: 'प्रत्येक फसल का चरणबद्ध शेड्यूल, वृद्धि दिवस और देखभाल चेकलिस्ट।',
      en: 'Step-by-step crop growth milestones, sowing tracker, and stage checklist.',
    },
    ctaLabel: {
      bn: 'সময়সূচি দেখুন',
      hi: 'शेड्यूल देखें',
      en: 'Open Schedule',
    },
  },
  {
    id: 'disease-scanner',
    path: '/crops/disease-scanner',
    sectionId: 'scanner',
    title: {
      bn: 'রোগ স্ক্যান',
      hi: 'रोग स्कैन',
      en: 'Disease Scan',
    },
    subtitle: {
      bn: 'ক্যামেরা বা ছবির মাধ্যমে ফসলের রোগ শনাক্তকরণ এবং জৈব ও রাসায়নিক প্রতিকার।',
      hi: 'कैमरा या फोटो से फसल रोग पहचान और जैविक व रासायनिक उपचार।',
      en: 'Instant camera & offline AI leaf disease diagnosis with treatment plan.',
    },
    ctaLabel: {
      bn: 'স্ক্যান করুন',
      hi: 'स्कैन करें',
      en: 'Open Scanner',
    },
  },
  {
    id: 'yield-pest-radar',
    path: '/crops/yield-pest-radar',
    sectionId: 'yield-radar',
    title: {
      bn: 'ফলন বালাই রাডার',
      hi: 'उपज व कीट रडार',
      en: 'Yield & Pest Radar',
    },
    subtitle: {
      bn: 'বৃদ্ধির ধাপ বিশ্লেষণে এআই ফলন পূর্বাভাস ও আঞ্চলিক বালাই প্রাদুর্ভাব সতর্কতা।',
      hi: 'वृद्धि चरण फोटो से उपज पूर्वानुमान और क्षेत्रीय कीट प्रकोप चेतावनी।',
      en: 'Multi-stage AI yield prediction and regional pest outbreak intelligence.',
    },
    ctaLabel: {
      bn: 'রাডার খুলুন',
      hi: 'रडार खोलें',
      en: 'Open Radar',
    },
  },
  {
    id: 'field-assistant',
    path: '/crops/field-assistant',
    sectionId: 'agro-service',
    title: {
      bn: 'মাঠ সহায়ক',
      hi: 'खेत सहायक',
      en: 'Field Assistant',
    },
    subtitle: {
      bn: 'দিনের সময় অনুযায়ী কাজের তালিকা, স্প্রে নিরাপত্তা, সেচ ও জরুরি কৃষি হেল্পলাইন।',
      hi: 'दिन के समय के अनुसार कार्य, छिड़काव सुरक्षा, सिंचाई व कृषि हेल्पलाइन।',
      en: 'Time-slot field tasks, spray safety window, irrigation stages & helplines.',
    },
    ctaLabel: {
      bn: 'সহায়ক দেখুন',
      hi: 'सहायक खोलें',
      en: 'Open Assistant',
    },
  },
];

export const CROP_SUB_ROUTE_MAP: Record<CropFeatureRouteId, CropSubRouteMeta> =
  CROP_SUB_ROUTE_CATALOG.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<CropFeatureRouteId, CropSubRouteMeta>
  );

const LEGACY_HASH_TO_ROUTE: Record<string, Partial<AppRouteState>> = {
  home: { parentPage: 'home', subRoute: null, entryParent: 'home' },
  weather: { parentPage: 'home', subRoute: null, entryParent: 'home' },
  'agri-news': { parentPage: 'home', subRoute: null, entryParent: 'home' },
  crops: { parentPage: 'crops', subRoute: null, entryParent: 'crops' },
  profile: { parentPage: 'profile', subRoute: null, entryParent: 'profile' },
  tips: { parentPage: 'crops', subRoute: 'cultivation-tips', entryParent: 'home' },
  'cultivation-tips': { parentPage: 'crops', subRoute: 'cultivation-tips', entryParent: 'home' },
  calendar: { parentPage: 'crops', subRoute: 'crop-calendar', entryParent: 'home' },
  'crop-calendar': { parentPage: 'crops', subRoute: 'crop-calendar', entryParent: 'home' },
  scanner: { parentPage: 'crops', subRoute: 'disease-scanner', entryParent: 'home' },
  'disease-scanner': { parentPage: 'crops', subRoute: 'disease-scanner', entryParent: 'home' },
  'yield-radar': { parentPage: 'crops', subRoute: 'yield-pest-radar', entryParent: 'home' },
  'yield-pest-radar': { parentPage: 'crops', subRoute: 'yield-pest-radar', entryParent: 'home' },
  'agro-service': { parentPage: 'crops', subRoute: 'field-assistant', entryParent: 'home' },
  'field-assistant': { parentPage: 'crops', subRoute: 'field-assistant', entryParent: 'home' },
};

export function shouldUseHashRouting(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'file:') return true;
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl !== '/';
}

export function getRoutePath(parentPage: AppPageTab, subRoute: CropFeatureRouteId | null): string {
  if (subRoute && CROP_SUB_ROUTE_MAP[subRoute]) {
    return CROP_SUB_ROUTE_MAP[subRoute].path;
  }
  if (parentPage === 'crops') return '/crops';
  if (parentPage === 'profile') return '/profile';
  return '/';
}

export function getRouteHref(parentPage: AppPageTab, subRoute: CropFeatureRouteId | null): string {
  const path = getRoutePath(parentPage, subRoute);
  if (shouldUseHashRouting()) {
    return `#${path}`;
  }
  return path;
}

function matchPathToRoute(rawPath: string): AppRouteState | null {
  const normalized = rawPath.trim().replace(/\/+$/, '') || '/';
  if (normalized === '/' || normalized === '/home' || normalized === '/index.html') {
    return { parentPage: 'home', subRoute: null, entryParent: 'home' };
  }
  if (normalized === '/crops') {
    return { parentPage: 'crops', subRoute: null, entryParent: 'crops' };
  }
  if (normalized === '/profile') {
    return { parentPage: 'profile', subRoute: null, entryParent: 'profile' };
  }

  for (const meta of CROP_SUB_ROUTE_CATALOG) {
    if (normalized === meta.path || normalized === `/${meta.id}`) {
      return { parentPage: 'crops', subRoute: meta.id, entryParent: 'home' };
    }
  }
  return null;
}

export function parseCurrentRoute(): AppRouteState {
  if (typeof window === 'undefined') {
    return { parentPage: 'home', subRoute: null, entryParent: 'home' };
  }

  const historyState = window.history.state as Partial<AppRouteState> | null;
  const hash = window.location.hash.replace(/^#/, '').trim();

  if (hash) {
    if (hash.startsWith('/')) {
      const matchedHash = matchPathToRoute(hash);
      if (matchedHash) {
        return {
          ...matchedHash,
          entryParent: historyState?.entryParent ?? matchedHash.entryParent,
        };
      }
    }
    const legacy = LEGACY_HASH_TO_ROUTE[hash];
    if (legacy) {
      return {
        parentPage: legacy.parentPage ?? 'home',
        subRoute: legacy.subRoute ?? null,
        entryParent: historyState?.entryParent ?? legacy.entryParent ?? 'home',
      };
    }
  }

  if (!shouldUseHashRouting()) {
    const matchedPath = matchPathToRoute(window.location.pathname);
    if (matchedPath) {
      return {
        ...matchedPath,
        entryParent: historyState?.entryParent ?? matchedPath.entryParent,
      };
    }
  }

  if (
    historyState &&
    (historyState.parentPage === 'home' ||
      historyState.parentPage === 'crops' ||
      historyState.parentPage === 'profile')
  ) {
    return {
      parentPage: historyState.parentPage,
      subRoute: historyState.subRoute ?? null,
      entryParent: historyState.entryParent ?? historyState.parentPage,
    };
  }

  return { parentPage: 'home', subRoute: null, entryParent: 'home' };
}

export function updateDocumentRouteTitle(
  lang: AppLanguage,
  brandName: string,
  state: AppRouteState
): void {
  if (typeof document === 'undefined') return;
  if (state.subRoute && CROP_SUB_ROUTE_MAP[state.subRoute]) {
    document.title = `${CROP_SUB_ROUTE_MAP[state.subRoute].title[lang]} — ${brandName}`;
    return;
  }
  if (state.parentPage === 'crops') {
    const label =
      lang === 'bn' ? 'ফসলের পরামর্শ' : lang === 'hi' ? 'फसल सलाह' : 'Crop Advisory';
    document.title = `${label} — ${brandName}`;
    return;
  }
  if (state.parentPage === 'profile') {
    const label = lang === 'bn' ? 'প্রোফাইল' : lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile';
    document.title = `${label} — ${brandName}`;
    return;
  }
  document.title = `${brandName}`;
}

export function syncBrowserHistory(
  state: AppRouteState,
  mode: 'push' | 'replace' = 'push'
): void {
  if (typeof window === 'undefined') return;
  const targetHref = getRouteHref(state.parentPage, state.subRoute);
  const currentHref = shouldUseHashRouting()
    ? window.location.hash || '#/'
    : window.location.pathname || '/';

  if (currentHref === targetHref && mode === 'push') {
    window.history.replaceState(state, '', targetHref);
    return;
  }

  if (mode === 'replace') {
    window.history.replaceState(state, '', targetHref);
  } else {
    window.history.pushState(state, '', targetHref);
  }
}
