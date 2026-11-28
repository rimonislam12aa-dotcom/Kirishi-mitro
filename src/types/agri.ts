export type AppLanguage = 'bn' | 'hi' | 'en';

export type BottomMainTab = 'home' | 'weather' | 'crops';

export type NavSection = 'home' | 'weather' | 'calendar' | 'scanner' | 'yield-radar' | 'tips';

export interface GeoLocationInfo {
  lat: number;
  lon: number;
  districtName: string;
  regionName: string;
  source: 'gps' | 'manual' | 'cached';
  detectedMethod?: 'gps-satellite' | 'gps-network' | 'ip-location' | 'manual' | 'cached';
  accuracyMeters?: number;
  nearestStationName?: string;
  nearestDistanceKm?: number;
  updatedAt: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProb: number;
  weatherCode: number;
}

export interface WeatherAlert {
  id: string;
  level: 'warning' | 'danger' | 'info';
  title: Record<AppLanguage, string>;
  message: Record<AppLanguage, string>;
  advice: Record<AppLanguage, string>;
  triggeredAt: string;
}

export interface WeatherCacheRecord {
  id: string;
  location: GeoLocationInfo;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windGusts?: number;
  precipitation: number;
  weatherCode: number;
  uvIndex: number;
  aqi?: number;
  pm25?: number;
  pm10?: number;
  forecast: DailyForecast[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}

export interface CropTip {
  id: string;
  cropKey: 'rice' | 'potato' | 'tomato' | 'wheat' | 'mustard' | 'mango' | 'chili' | 'jute' | 'onion';
  seasonKey: 'kharif' | 'rabi' | 'zaid' | 'all';
  imageUrl?: string;
  title: Record<AppLanguage, string>;
  cropName: Record<AppLanguage, string>;
  seasonLabel: Record<AppLanguage, string>;
  summary: Record<AppLanguage, string>;
  steps: Record<AppLanguage, string[]>;
  fertilizerNote: Record<AppLanguage, string>;
  audioScript: Record<AppLanguage, string>;
  bookmarked?: boolean;
}

export interface DiseaseDiagnosis {
  id: string;
  createdAt: string;
  language: AppLanguage;
  imageDataUrl: string;
  cropName: string;
  diseaseName: string;
  scientificName: string;
  pathogenType?: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency' | 'healthy' | 'unclear';
  severity: 'healthy' | 'low' | 'moderate' | 'high';
  diseaseStage?: string;
  spreadRisk?: 'low' | 'moderate' | 'high';
  confidence: number;
  affectedPart?: string;
  growthStage?: string;
  rootCause?: string;
  immediateAction?: string;
  symptoms: string[];
  organicTreatment: string[];
  chemicalTreatment: string[];
  dosageAndSprayGuide?: string;
  harvestWaitDays?: string;
  differentialDiagnosis?: string;
  prevention: string[];
  audioSummary: string;
}

export interface FarmerFeedback {
  id: string;
  name: string;
  phone: string;
  village: string;
  crop: string;
  category: 'disease' | 'weather' | 'suggestion';
  message: string;
  language: AppLanguage;
  lat?: number;
  lon?: number;
  createdAt: string;
  syncStatus: 'synced' | 'pending';
}

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  language: AppLanguage;
}

export interface OfflinePendingScan {
  id: string;
  createdAt: string;
  language: AppLanguage;
  imageDataUrl: string;
  mimeType: string;
  cropHint: string;
  affectedPart: string;
  growthStage: string;
  symptomTags: string[];
  lastError?: string;
}

export interface OfflineStorageHealth {
  usedBytes: number;
  quotaBytes: number | null;
  usagePercent: number | null;
  persisted: boolean;
}

export interface OfflineSyncSummary {
  lastSyncAt: string | null;
  processedScans: number;
  failedScans: number;
  status: 'idle' | 'synced' | 'partial' | 'offline' | 'error';
}

export interface OfflineDbStats {
  cropTipsCount: number;
  diagnosesCount: number;
  yieldPredictionsCount: number;
  pendingScansCount: number;
  pendingSyncCount: number;
  audioCachedCount: number;
  hasWeatherCache: boolean;
  lastSyncAt: string | null;
}

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  todayUniqueVisitors?: number;
  returningVisits?: number;
  avgViewsPerVisitor?: number;
  activeNow: number;
  lastVisitAt: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  level: 'warning' | 'danger' | 'info';
  deliveredViaOs: boolean;
  createdAt: string;
}

export interface CropGrowthMilestone {
  dayOffset: number;
  title: Record<AppLanguage, string>;
  action: Record<AppLanguage, string>;
}

