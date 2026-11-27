import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Droplets,
  HelpCircle,
  History,
  Leaf,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Sprout,
  Trash2,
  Upload,
  VideoOff,
  Volume2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Translations } from '../catalog/i18n';
import { matchOfflineAgronomyDiagnosis } from '../catalog/offlineDiseaseMatcher';
import { processPendingScanItem } from '../lib/offlineArchitecture';
import { deleteDiagnosis, deletePendingScan, saveDiagnosis, savePendingScan } from '../lib/offlineDb';
import {
  AppLanguage,
  DiseaseDiagnosis,
  OfflinePendingScan,
  WeatherCacheRecord,
} from '../types/agri';
import sampleRiceLeafImg from '../assets/images/crop_rice_leaf_sample_1795261298022.jpg';

interface DiseaseScannerSectionProps {
  t: Translations;
  lang: AppLanguage;
  isOnline: boolean;
  weather?: WeatherCacheRecord | null;
  savedDiagnoses: DiseaseDiagnosis[];
  pendingScans: OfflinePendingScan[];
  onDiagnosesChange: (next: DiseaseDiagnosis[]) => void;
  onPendingScansChange: (next: OfflinePendingScan[]) => void;
}

type AffectedPartKey = 'leaf' | 'stem' | 'fruit' | 'root';
type GrowthStageKey = 'seedling' | 'vegetative' | 'flowering' | 'mature';

const SAMPLE_LEAF_IMAGE = sampleRiceLeafImg;

