import { DISTRICT_PRESETS } from '../catalog/seedData';
import {
  AppLanguage,
  DailyForecast,
  GeoLocationInfo,
  WeatherAlert,
  WeatherCacheRecord,
} from '../types/agri';
import { getWeatherCache, saveWeatherCache } from './offlineDb';

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestDistrict(lat: number, lon: number) {
  let best = DISTRICT_PRESETS[0];
  let bestDistKm = Infinity;
  for (const d of DISTRICT_PRESETS) {
    const distKm = calculateDistanceKm(lat, lon, d.lat, d.lon);
    if (distKm < bestDistKm) {
      bestDistKm = distKm;
      best = d;
    }
  }
  return {
    district: best,
    distanceKm: Math.round(bestDistKm * 10) / 10,
  };
}

export async function reverseGeocodePosition(
  lat: number,
  lon: number,
  lang: AppLanguage
): Promise<{
  districtName: string;
  regionName: string;
  nearestStationName: string;
  nearestDistanceKm: number;
}> {
  const { district: nearest, distanceKm } = findNearestDistrict(lat, lon);
  const nearestStationName = nearest.name[lang];

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.city || data.principalSubdivision;
      const admin = data.city && data.city !== locality ? data.city : data.principalSubdivision;
      const region = admin || nearest.region[lang];
      if (locality) {
        return {
          districtName: String(locality),
          regionName: String(region),
          nearestStationName,
          nearestDistanceKm: distanceKm,
        };
      }
    }
  } catch {
    // Fallback to nearest regional preset
  }

  return {
    districtName: nearestStationName,
    regionName: nearest.region[lang],
    nearestStationName,
    nearestDistanceKm: distanceKm,
  };
}

function requestBrowserPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function detectIpLocationFallback(lang: AppLanguage): Promise<GeoLocationInfo> {
  const providers = [
    async () => {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('GeoJS failed');
      const json = await res.json();
      return {
        lat: Number(json.latitude),
        lon: Number(json.longitude),
        city: json.city as string | undefined,
        region: json.region as string | undefined,
      };
    },
    async () => {
      const res = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error('ipapi failed');
      const json = await res.json();
      return {
        lat: Number(json.latitude),
        lon: Number(json.longitude),
        city: json.city as string | undefined,
        region: json.region as string | undefined,
      };
    },
  ];

  for (const lookup of providers) {
    try {
      const ipData = await lookup();
      if (Number.isFinite(ipData.lat) && Number.isFinite(ipData.lon)) {
        const lat = Math.round(ipData.lat * 10000) / 10000;
        const lon = Math.round(ipData.lon * 10000) / 10000;
        const place = await reverseGeocodePosition(lat, lon, lang);
        return {
          lat,
          lon,
          districtName: place.districtName || ipData.city || place.nearestStationName,
          regionName: place.regionName || ipData.region || '',
          source: 'gps',
          detectedMethod: 'ip-location',
          nearestStationName: place.nearestStationName,
          nearestDistanceKm: place.nearestDistanceKm,
          updatedAt: new Date().toISOString(),
        };
      }
    } catch {
      // Try next provider
    }
  }

  throw new Error('Unable to detect location via GPS or network');
}