export interface CropCalendarItem {
  id: string;
  cropName: Record<AppLanguage, string>;
  variety: Record<AppLanguage, string>;
  seasonKey: 'rabi' | 'kharif1' | 'kharif2' | 'all';
  seasonLabel: Record<AppLanguage, string>;
  plantingMonths: number[];
  harvestMonths: number[];
  plantingWindowText: Record<AppLanguage, string>;
  harvestWindowText: Record<AppLanguage, string>;
  durationDaysMin: number;
  durationDaysMax: number;
  soilAndPh: Record<AppLanguage, string>;
  spacingAndSeedRate: Record<AppLanguage, string>;
  milestones: CropGrowthMilestone[];
}

export type AutoSyncIntervalMinutes = 15 | 30 | 60 | 180;

export type AgroTimeSlotId = 'early-morning' | 'midday' | 'afternoon' | 'night';

export interface AgroTimeAdvisory {
  slotId: AgroTimeSlotId;
  timeRangeLabel: Record<AppLanguage, string>;
  slotTitle: Record<AppLanguage, string>;
  focusSummary: Record<AppLanguage, string>;
  tasks: Record<AppLanguage, string[]>;
  spraySafety: {
    status: 'safe' | 'caution' | 'avoid';
    headline: Record<AppLanguage, string>;
    reason: Record<AppLanguage, string>;
  };
}

export interface MonthlyAgroAdvisory {
  month: number;
  banglaSeason: Record<AppLanguage, string>;
  headline: Record<AppLanguage, string>;
  keyCropsFocus: Record<AppLanguage, string>;
  actionItems: Record<AppLanguage, string[]>;
}

export interface IrrigationCriticalStage {
  id: string;
  crop: Record<AppLanguage, string>;
  stages: Record<AppLanguage, string>;
  note: Record<AppLanguage, string>;
}

export interface SoilAndSprayRule {
  id: string;
  title: Record<AppLanguage, string>;
  detail: Record<AppLanguage, string>;
}

export interface FarmerHelplineItem {
  id: string;
  number: string;
  title: Record<AppLanguage, string>;
  hours: Record<AppLanguage, string>;
  regionNote: Record<AppLanguage, string>;
}

export type YieldGrowthStageKey = 'seedling' | 'vegetative' | 'flowering' | 'grain_fill';

export interface YieldStagePhotoInput {
  stageKey: YieldGrowthStageKey;
  imageDataUrl: string;
  mimeType: string;
  note?: string;
}

export interface YieldStageAnalysis {
  stageKey: YieldGrowthStageKey;
  stageLabel: string;
  healthScore: number;
  vigorStatus: 'excellent' | 'good' | 'moderate' | 'stressed';
  visualObservations: string;
  stageRecommendation: string;
}

export interface YieldPredictionRecord {
  id: string;
  createdAt: string;
  language: AppLanguage;
  cropName: string;
  variety: string;
  landArea: number;
  landUnit: 'bigha' | 'decimal' | 'acre' | 'hectare';
  soilType: string;
  irrigationLevel: string;
  fertilizerRegime: string;
  sowingDate: string;
  districtName?: string;
  stagesUploaded: YieldGrowthStageKey[];
  stageThumbnails: { stageKey: YieldGrowthStageKey; imageDataUrl: string }[];
  stagesAnalyzed: YieldStageAnalysis[];
  projectedYieldPerBighaKg: number;
  projectedTotalYieldKg: number;
  projectedYieldMinKg: number;
  projectedYieldMaxKg: number;
  yieldGrade: 'bumper' | 'above_average' | 'average' | 'below_average' | 'at_risk';
  confidencePercent: number;
  estimatedHarvestWindow: string;
  weatherImpactSummary: string;
  yieldDrivers: string[];
  yieldBottlenecks: string[];
  boosterActionPlan: string[];
  audioSummary: string;
}

export interface RegionalPestThreat {
  pestName: string;
  scientificName: string;
  targetCrops: string[];
  riskPercent: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  onsetWindow: string;
  earlyWarningSignals: string[];
  preventiveShield: string;
  affectedRadiusNote: string;
}

export interface RegionalPestObservation {
  id: string;
  districtName: string;
  cropName: string;
  pestName: string;
  severity: 'early' | 'moderate' | 'severe';
  note?: string;
  createdAt: string;
}

export interface RegionalPestRadarResult {
  id: string;
  createdAt: string;
  language: AppLanguage;
  districtName: string;
  cropFocus: string;
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  overallRiskScore: number;
  outbreakWindowDays: number;
  weatherTriggerSummary: string;
  regionalScoutingSummary: string;
  communitySignalCount: number;
  predictedOutbreaks: RegionalPestThreat[];
  recentReports: RegionalPestObservation[];
  audioSummary: string;
}