export const DiseaseScannerSection: React.FC<DiseaseScannerSectionProps> = ({
  t,
  lang,
  isOnline,
  weather,
  savedDiagnoses,
  pendingScans,
  onDiagnosesChange,
  onPendingScansChange,
}) => {
  const { playTrack } = useAudioPlayer();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string>('image/jpeg');
  const [cropHint, setCropHint] = useState('');
  const [affectedPart, setAffectedPart] = useState<AffectedPartKey>('leaf');
  const [growthStage, setGrowthStage] = useState<GrowthStageKey>('vegetative');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingQueueId, setProcessingQueueId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<DiseaseDiagnosis | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setScanError(null);
    setQueueNotice(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        lang === 'bn'
          ? 'এই ব্রাউজারে সরাসরি ক্যামেরা খোলা যাচ্ছে না। নিচের "গ্যালারি থেকে দিন" বোতামে চাপ দিয়ে ফোনের ছবি দিন।'
          : lang === 'hi'
          ? 'इस ब्राउज़र में सीधा कैमरा उपलब्ध नहीं है। नीचे "फोटो अपलोड करें" बटन से गैलरी की फोटो दें।'
          : 'Camera unavailable in this browser. Tap "Upload Photo" below to select from gallery.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(false);
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError(
        lang === 'bn'
          ? 'ক্যামেরার অনুমতি পাওয়া যায়নি। আপনি "গ্যালারি থেকে দিন" বা "নমুনা ধানের পাতা দেখুন" ব্যবহার করতে পারেন।'
          : lang === 'hi'
          ? 'कैमरे की अनुमति नहीं मिली। आप गैलरी से फोटो अपलोड करें या नमूना पत्ती देखें।'
          : 'Could not access camera. You can upload a photo or test the sample leaf.'
      );
    }
  };

  const resizeImageSrc = (src: string, maxSide = 1024, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          reject(new Error('Image has zero dimensions'));
          return;
        }
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, maxSide / Math.max(w, h));
        canvas.width = Math.max(240, Math.round(w * ratio));
        canvas.height = Math.max(180, Math.round(h * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      setCameraError(t.scanner.cameraInitializing);
      return;
    }
    const canvas = document.createElement('canvas');
    const maxSide = 1024;
    const ratio = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(240, Math.round(video.videoWidth * ratio));
    canvas.height = Math.max(180, Math.round(video.videoHeight * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setPreviewDataUrl(dataUrl);
    setPreviewMimeType('image/jpeg');
    setCameraError(null);
    setScanError(null);
    setQueueNotice(null);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScanError(null);
    setQueueNotice(null);
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const compactUrl = await resizeImageSrc(String(reader.result), 1024, 0.82);
        setPreviewDataUrl(compactUrl);
        setPreviewMimeType('image/jpeg');
        stopCamera();
      } catch {
        setScanError(
          lang === 'bn'
            ? 'নির্বাচিত ছবিটি প্রসেস করা যায়নি। অনুগ্রহ করে পরিষ্কার JPG বা PNG ছবি দিন।'
            : lang === 'hi'
            ? 'चयनित फोटो प्रोसेस नहीं हो सकी। कृपया साफ JPG या PNG फोटो चुनें।'
            : 'Could not process the selected photo. Please try a standard JPG or PNG image.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleLeaf = async () => {
    setScanError(null);
    setQueueNotice(null);
    setCameraError(null);
    stopCamera();
    try {
      const compactUrl = await resizeImageSrc(SAMPLE_LEAF_IMAGE, 1024, 0.82);
      setPreviewDataUrl(compactUrl);
      setPreviewMimeType('image/jpeg');
      setCropHint(lang === 'bn' ? 'ধান' : lang === 'hi' ? 'धान' : 'Rice');
      setAffectedPart('leaf');
      setGrowthStage('vegetative');
    } catch {
      setScanError('Could not load sample image.');
    }
  };

  const handleClearPreview = () => {
    setPreviewDataUrl(null);
    setScanError(null);
    setQueueNotice(null);
  };

  const toggleSymptomTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag].slice(0, 5)
    );
  };

  const handleSaveToOfflineQueue = async () => {
    if (!previewDataUrl) return;
    const item: OfflinePendingScan = {
      id: `qscan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      language: lang,
      imageDataUrl: previewDataUrl,
      mimeType: previewMimeType,
      cropHint: cropHint.trim(),
      affectedPart: t.scanner.affectedParts[affectedPart],
      growthStage: t.scanner.growthStages[growthStage],
      symptomTags: selectedTags,
    };
    const nextQueue = await savePendingScan(item);
    onPendingScansChange(nextQueue);
    setScanError(null);
    setQueueNotice(t.scanner.queuedSavedMsg);
  };

  const handleProcessQueuedScan = async (scan: OfflinePendingScan) => {
    if (!isOnline) {
      setScanError(t.scanner.offlineScanNotice);
      return;
    }
    setProcessingQueueId(scan.id);
    setScanError(null);
    setQueueNotice(null);
    try {
      const res = await processPendingScanItem(scan, weather);
      if (res.diagnoses) {
        onDiagnosesChange(res.diagnoses);
      }
      if (res.pendingScans) {
        onPendingScansChange(res.pendingScans);
      }
      if (res.diagnosis) {
        setActiveResult(res.diagnosis);
        setPreviewDataUrl(res.diagnosis.imageDataUrl);
      } else if (res.error) {
        setScanError(res.error);
      }
    } finally {
      setProcessingQueueId(null);
    }
  };

  const handleDeleteQueuedScan = async (id: string) => {
    const next = await deletePendingScan(id);
    onPendingScansChange(next);
  };

  const handleDeleteDiagnosisRecord = async (id: string) => {
    const next = await deleteDiagnosis(id);
    onDiagnosesChange(next);
    if (activeResult?.id === id) {
      setActiveResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!previewDataUrl) return;
    setQueueNotice(null);
    if (!isOnline) {
      await handleSaveToOfflineQueue();
      return;
    }

    setIsAnalyzing(true);
    setScanError(null);
    try {
      const base64 = previewDataUrl.split(',')[1] ?? '';
      if (base64.length < 100) {
        throw new Error(
          lang === 'bn'
            ? 'ছবির ডেটা সম্পূর্ণ নয়। অনুগ্রহ করে নতুন করে ছবি তুলুন।'
            : 'Captured image data is incomplete. Please retake the photo.'
        );
      }

      const weatherContext = weather
        ? {
            districtName: weather.location.districtName,
            temperature: weather.temperature,
            humidity: weather.humidity,
            precipitation: weather.precipitation,
          }
        : null;

      const payload = JSON.stringify({
        imageBase64: base64,
        mimeType: previewMimeType,
        language: lang,
        cropHint,
        affectedPart: t.scanner.affectedParts[affectedPart],
        growthStage: t.scanner.growthStages[growthStage],
        symptomTags: selectedTags,
        weatherContext,
      });

      let res: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        res = await fetch('/api/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(45000),
          body: payload,
        });
        if (res.status !== 503 || attempt === 1) {
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (!res) {
        throw new Error('Network unavailable.');
      }

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;
      if (!res.ok || !data) {
        const isStaticHostOrQuota =
          res.status === 404 ||
          res.status === 405 ||
          res.status === 429 ||
          res.status === 503 ||
          !contentType.includes('application/json');

        if (isStaticHostOrQuota) {
          const localRecord = matchOfflineAgronomyDiagnosis({
            lang,
            imageDataUrl: previewDataUrl,
            cropHint,
            affectedPart: t.scanner.affectedParts[affectedPart],
            growthStage: t.scanner.growthStages[growthStage],
            symptomTags: selectedTags,
            weather,
          });
          const updated = await saveDiagnosis(localRecord);
          onDiagnosesChange(updated);
          setActiveResult(localRecord);
          setQueueNotice(
            lang === 'bn'
              ? 'ফসলের নাম ও নির্বাচিত লক্ষণ অনুযায়ী স্থানীয় BARI/BRRI কৃষি গাইড থেকে পূর্ণাঙ্গ পরামর্শ তৈরি করা হয়েছে (অফলাইন ও GitHub Pages-এ ১০০% কার্যকর)।'
              : lang === 'hi'
              ? 'फसल और लक्षणों के आधार पर स्थानीय कृषि गाइड से पूर्ण सलाह तैयार की गई है।'
              : 'Generated complete field guidance from local BARI/BRRI symptom guide (works 100% on static GitHub Pages & offline).'
          );
          return;
        }
        throw new Error(data?.error || 'Analysis failed.');
      }

      const record: DiseaseDiagnosis = {
        id: `diag_${Date.now()}`,
        createdAt: new Date().toISOString(),
        language: lang,
        imageDataUrl: previewDataUrl,
        cropName: data.cropName || cropHint || 'Crop',
        diseaseName: data.diseaseName || 'Unknown',
        scientificName: data.scientificName || '',
        pathogenType: data.pathogenType,
        severity: data.severity || 'moderate',
        diseaseStage: data.diseaseStage || '',
        spreadRisk: data.spreadRisk,
        confidence: Number(data.confidence) || 82,
        affectedPart: t.scanner.affectedParts[affectedPart],
        growthStage: t.scanner.growthStages[growthStage],
        rootCause: data.rootCause || '',
        immediateAction: data.immediateAction || '',
        symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
        organicTreatment: Array.isArray(data.organicTreatment) ? data.organicTreatment : [],
        chemicalTreatment: Array.isArray(data.chemicalTreatment) ? data.chemicalTreatment : [],
        dosageAndSprayGuide: data.dosageAndSprayGuide || '',
        harvestWaitDays: data.harvestWaitDays || '',
        differentialDiagnosis: data.differentialDiagnosis || '',
        prevention: Array.isArray(data.prevention) ? data.prevention : [],
        audioSummary: data.audioSummary || `${data.cropName}: ${data.diseaseName}`,
      };

      const updated = await saveDiagnosis(record);
      onDiagnosesChange(updated);
      setActiveResult(record);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
        setScanError(
          lang === 'bn'
            ? 'সার্ভার থেকে উত্তর আসতে বেশি সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা ছবিটি অফলাইনে জমা রাখুন।'
            : lang === 'hi'
            ? 'सर्वर से जवाब आने में समय लग रहा है। कृपया फिर से प्रयास करें।'
            : 'Analysis request timed out. Please retry or save to the offline queue.'
        );
      } else {
        setScanError(err instanceof Error ? err.message : 'Unable to analyze leaf photo.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleListenDiagnosis = (diag: DiseaseDiagnosis) => {
    const parts = [
      `${diag.cropName} — ${diag.diseaseName}.`,
      diag.audioSummary,
      diag.immediateAction ? `${t.scanner.urgentActionTitle}: ${diag.immediateAction}` : '',
      diag.dosageAndSprayGuide ? `${t.scanner.dosageGuideTitle}: ${diag.dosageAndSprayGuide}` : '',
      diag.organicTreatment[0] ? `${t.scanner.organicTitle}: ${diag.organicTreatment[0]}` : '',
    ].filter(Boolean);

    playTrack({
      id: diag.id,
      title: `${diag.cropName} · ${diag.diseaseName}`,
      subtitle: t.scanner.severityLabels[diag.severity],
      text: parts.join(' '),
      language: diag.language,
    });
  };

  const severityMeta = (severity: DiseaseDiagnosis['severity']) => {
    if (severity === 'healthy') {
      return {
        color: 'text-emerald-800',
        bg: 'bg-emerald-50 border-emerald-200',
        icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
      };
    }
    if (severity === 'high') {
      return {
        color: 'text-red-800',
        bg: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="h-4 w-4 shrink-0" />,
      };
    }
    return {
      color: 'text-amber-800',
      bg: 'bg-amber-50 border-amber-200',
      icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    };
  };

  return (
    <section id="scanner" className="scroll-mt-20 border-b border-stone-200 bg-[#F7F8F5] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl text-balance">
            {t.scanner.sectionTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">{t.scanner.sectionSubtitle}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Camera Viewfinder + Diagnostic Context */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6 lg:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-950">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => setCameraReady(true)}
                    onCanPlay={() => setCameraReady(true)}
                    className="h-full w-full object-cover"
                  />
                  {/* Framing reticles for sharper leaf capture */}
                  <div className="pointer-events-none absolute inset-4 rounded-lg border border-dashed border-emerald-300/60" />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70 text-xs font-medium text-white">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.scanner.cameraInitializing}
                    </div>
                  )}
                </>
              ) : previewDataUrl ? (
                <>
                  <img
                    src={previewDataUrl}
                    alt="Captured crop leaf preview"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleClearPreview}
                    aria-label={t.scanner.retakePhotoBtn}
                    className="absolute right-2.5 top-2.5 inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-stone-950/75 px-2.5 py-1 text-xs font-medium text-white hover:bg-stone-950"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t.scanner.retakePhotoBtn}
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-stone-900 px-6 text-center text-stone-200">
                  <Leaf className="h-10 w-10 text-emerald-400" />
                  <p className="mt-3 text-sm font-medium">{t.scanner.photoQualityTip}</p>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="mt-3 text-xs font-medium text-amber-800">{cameraError}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2.5">
              {!cameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex min-h-[44px] flex-1 min-w-[130px] items-center justify-center gap-2 rounded-lg bg-emerald-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 text-center"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  <span>{t.scanner.startCamera}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    disabled={!cameraReady}
                    className="inline-flex min-h-[44px] flex-1 min-w-[130px] items-center justify-center gap-2 rounded-lg bg-emerald-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 text-center"
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    <span>{t.scanner.capturePhoto}</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                  >
                    <VideoOff className="h-4 w-4 shrink-0" />
                    <span>{t.scanner.stopCamera}</span>
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-[44px] flex-1 min-w-[130px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 text-center"
              >
                <Upload className="h-4 w-4 shrink-0" />
                <span>{t.scanner.uploadPhoto}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleLeaf}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 text-center"
              >
                {t.scanner.trySampleLeaf}
              </button>
            </div>

            <div className="mt-5 space-y-4 border-t border-stone-200 pt-4">
              <div>
                <label htmlFor="crop-hint-input" className="block text-xs font-semibold text-stone-700">
                  {t.scanner.cropHintLabel}
                </label>
                <input
                  id="crop-hint-input"
                  type="text"
                  value={cropHint}
                  onChange={(e) => setCropHint(e.target.value)}
                  placeholder={t.scanner.cropHintPlaceholder}
                  className="mt-1.5 w-full min-h-[42px] rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="affected-part-select" className="block text-xs font-semibold text-stone-700">
                    {t.scanner.affectedPartLabel}
                  </label>
                  <select
                    id="affected-part-select"
                    value={affectedPart}
                    onChange={(e) => setAffectedPart(e.target.value as AffectedPartKey)}
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-2.5 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {(['leaf', 'stem', 'fruit', 'root'] as const).map((part) => (
                      <option key={part} value={part}>
                        {t.scanner.affectedParts[part]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="growth-stage-select" className="block text-xs font-semibold text-stone-700">
                    {t.scanner.growthStageLabel}
                  </label>
                  <select
                    id="growth-stage-select"
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value as GrowthStageKey)}
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-stone-300 bg-white px-2.5 text-sm text-stone-900 focus:border-emerald-800 focus:outline-none"
                  >
                    {(['seedling', 'vegetative', 'flowering', 'mature'] as const).map((stage) => (
                      <option key={stage} value={stage}>
                        {t.scanner.growthStages[stage]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-700">{t.scanner.symptomTagsLabel}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.scanner.symptomTags.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleSymptomTag(tag)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'border-emerald-800 bg-emerald-900 text-white'
                            : 'border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!previewDataUrl || isAnalyzing}
                  className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isOnline ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isAnalyzing
                    ? t.scanner.analyzing
                    : isOnline
                    ? t.scanner.analyzeButton
                    : t.scanner.saveOfflineQueueBtn}
                </button>

                {previewDataUrl && isOnline && !isAnalyzing && (
                  <button
                    type="button"
                    onClick={handleSaveToOfflineQueue}
                    className="flex w-full min-h-[40px] items-center justify-center gap-2 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                  >
                    <Save className="h-3.5 w-3.5 text-emerald-900" />
                    {t.scanner.saveOfflineQueueBtn}
                  </button>
                )}
              </div>

              {!isOnline && (
                <p className="text-xs text-amber-800">{t.scanner.offlineScanNotice}</p>
              )}
              {queueNotice && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
                  {queueNotice}
                </p>
              )}
              {scanError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                  <p className="font-medium leading-relaxed">{scanError}</p>
                  {previewDataUrl && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {isOnline && (
                        <button
                          type="button"
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-red-800 px-3 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {t.scanner.retryScanBtn}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveToOfflineQueue}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 font-medium text-red-900 hover:bg-red-100/60"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {t.scanner.saveOfflineQueueBtn}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Diagnosis Report + Offline Scan Queue + Saved History */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {activeResult ? (
              <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">{activeResult.cropName}</span>
                      {activeResult.pathogenType && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-emerald-900">
                            {t.scanner.pathogenTypes[activeResult.pathogenType]}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-tabular">
                        {t.scanner.confidenceLabel}: {activeResult.confidence}%
                      </span>
                    </div>

                    <h3 className="mt-1 text-xl font-bold text-stone-900">
                      {activeResult.diseaseName}
                    </h3>
                    {activeResult.scientificName && (
                      <p className="text-xs italic text-stone-500">{activeResult.scientificName}</p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-semibold ${
                          severityMeta(activeResult.severity).bg
                        } ${severityMeta(activeResult.severity).color}`}
                      >
                        {severityMeta(activeResult.severity).icon}
                        {t.scanner.severityLabels[activeResult.severity]}
                      </span>

                      {activeResult.diseaseStage && (
                        <span className="text-stone-600">
                          <strong className="text-stone-800">{t.scanner.diseaseStageLabel}:</strong>{' '}
                          {activeResult.diseaseStage}
                        </span>
                      )}

                      {activeResult.spreadRisk && (
                        <span className="inline-flex items-center gap-1 text-stone-600">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
                          <span>
                            {t.scanner.spreadRiskLabel}: {t.scanner.spreadRiskLabels[activeResult.spreadRisk]}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleListenDiagnosis(activeResult)}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
                  >
                    <Volume2 className="h-4 w-4" />
                    {t.scanner.listenDiagnosis}
                  </button>
                </div>

                {activeResult.immediateAction && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/90 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
                      <span>{t.scanner.urgentActionTitle}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-amber-950">
                      {activeResult.immediateAction}
                    </p>
                  </div>
                )}

                {activeResult.rootCause && (
                  <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                      <Sprout className="h-4 w-4 shrink-0 text-emerald-800" />
                      <span>{t.scanner.rootCauseTitle}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-stone-700">
                      {activeResult.rootCause}
                    </p>
                  </div>
                )}

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-lg border border-stone-200 p-4">
                    <h4 className="text-sm font-semibold text-stone-900">{t.scanner.symptomsTitle}</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                      {activeResult.symptoms.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                    <h4 className="text-sm font-semibold text-emerald-950">{t.scanner.organicTitle}</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                      {activeResult.organicTreatment.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-stone-200 p-4">
                    <h4 className="text-sm font-semibold text-stone-900">{t.scanner.chemicalTitle}</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                      {activeResult.chemicalTreatment.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>

                    {activeResult.dosageAndSprayGuide && (
                      <div className="mt-3 border-t border-stone-200 pt-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                          <Droplets className="h-3.5 w-3.5 shrink-0" />
                          <span>{t.scanner.dosageGuideTitle}</span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-700">
                          {activeResult.dosageAndSprayGuide}
                        </p>
                      </div>
                    )}

                    {activeResult.harvestWaitDays && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs sm:text-sm text-stone-700">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                        <span>
                          <strong className="text-stone-900">{t.scanner.harvestWaitLabel}:</strong>{' '}
                          {activeResult.harvestWaitDays}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-stone-200 p-4">
                    <h4 className="text-sm font-semibold text-stone-900">{t.scanner.preventionTitle}</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                      {activeResult.prevention.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>

                    {activeResult.differentialDiagnosis && (
                      <div className="mt-3 border-t border-stone-200 pt-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                          <HelpCircle className="h-3.5 w-3.5 shrink-0 text-stone-600" />
                          <span>{t.scanner.lookalikeTitle}</span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                          {activeResult.differentialDiagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Queued Offline Field Photos */}
            {pendingScans.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-800" />
                    <h3 className="text-base font-bold text-amber-950">{t.scanner.queuedScansTitle}</h3>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-amber-900">
                    {pendingScans.length}
                  </span>
                </div>

                <div className="divide-y divide-amber-200/80">
                  {pendingScans.map((qItem) => (
                    <div
                      key={qItem.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-3 last:pb-0"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <img
                          src={qItem.imageDataUrl}
                          alt={qItem.cropHint || 'Queued crop photo'}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 shrink-0 rounded-lg border border-amber-300 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-stone-900 leading-snug">
                            {qItem.cropHint || t.scanner.affectedParts.leaf} · {qItem.affectedPart}
                          </div>
                          <div className="mt-0.5 text-xs text-stone-600">
                            {new Date(qItem.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleProcessQueuedScan(qItem)}
                          disabled={!isOnline || processingQueueId === qItem.id}
                          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap"
                        >
                          {processingQueueId === qItem.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {t.scanner.queuedScanNowBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQueuedScan(qItem.id)}
                          aria-label={t.scanner.deleteDiagnosisBtn}
                          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-amber-300 bg-white text-stone-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Offline Diagnosis History */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-900" />
                  <h3 className="text-base font-bold text-stone-900">{t.scanner.savedHistoryTitle}</h3>
                </div>
                <span className="font-mono-tabular text-xs text-stone-500">
                  {savedDiagnoses.length}
                </span>
              </div>

              {savedDiagnoses.length === 0 ? (
                <p className="py-6 text-sm text-stone-500">{t.scanner.noSavedHistory}</p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {savedDiagnoses.map((item) => {
                    const sev = severityMeta(item.severity);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 py-3.5 first:pt-3 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveResult(item);
                            setPreviewDataUrl(item.imageDataUrl);
                          }}
                          className="flex min-w-0 flex-1 items-start sm:items-center gap-3 text-left hover:opacity-85"
                        >
                          <img
                            src={item.imageDataUrl}
                            alt={item.diseaseName}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-stone-900 leading-snug">
                              {item.diseaseName}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                              <span>{item.cropName}</span>
                              <span aria-hidden="true">·</span>
                              <span className={`font-medium ${sev.color}`}>
                                {t.scanner.severityLabels[item.severity]}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-tabular">{item.confidence}%</span>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleListenDiagnosis(item)}
                            aria-label={t.status.listenLabel}
                            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 bg-stone-50 px-3 text-xs font-medium text-stone-800 hover:bg-stone-100 whitespace-nowrap"
                          >
                            <Volume2 className="h-4 w-4 text-emerald-900" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiagnosisRecord(item.id)}
                            aria-label={t.scanner.deleteDiagnosisBtn}
                            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
