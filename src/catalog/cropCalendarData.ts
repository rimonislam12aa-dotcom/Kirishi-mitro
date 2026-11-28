// ১২ মাসের ফসল রোপণ ও ফসল তোলার পঞ্জিকার তথ্য
import { AppLanguage, CropCalendarItem } from '../types/agri';

export const MONTH_LABELS: Record<AppLanguage, string[]> = {
  "bn": [
    "জানু",
    "ফেব্রু",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টে",
    "অক্টো",
    "নভে",
    "ডিসে"
  ],
  "hi": [
    "जन",
    "फर",
    "मार्च",
    "अप्रै",
    "मई",
    "जून",
    "जुल",
    "अग",
    "सितं",
    "अक्टू",
    "नवं",
    "दिसं"
  ],
  "en": [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ]
};

export const BANGLA_MONTH_HINTS: string[] = [
  "পৌষ–মাঘ",
  "মাঘ–ফাল্গুন",
  "ফাল্গুন–চৈত্র",
  "চৈত্র–বৈশাখ",
  "বৈশাখ–জ্যৈষ্ঠ",
  "জ্যৈষ্ঠ–আষাঢ়",
  "আষাঢ়–শ্রাবণ",
  "শ্রাবণ–ভাদ্র",
  "ভাদ্র–আশ্বিন",
  "আশ্বিন–কার্তিক",
  "কার্তিক–অগ্রহায়ণ",
  "অগ্রহায়ণ–পৌষ"
];