export async function detectDeviceGps(lang: AppLanguage): Promise<GeoLocationInfo> {
  // Tier 1: High-accuracy satellite GPS
  try {
    const pos = await requestBrowserPosition({
      enableHighAccuracy: true,
      timeout: 6500,
      maximumAge: 60000,
    });
    const lat = Math.round(pos.coords.latitude * 10000) / 10000;
    const lon = Math.round(pos.coords.longitude * 10000) / 10000;
    const place = await reverseGeocodePosition(lat, lon, lang);
    return {
      lat,
      lon,
      districtName: place.districtName,
      regionName: place.regionName,
      source: 'gps',
      detectedMethod: 'gps-satellite',
      accuracyMeters: Number.isFinite(pos.coords.accuracy)
        ? Math.round(pos.coords.accuracy)
        : undefined,
      nearestStationName: place.nearestStationName,
      nearestDistanceKm: place.nearestDistanceKm,
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    const geoErr = err as GeolocationPositionError | undefined;
    // If permission was explicitly denied, skip Tier 2 and try IP fallback
    if (!geoErr || geoErr.code !== 1) {
      // Tier 2: Fast Wi-Fi / cell-tower geolocation (works indoors)
      try {
        const pos = await requestBrowserPosition({
          enableHighAccuracy: false,
          timeout: 6500,
          maximumAge: 300000,
        });
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        const place = await reverseGeocodePosition(lat, lon, lang);
        return {
          lat,
          lon,
          districtName: place.districtName,
          regionName: place.regionName,
          source: 'gps',
          detectedMethod: 'gps-network',
          accuracyMeters: Number.isFinite(pos.coords.accuracy)
            ? Math.round(pos.coords.accuracy)
            : undefined,
          nearestStationName: place.nearestStationName,
          nearestDistanceKm: place.nearestDistanceKm,
          updatedAt: new Date().toISOString(),
        };
      } catch {
        // Proceed to Tier 3 IP fallback
      }
    }
  }

  // Tier 3: Network IP geolocation fallback
  return detectIpLocationFallback(lang);
}

export interface AqiStatusInfo {
  label: string;
  toneClass: string;
  badgeClass: string;
}

export function getAqiStatus(aqi: number | undefined, lang: AppLanguage): AqiStatusInfo {
  const val = typeof aqi === 'number' && Number.isFinite(aqi) ? aqi : 65;
  if (val <= 50) {
    return {
      label: lang === 'bn' ? 'ভালো (নিরাপদ)' : lang === 'hi' ? 'अच्छा' : 'Good',
      toneClass: 'text-emerald-800',
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    };
  }
  if (val <= 100) {
    return {
      label: lang === 'bn' ? 'মাঝারি' : lang === 'hi' ? 'मध्यम' : 'Moderate',
      toneClass: 'text-amber-800',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  }
  if (val <= 150) {
    return {
      label: lang === 'bn' ? 'সংবেদনশীল ঝুঁকি' : lang === 'hi' ? 'अस्वस्थ (संवेदनशील)' : 'Sensitive Risk',
      toneClass: 'text-orange-800',
      badgeClass: 'bg-orange-50 text-orange-900 border-orange-200',
    };
  }
  if (val <= 200) {
    return {
      label: lang === 'bn' ? 'অস্বাস্থ্যকর' : lang === 'hi' ? 'अस्वस्थ' : 'Unhealthy',
      toneClass: 'text-red-800',
      badgeClass: 'bg-red-50 text-red-900 border-red-200',
    };
  }
  return {
    label: lang === 'bn' ? 'অত্যন্ত ঝুঁকিপূর্ণ' : lang === 'hi' ? 'गंभीर / खतरनाक' : 'Very Unhealthy',
    toneClass: 'text-rose-900',
    badgeClass: 'bg-rose-50 text-rose-950 border-rose-300',
  };
}

function evaluateAgroAlerts(
  temp: number,
  humidity: number,
  windSpeed: number,
  windGusts: number,
  precipitation: number,
  weatherCode: number,
  aqi: number,
  forecast: DailyForecast[]
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const nextRainMm = forecast.slice(0, 2).reduce((acc, d) => acc + d.rainMm, 0);
  const maxTempForecast = Math.max(temp, ...forecast.slice(0, 2).map((d) => d.tempMax));
  const minTempForecast = Math.min(temp, ...forecast.slice(0, 2).map((d) => d.tempMin));
  const maxRainProb = Math.max(...forecast.slice(0, 2).map((d) => d.rainProb));

  if (windSpeed >= 28 || windGusts >= 42 || weatherCode >= 95) {
    alerts.push({
      id: 'alert-cyclone-squall',
      level: 'danger',
      title: {
        bn: 'দুর্যোগ সতর্কতা: কালবৈশাখী / ঘূর্ণিঝড়ো হাওয়া ও বজ্রপাত',
        hi: 'आपदा चेतावनी: आंधी-तूफान और बिजली गिरने का खतरा',
        en: 'Disaster Alert: Severe Squall, Kalboishakhi & Lightning',
      },
      message: {
        bn: `ঝড়ো হাওয়ার দমকা গতি ঘণ্টায় প্রায় ${Math.round(Math.max(windSpeed, windGusts))} কি.মি.${
          weatherCode >= 95 ? ' এবং বজ্রসহ ঝড়ের প্রবণতা রয়েছে।' : '।'
        }`,
        hi: `हवा के तेज झोंके ${Math.round(Math.max(windSpeed, windGusts))} किमी/घंटा तक जा सकते हैं।`,
        en: `Wind gusts reaching ~${Math.round(Math.max(windSpeed, windGusts))} km/h with storm activity.`,
      },
      advice: {
        bn: 'খোলা মাঠে কাজ ও কীটনাশক স্প্রে বন্ধ রাখুন। পাকা ধান দ্রুত কাটুন এবং কলা/সবজি গাছে শক্ত খুঁটি দিন।',
        hi: 'खुले खेत में काम व छिड़काव रोकें। पकी फसल सुरक्षित स्थान पर रखें और पौधों को सहारा दें।',
        en: 'Suspend open-field work and spraying; harvest ripe paddy immediately and reinforce crop stakes.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (precipitation >= 8 || nextRainMm >= 25 || maxRainProb >= 80) {
    alerts.push({
      id: 'alert-heavy-rain',
      level: 'danger',
      title: {
        bn: 'ভারী বর্ষণ, আকস্মিক বন্যা ও জলাবদ্ধতা সতর্কতা',
        hi: 'भारी बारिश और जलभराव चेतावनी',
        en: 'Heavy Rainfall & Flash-Flood Alert',
      },
      message: {
        bn: `আগামী ৪৮ ঘণ্টায় প্রায় ${Math.round(nextRainMm)} মি.মি. বৃষ্টির সম্ভাবনা (সম্ভাব্যতা ${maxRainProb}%)।`,
        hi: `अगले 48 घंटों में लगभग ${Math.round(nextRainMm)} मिमी बारिश की संभावना (${maxRainProb}%)।`,
        en: `Expected rainfall ~${Math.round(nextRainMm)} mm over 48 hours (${maxRainProb}% probability).`,
      },
      advice: {
        bn: 'হাওর ও নিচু জমির বাঁধ/আইল পরীক্ষা করুন, সেচ ও সার প্রয়োগ স্থগিত রাখুন এবং দ্রুত পানি নিষ্কাশনের নালা রাখুন।',
        hi: 'खेत की मेड़ें साफ रखें, खाद और सिंचाई रोक दें और जल निकासी की व्यवस्था करें।',
        en: 'Inspect low-land bunds, clear drainage channels, pause irrigation/fertilizer, and protect harvested grain.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (humidity >= 80 && temp >= 14 && temp <= 28) {
    alerts.push({
      id: 'alert-fungal-blight',
      level: 'warning',
      title: {
        bn: 'উচ্চ আর্দ্রতা — ছত্রাক ও মড়ক রোগের ঝুঁকি',
        hi: 'अधिक नमी — झुलसा व फफूंद रोग का खतरा',
        en: 'High Humidity — Fungal Blight Risk',
      },
      message: {
        bn: `বাতাসের আর্দ্রতা ${Math.round(humidity)}% ও তাপমাত্রা ${Math.round(temp)}°সে.। আলু, টমেটো ও ধানে ব্লাইট/ধ্বসা ছড়াতে পারে।`,
        hi: `हवा में नमी ${Math.round(humidity)}% और तापमान ${Math.round(temp)}°C है। आलू, टमाटर और धान में झुलसा रोग फैल सकता है।`,
        en: `Relative humidity is ${Math.round(humidity)}% at ${Math.round(temp)}°C, favoring late blight in potato/tomato and blast in paddy.`,
      },
      advice: {
        bn: 'সকালে গাছের পাতা পরীক্ষা করুন, অতিরিক্ত ইউরিয়া দেবেন না এবং প্রয়োজনে প্রতিরোধক স্প্রে করুন।',
        hi: 'सुबह पत्तों की जांच करें, अतिरिक्त यूरिया न डालें और बचाव के लिए फफूंदनाशी का छिड़काव करें।',
        en: 'Inspect lower leaves in the morning, avoid excess nitrogen, and keep preventive fungicides ready.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (maxTempForecast >= 35) {
    alerts.push({
      id: 'alert-heat-stress',
      level: maxTempForecast >= 38 ? 'danger' : 'warning',
      title: {
        bn: 'তীব্র তাপদাহ ও পরাগায়ন ঝুঁকি — সেচ সতর্কতা',
        hi: 'तेज गर्मी व परागण जोखिम — सिंचाई चेतावनी',
        en: 'Heat & Pollination Stress Advisory',
      },
      message: {
        bn: `তাপমাত্রা ${Math.round(maxTempForecast)}°সে. পর্যন্ত উঠতে পারে (৩৫°সে.+ তাপমাত্রায় ধান ও গমের চিটা বাড়তে পারে)।`,
        hi: `तापमान ${Math.round(maxTempForecast)}°C तक पहुंच सकता है (35°C+ पर धान व गेहूं के दाने खाली रह सकते हैं)।`,
        en: `Daytime highs may reach ${Math.round(maxTempForecast)}°C (35°C+ risks pollen sterility in rice & wheat).`,
      },
      advice: {
        bn: 'ধান/সবজিতে বিকেলের পর হালকা সেচ দিয়ে ২–৩ ইঞ্চি পানি রাখুন এবং গাছের গোড়ায় খড় দিয়ে মালচিং করুন।',
        hi: 'शाम के समय खेत में हल्की सिंचाई कर 2-3 इंच नमी रखें और पौधों के पास पुआल बिछाएं।',
        en: 'Maintain shallow afternoon moisture/water in flowering paddy and mulch soil basins.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (minTempForecast <= 12) {
    alerts.push({
      id: 'alert-cold-wave',
      level: minTempForecast <= 10 ? 'warning' : 'info',
      title: {
        bn: 'শৈত্যপ্রবাহ ও ঘন কুয়াশা পরামর্শ',
        hi: 'शीतलहर और घने कोहरे की सलाह',
        en: 'Cold Wave & Dense Fog Advisory',
      },
      message: {
        bn: `সর্বনিম্ন তাপমাত্রা ${Math.round(minTempForecast)}°সে. হতে পারে। বোরো বীজতলায় ঠান্ডা ও পাতা হলুদ হওয়ার ঝুঁকি।`,
        hi: `न्यूनतम तापमान ${Math.round(minTempForecast)}°C तक जा सकता है। नर्सरी पौध की सुरक्षा करें।`,
        en: `Minimum temperature dipping to ${Math.round(minTempForecast)}°C; watch rice seedbeds for cold injury.`,
      },
      advice: {
        bn: 'বীজতলা রাতে স্বচ্ছ পলিথিন দিয়ে ঢেকে রাখুন (সকাল ১০টায় খুলে দিন) এবং সকালে পানি পরিবর্তন করুন।',
        hi: 'रात में नर्सरी को पॉलिथीन से ढकें और सुबह ताज़ा पानी बदलें।',
        en: 'Cover paddy nurseries with clear polythene overnight and refresh standing water in morning.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (windSpeed >= 20 && windSpeed < 28 && windGusts < 42 && weatherCode < 95) {
    alerts.push({
      id: 'alert-high-wind',
      level: 'warning',
      title: {
        bn: 'দমকা বাতাস সতর্কতা — স্প্রে স্থগিত রাখুন',
        hi: 'तेज हवा चेतावनी — छिड़काव रोकें',
        en: 'High Wind — Delay Foliar Spraying',
      },
      message: {
        bn: `বাতাসের গতি ঘণ্টায় ${Math.round(windSpeed)} কি.মি.।`,
        hi: `हवा की गति ${Math.round(windSpeed)} किमी/घंटा है।`,
        en: `Wind speeds near ${Math.round(windSpeed)} km/h.`,
      },
      advice: {
        bn: 'এই বাতাসে বালাইনাশক স্প্রে করলে ওষুধ উড়ে যাবে; সবজি ও কলা গাছে খুঁটি শক্ত করুন।',
        hi: 'तेज हवा में छिड़काव बेकार जाएगा; सब्जियों व बेलों को मजबूत सहारा दें।',
        en: 'Postpone spraying to avoid drift and reinforce stakes on tall vegetable crops.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (aqi >= 151) {
    alerts.push({
      id: 'alert-poor-aqi',
      level: aqi >= 201 ? 'danger' : 'warning',
      title: {
        bn: 'দূষিত বায়ু (AQI) সতর্কতা',
        hi: 'खराब वायु गुणवत्ता (AQI) चेतावनी',
        en: 'Unhealthy Air Quality (AQI) Alert',
      },
      message: {
        bn: `বর্তমান এয়ার কোয়ালিটি ইনডেক্স ${Math.round(aqi)} — বাতাসে ধূলিকণার মাত্রা বেশি।`,
        hi: `वर्तमान वायु गुणवत्ता सूचकांक (AQI) ${Math.round(aqi)} है — हवा में धूल व धुआं अधिक है।`,
        en: `Current Air Quality Index is ${Math.round(aqi)} (unhealthy ambient particulate level).`,
      },
      advice: {
        bn: 'মাঠে কাজ বা স্প্রে করার সময় মাস্ক ব্যবহার করুন এবং চারা গাছের পাতায় ধুলা জমলে পরিষ্কার পানি স্প্রে করুন।',
        hi: 'खेत में काम या छिड़काव के समय मास्क पहनें और पौधों के पत्तों से धूल साफ रखें।',
        en: 'Wear a protective mask during extended field work or spraying, and avoid burning crop residue.',
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  return alerts;
}

export async function fetchLiveWeather(location: GeoLocationInfo): Promise<WeatherCacheRecord> {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=5`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=us_aqi,pm2_5,pm10&timezone=auto`;

  try {
    const [forecastResult, aqiResult] = await Promise.allSettled([
      fetch(forecastUrl, { signal: AbortSignal.timeout(7000) }),
      fetch(aqiUrl, { signal: AbortSignal.timeout(6000) }),
    ]);

    if (forecastResult.status !== 'fulfilled' || !forecastResult.value.ok) {
      throw new Error('Weather API unavailable');
    }
    const data = await forecastResult.value.json();

    let aqi: number | undefined;
    let pm25: number | undefined;
    let pm10: number | undefined;

    if (aqiResult.status === 'fulfilled' && aqiResult.value.ok) {
      try {
        const aqiJson = await aqiResult.value.json();
        const currAqi = aqiJson?.current ?? {};
        if (typeof currAqi.us_aqi === 'number' && Number.isFinite(currAqi.us_aqi)) {
          aqi = Math.round(currAqi.us_aqi);
        }
        if (typeof currAqi.pm2_5 === 'number' && Number.isFinite(currAqi.pm2_5)) {
          pm25 = Math.round(currAqi.pm2_5 * 10) / 10;
        }
        if (typeof currAqi.pm10 === 'number' && Number.isFinite(currAqi.pm10)) {
          pm10 = Math.round(currAqi.pm10 * 10) / 10;
        }
      } catch {
        // Leave undefined if air-quality response is malformed
      }
    }

    const current = data.current ?? {};
    const daily = data.daily ?? {};
    const forecast: DailyForecast[] = (daily.time ?? []).map((date: string, i: number) => ({
      date,
      tempMax: Math.round(daily.temperature_2m_max?.[i] ?? 30),
      tempMin: Math.round(daily.temperature_2m_min?.[i] ?? 20),
      rainMm: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
      rainProb: Math.round(daily.precipitation_probability_max?.[i] ?? 0),
      weatherCode: Number(daily.weather_code?.[i] ?? 1),
    }));

    const temperature = Math.round((current.temperature_2m ?? 27) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 72);
    const windSpeed = Math.round((current.wind_speed_10m ?? 9) * 10) / 10;
    const windGusts = Math.round((current.wind_gusts_10m ?? windSpeed * 1.4) * 10) / 10;
    const precipitation = Math.round((current.precipitation ?? 0) * 10) / 10;
    const weatherCode = Number(current.weather_code ?? 1);
    const uvIndex = Math.round((daily.uv_index_max?.[0] ?? 6) * 10) / 10;

    const alerts = evaluateAgroAlerts(
      temperature,
      humidity,
      windSpeed,
      windGusts,
      precipitation,
      weatherCode,
      aqi ?? 0,
      forecast
    );

    const record: WeatherCacheRecord = {
      id: 'current',
      location,
      temperature,
      humidity,
      windSpeed,
      windGusts,
      precipitation,
      weatherCode,
      uvIndex,
      aqi,
      pm25,
      pm10,
      forecast,
      alerts,
      fetchedAt: new Date().toISOString(),
    };

    await saveWeatherCache(record);
    return record;
  } catch {
    const cached = await getWeatherCache();
    if (cached) {
      return {
        ...cached,
        location: { ...cached.location, source: 'cached' },
      };
    }

    const fallbackForecast: DailyForecast[] = Array.from({ length: 5 }, (_, idx) => {
      const d = new Date(Date.now() + idx * 86400000);
      return {
        date: d.toISOString().slice(0, 10),
        tempMax: 29 + (idx % 2),
        tempMin: 18 + (idx % 3),
        rainMm: idx === 2 ? 6 : 0,
        rainProb: idx === 2 ? 55 : 15,
        weatherCode: idx === 2 ? 61 : 2,
      };
    });

    const fallback: WeatherCacheRecord = {
      id: 'current',
      location: { ...location, source: 'cached' },
      temperature: 26.5,
      humidity: 78,
      windSpeed: 10.2,
      windGusts: 16.5,
      precipitation: 0,
      weatherCode: 2,
      uvIndex: 5.5,
      forecast: fallbackForecast,
      alerts: evaluateAgroAlerts(26.5, 78, 10.2, 16.5, 0, 2, 0, fallbackForecast),
      fetchedAt: new Date().toISOString(),
    };
    await saveWeatherCache(fallback);
    return fallback;
  }
}

export function describeWeatherCode(code: number, lang: AppLanguage): string {
  const labels = {
    clear: { bn: 'পরিষ্কার রোদ', hi: 'साफ धूप', en: 'Clear Sky' },
    partly: { bn: 'আংশিক মেঘলা', hi: 'आंशिक बादल', en: 'Partly Cloudy' },
    fog: { bn: 'হালকা কুয়াশা', hi: 'हल्का कोहरा', en: 'Mist / Fog' },
    rain: { bn: 'হালকা থেকে মাঝারি বৃষ্টি', hi: 'हल्की से मध्यम बारिश', en: 'Light to Moderate Rain' },
    storm: { bn: 'বজ্রসহ বৃষ্টিপাত', hi: 'गरज के साथ बारिश', en: 'Thunderstorm & Rain' },
  };
  if (code === 0 || code === 1) return labels.clear[lang];
  if (code === 2 || code === 3) return labels.partly[lang];
  if (code === 45 || code === 48) return labels.fog[lang];
  if (code >= 95) return labels.storm[lang];
  if (code >= 51) return labels.rain[lang];
  return labels.partly[lang];
}

export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [587.33, 880]; // D5 -> A5 gentle chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.3);
    });
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch {
    // Ignore autoplay restriction
  }
}

export async function dispatchWeatherPushNotification(
  title: string,
  body: string
): Promise<{ osDelivered: boolean }> {
  playNotificationChime();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { osDelivered: false };
  }
  if (Notification.permission !== 'granted') {
    return { osDelivered: false };
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 1500)),
      ]);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
          badge: `${import.meta.env.BASE_URL}pwa-192x192.png`,
          tag: `krishi-weather-${Date.now()}`,
        });
        return { osDelivered: true };
      }
    }
    new Notification(title, {
      body,
      icon: `${import.meta.env.BASE_URL}pwa-192x192.png`,
    });
    return { osDelivered: true };
  } catch {
    return { osDelivered: false };
  }
}