export const CROP_CALENDAR_DATA: CropCalendarItem[] = [
  {
    "id": "cal-boro-rice",
    "cropName": {
      "bn": "বোরো ধান",
      "hi": "बोरो धान",
      "en": "Boro Rice (Winter Paddy)"
    },
    "variety": {
      "bn": "ব্রি ধান-২৮, ২৯, ৮৯ ও ৯২",
      "hi": "BRRI-28, 29, 89",
      "en": "BRRI Dhan-28, 29, 89 & 92"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি / বোরো",
      "hi": "रबी / बोरो",
      "en": "Rabi / Boro"
    },
    "plantingMonths": [
      11,
      12,
      1,
      2
    ],
    "harvestMonths": [
      4,
      5
    ],
    "plantingWindowText": {
      "bn": "বীজতলা: ১৫ নভে – ১৫ ডিসে | মূল জমি রোপণ: ডিসে – মধ্য ফেব্রু",
      "hi": "नर्सरी: 15 नव – 15 दिस | रोपाई: दिस – मध्य फर",
      "en": "Seedbed: mid Nov–mid Dec | Transplant: Dec–mid Feb"
    },
    "harvestWindowText": {
      "bn": "মধ্য এপ্রিল – মে (বৈশাখ – জ্যৈষ্ঠ)",
      "hi": "मध्य अप्रैल – मई",
      "en": "Mid April – May (Boishakh – Joishtho)"
    },
    "durationDaysMin": 110,
    "durationDaysMax": 125,
    "soilAndPh": {
      "bn": "এঁটেল ও দোআঁশ মাটি (pH 5.5–6.8)",
      "hi": "दोमट व चिकनी मिट्टी (pH 5.5–6.8)",
      "en": "Clay to Clay-Loam (pH 5.5–6.8)"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ২০ সে.মি. × চারা ১৫ সে.মি. | বীজ: ৩–৪ কেজি/বিঘা",
      "hi": "कतार 20 सेमी × पौधा 15 सेमी | बीज: 3-4 किग्रा/बीघा",
      "en": "20×15 cm spacing | Seed: 3–4 kg per 33-dec Bigha"
    },
    "milestones": [
      {
        "dayOffset": 15,
        "title": {
          "bn": "চারা স্থাপন ও আগাছা পরিষ্কার",
          "hi": "पौध स्थापना व निराई",
          "en": "Establishment & First Weeding"
        },
        "action": {
          "bn": "জমিতে ২–৩ ইঞ্চি পানি ধরে রাখুন এবং নিড়ানি দিয়ে আগাছা পরিষ্কার করুন।",
          "hi": "खेत में 2-3 इंच पानी रखें और पहली निराई करें।",
          "en": "Maintain 2–3 inches of standing water and perform first hand weeding."
        }
      },
      {
        "dayOffset": 35,
        "title": {
          "bn": "কুশি পর্যায় (১ম/২য় ইউরিয়া কিস্তি)",
          "hi": "कल्ले निकलना (यूरिया किस्त)",
          "en": "Active Tillering Top-Dress"
        },
        "action": {
          "bn": "বিঘাপ্রতি ৬–৭ কেজি ইউরিয়া প্রয়োগ করুন ও পাতা সবুজ আছে কি না দেখুন।",
          "hi": "प्रति बीघा 6-7 किग्रा यूरिया डालें और कीट निगरानी करें।",
          "en": "Apply split Urea top-dressing (~6–7 kg/bigha) and scout for stem borer."
        }
      },
      {
        "dayOffset": 85,
        "title": {
          "bn": "থোড় ও ফুল আসা (অত্যন্ত সংবেদনশীল)",
          "hi": "बालियां निकलना व फूल आना",
          "en": "Panicle Initiation & Flowering"
        },
        "action": {
          "bn": "জমিতে অবশ্যই ছিপছিপে পানি রাখুন; পানির অভাবে চিটা হতে পারে।",
          "hi": "खेत में हल्की नमी/पानी बनाए रखें ताकि दाने खाली न रहें।",
          "en": "Keep fields moist/shallow-flooded; moisture stress now reduces grain fill."
        }
      },
      {
        "dayOffset": 115,
        "title": {
          "bn": "ফসল কর্তন উপযুক্ত সময় (রোপণ থেকে ১১০–১২৫ দিন)",
          "hi": "कटाई का सही समय (रोपाई से 110-125 दिन)",
          "en": "Optimal Harvest Window (110–125 DAT)"
        },
        "action": {
          "bn": "মূল জমিতে রোপণের ১১০–১২৫ দিনে (বীজতলাসহ মোট ১৪০–১৫৫ দিনে) শীষের ৮০% ধান সোনালি পাকলে কেটে মাড়াই ও রোদে শুকান।",
          "hi": "रोपाई के 110-125 दिन बाद 80% बालियां सुनहरी होने पर कटाई करें और धूप में अच्छी तरह सुखाएं।",
          "en": "At 110–125 days after transplanting (140–155d seed-to-seed), harvest once 80% panicles turn golden yellow; dry to 12–14% moisture."
        }
      }
    ]
  },
  {
    "id": "cal-aman-rice",
    "cropName": {
      "bn": "রোপা আমন ধান",
      "hi": "अमन धान",
      "en": "Transplanted Aman Rice"
    },
    "variety": {
      "bn": "ব্রি ধান-৪৯, ৭৫, ৮৭ ও ১০৩",
      "hi": "BRRI-49, 75, 87",
      "en": "BRRI Dhan-49, 75, 87 & 103"
    },
    "seasonKey": "kharif2",
    "seasonLabel": {
      "bn": "খরিফ-২ / বর্ষা",
      "hi": "खरीफ-2 / मानसून",
      "en": "Kharif-2 / Monsoon"
    },
    "plantingMonths": [
      6,
      7,
      8
    ],
    "harvestMonths": [
      11,
      12
    ],
    "plantingWindowText": {
      "bn": "বীজতলা: জুন – জুলাই | রোপণ: জুলাই – মধ্য আগস্ট (আষাঢ় – শ্রাবণ)",
      "hi": "नर्सरी: जून-जुलाई | रोपाई: जुलाई – मध्य अगस्त",
      "en": "Seedbed: Jun–Jul | Transplant: Jul–mid Aug"
    },
    "harvestWindowText": {
      "bn": "নভেম্বর – মধ্য ডিসেম্বর (অগ্রহায়ণ – পৌষ)",
      "hi": "नवंबर – मध्य दिसंबर",
      "en": "November – mid December (Ogrohayon)"
    },
    "durationDaysMin": 90,
    "durationDaysMax": 110,
    "soilAndPh": {
      "bn": "মাঝারি উঁচু ও মাঝারি নিচু দোআঁশ জমি",
      "hi": "मध्यम दोमट व चिकनी मिट्टी",
      "en": "Medium high to medium low loam"
    },
    "spacingAndSeedRate": {
      "bn": "২০×১৫ সে.মি. | বীজ: ৩–৪ কেজি/বিঘা",
      "hi": "20×15 सेमी | बीज: 3-4 किग्रा/बीघा",
      "en": "20×15 cm spacing | Seed: 3–4 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 15,
        "title": {
          "bn": "চারা গায়ে জোর ধরা ও আগাছা দমন",
          "hi": "पौध जमना व निराई",
          "en": "Rooting & Weed Control"
        },
        "action": {
          "bn": "প্রথম কিস্তি ইউরিয়া (৫–৬ কেজি/বিঘা) প্রয়োগ করে মাটির সাথে মিশিয়ে দিন।",
          "hi": "पहली यूरिया किस्त (5-6 किग्रा/बीघा) डालकर निराई करें।",
          "en": "Weed cleanly and apply first split Urea (5–6 kg/bigha)."
        }
      },
      {
        "dayOffset": 40,
        "title": {
          "bn": "সর্বোচ্চ কুশি পর্যায়",
          "hi": "अधिकतम कल्ले अवस्था",
          "en": "Maximum Tillering"
        },
        "action": {
          "bn": "পার্চিং (পাখি বসার ডাল) স্থাপন করুন ও পাতা মোড়ানো পোকা পর্যবেক্ষণ করুন।",
          "hi": "खेत में पक्षी बैठने के लिए डंडे लगाएं व कीट जांच करें।",
          "en": "Install bird perches across field and monitor for leaf-folder."
        }
      },
      {
        "dayOffset": 75,
        "title": {
          "bn": "থোড় ও শীষ বের হওয়া",
          "hi": "गभोट व बाली निकलना",
          "en": "Booting & Heading"
        },
        "action": {
          "bn": "খরা হলে সম্পূরক সেচ দিন; ব্লাস্ট বা বাদামী দাগ হলে ছত্রাকনাশক ব্যবস্থা নিন।",
          "hi": "सूखा पड़ने पर सिंचाई करें और ब्लास्ट रोग की जांच करें।",
          "en": "Provide supplemental irrigation if dry; inspect panicles for neck blast."
        }
      },
      {
        "dayOffset": 95,
        "title": {
          "bn": "অগ্রহায়ণের ফসল কাটা (রোপণ থেকে ৯০–১১০ দিন)",
          "hi": "कटाई अवस्था (रोपाई से 90-110 दिन)",
          "en": "Harvest Maturity (90–110 DAT)"
        },
        "action": {
          "bn": "রোপণের ৯০–১১০ দিনে (বীজতলাসহ ১১৫–১৩৫ দিনে) ও কাটার ৭–১০ দিন আগে পানি সরিয়ে ৮০% পাকলে কেটে নিন।",
          "hi": "कटाई से 7-10 दिन पहले पानी निकालें और रोपाई के 90-110 दिन बाद 80% पकने पर काटें।",
          "en": "Drain field 7–10 days before cutting; harvest at 90–110 DAT when 80% panicles turn golden."
        }
      }
    ]
  },
  {
    "id": "cal-aus-rice",
    "cropName": {
      "bn": "আউশ ধান",
      "hi": "औस धान",
      "en": "Aus Rice (Pre-Monsoon)"
    },
    "variety": {
      "bn": "ব্রি ধান-৪৮, ৮২ ও ৯৮",
      "hi": "BRRI-48, 82, 98",
      "en": "BRRI Dhan-48, 82 & 98"
    },
    "seasonKey": "kharif1",
    "seasonLabel": {
      "bn": "খরিফ-১ / গ্রীষ্ম",
      "hi": "जायद / प्री-मानसून",
      "en": "Kharif-1 / Summer"
    },
    "plantingMonths": [
      3,
      4,
      5
    ],
    "harvestMonths": [
      7,
      8
    ],
    "plantingWindowText": {
      "bn": "মার্চ – মে (চৈত্র – জ্যৈষ্ঠ)",
      "hi": "मार्च – मई",
      "en": "March – May (Choitro – Joishtho)"
    },
    "harvestWindowText": {
      "bn": "জুলাই – আগস্ট (আষাঢ় – শ্রাবণ)",
      "hi": "जुलाई – अगस्त",
      "en": "July – August (Asharh – Srabon)"
    },
    "durationDaysMin": 95,
    "durationDaysMax": 112,
    "soilAndPh": {
      "bn": "উঁচু ও মাঝারি উঁচু বেলে-দোআঁশ জমি",
      "hi": "ऊंची व मध्यम बलुई-दोमट मिट्टी",
      "en": "High & medium-high sandy loam"
    },
    "spacingAndSeedRate": {
      "bn": "রোপা ২০×১৫ সে.মি. | বীজ: ৪ কেজি/বিঘা",
      "hi": "20×15 सेमी | बीज: 4 किग्रा/बीघा",
      "en": "20×15 cm spacing | Seed: 4 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 15,
        "title": {
          "bn": "আগাছা দমন ও প্রথম সার",
          "hi": "निराई व पहली खाद",
          "en": "Early Weeding & Nitrogen"
        },
        "action": {
          "bn": "আউশে আগাছা বেশি হয়—রোপণের ১৫–২০ দিনে আগাছা পরিষ্কার করুন।",
          "hi": "15-20 दिन में अच्छी निराई करें।",
          "en": "Remove weeds thoroughly at 15–20 days after planting."
        }
      },
      {
        "dayOffset": 35,
        "title": {
          "bn": "কুশি ও থোড় প্রস্তুতি",
          "hi": "कल्ले व गभोट तैयारी",
          "en": "Tillering Stage"
        },
        "action": {
          "bn": "শেষ কিস্তি ইউরিয়া প্রয়োগ করে বৃষ্টির পানি ধরে রাখুন।",
          "hi": "अंतिम यूरिया डालें और नमी बचाएं।",
          "en": "Apply final urea split and conserve rainwater in bunds."
        }
      },
      {
        "dayOffset": 65,
        "title": {
          "bn": "শীষ বের হওয়া",
          "hi": "बाली निकलना",
          "en": "Heading & Flowering"
        },
        "action": {
          "bn": "গান্ধি পোকা বা মাজরা পোকার আক্রমণ থাকলে ব্যবস্থা নিন।",
          "hi": "गंधी बग व तना छेदक की निगरानी करें।",
          "en": "Scout for rice bug during milk stage."
        }
      },
      {
        "dayOffset": 100,
        "title": {
          "bn": "আউশ ফসল সংগ্রহ",
          "hi": "कटाई समय",
          "en": "Aus Harvest"
        },
        "action": {
          "bn": "বর্ষার বৃষ্টির মধ্যেই পাকা ধান কেটে শুকনো জায়গায় সংরক্ষণ করুন।",
          "hi": "पकने पर तुरंत काटकर सूखे स्थान पर सुखाएं।",
          "en": "Harvest promptly before monsoon downpours and store dry."
        }
      }
    ]
  },
  {
    "id": "cal-potato",
    "cropName": {
      "bn": "আলু",
      "hi": "आलू",
      "en": "Potato (Winter)"
    },
    "variety": {
      "bn": "বারি আলু-৭ (ডায়মন্ড), ২৫ (অ্যাস্টেরিক্স)",
      "hi": "डायमंड, कार्डिनल, कुफरी",
      "en": "BARI Alu-7 (Diamant), Asterix"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি / শীতকালীন",
      "hi": "रबी / सर्दी",
      "en": "Rabi / Winter"
    },
    "plantingMonths": [
      11,
      12
    ],
    "harvestMonths": [
      2,
      3
    ],
    "plantingWindowText": {
      "bn": "নভেম্বর – মধ্য ডিসেম্বর (কার্তিক – অগ্রহায়ণ)",
      "hi": "नवंबर – मध्य दिसंबर",
      "en": "November – mid December (Kartik – Ogrohayon)"
    },
    "harvestWindowText": {
      "bn": "ফেব্রুয়ারি – মার্চ (মাঘ – ফাল্গুন)",
      "hi": "फरवरी – मार्च",
      "en": "February – March (Magh – Falgun)"
    },
    "durationDaysMin": 85,
    "durationDaysMax": 95,
    "soilAndPh": {
      "bn": "পানি নিষ্কাশনযুক্ত বেলে-দোআঁশ (pH 5.5–6.5)",
      "hi": "बलुई-दोमट मिट्टी (pH 5.5–6.5)",
      "en": "Well-drained sandy loam (pH 5.5–6.5)"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ৬০ সে.মি. × আলু ২৫ সে.মি. | বীজ: ২০০–২৩০ কেজি/বিঘা",
      "hi": "कतार 60 सेमी × आलू 25 सेमी | बीज: 200 किग्रा/बीघा",
      "en": "60×25 cm ridges | Seed tuber: 200–230 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 25,
        "title": {
          "bn": "প্রথম সেচ ও মাটি তোলা",
          "hi": "पहली सिंचाई व मिट्टी चढ़ाना",
          "en": "First Earthing-Up & Irrigation"
        },
        "action": {
          "bn": "বাকি অর্ধেক ইউরিয়া প্রয়োগ করে সারির গোড়ায় মাটি উঁচু করে তুলে দিন।",
          "hi": "बचा यूरिया डालकर मेड़ों पर मिट्टी चढ़ाएं।",
          "en": "Side-dress remaining nitrogen and earth up soil ridges."
        }
      },
      {
        "dayOffset": 45,
        "title": {
          "bn": "২য় মাটি তোলা ও মড়ক নজরদারি",
          "hi": "दूसरी मिट्टी व झुलसा निगरानी",
          "en": "Tuber Bulking & Blight Watch"
        },
        "action": {
          "bn": "ঘন কুয়াশায় আলুর লেইট ব্লাইট (মড়ক) রোধে পাতা পরীক্ষা ও প্রতিরোধক স্প্রে করুন।",
          "hi": "कोहरे में पछेती झुलसा रोग की नियमित जांच करें।",
          "en": "Inspect leaves during dense fog for dark late-blight lesions."
        }
      },
      {
        "dayOffset": 75,
        "title": {
          "bn": "সেচ বন্ধ ও হাম-কাটিং প্রস্তুতি",
          "hi": "सिंचाई बंद करना",
          "en": "Cut-off Irrigation & Skin Set"
        },
        "action": {
          "bn": "তোলার ১০–১২ দিন আগে সেচ বন্ধ করুন ও গাছ কেটে দিয়ে খোসা শক্ত হতে দিন।",
          "hi": "खुदाई से 10 दिन पहले सिंचाई बंद कर बेल काट दें।",
          "en": "Stop irrigation 10–12 days pre-harvest and cut haulms to harden skin."
        }
      },
      {
        "dayOffset": 90,
        "title": {
          "bn": "আলু উত্তোলন",
          "hi": "आलू खुदाई",
          "en": "Potato Harvest"
        },
        "action": {
          "bn": "রৌদ্রোজ্জ্বল দিনে আলু তুলে ছায়ায় বাছাই করে শুকনো ঘরে বা হিমাগারে রাখুন।",
          "hi": "साफ मौसम में खुदाई कर छांव में सुखाएं व भंडारण करें।",
          "en": "Dig tubers on dry days, cure in shade, and grade before cold storage."
        }
      }
    ]
  },
  {
    "id": "cal-wheat",
    "cropName": {
      "bn": "গম",
      "hi": "गेहूं",
      "en": "Wheat"
    },
    "variety": {
      "bn": "বারি গম-৩০, ৩২ ও ৩৩ (তাপসহিষ্ণু)",
      "hi": "BARI-30, 33 / HD-2967",
      "en": "BARI Gom-30, 32 & 33"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "plantingMonths": [
      11,
      12
    ],
    "harvestMonths": [
      3,
      4
    ],
    "plantingWindowText": {
      "bn": "১৫ নভেম্বর – ৭ ডিসেম্বর (নাবী রোপণ এড়িয়ে চলুন)",
      "hi": "15 नवंबर – 7 दिसंबर",
      "en": "15 Nov – 7 Dec (avoid late sowing)"
    },
    "harvestWindowText": {
      "bn": "মধ্য মার্চ – প্রথম সপ্তাহ এপ্রিল (চৈত্র)",
      "hi": "मध्य मार्च – अप्रैल प्रथम सप्ताह",
      "en": "Mid March – early April"
    },
    "durationDaysMin": 105,
    "durationDaysMax": 115,
    "soilAndPh": {
      "bn": "উঁচু ও মাঝারি উঁচু দোআঁশ মাটি",
      "hi": "दोमट व मटियार दोमट मिट्टी",
      "en": "High & medium-high loam"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ২০ সে.মি. | বীজ: ১৬ কেজি/বিঘা",
      "hi": "कतार 20 सेमी | बीज: 16 किग्रा/बीघा",
      "en": "20 cm row drill | Seed: 16 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 20,
        "title": {
          "bn": "CRI পর্যায়ে প্রথম সেচ ও ইউরিয়া",
          "hi": "ताज जड़ अवस्था (पहली सिंचाई)",
          "en": "Crown Root Initiation (CRI)"
        },
        "action": {
          "bn": "রোপণের ১৭–২১ দিনের মধ্যে প্রথম হালকা সেচ ও শেষ কিস্তি ইউরিয়া দিন।",
          "hi": "17-21 दिन में पहली सिंचाई और बचा यूरिया दें।",
          "en": "Apply critical first irrigation and final nitrogen top-dress at 17–21 days."
        }
      },
      {
        "dayOffset": 55,
        "title": {
          "bn": "শীষ বের হওয়ার পর্যায় (২য় সেচ)",
          "hi": "बालियां निकलना (दूसरी सिंचाई)",
          "en": "Heading Stage (2nd Irrigation)"
        },
        "action": {
          "bn": "শীষ বের হওয়ার সময় দ্বিতীয় সেচ দিন এবং গমের ব্লাস্ট রোগ পরীক্ষা করুন।",
          "hi": "फूल आने से पहले दूसरी सिंचाई करें।",
          "en": "Irrigate lightly at heading and inspect spikes for wheat blast."
        }
      },
      {
        "dayOffset": 75,
        "title": {
          "bn": "দানা দুধ আসা পর্যায় (৩য় সেচ)",
          "hi": "दाने भरने की अवस्था",
          "en": "Grain Milk Stage"
        },
        "action": {
          "bn": "বাতাস না থাকলে হালকা সেচ দিলে গমের দানা পুষ্ট ও ওজনদার হয়।",
          "hi": "शांत हवा में हल्की सिंचाई करने से दाने पुष्ट बनते हैं।",
          "en": "Give light irrigation on calm days for plump grain filling."
        }
      },
      {
        "dayOffset": 110,
        "title": {
          "bn": "গম কাটা ও মাড়াই",
          "hi": "कटाई व थ्रेसिंग",
          "en": "Wheat Harvest"
        },
        "action": {
          "bn": "গাছ ও শীষ সম্পূর্ণ হলদে হয়ে দানা শক্ত হলে কেটে ভালোভাবে রোদে শুকান।",
          "hi": "पौधे सुनहरे व दाने सख्त होने पर कटाई करें।",
          "en": "Harvest when straw yellows and grain is hard; sun-dry before storage."
        }
      }
    ]
  },
  {
    "id": "cal-mustard",
    "cropName": {
      "bn": "সরিষা",
      "hi": "सरसों",
      "en": "Mustard / Rapeseed"
    },
    "variety": {
      "bn": "বারি সরিষা-১৪, ১৭, ১৮ ও টরি-৭",
      "hi": "BARI-14, 17, 18 / पूसा बोल्ड",
      "en": "BARI Sarisha-14, 17, 18"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "plantingMonths": [
      10,
      11
    ],
    "harvestMonths": [
      1,
      2
    ],
    "plantingWindowText": {
      "bn": "মধ্য অক্টোবর – মধ্য নভেম্বর (কার্তিক – অগ্রহায়ণ)",
      "hi": "मध्य अक्टूबर – मध्य नवंबर",
      "en": "Mid October – mid November"
    },
    "harvestWindowText": {
      "bn": "মধ্য জানুয়ারি – ফেব্রুয়ারি (মাঘ – ফাল্গুন)",
      "hi": "मध्य जनवरी – फरवरी",
      "en": "Mid January – February"
    },
    "durationDaysMin": 80,
    "durationDaysMax": 90,
    "soilAndPh": {
      "bn": "দোআঁশ ও বেলে-দোআঁশ মাটি (জলাবদ্ধতা সহ্য করে না)",
      "hi": "बलुई-दोमट मिट्टी",
      "en": "Loam to sandy loam (zero waterlogging)"
    },
    "spacingAndSeedRate": {
      "bn": "ছিটানো বা ৩০ সে.মি. সারি | বীজ: ৮০০–৯০০ গ্রাম/বিঘা",
      "hi": "30 सेमी कतार | बीज: 800-900 ग्राम/बीघा",
      "en": "30 cm rows | Seed: 800–900 g/bigha"
    },
    "milestones": [
      {
        "dayOffset": 15,
        "title": {
          "bn": "চারা পাতলা করা ও আগাছা পরিষ্কার",
          "hi": "पौधे विरल करना व निराई",
          "en": "Thinning & First Weeding"
        },
        "action": {
          "bn": "ঘন চারা তুলে পাতলা করে দিন এবং প্রথম হালকা সেচ দিন (রোপণের ২০–২৫ দিনে)।",
          "hi": "अतिरिक्त पौधे हटाएं और 20-25 दिन पर हल्की सिंचाई करें।",
          "en": "Thin crowded seedlings and give light irrigation around day 20–25."
        }
      },
      {
        "dayOffset": 38,
        "title": {
          "bn": "ফুল আসা ও মৌমাছি সুরক্ষা",
          "hi": "फूल अवस्था व मधुमक्खी सुरक्षा",
          "en": "Full Bloom & Pollinator Care"
        },
        "action": {
          "bn": "ফুলের সময় কখনোই সকালে স্প্রে করবেন না; জাব পোকা থাকলে বিকেলে নিম তেল দিন।",
          "hi": "फूल के समय सुबह छिड़काव न करें; माहू के लिए शाम को नीम तेल दें।",
          "en": "Avoid morning sprays during bloom; apply neem oil late afternoon only if aphids appear."
        }
      },
      {
        "dayOffset": 60,
        "title": {
          "bn": "শুঁটি বা ফল গঠন (২য় সেচ)",
          "hi": "फलियां बनना",
          "en": "Pod Formation"
        },
        "action": {
          "bn": "শুঁটি গঠনের সময় মাটি শুকনো থাকলে একটি হালকা সেচ দিন।",
          "hi": "नमी कम होने पर फलियां भरते समय हल्की सिंचाई करें।",
          "en": "Irrigate lightly if soil is dry during pod filling."
        }
      },
      {
        "dayOffset": 85,
        "title": {
          "bn": "সরিষা কাটা (৭৫–৮০% শুঁটি হলুদ)",
          "hi": "कटाई (75-80% फलियां पीली)",
          "en": "Harvest Timing"
        },
        "action": {
          "bn": "৭৫–৮০% শুঁটি খড়ের রঙ ধারণ করলে সকালের দিকে কেটে মাড়াই করুন (নইলে বীজ ঝরবে)।",
          "hi": "75-80% फलियां पीली पड़ने पर सुबह कटाई करें ताकि दाने न झड़ें।",
          "en": "Harvest early morning when 75–80% of pods turn yellow to prevent shattering."
        }
      }
    ]
  },
  {
    "id": "cal-maize",
    "cropName": {
      "bn": "ভুট্টা (রবি)",
      "hi": "मक्का (रबी)",
      "en": "Maize / Corn (Rabi)"
    },
    "variety": {
      "bn": "বারি হাইব্রিড ভুট্টা-৯, ১৬ ও ১৭",
      "hi": "BARI हाइब्रिड मक्का-9, 16",
      "en": "BARI Hybrid Maize-9, 16 & 17"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "plantingMonths": [
      11,
      12
    ],
    "harvestMonths": [
      3,
      4,
      5
    ],
    "plantingWindowText": {
      "bn": "নভেম্বর – মধ্য ডিসেম্বর",
      "hi": "नवंबर – मध्य दिसंबर",
      "en": "November – mid December"
    },
    "harvestWindowText": {
      "bn": "শেষ মার্চ – মে (চৈত্র – জ্যৈষ্ঠ)",
      "hi": "मार्च अंत – मई",
      "en": "Late March – May"
    },
    "durationDaysMin": 130,
    "durationDaysMax": 145,
    "soilAndPh": {
      "bn": "উর্বর দোআঁশ ও বেলে-দোআঁশ জমি",
      "hi": "उपजाऊ दोमट मिट्टी",
      "en": "Fertile well-drained loam"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ৬০ সে.মি. × গাছ ২০ সে.মি. | বীজ: ২.৫–৩ কেজি/বিঘা",
      "hi": "60×20 सेमी | बीज: 2.5-3 किग्रा/बीघा",
      "en": "60×20 cm | Seed: 2.5–3 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 25,
        "title": {
          "bn": "হাঁটু সমান উচ্চতা (১ম সার ও সেচ)",
          "hi": "घुटने तक ऊंचाई (पहली खाद)",
          "en": "Knee-High Stage"
        },
        "action": {
          "bn": "সারির পাশে ইউরিয়া প্রয়োগ করে হালকা সেচ ও গোড়ায় মাটি তুলে দিন।",
          "hi": "यूरिया डालकर सिंचाई करें और मिट्टी चढ़ाएं।",
          "en": "Side-dress nitrogen, irrigate lightly, and earth up."
        }
      },
      {
        "dayOffset": 60,
        "title": {
          "bn": "পুরুষ ফুল ও মোচা বের হওয়া",
          "hi": "मंजर व भुट्टा निकलना",
          "en": "Tasseling & Silking"
        },
        "action": {
          "bn": "এই পর্যায়ে পানির অভাব হতে দেবেন না এবং ফল আর্মিওয়ার্ম পোকা পরীক্ষা করুন।",
          "hi": "फूल व सिल्क आते समय सिंचाई दें और कीट जांचें।",
          "en": "Avoid moisture stress and check whorls for fall armyworm."
        }
      },
      {
        "dayOffset": 95,
        "title": {
          "bn": "মোচায় দানা শক্ত হওয়া",
          "hi": "दाना भराव अवस्था",
          "en": "Grain Filling"
        },
        "action": {
          "bn": "জলাবদ্ধতা হলে পানি নিষ্কাশন করুন; বাতাসে গাছ হেলে পড়লে খুঁটি দিন।",
          "hi": "जलभराव न होने दें व हवा से गिरते पौधों को सहारा दें।",
          "en": "Maintain drainage and support lodged stalks."
        }
      },
      {
        "dayOffset": 138,
        "title": {
          "bn": "মোচা সংগ্রহ (কালো দাগ পরীক্ষা)",
          "hi": "भुट्टा कटाई",
          "en": "Maize Harvest"
        },
        "action": {
          "bn": "মোচার খোসা খড়ের মতো শুকিয়ে দানার গোড়ায় কালো দাগ (Black Layer) পড়লে সংগ্রহ করুন।",
          "hi": "भुट्टे का छिलका सूखने पर कटाई करें और दाने सुखाएं।",
          "en": "Harvest when husks dry straw-brown and kernels show black abscission layer."
        }
      }
    ]
  },
  {
    "id": "cal-tomato",
    "cropName": {
      "bn": "টমেটো (শীতকালীন)",
      "hi": "टमाटर (सर्दियों का)",
      "en": "Tomato (Winter)"
    },
    "variety": {
      "bn": "বারি টমেটো-১৪, ১৫, ১৯ ও হাইব্রিড",
      "hi": "BARI-14, 15 / पूसा रूबी",
      "en": "BARI Tomato-14, 15 & Hybrids"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি / শীতকালীন",
      "hi": "रबी / सर्दी",
      "en": "Rabi / Winter"
    },
    "plantingMonths": [
      10,
      11
    ],
    "harvestMonths": [
      1,
      2,
      3
    ],
    "plantingWindowText": {
      "bn": "বীজতলা: সেপ্টেম্বর | চারা রোপণ: অক্টোবর – নভেম্বর",
      "hi": "नर्सरी: सितंबर | रोपाई: अक्टूबर – नवंबर",
      "en": "Seedbed: Sep | Transplant: Oct – Nov"
    },
    "harvestWindowText": {
      "bn": "জানুয়ারি – মার্চ (পৌষ – চৈত্র)",
      "hi": "जनवरी – मार्च",
      "en": "January – March"
    },
    "durationDaysMin": 85,
    "durationDaysMax": 110,
    "soilAndPh": {
      "bn": "উঁচু বেলে-দোআঁশ জমি (pH 6.0–7.0)",
      "hi": "बलुई-दोमट मिट्टी (pH 6.0–7.0)",
      "en": "Raised sandy loam (pH 6.0–7.0)"
    },
    "spacingAndSeedRate": {
      "bn": "৬০×৪০ সে.মি. | বীজ: ৩০–৩৫ গ্রাম/বিঘা",
      "hi": "60×40 सेमी | बीज: 30-35 ग्राम/बीघा",
      "en": "60×40 cm | Seed: 30–35 g/bigha"
    },
    "milestones": [
      {
        "dayOffset": 20,
        "title": {
          "bn": "বাঁশের খুঁটি স্থাপন ও গোড়া ছাঁটাই",
          "hi": "सहारा देना व निचले पत्ते हटाना",
          "en": "Bamboo Staking & Lower Pruning"
        },
        "action": {
          "bn": "প্রতি গাছে বাঁশের খুঁটি দিন ও মাটি থেকে ৬ ইঞ্চি নিচের পাতা ছেঁটে দিন।",
          "hi": "पौधों को बांस से बांधें और निचले पत्ते हटाएं।",
          "en": "Stake plants cleanly and prune bottom 6 inches of foliage."
        }
      },
      {
        "dayOffset": 40,
        "title": {
          "bn": "ফুল ও প্রথম ফল ধরা",
          "hi": "फूल व फल सेट होना",
          "en": "Flowering & Fruit Set"
        },
        "action": {
          "bn": "প্রতি লিটার পানিতে ১ গ্রাম বোরন স্প্রে করলে ফুল ঝরা কমে ও ফল ভালো ধরে।",
          "hi": "1 ग्राम/लीटर बोरॉन छिड़काव से फूल झड़ना रुकता है।",
          "en": "Foliar Boron (1g/L) supports fruit set; place pheromone traps for borers."
        }
      },
      {
        "dayOffset": 70,
        "title": {
          "bn": "প্রথম পাকা ফল তোলা শুরু",
          "hi": "पहली तुड़ाई शुरू",
          "en": "First Picking Begins"
        },
        "action": {
          "bn": "রঙ ধরার শুরুতে (Breaker stage) অথবা সম্পূর্ণ পাকা টমেটো সাবধানে সংগ্রহ করুন।",
          "hi": "हल्का लाल होने पर या पूरी तरह पकने पर तुड़ाई शुरू करें।",
          "en": "Pick at breaker stage for storage or full red for fresh use."
        }
      },
      {
        "dayOffset": 105,
        "title": {
          "bn": "ধারাবাহিক সংগ্রহ সমাপ্তি",
          "hi": "नियमित तुड़ाई पूर्ण",
          "en": "Peak & Late Harvest"
        },
        "action": {
          "bn": "প্রতি ৪–৫ দিন পরপর তোলা চালিয়ে যান ও রোগাক্রান্ত ফল সরিয়ে ফেলুন।",
          "hi": "हर 4-5 दिन में तुड़ाई करें व खराब फल हटाएं।",
          "en": "Pick every 4–5 days and remove diseased fruits immediately."
        }
      }
    ]
  },
  {
    "id": "cal-onion",
    "cropName": {
      "bn": "পেঁয়াজ (হালি/চারা)",
      "hi": "प्याज़ (रबी)",
      "en": "Onion (Rabi Transplant)"
    },
    "variety": {
      "bn": "বারি পেঁয়াজ-১, ৪ ও তাহিরপুরী",
      "hi": "BARI-1 / नासिक रेड",
      "en": "BARI Piaz-1, 4 & Taherpuri"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "plantingMonths": [
      12,
      1
    ],
    "harvestMonths": [
      3,
      4
    ],
    "plantingWindowText": {
      "bn": "ডিসেম্বর – মধ্য জানুয়ারি (পৌষ)",
      "hi": "दिसंबर – मध्य जनवरी",
      "en": "December – mid January"
    },
    "harvestWindowText": {
      "bn": "মধ্য মার্চ – এপ্রিল (চৈত্র – বৈশাখ)",
      "hi": "मध्य मार्च – अप्रैल",
      "en": "Mid March – April"
    },
    "durationDaysMin": 95,
    "durationDaysMax": 115,
    "soilAndPh": {
      "bn": "উর্বর দোআঁশ ও পলি-দোআঁশ জমি",
      "hi": "उपजाऊ दोमट व जलोढ़ मिट्टी",
      "en": "Fertile alluvial silt loam"
    },
    "spacingAndSeedRate": {
      "bn": "১৫×১০ সে.মি. | বীজ: ৫০০–৬০০ গ্রাম/বিঘা",
      "hi": "15×10 सेमी | बीज: 500-600 ग्राम/बीघा",
      "en": "15×10 cm | Seed: 500–600 g/bigha"
    },
    "milestones": [
      {
        "dayOffset": 25,
        "title": {
          "bn": "প্রথম নিড়ানি ও ইউরিয়া উপরি প্রয়োগ",
          "hi": "निराई व यूरिया छिड़काव",
          "en": "Weeding & Nitrogen Split"
        },
        "action": {
          "bn": "আগাছা পরিষ্কার করে ইউরিয়া ও পটাশ উপরি প্রয়োগ করুন।",
          "hi": "निराई करके यूरिया और पोटाश डालें।",
          "en": "Weed gently without disturbing shallow roots and apply nitrogen."
        }
      },
      {
        "dayOffset": 55,
        "title": {
          "bn": "কন্দ গঠন ও থ্রিপস দমন",
          "hi": "कंद बनना व थ्रिप्स नियंत्रण",
          "en": "Bulb Initiation & Thrips Care"
        },
        "action": {
          "bn": "পাতায় সাদা দাগ (থ্রিপস) বা পার্পল ব্লচ দেখলে অনুমোদিত স্প্রে দিন।",
          "hi": "थ्रिप्स या बैंगनी धब्बा दिखने पर बचाव छिड़काव करें।",
          "en": "Watch for thrips silvering and purple blotch; maintain uniform moisture."
        }
      },
      {
        "dayOffset": 85,
        "title": {
          "bn": "সেচ বন্ধ করা",
          "hi": "सिंचाई बंद करना",
          "en": "Pre-Harvest Drying"
        },
        "action": {
          "bn": "তোলার ১৫ দিন আগে সেচ বন্ধ করে দিন যাতে পেঁয়াজ ভালোভাবে কিউরিং হয় ও পচে না।",
          "hi": "खुदाई से 15 दिन पहले सिंचाई बंद करें।",
          "en": "Stop irrigation 15 days prior so necks cure tightly for storage."
        }
      },
      {
        "dayOffset": 105,
        "title": {
          "bn": "পেঁয়াজ তোলা (৬০–৭০% গলা ভেঙে পড়লে)",
          "hi": "प्याज़ खुदाई",
          "en": "Onion Harvest"
        },
        "action": {
          "bn": "৬০–৭০% গাছের ডাঁটা নুয়ে পড়লে তুলে ৩–৪ দিন ছায়ায় শুকিয়ে সংরক্ষণ করুন।",
          "hi": "60-70% पत्तियां झुकने पर खुदाई कर छांव में सुखाएं।",
          "en": "Lift bulbs when 60–70% tops fall over; shade-cure before storing."
        }
      }
    ]
  },
  {
    "id": "cal-jute",
    "cropName": {
      "bn": "পাট (তোষা পাট)",
      "hi": "जूट (तोषा पाट)",
      "en": "Jute (Tossa)"
    },
    "variety": {
      "bn": "বিজেআরআই তোষা পাট-৮ ও ও-৯৮৯৭",
      "hi": "JRO-524 / BJRI-8",
      "en": "BJRI Tossa Pat-8 & O-9897"
    },
    "seasonKey": "kharif1",
    "seasonLabel": {
      "bn": "খরিফ-১ / বর্ষা পূর্ব",
      "hi": "जायद / खरीफ-1",
      "en": "Kharif-1 / Spring"
    },
    "plantingMonths": [
      3,
      4
    ],
    "harvestMonths": [
      7,
      8
    ],
    "plantingWindowText": {
      "bn": "মধ্য মার্চ – এপ্রিল (চৈত্র – বৈশাখ)",
      "hi": "मध्य मार्च – अप्रैल",
      "en": "Mid March – April (Choitro – Boishakh)"
    },
    "harvestWindowText": {
      "bn": "জুলাই – আগস্ট (আষাঢ় – শ্রাবণ)",
      "hi": "जुलाई – अगस्त",
      "en": "July – August"
    },
    "durationDaysMin": 110,
    "durationDaysMax": 120,
    "soilAndPh": {
      "bn": "পলি-দোআঁশ ও দোআঁশ মাটি",
      "hi": "जलोढ़ दोमट मिट्टी",
      "en": "Alluvial silt loam"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ৩০ সে.মি. | বীজ: ৬৫০–৮০০ গ্রাম/বিঘা",
      "hi": "30 सेमी कतार | बीज: 700-800 ग्राम/बीघा",
      "en": "30 cm rows | Seed: 650–800 g/bigha"
    },
    "milestones": [
      {
        "dayOffset": 20,
        "title": {
          "bn": "প্রথম নিড়ানি ও গাছ পাতলা করা",
          "hi": "निराई व पौधे विरल करना",
          "en": "Thinning & Weeding"
        },
        "action": {
          "bn": "প্রতি বর্গমিটারে ৪০–৪৫টি সুস্থ চারা রেখে বাকিগুলো তুলে ফেলুন।",
          "hi": "प्रति वर्ग मीटर 40-45 स्वस्थ पौधे रखें।",
          "en": "Thin stand to 40–45 healthy plants per square meter."
        }
      },
      {
        "dayOffset": 45,
        "title": {
          "bn": "উপরি ইউরিয়া প্রয়োগ ও বিছা পোকা দমন",
          "hi": "यूरिया व कीट नियंत्रण",
          "en": "Top-Dressing & Pest Watch"
        },
        "action": {
          "bn": "ইউরিয়া প্রয়োগ করে বিছা পোকা (Hairy caterpillar) দেখা গেলে সংগ্রহ করে নষ্ট করুন।",
          "hi": "यूरिया डालें व इल्ली दिखने पर नियंत्रण करें।",
          "en": "Apply split Urea and remove hairy caterpillar clusters."
        }
      },
      {
        "dayOffset": 85,
        "title": {
          "bn": "দ্রুত বৃদ্ধি ও কান্ড মোটা হওয়া",
          "hi": "तेज़ बढ़वार अवस्था",
          "en": "Rapid Stem Elongation"
        },
        "action": {
          "bn": "মাটিতে বৃষ্টির অতিরিক্ত পানি জমে থাকলে নালা করে বের করে দিন।",
          "hi": "खेत में पानी जमा न होने दें।",
          "en": "Ensure standing excess rainwater drains from stems."
        }
      },
      {
        "dayOffset": 115,
        "title": {
          "bn": "পাট কাটা ও জাগ দেওয়া",
          "hi": "जूट कटाई व सड़ाना (रेटिंग)",
          "en": "Harvest & Retting"
        },
        "action": {
          "bn": "গাছে ৫০% ফুল ফুটলে কেটে ৩–৪ দিন ক্ষেতে রেখে পরিষ্কার পানিতে জাগ দিন।",
          "hi": "50% फूल आने पर काटें और साफ पानी में सड़ाएं।",
          "en": "Cut at early flowering/small-pod stage for top fiber quality and ret in clean water."
        }
      }
    ]
  },
  {
    "id": "cal-lentil",
    "cropName": {
      "bn": "মসুর ডাল",
      "hi": "मसूर दाल",
      "en": "Lentil (Pulse)"
    },
    "variety": {
      "bn": "বারি মসুর-৬, ৭ ও ৮",
      "hi": "BARI-8 / पूसा वैभव",
      "en": "BARI Masur-6, 7 & 8"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "plantingMonths": [
      10,
      11
    ],
    "harvestMonths": [
      2,
      3
    ],
    "plantingWindowText": {
      "bn": "২৫ অক্টোবর – ১৫ নভেম্বর (কার্তিক)",
      "hi": "25 अक्टूबर – 15 नवंबर",
      "en": "25 Oct – 15 Nov"
    },
    "harvestWindowText": {
      "bn": "ফেব্রুয়ারি শেষ – মধ্য মার্চ (ফাল্গুন)",
      "hi": "फरवरी अंत – मध्य मार्च",
      "en": "Late Feb – mid March"
    },
    "durationDaysMin": 105,
    "durationDaysMax": 115,
    "soilAndPh": {
      "bn": "জলাবদ্ধতামুক্ত দোআঁশ ও এঁটেল-দোআঁশ",
      "hi": "दोमट व मटियार मिट्टी",
      "en": "Well-drained loam"
    },
    "spacingAndSeedRate": {
      "bn": "সারি ৩০ সে.মি. | বীজ: ৪.৫–৫ কেজি/বিঘা",
      "hi": "30 सेमी कतार | बीज: 4.5-5 किग्रा/बीघा",
      "en": "30 cm rows | Seed: 4.5–5 kg/bigha"
    },
    "milestones": [
      {
        "dayOffset": 25,
        "title": {
          "bn": "প্রথম আগাছা পরিষ্কার",
          "hi": "पहली निराई",
          "en": "Weed Control"
        },
        "action": {
          "bn": "বপনের ২৫–৩০ দিনের মধ্যে একবার নিড়ানি দিয়ে আগাছা তুলে ফেলুন।",
          "hi": "25-30 दिन में निराई करें।",
          "en": "Hand weed 25–30 days after sowing to avoid shading."
        }
      },
      {
        "dayOffset": 55,
        "title": {
          "bn": "ফুল ও ফল ধরা (স্টেমফাইলিয়াম ব্লাইট সতর্কতা)",
          "hi": "फूल अवस्था व झुलसा निगरानी",
          "en": "Flowering & Stemphylium Watch"
        },
        "action": {
          "bn": "মেঘলা কুয়াশাচ্ছন্ন দিনে স্টেমফাইলিয়াম ব্লাইট ও জাব পোকা পরীক্ষা করুন।",
          "hi": "कोहरे में स्टेमफिलियम झुलसा रोग की जांच करें।",
          "en": "Monitor foliage during humid fog for Stemphylium blight."
        }
      },
      {
        "dayOffset": 85,
        "title": {
          "bn": "শুঁটি পরিপক্ক হওয়া",
          "hi": "फलियां पकना",
          "en": "Pod Ripening"
        },
        "action": {
          "bn": "বেশি পানি থাকলে রোগ বাড়ে—এই সময় কোনো সেচ দেবেন না।",
          "hi": "अधिक नमी से बचें, सिंचाई न करें।",
          "en": "Keep soil dry; avoid late irrigation."
        }
      },
      {
        "dayOffset": 110,
        "title": {
          "bn": "মসুর সংগ্রহ ও মাড়াই",
          "hi": "कटाई व थ्रेसिंग",
          "en": "Lentil Harvest"
        },
        "action": {
          "bn": "৮০% শুঁটি বাদামী রং ধরলে সকালের শিশির থাকা অবস্থায় সংগ্রহ করে রোদে শুকান।",
          "hi": "80% फलियां भूरी होने पर सुबह कटाई कर थ्रेसिंग करें।",
          "en": "Harvest in morning once 80% pods turn brown; sun-dry and thresh."
        }
      }
    ]
  },
  {
    "id": "cal-chili",
    "cropName": {
      "bn": "কাঁচা মরিচ",
      "hi": "हरी मिर्च",
      "en": "Chili Pepper"
    },
    "variety": {
      "bn": "বারি মরিচ-২, বগুড়া ঝাল ও হাইব্রিড",
      "hi": "BARI-2 / पूसा ज्वाला",
      "en": "BARI Morich-2 & Local Hot"
    },
    "seasonKey": "rabi",
    "seasonLabel": {
      "bn": "রবি ও খরিফ-১",
      "hi": "रबी व जायद",
      "en": "Rabi & Spring"
    },
    "plantingMonths": [
      10,
      11,
      3
    ],
    "harvestMonths": [
      1,
      2,
      3,
      6,
      7
    ],
    "plantingWindowText": {
      "bn": "শীতকালীন রোপণ: অক্টো – নভে | গ্রীষ্মকালীন: মার্চ",
      "hi": "सर्दी: अक्टू-नव | गर्मी: मार्च",
      "en": "Winter: Oct–Nov | Summer: March"
    },
    "harvestWindowText": {
      "bn": "রোপণের ৭০–৭৫ দিন পর থেকে ৩–৪ মাসব্যাপী তোলা যায়",
      "hi": "रोपाई के 70-75 दिन बाद से 3-4 महीने तक तुड़ाई",
      "en": "Starts 70–75 days after planting (multiple pickings)"
    },
    "durationDaysMin": 75,
    "durationDaysMax": 120,
    "soilAndPh": {
      "bn": "উঁচু ও পানি নিষ্কাশনযুক্ত দোআঁশ (pH 6.0–7.0)",
      "hi": "जल निकास युक्त दोमट मिट्टी",
      "en": "Raised well-drained loam (pH 6.0–7.0)"
    },
    "spacingAndSeedRate": {
      "bn": "৫০×৪০ সে.মি. | বীজ: ১৩০–১৫০ গ্রাম/বিঘা",
      "hi": "50×40 सेमी | बीज: 130-150 ग्राम/बीघा",
      "en": "50×40 cm | Seed: 130–150 g/bigha"
    },
    "milestones": [
      {
        "dayOffset": 20,
        "title": {
          "bn": "নালার পানি নিষ্কাশন ও জৈব সার",
          "hi": "नाली व खाद प्रबंधन",
          "en": "Drainage & Establishment"
        },
        "action": {
          "bn": "গোড়ায় পানি জমতে দেবেন না এবং হলুদ আঠালো ফাঁদ স্থাপন করুন।",
          "hi": "जलभराव न होने दें व पीले चिपचिपे जाल लगाएं।",
          "en": "Keep beds raised and place yellow sticky traps against thrips/whitefly."
        }
      },
      {
        "dayOffset": 45,
        "title": {
          "bn": "ফুল আসা ও পাতা কোঁকড়ানো সুরক্ষা",
          "hi": "फूल व पत्ता मरोड़ सुरक्षा",
          "en": "Flowering & Curl Prevention"
        },
        "action": {
          "bn": "পাতা ওপর/নিচে কুঁকড়ে গেলে সাথে সাথে নিম তেল বা মাকড়নাশক ব্যবহার করুন।",
          "hi": "पत्ती मुड़ने पर तुरंत नीम तेल या माइट नियंत्रण करें।",
          "en": "Watch for thrips/mites causing leaf curl and apply neem extract promptly."
        }
      },
      {
        "dayOffset": 75,
        "title": {
          "bn": "প্রথম মরিচ তোলা শুরু",
          "hi": "पहली तुड़ाई",
          "en": "First Green Chili Harvest"
        },
        "action": {
          "bn": "ডাঁটাসহ মরিচ তুলুন ও প্রতি তোলার পর হালকা সেচ ও সুষম সার দিন।",
          "hi": "डंठल सहित तोड़ें और हल्की सिंचाई करें।",
          "en": "Pick with stems intact and irrigate lightly between flushes."
        }
      },
      {
        "dayOffset": 115,
        "title": {
          "bn": "পাকা লাল ও পুনঃসংগ্রহ",
          "hi": "लाल मिर्च व निरंतर तुड़ाई",
          "en": "Red / Continued Picking"
        },
        "action": {
          "bn": "শুকনো মরিচের জন্য গাছে সম্পূর্ণ লাল হলে তুলে পরিষ্কার চাতালে শুকান।",
          "hi": "सूखी मिर्च के लिए पूरी लाल होने पर तोड़कर धूप में सुखाएं।",
          "en": "Leave late flushes to ripen bright red for sun-dried spice."
        }
      }
    ]
  }
];
