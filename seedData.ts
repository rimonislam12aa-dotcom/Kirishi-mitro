// জেলা, ফসল পরিচর্যা টিপস ও শুরুর বাজার দরের তথ্যভাণ্ডার
import { CropTip, MarketPrice } from '../types/agri';
import riceLeafImg from '../assets/images/crop_rice_leaf_sample_1795261298022.jpg';
import tomatoFieldImg from '../assets/images/crop_tomato_field_1795261298066.jpg';
import potatoHarvestImg from '../assets/images/crop_potato_harvest_1795261297721.jpg';

export interface DistrictPreset {
  id: string;
  lat: number;
  lon: number;
  name: { bn: string; hi: string; en: string };
  region: { bn: string; hi: string; en: string };
}

export const DISTRICT_PRESETS: DistrictPreset[] = [
  {
    "id": "dhaka",
    "lat": 23.8103,
    "lon": 90.4125,
    "name": {
      "bn": "ঢাকা",
      "hi": "ढाका",
      "en": "Dhaka"
    },
    "region": {
      "bn": "মধ্যাঞ্চল সমভূমি",
      "hi": "केंद्रीय क्षेत्र",
      "en": "Central Plain"
    }
  },
  {
    "id": "bogura",
    "lat": 24.8465,
    "lon": 89.3773,
    "name": {
      "bn": "বগুড়া",
      "hi": "बोगुरा",
      "en": "Bogura"
    },
    "region": {
      "bn": "যমুনা অববাহিকা (উত্তরাঞ্চল)",
      "hi": "यमुना बेसिन क्षेत्र",
      "en": "Jamuna Floodplain"
    }
  },
  {
    "id": "rajshahi",
    "lat": 24.3745,
    "lon": 88.6042,
    "name": {
      "bn": "রাজশাহী",
      "hi": "राजशाही",
      "en": "Rajshahi"
    },
    "region": {
      "bn": "বরেন্দ্র খরাপ্রবণ অঞ্চল",
      "hi": "बरेंद्र सूखा क्षेत्र",
      "en": "Barind Drought Zone"
    }
  },
  {
    "id": "rangpur",
    "lat": 25.7439,
    "lon": 89.2752,
    "name": {
      "bn": "রংপুর",
      "hi": "रंगपुर",
      "en": "Rangpur"
    },
    "region": {
      "bn": "উত্তরাঞ্চল শৈত্যপ্রবাহ বলয়",
      "hi": "उत्तरी शीतलहर क्षेत्र",
      "en": "Northern Cold-Wave Belt"
    }
  },
  {
    "id": "dinajpur",
    "lat": 25.6279,
    "lon": 88.6332,
    "name": {
      "bn": "দিনাজপুর",
      "hi": "दिनाजपुर",
      "en": "Dinajpur"
    },
    "region": {
      "bn": "উত্তরাঞ্চল ধান ও লিচু অঞ্চল",
      "hi": "उत्तरी धान क्षेत्र",
      "en": "Northern Grain & Litchi Belt"
    }
  },
  {
    "id": "pabna",
    "lat": 24.0064,
    "lon": 89.2372,
    "name": {
      "bn": "পাবনা",
      "hi": "पाबना",
      "en": "Pabna"
    },
    "region": {
      "bn": "পদ্মা-যমুনা পেঁয়াজ ও ডাল অঞ্চল",
      "hi": "पद्मा-यमुना क्षेत्र",
      "en": "Padma-Jamuna Onion & Pulse Belt"
    }
  },
  {
    "id": "sylhet",
    "lat": 24.8949,
    "lon": 91.8687,
    "name": {
      "bn": "সিলেট",
      "hi": "सिलहट",
      "en": "Sylhet"
    },
    "region": {
      "bn": "হাওর আকস্মিক বন্যা অঞ্চল",
      "hi": "हाओर बाढ़ क्षेत्र",
      "en": "Haor Flash-Flood Basin"
    }
  },
  {
    "id": "sunamganj",
    "lat": 25.0658,
    "lon": 91.395,
    "name": {
      "bn": "সুনামগঞ্জ",
      "hi": "सुनामगंज",
      "en": "Sunamganj"
    },
    "region": {
      "bn": "গভীর হাওর ও অতিবৃষ্টি অঞ্চল",
      "hi": "हाओर व अतिवृष्टि क्षेत्र",
      "en": "Deep Haor Monsoon Belt"
    }
  },
  {
    "id": "habiganj",
    "lat": 24.3749,
    "lon": 91.4155,
    "name": {
      "bn": "হবিগঞ্জ",
      "hi": "हबीबगंज",
      "en": "Habiganj"
    },
    "region": {
      "bn": "দক্ষিণ হাওর ও চা-বাগান অঞ্চল",
      "hi": "दक्षिण हाओर क्षेत्र",
      "en": "Southern Haor & Valley Belt"
    }
  },
  {
    "id": "kishoreganj",
    "lat": 24.4449,
    "lon": 90.7766,
    "name": {
      "bn": "কিশোরগঞ্জ",
      "hi": "किशोरगंज",
      "en": "Kishoreganj"
    },
    "region": {
      "bn": "মিঠামইন-অষ্টগ্রাম হাওর বলয়",
      "hi": "हाओर धान क्षेत्र",
      "en": "Haor Boro Rice Belt"
    }
  },
  {
    "id": "netrokona",
    "lat": 24.8709,
    "lon": 90.7279,
    "name": {
      "bn": "নেত্রকোণা",
      "hi": "नेत्रकोना",
      "en": "Netrokona"
    },
    "region": {
      "bn": "গারো পাহাড় পাদদেশ ও হাওর",
      "hi": "उत्तर-पूर्व हाओर क्षेत्र",
      "en": "Foothill & Haor Basin"
    }
  },
  {
    "id": "mymensingh",
    "lat": 24.7471,
    "lon": 90.4203,
    "name": {
      "bn": "ময়মনসিংহ",
      "hi": "मयमनसिंह",
      "en": "Mymensingh"
    },
    "region": {
      "bn": "ব্রহ্মপুত্র অববাহিকা",
      "hi": "ब्रह्मपुत्र बेसिन",
      "en": "Brahmaputra Basin"
    }
  },
  {
    "id": "tangail",
    "lat": 24.2513,
    "lon": 89.9167,
    "name": {
      "bn": "টাঙ্গাইল",
      "hi": "टांगाइल",
      "en": "Tangail"
    },
    "region": {
      "bn": "মধুপুর গড় ও যমুনা চর",
      "hi": "मधुुपुर व यमुना क्षेत्र",
      "en": "Madhupur Tract & Char"
    }
  },
  {
    "id": "faridpur",
    "lat": 23.6071,
    "lon": 89.8429,
    "name": {
      "bn": "ফরিদপুর",
      "hi": "फरीदपुर",
      "en": "Faridpur"
    },
    "region": {
      "bn": "পদ্মা পাড়ের পাট ও মসলা অঞ্চল",
      "hi": "पद्मा जूट क्षेत्र",
      "en": "Padma Jute & Spice Belt"
    }
  },
  {
    "id": "kushtia",
    "lat": 23.9013,
    "lon": 89.1205,
    "name": {
      "bn": "কুষ্টিয়া",
      "hi": "कुश्तिया",
      "en": "Kushtia"
    },
    "region": {
      "bn": "গঙ্গা-কপোতাক্ষ কৃষি অঞ্চল",
      "hi": "गंगा-कपोताक्ष क्षेत्र",
      "en": "Ganges-Kobadak Irrigation Zone"
    }
  },
  {
    "id": "jessore",
    "lat": 23.1634,
    "lon": 89.2182,
    "name": {
      "bn": "যশোর",
      "hi": "यशोर",
      "en": "Jashore"
    },
    "region": {
      "bn": "দক্ষিণ-পশ্চিম সবজি ও ফুল অঞ্চল",
      "hi": "दक्षिण-पश्चिम कृषि क्षेत्र",
      "en": "South-West Vegetable Belt"
    }
  },
  {
    "id": "khulna",
    "lat": 22.8456,
    "lon": 89.5403,
    "name": {
      "bn": "খুলনা",
      "hi": "खुलना",
      "en": "Khulna"
    },
    "region": {
      "bn": "সুন্দরবন উপকূল ও লবণাক্ত অঞ্চল",
      "hi": "सुंदरबन तटीय क्षेत्र",
      "en": "Coastal Salinity Zone"
    }
  },
  {
    "id": "barishal",
    "lat": 22.701,
    "lon": 90.3535,
    "name": {
      "bn": "বরিশাল",
      "hi": "बरिशाल",
      "en": "Barishal"
    },
    "region": {
      "bn": "দক্ষিণাঞ্চল নদী ও জলোচ্ছ্বাস বলয়",
      "hi": "दक्षिणी नदी क्षेत्र",
      "en": "Southern Riverine Surge Belt"
    }
  },
  {
    "id": "patuakhali",
    "lat": 22.3596,
    "lon": 90.3296,
    "name": {
      "bn": "পটুয়াখালী",
      "hi": "पटुआखाली",
      "en": "Patuakhali"
    },
    "region": {
      "bn": "উপকূলীয় জোয়ার-ভাটা ও মুগডাল অঞ্চল",
      "hi": "तटीय ज्वार क्षेत्र",
      "en": "Coastal Tidal & Pulse Belt"
    }
  },
  {
    "id": "bhola",
    "lat": 22.6859,
    "lon": 90.6482,
    "name": {
      "bn": "ভোলা",
      "hi": "भोला",
      "en": "Bhola"
    },
    "region": {
      "bn": "মেঘনা মোহনা দ্বীপ অঞ্চল",
      "hi": "मेघना द्वीप क्षेत्र",
      "en": "Meghna Estuary Island Belt"
    }
  },
  {
    "id": "noakhali",
    "lat": 22.8696,
    "lon": 91.0994,
    "name": {
      "bn": "নোয়াখালী",
      "hi": "नोआखाली",
      "en": "Noakhali"
    },
    "region": {
      "bn": "উপকূলীয় চর ও সয়াবিন বলয়",
      "hi": "तटीय चर क्षेत्र",
      "en": "Coastal Char & Soybean Belt"
    }
  },
  {
    "id": "cumilla",
    "lat": 23.4607,
    "lon": 91.1809,
    "name": {
      "bn": "কুমিল্লা",
      "hi": "कुमिल्ला",
      "en": "Cumilla"
    },
    "region": {
      "bn": "মেঘনা পূর্ব ডেল্টা",
      "hi": "पूर्वी डेल्टा क्षेत्र",
      "en": "Eastern Delta"
    }
  },
  {
    "id": "chattogram",
    "lat": 22.3569,
    "lon": 91.7832,
    "name": {
      "bn": "চট্টগ্রাম",
      "hi": "चटगांव",
      "en": "Chattogram"
    },
    "region": {
      "bn": "দক্ষিণ-পূর্ব উপকূলীয় অঞ্চল",
      "hi": "दक्षिण-पूर्व तटीय क्षेत्र",
      "en": "South-East Coastal Belt"
    }
  },
  {
    "id": "coxsbazar",
    "lat": 21.4272,
    "lon": 92.0058,
    "name": {
      "bn": "কক্সবাজার",
      "hi": "कॉक्स बाजार",
      "en": "Cox's Bazar"
    },
    "region": {
      "bn": "উপকূলীয় ঘূর্ণিঝড় ঝুঁকি অঞ্চল",
      "hi": "तटीय चक्रवात क्षेत्र",
      "en": "Coastal Cyclone Belt"
    }
  },
  {
    "id": "nadia",
    "lat": 23.471,
    "lon": 88.5565,
    "name": {
      "bn": "নদীয়া (কৃষ্ণনগর)",
      "hi": "नदिया (कृष्णनगर)",
      "en": "Nadia"
    },
    "region": {
      "bn": "পশ্চিমবঙ্গ",
      "hi": "पश्चिम बंगाल",
      "en": "West Bengal"
    }
  },
  {
    "id": "bardhaman",
    "lat": 23.2324,
    "lon": 87.8615,
    "name": {
      "bn": "বর্ধমান",
      "hi": "बर्धमान",
      "en": "Bardhaman"
    },
    "region": {
      "bn": "ধানের গোলা অঞ্চল",
      "hi": "धान क्षेत्र",
      "en": "Lower Gangetic Plain"
    }
  }
];

export const SEED_CROP_TIPS: CropTip[] = [
  {
    "id": "tip-rice-blast",
    "cropKey": "rice",
    "seasonKey": "kharif",
    "imageUrl": riceLeafImg,
    "cropName": {
      "bn": "ধান",
      "hi": "धान",
      "en": "Rice (Paddy)"
    },
    "seasonLabel": {
      "bn": "বোরো ও আমন",
      "hi": "खरीफ व रबी",
      "en": "Boro & Aman"
    },
    "title": {
      "bn": "ধানের ব্লাস্ট ও বাদামী দাগ রোগ প্রতিরোধে সুষম পরিচর্যা",
      "hi": "धान में ब्लास्ट और भूरे धब्बे रोग से बचाव की देखभाल",
      "en": "Preventing Rice Blast & Brown Spot with Balanced Care"
    },
    "summary": {
      "bn": "অতিরিক্ত ইউরিয়া সার পরিহার করুন এবং জমিতে ২–৩ ইঞ্চি পরিষ্কার পানি ধরে রেখে পটাশ সার ব্যবহার করুন।",
      "hi": "अतिरिक्त यूरिया से बचें, खेत में 2-3 इंच साफ पानी रखें और पोटाश खाद का संतुलित उपयोग करें।",
      "en": "Avoid excess urea top-dressing, maintain 2–3 inches of clean water, and balance with potash."
    },
    "steps": {
      "bn": [
        "রোপণের আগে প্রতি কেজি বীজে ৩ গ্রাম কার্বেন্ডাজিম বা ট্রাইকোডার্মা দিয়ে বীজ শোধন করুন।",
        "পাতার আগায় চোখের মতো ধূসর দাগ দেখলে সাময়িকভাবে ইউরিয়া সার প্রয়োগ বন্ধ রাখুন।",
        "প্রতি বিঘায় (৩৩ শতাংশ) অতিরিক্ত ৫ কেজি পটাশ (MOP) উপরি প্রয়োগ করুন।",
        "ভোরে শিশির শুকানোর পর অনুমোদিত ছত্রাকনাশক বা নিম তেল স্প্রে করুন।"
      ],
      "hi": [
        "बुवाई से पहले प्रति किलो बीज को 3 ग्राम ट्राइकोडर्मा या कार्बेन्डाजिम से उपचारित करें।",
        "पत्तों पर आंख जैसे भूरे धब्बे दिखें तो तुरंत यूरिया डालना रोक दें।",
        "खेत में प्रति बीघा 5 किग्रा (या प्रति एकड़ 15 किग्रा) अतिरिक्त पोटाश (MOP) डालें।",
        "सुबह ओस सूखने के बाद नीम तेल या अनुशंसित फफूंदनाशी का छिड़काव करें।"
      ],
      "en": [
        "Treat paddy seeds with Trichoderma or Carbendazim (3g/kg) before sowing.",
        "Pause urea application immediately if diamond-shaped lesions appear on leaves.",
        "Apply supplemental Muriate of Potash (5 kg per 33-dec Bigha / ~15 kg per acre) to strengthen cell walls.",
        "Spray in the late morning once dew evaporates for best adherence."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): ইউরিয়া ১৮–২৪ কেজি (৩ কিস্তিতে), টিএসপি ১০ কেজি, এমওপি ১০ কেজি, জিপসাম ৬–৮ কেজি ও জিংক ১ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): यूरिया 18-24 किग्रा (3 किस्तों में), टीएसपी/डीएपी 10 किग्रा, एमओपी 10 किग्रा, जिप्सम 6-8 किग्रा व जिंक 1 किग्रा (एकड़ में लगभग 3 गुना)।",
      "en": "Per 33-decimal Bigha (~1/3 acre): Urea 18–24 kg (3 splits), TSP 10 kg, MoP 10 kg, Gypsum 6–8 kg & Zinc 1 kg (multiply by ~3 for 1 acre)."
    },
    "audioScript": {
      "bn": "ধানের ব্লাস্ট ও বাদামী দাগ রোগ ঠেকাতে কখনো অতিরিক্ত ইউরিয়া দেবেন না। রোপণের আগে বীজ শোধন করুন এবং পাতায় দাগ দেখলে বিঘাপ্রতি ৫ কেজি পটাশ সার দিন। সকালে শিশির শুকালে ছত্রাকনাশক স্প্রে করলে ভালো ফল পাওয়া যায়।",
      "hi": "धान में ब्लास्ट और भूरे धब्बे से बचने के लिए ज्यादा यूरिया न डालें। बुवाई से पहले बीज उपचार करें और पत्तों पर धब्बे दिखते ही पोटाश का प्रयोग करें। सुबह ओस सूखने के बाद छिड़काव करना सबसे असरदार रहता है।",
      "en": "To prevent rice blast and brown spot, avoid heavy urea application. Treat seeds before sowing, apply potash if leaf spots appear, and spray after morning dew dries."
    },
    "bookmarked": true
  },
  {
    "id": "tip-tomato-blight",
    "cropKey": "tomato",
    "seasonKey": "rabi",
    "imageUrl": tomatoFieldImg,
    "cropName": {
      "bn": "টমেটো",
      "hi": "टमाटर",
      "en": "Tomato"
    },
    "seasonLabel": {
      "bn": "রবি / শীতকালীন",
      "hi": "रबी / सर्दी",
      "en": "Rabi / Winter"
    },
    "title": {
      "bn": "টমেটোর নাবী ধ্বসা ও ফল ছিদ্রকারী পোকা দমন",
      "hi": "टमाटर में झुलसा रोग और फल छेदक कीट नियंत्रण",
      "en": "Tomato Late Blight Control & Staking Care"
    },
    "summary": {
      "bn": "বাঁশের খুঁটি দিয়ে গাছ বেঁধে দিন এবং কুয়াশাচ্ছন্ন আবহাওয়ায় নিচের পুরোনো পাতা ছাঁটাই করুন।",
      "hi": "बांस के सहारे पौधों को बांधें और कोहरे वाले मौसम में नीचे की पुरानी पत्तियों की छंटाई करें।",
      "en": "Stake plants on bamboo trellises and prune lower leaves during foggy weather to improve airflow."
    },
    "steps": {
      "bn": [
        "গাছের গোড়ায় পানি জমতে দেবেন না; নালা পদ্ধতিতে হালকা সেচ দিন।",
        "মাটি থেকে ৬ ইঞ্চি পর্যন্ত নিচের পাতা ছাঁটাই করে বাতাস চলাচল বাড়ান।",
        "প্রতি গাছে বাঁশের খুঁটি দিন যাতে ফল মাটির সংস্পর্শে না আসে।",
        "হলুদ আঠালো ফাঁদ ও ফেরোমন ফাঁদ স্থাপন করে সাদামাছি ও ফল ছিদ্রকারী পোকা দমন করুন।"
      ],
      "hi": [
        "जड़ों के पास पानी जमा न होने दें; मेड़ों के बीच हल्की सिंचाई करें।",
        "ज़मीन से 6 इंच ऊपर तक के निचले पत्ते हटा दें ताकि हवा पास हो सके।",
        "फलों को मिट्टी से बचाने के लिए बांस का सहारा दें।",
        "सफेद मक्खी और इल्ली रोकने के लिए पीला चिपचिपा जाल व फेरोमोन ट्रैप लगाएं।"
      ],
      "en": [
        "Avoid waterlogging around stems; irrigate lightly along furrows.",
        "Prune bottom 6 inches of foliage to reduce soil splash and humidity.",
        "Use bamboo stakes to keep ripening fruit off damp soil.",
        "Install yellow sticky traps and pheromone lures for whiteflies and fruit borers."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): গোবর/কম্পোস্ট ১–১.৫ টন, ইউরিয়া ৩৫–৪৫ কেজি (২–৩ কিস্তিতে), টিএসপি ২৫–৩০ কেজি, এমওপি ২০–২৫ কেজি ও ফুলের আগে বোরন (১ গ্রাম/লিটার) স্প্রে করুন।",
      "hi": "प्रति बीघा (33 डिसमिल): गोबर खाद 1-1.5 टन, यूरिया 35-45 किग्रा (किस्तों में), डीएपी/टीएसपी 25-30 किग्रा, एमओपी 20-25 किग्रा व फूल से पहले बोरॉन (1 ग्राम/लीटर) का छिड़काव करें।",
      "en": "Per 33-dec Bigha: Compost 1–1.5 t, Urea 35–45 kg (2–3 splits), TSP 25–30 kg, MoP 20–25 kg, plus foliar Boron (1g/L) before bloom to cut flower drop."
    },
    "audioScript": {
      "bn": "টমেটো গাছে বাঁশের খুঁটি দিলে ফল মাটিতে পচে না। শীতে কুয়াশা বাড়লে গাছের নিচের পাতা ছেঁটে দিন এবং নালায় হালকা সেচ দিন। ফুল আসার সময় বোরন স্প্রে করলে টমেটো ঝরে পড়া কমে যায়।",
      "hi": "टमाटर के पौधों को बांस से बांधने पर फल मिट्टी में खराब नहीं होते। सर्दी और कोहरे में नीचे के पत्ते छांट दें और हल्की सिंचाई करें। फूल आने पर बोरॉन का छिड़काव फल बनने में मदद करता है।",
      "en": "Staking tomato plants keeps fruit off damp soil. Prune lower leaves during winter fog, irrigate lightly in furrows, and apply boron before flowering."
    },
    "bookmarked": false
  },
  {
    "id": "tip-potato-blight",
    "cropKey": "potato",
    "seasonKey": "rabi",
    "imageUrl": potatoHarvestImg,
    "cropName": {
      "bn": "আলু",
      "hi": "आलू",
      "en": "Potato"
    },
    "seasonLabel": {
      "bn": "রবি মৌসুম",
      "hi": "रबी सीजन",
      "en": "Rabi Season"
    },
    "title": {
      "bn": "আলুর মড়ক (লেইট ব্লাইট) রোধ ও সঠিক মাটি তোলা",
      "hi": "आलू में पछेती झुलसा रोकथाम और मिट्टी चढ़ाना",
      "en": "Potato Ridge Earthing-Up & Late Blight Defense"
    },
    "summary": {
      "bn": "রোপণের ২৫–৩০ দিন পর গোড়ায় মাটি তুলে দিন এবং শৈত্যপ্রবাহ ও কুয়াশায় প্রতিরোধমূলক স্প্রে করুন।",
      "hi": "बुवाई के 25-30 दिन बाद पौधों की जड़ों पर मिट्टी चढ़ाएं और कोहरे से पहले बचाव छिड़काव करें।",
      "en": "Earth up soil ridges 25–30 days after planting and apply preventive sprays before dense winter fog."
    },
    "steps": {
      "bn": [
        "রোপণের ২৫ ও ৪৫ দিনের মাথায় দুইবার সারির গোড়ায় মাটি উঁচু করে দিন।",
        "রাতে তাপমাত্রা ১০ ডিগ্রির নিচে নামলে ও ঘন কুয়াশা থাকলে সকালে সেচ বন্ধ রাখুন।",
        "প্রথম পাতায় কালচে ভেজা দাগ দেখা মাত্রই ম্যানকোজেব ও মেটালাক্সিল মিশ্রিত ছত্রাকনাশক স্প্রে করুন।",
        "আলু তোলার ৭–১০ দিন আগে গাছ কেটে দিলে আলুর খোসা শক্ত হয় ও গুদামে ভালো থাকে।"
      ],
      "hi": [
        "बुवाई के 25 और 45 दिन बाद दो बार जड़ों पर मिट्टी चढ़ाएं।",
        "रात का तापमान 10 डिग्री से नीचे और घना कोहरा होने पर सुबह सिंचाई न करें।",
        "पत्तों पर काले गीले धब्बे दिखते ही मैन्कोज़ेब या अनुशंसित फफूंदनाशी का छिड़काव करें।",
        "खुदाई से 7-10 दिन पहले ऊपर की बेल काट दें ताकि आलू का छिलका मजबूत हो सके।"
      ],
      "en": [
        "Earth up soil ridges at 25 and 45 days after planting to protect tubers.",
        "Avoid morning irrigation during cold snaps (<10°C) and heavy fog.",
        "Spray preventive fungicide immediately if dark water-soaked lesions appear.",
        "Cut haulms 7–10 days before harvest to toughen potato skin for storage."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): ইউরিয়া ৩০–৪০ কেজি (অর্ধেক রোপণে, বাকি অর্ধেক ২৫–৩০ দিনে মাটি তোলার সময়), টিএসপি ২২–২৮ কেজি, এমওপি ২৫–৩৫ কেজি, জিপসাম ১৫ কেজি ও বোরন ১ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): यूरिया 30-40 किग्रा (आधा बुवाई पर, आधा मिट्टी चढ़ाते समय), टीएसपी/डीएपी 22-28 किग्रा, एमओपी 25-35 किग्रा, जिप्सम 15 किग्रा व बोरॉन 1 किग्रा।",
      "en": "Per 33-dec Bigha: Urea 30–40 kg (half basal, half at 25–30d earthing-up), TSP 22–28 kg, MoP 25–35 kg, Gypsum 15 kg & Boron 1 kg."
    },
    "audioScript": {
      "bn": "আলু রোপণের ২৫ থেকে ৩০ দিন পর অবশ্যই গোড়ায় মাটি তুলে দেবেন, এতে আলু সবুজ হয় না। ঘন কুয়াশায় মড়ক রোগ দ্রুত ছড়ায়, তাই সকালে হালকা রোদ উঠলে প্রতিরোধমূলক স্প্রে দিন।",
      "hi": "आलू बोने के 25 से 30 दिन बाद जड़ों पर मिट्टी जरूर चढ़ाएं, इससे आलू हरे नहीं होते। घने कोहरे में झुलसा रोग तेजी से फैलता है, इसलिए समय रहते बचाव छिड़काव करें।",
      "en": "Earth up potato ridges 25 to 30 days after planting to prevent green tubers. Dense fog accelerates late blight, so apply preventive sprays early."
    },
    "bookmarked": false
  },
  {
    "id": "tip-mustard-aphid",
    "cropKey": "mustard",
    "seasonKey": "rabi",
    "cropName": {
      "bn": "সরিষা",
      "hi": "सरसों",
      "en": "Mustard"
    },
    "seasonLabel": {
      "bn": "শীতকালীন",
      "hi": "रबी / सर्दी",
      "en": "Winter / Rabi"
    },
    "title": {
      "bn": "সরিষার জাব পোকা দমন ও মৌমাছি সুরক্ষা",
      "hi": "सरसों में माहू (चेपा) नियंत्रण और मधुमक्खी सुरक्षा",
      "en": "Mustard Aphid Control Without Harming Pollinators"
    },
    "summary": {
      "bn": "সকালবেলা মৌমাছি পরাগায়ন করে, তাই যেকোনো জৈব বা কীটনাশক স্প্রে বিকেলের পর করুন।",
      "hi": "सुबह मधुमक्खियां परागण करती हैं, इसलिए कोई भी छिड़काव हमेशा शाम के समय ही करें।",
      "en": "Pollinating honeybees forage in the morning, so apply all sprays strictly in the late afternoon."
    },
    "steps": {
      "bn": [
        "আক্রান্ত ডগার অগ্রভাগ হাত দিয়ে ভেঙে গর্তে পুঁতে দিন।",
        "প্রতি লিটার পানিতে ৫ গ্রাম সাবান-গুঁড়া বা নিম তেল মিশিয়ে বিকেলে স্প্রে করুন।",
        "জমির পাশে পাখি বসার ডাল (পার্চিং) পুঁতে দিলে প্রাকৃতিক উপায়ে পোকা কমে।"
      ],
      "hi": [
        "प्रभावित टहनियों के ऊपरी सिरों को हाथ से तोड़कर नष्ट कर दें।",
        "प्रति लीटर पानी में 5 मिलीलीटर नीम तेल मिलाकर शाम को छिड़काव करें।",
        "खेत में पक्षियों के बैठने के लिए बांस की खूंटियां (पर्च) लगाएं।"
      ],
      "en": [
        "Hand-prune heavily infested shoot tips early in the infestation.",
        "Spray neem oil or mild insecticidal soap solution in the late afternoon.",
        "Place T-shaped bamboo bird perches across the field for natural pest control."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): ইউরিয়া ২৫–৩০ কেজি (অর্ধেক শেষ চাষে, অর্ধেক ফুলের আগে), টিএসপি ১৮–২২ কেজি, এমওপি ১০–১২ কেজি, জিপসাম ১৫–২০ কেজি, জিংক ০.৭ কেজি ও বোরন ১–১.৫ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): यूरिया 25-30 किग्रा, टीएसपी/डीएपी 18-22 किग्रा, एमओपी 10-12 किग्रा, जिप्सम 15-20 किग्रा, जिंक 0.7 किग्रा व बोरॉन 1-1.5 किग्रा।",
      "en": "Per 33-dec Bigha: Urea 25–30 kg (half basal, half pre-bloom), TSP 18–22 kg, MoP 10–12 kg, Gypsum 15–20 kg (Sulphur), Zinc 0.7 kg & Boron 1–1.5 kg."
    },
    "audioScript": {
      "bn": "সরিষা ক্ষেতে মৌমাছি পরাগায়ন ঘটিয়ে ফলন বাড়ায়। তাই সকালবেলা কখনো বিষ স্প্রে করবেন না। জাব পোকা হলে বিকেলে নিম তেল স্প্রে করুন এবং পাখি বসার ডাল পুঁতে দিন।",
      "hi": "सरसों के खेत में मधुमक्खियां उपज बढ़ाती हैं, इसलिए सुबह छिड़काव न करें। माहू लगने पर शाम के समय नीम तेल का प्रयोग करें और खेत में पक्षी बैठने के लिए खूंटियां लगाएं।",
      "en": "Honeybees boost mustard yield, so never spray in the morning. Apply neem oil in the late afternoon for aphids and install bird perches."
    },
    "bookmarked": false
  },
  {
    "id": "tip-chili-curl",
    "cropKey": "chili",
    "seasonKey": "all",
    "cropName": {
      "bn": "মরিচ",
      "hi": "मिर्च",
      "en": "Chili Pepper"
    },
    "seasonLabel": {
      "bn": "সারা বছর",
      "hi": "सारा साल",
      "en": "Year-Round"
    },
    "title": {
      "bn": "মরিচের পাতা কোঁকড়ানো রোগ ও মাকড় ব্যবস্থাপনা",
      "hi": "मिर्च में पत्ता मरोड़ रोग और माइट प्रबंधन",
      "en": "Managing Chili Leaf Curl, Thrips & Mites"
    },
    "summary": {
      "bn": "থ্রিপস ও মাকড় দমনে হলুদ ফাঁদ ব্যবহার করুন এবং জৈব ছাই বা নিম নির্যাস ছিটিয়ে দিন।",
      "hi": "थ्रिप्स और माइट को रोकने के लिए पीले चिपचिपे जाल और नीम अर्क का उपयोग करें।",
      "en": "Control thrips and mites early with sticky traps and neem extract to prevent viral leaf curl."
    },
    "steps": {
      "bn": [
        "রোগাক্রান্ত চারা দেখামাত্র তুলে মাটিতে পুঁতে দিন যাতে ভাইরাস না ছড়ায়।",
        "প্রতি ১০ দিন পরপর নিম বীজের নির্যাস স্প্রে করুন।",
        "উপযুক্ত ড্রেনেজ ব্যবস্থা রাখুন; শিকড়ে পানি জমলে গোড়া পচা শুরু হয়।"
      ],
      "hi": [
        "वायरस से अत्यधिक प्रभावित पौधों को तुरंत उखाड़कर दबा दें।",
        "हर 10 दिन में नीम बीज अर्क का छिड़काव करें।",
        "जल निकासी अच्छी रखें ताकि जड़ गलन की समस्या न हो।"
      ],
      "en": [
        "Rogue out severely virus-curled seedlings early to halt spread.",
        "Spray cold-pressed neem extract every 10 days during dry spells.",
        "Ensure raised beds and drainage to prevent root rot."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): পচা গোবর/কম্পোস্ট ১ টন, ইউরিয়া ২৫–৩০ কেজি (৩ কিস্তিতে), টিএসপি ২০–২৫ কেজি, এমওপি ১৫–২০ কেজি, জিপসাম ১০–১২ কেজি ও ক্যালসিয়াম-ম্যাগনেশিয়াম।",
      "hi": "प्रति बीघा (33 डिसमिल): सड़ी गोबर खाद 1 टन, यूरिया 25-30 किग्रा (3 किस्तों में), टीएसपी 20-25 किग्रा, एमओपी 15-20 किग्रा व जिप्सम 10-12 किग्रा।",
      "en": "Per 33-dec Bigha: Compost 1 t, Urea 25–30 kg (3 splits), TSP 20–25 kg, MoP 15–20 kg, Gypsum 10–12 kg, plus calcium-magnesium micronutrients."
    },
    "audioScript": {
      "bn": "মরিচের পাতা ওপরের দিকে কুঁকড়ে গেলে থ্রিপস এবং নিচের দিকে কুঁকড়ে গেলে মাকড়ের আক্রমণ হয়েছে বুঝতে হবে। শুরুতেই নিম তেল ও হলুদ ফাঁদ ব্যবহার করুন।",
      "hi": "मिर्च के पत्ते ऊपर की ओर मुड़ें तो थ्रिप्स और नीचे की ओर मुड़ें तो माइट का प्रकोप होता है। शुरुआत में ही नीम तेल और चिपचिपे जाल का उपयोग करें।",
      "en": "Upward curling in chili leaves indicates thrips, while downward curling signals mites. Use neem oil and sticky traps early."
    },
    "bookmarked": false
  },
  {
    "id": "tip-mango-hopper",
    "cropKey": "mango",
    "seasonKey": "zaid",
    "cropName": {
      "bn": "আম",
      "hi": "आम",
      "en": "Mango"
    },
    "seasonLabel": {
      "bn": "গ্রীষ্ম ও বসন্ত",
      "hi": "बसंत व गर्मी",
      "en": "Spring & Summer"
    },
    "title": {
      "bn": "আমের মুকুল ও গুটি রক্ষায় সেচ ও হপার দমন",
      "hi": "आम के बौर और टिकोले बचाने हेतु सिंचाई व कीट नियंत्रण",
      "en": "Protecting Mango Panicles & Reducing Fruit Drop"
    },
    "summary": {
      "bn": "মুকুল পুরোপুরি ফোটার সময় কোনো স্প্রে করবেন না; গুটি মটরদানার সমান হলে সেচ ও ছায়া ব্যবস্থাপনা দিন।",
      "hi": "पूरा बौर खिलते समय कोई छिड़काव न करें; मटर के दाने जैसे फल बनने पर हल्की सिंचाई शुरू करें।",
      "en": "Avoid spraying during full bloom; begin light basin irrigation once fruits reach pea size."
    },
    "steps": {
      "bn": [
        "মুকুল আসার আগে একবার এবং গুটি মটরদানার মতো হলে আরেকবার পরিমিত স্প্রে করুন।",
        "তীব্র গরমে গাছের গোড়ায় খড় বা কচুরিপানা দিয়ে মালচিং করে আর্দ্রতা ধরে রাখুন।",
        "গুটি ঝরা কমাতে বিকেলে (রোদ পড়ার পর) প্রতি লিটার পানিতে ১.৫–২ গ্রাম বোরন (সলুবর) অথবা ১০ গ্রাম (১%) ইউরিয়া স্প্রে করা যায়।"
      ],
      "hi": [
        "बौर निकलने से पहले और फल मटर के दाने के बराबर होने पर ही छिड़काव करें।",
        "तेज़ गर्मी में जड़ों के पास पुआल बिछाकर नमी बनाए रखें।",
        "फल झड़ने से रोकने के लिए शाम के समय हल्की सिंचाई और 1.5-2 ग्राम बोरॉन या 10 ग्राम (1%) यूरिया प्रति लीटर छिड़काव करें।"
      ],
      "en": [
        "Spray only before flower opening and again at pea-sized fruit stage.",
        "Mulch tree basins with dry straw to preserve soil moisture in summer heat.",
        "Irrigate lightly every 10–12 days and apply late-afternoon Boron (1.5–2g/L) or 1% Urea (10g/L) spray if young fruit drops."
      ]
    },
    "fertilizerNote": {
      "bn": "ফল সংগ্রহের পর বর্ষার আগে গাছপ্রতি জৈব সার, টিএসপি ও পটাশ প্রয়োগ করলে পরের বছর মুকুল ভালো আসে।",
      "hi": "फल तुड़ाई के बाद मानसून से पहले गोबर खाद, डीएपी और पोटाश डालने से अगले साल अच्छा बौर आता है।",
      "en": "Apply post-harvest organic manure and NPK before monsoon to support next year’s flowering."
    },
    "audioScript": {
      "bn": "আমের মুকুল পুরোপুরি ফুটে গেলে কখনো স্প্রে করবেন না, এতে পরাগায়ন নষ্ট হয়। আম মটরদানার সমান হলে গাছের গোড়ায় খড় বিছিয়ে হালকা সেচ দিলে গুটি ঝরা অনেক কমে যায়।",
      "hi": "आम का बौर पूरी तरह खिलने पर छिड़काव न करें। जब टिकोले मटर के दाने के बराबर हो जाएं, तब जड़ों में पुआल बिछाकर हल्की सिंचाई करें, इससे फल झड़ना रुकता है।",
      "en": "Never spray mango trees during full bloom. Once fruits reach pea size, mulch the tree basin and irrigate lightly to curb fruit drop."
    },
    "bookmarked": false
  },
  {
    "id": "tip-wheat-cri",
    "cropKey": "wheat",
    "seasonKey": "rabi",
    "cropName": {
      "bn": "গম",
      "hi": "गेहूं",
      "en": "Wheat"
    },
    "seasonLabel": {
      "bn": "রবি / শীতকালীন",
      "hi": "रबी / सर्दी",
      "en": "Rabi / Winter"
    },
    "title": {
      "bn": "গমের শিষ-তাপ ও ব্লাস্ট প্রতিরোধে সময়মতো বপন ও ১৭–২১ দিনে সেচ",
      "hi": "गेहूं में क्राउन रूट (17-21 दिन) सिंचाई व झुलसा बचाव",
      "en": "Wheat Blast Resistance & 17–21 Day CRI Irrigation Timing"
    },
    "summary": {
      "bn": "১৫–৩০ নভেম্বরের মধ্যে বারি গম-৩৩ বা ৩৫ বপন করুন এবং বপনের ১৭–২১ দিনের মাথায় প্রথম সেচ ও ইউরিয়া উপরি দিন।",
      "hi": "15-30 नवंबर के बीच बुवाई करें और 17-21 दिन की अवस्था (सीआरआई) पर पहली सिंचाई व यूरिया की टॉप ड्रेसिंग दें।",
      "en": "Sow blast-tolerant BARI Gom-33/35 in mid-late November and apply the critical first irrigation + urea top-dress at 17–21 days."
    },
    "steps": {
      "bn": [
        "গমের ব্লাস্ট প্রতিরোধে বারি গম-৩৩, ৩৫ বা ডব্লিউএমআরআই-৩ জাত বেছে নিন এবং বীজ শোধন করুন।",
        "বপনের ১৭–২১ দিনে (তিন পাতা ও কুঁড়ি পর্যায়) প্রথম সেচ দিন ও মাটিতে জো অবস্থায় বাকি ইউরিয়া প্রয়োগ করুন।",
        "শীষ বের হওয়ার সময় (৫০–৫৫ দিন) ও দানা গঠনের সময় (৭৫–৮০ দিন) দ্বিতীয় ও তৃতীয় হালকা সেচ দিন।",
        "বাতাসে আর্দ্রতা ৮০%+ ও মেঘলা আবহাওয়ায় শীষ বের হওয়ার সময় ট্রাইফ্লক্সিস্ট্রোবিন + টেবুকোনাজল প্রতিরোধক স্প্রে করুন।"
      ],
      "hi": [
        "उन्नत किस्म चुनें और बुवाई से पहले कार्बोक्सिन या ट्राइकोडर्मा से बीज उपचारित करें।",
        "बुवाई के 17-21 दिन (ताज जड़ अवस्था) पर पहली हल्की सिंचाई कर बची हुई यूरिया डालें।",
        "बाली निकलते (50-55 दिन) व दूधिया अवस्था (75-80 दिन) पर समय से सिंचाई करें।",
        "अधिक नमी व बादल रहने पर बाली निकलते समय फफूंदनाशी का बचाव छिड़काव करें।"
      ],
      "en": [
        "Choose blast-tolerant varieties (BARI Gom-33/35) and treat seed prior to mid-November sowing.",
        "Apply first irrigation strictly at 17–21 days (Crown Root Initiation) alongside remaining urea.",
        "Give second and third light irrigations at booting/heading (50–55d) and grain filling (75–80d).",
        "If cloudy humid weather coincides with heading, apply recommended strobilurin+triazole preventive spray."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): ইউরিয়া ২৪–২৮ কেজি (২/৩ অংশ শেষ চাষে, ১/৩ অংশ ১৭–২১ দিনে সেচের পর), টিএসপি ১৮–২২ কেজি, এমওপি ১৪–১৬ কেজি, জিপসাম ১৪ কেজি ও বোরন ১ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): यूरिया 24-28 किग्रा (2/3 बुवाई में, 1/3 पहली सिंचाई पर), डीएपी/टीएसपी 18-22 किग्रा, एमओपी 14-16 किग्रा, जिप्सम 14 किग्रा व बोरॉन 1 किग्रा।",
      "en": "Per 33-dec Bigha: Urea 24–28 kg (2/3 basal, 1/3 at 17–21d irrigation), TSP 18–22 kg, MoP 14–16 kg, Gypsum 14 kg & Boron 1 kg."
    },
    "audioScript": {
      "bn": "গমে ভালো ফলন পেতে ১৫ থেকে ৩০ নভেম্বরের মধ্যে বারি গম-৩৩ বা ৩৫ বপন করুন। বপনের ১৭ থেকে ২১ দিনের মাথায় প্রথম সেচ দিয়ে বাকি ইউরিয়া সার দিলে কুশি ও ছড়া অনেক বাড়ে।",
      "hi": "गेहूं की अच्छी पैदावार के लिए समय से बुवाई करें और 17 से 21 दिन की अवस्था पर पहली सिंचाई के साथ बची हुई यूरिया जरूर दें।",
      "en": "For high wheat yield, sow BARI Gom-33 or 35 on time and apply the first irrigation at 17 to 21 days with top-dress urea."
    },
    "bookmarked": false
  },
  {
    "id": "tip-onion-purple-blotch",
    "cropKey": "onion",
    "seasonKey": "rabi",
    "cropName": {
      "bn": "পেঁয়াজ",
      "hi": "प्याज",
      "en": "Onion"
    },
    "seasonLabel": {
      "bn": "রবি / শীত ও বসন্ত",
      "hi": "रबी व बसंत",
      "en": "Rabi & Spring"
    },
    "title": {
      "bn": "পেঁয়াজের পার্পল ব্লচ ও চারা থ্রিপস নিয়ন্ত্রণ",
      "hi": "प्याज में बैंगनी धब्बा (पर्पल ब्लॉच) व थ्रिप्स नियंत्रण",
      "en": "Onion Purple Blotch Prevention & Bulb Yield Care"
    },
    "summary": {
      "bn": "৪০–৪৫ দিনের চারা রোপণ করুন; সালফার-বোরন সার ও স্প্রেতে আঠালো স্টিকার ব্যবহার করলে পেঁয়াজ বড় ও দীর্ঘস্থায়ী হয়।",
      "hi": "40-45 दिन के स्वस्थ पौधे लगाएं; सल्फर-बोरॉन खाद व छिड़काव में स्टिकर मिलाने से कंद बड़े व टिकाऊ बनते हैं।",
      "en": "Transplant 40–45 day seedlings, include sulphur and boron for firm keeping quality, and add a wetting agent to sprays."
    },
    "steps": {
      "bn": [
        "বারি পেঁয়াজ-১ বা ৪ এর ৪০–৪৫ দিনের সুস্থ চারা ১৫×১০ সে.মি. দূরত্বে রোপণ করুন।",
        "শিকড় ও গলা পচা রোধে চারা রোপণের সময় গোড়া অতিরিক্ত গভীরে পুঁতবেন না (২–২.৫ সে.মি.)।",
        "পাতায় বেগুনি-সাদা দাগ (পার্পল ব্লচ) ও থ্রিপস দেখলে বিকেলে ম্যানকোজেব/ইপ্রোডিয়ন + স্টিকার স্প্রে করুন।",
        "গাছের ৭০–৮০% গলা নুয়ে পড়লে সেচ বন্ধ করে রোদে শুকিয়ে পেঁয়াজ তুলুন।"
      ],
      "hi": [
        "40-45 दिन के स्वस्थ पौधों की 15×10 सेमी दूरी पर उथली रोपाई (2-2.5 सेमी) करें।",
        "कंद सड़न रोकने के लिए जल निकासी अच्छी रखें और अतिरिक्त नाइट्रोजन न डालें।",
        "बैंगनी धब्बा व थ्रिप्स दिखने पर शाम को फफूंदनाशी के साथ चिपचिपा एजेंट (स्टिकर) मिलाकर छिड़कें।",
        "जब 70-80% पौधों की गर्दन झुक जाए तो सिंचाई बंद कर खुदाई करें।"
      ],
      "en": [
        "Transplant 40–45 day seedlings shallowly (2–2.5 cm) at 15×10 cm spacing.",
        "Avoid heavy late nitrogen to keep bulbs firm and reduce storage rot.",
        "Mix a non-ionic sticker/spreader with foliar fungicides against Purple Blotch on waxy leaves.",
        "Stop irrigation once 70–80% of necks fall over naturally before curing in shade."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): পচা গোবর ২ টন, ইউরিয়া ২৭–৩২ কেজি (২ কিস্তিতে), টিএসপি ২৫ কেজি, এমওপি ২০–২২ কেজি, জিপসাম ১৫ কেজি, জিংক ১.৫ কেজি ও বোরন ১ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): गोबर खाद 2 टन, यूरिया 27-32 किग्रा, टीएसपी 25 किग्रा, एमओपी 20-22 किग्रा, जिप्सम 15 किग्रा, जिंक 1.5 किग्रा व बोरॉन 1 किग्रा।",
      "en": "Per 33-dec Bigha: Well-rotted Compost 2 t, Urea 27–32 kg (2 splits), TSP 25 kg, MoP 20–22 kg, Gypsum 15 kg (Sulphur), Zinc 1.5 kg & Boron 1 kg."
    },
    "audioScript": {
      "bn": "পেঁয়াজের পাতা মোমযুক্ত হওয়ায় ওষুধ পিছলে পড়ে, তাই স্প্রের সাথে অবশ্যই আঠালো স্টিকার মিশিয়ে দেবেন। গাছের ৭০ শতাংশ গলা নুয়ে পড়লে সেচ বন্ধ করে পেঁয়াজ তুললে বহুদিন ভালো থাকে।",
      "hi": "प्याज की पत्तियां चिकनी होने के कारण छिड़काव में स्टिकर जरूर मिलाएं। 70 प्रतिशत गर्दन झुकने पर सिंचाई रोक दें।",
      "en": "Onion leaves are waxy, so add a spreader-sticker to sprays. Stop irrigating once 70 percent of tops fall over for long storage life."
    },
    "bookmarked": false
  },
  {
    "id": "tip-jute-stem-rot",
    "cropKey": "jute",
    "seasonKey": "kharif",
    "cropName": {
      "bn": "পাট (তোষা পাট)",
      "hi": "जूट / पटसन",
      "en": "Tossa Jute"
    },
    "seasonLabel": {
      "bn": "খরিফ-১ / গ্রীষ্ম",
      "hi": "खरीफ-1 / गर्मी",
      "en": "Kharif-1 / Pre-Monsoon"
    },
    "title": {
      "bn": "তোষা পাটের কাণ্ড পচা রোধ ও রিবন রেটিংয়ে সোনালি আঁশ",
      "hi": "जूट में तना सड़न रोकथाम और बेहतर रेशा सड़ाने की विधि",
      "en": "Tossa Jute Stem Rot Prevention & Clean Ribbon Retting"
    },
    "summary": {
      "bn": "বীজ শোধন করে মার্চ-এপ্রিলে বপন করুন; পাতলা করে চারা রাখলে ও রিবন রেটিং করলে উজ্জ্বল সোনালি আঁশ পাওয়া যায়।",
      "hi": "बीज उपचारित कर मार्च-अप्रैल में बुवाई करें; समय पर छंटाई व साफ पानी में सड़ाने से चमकदार सुनहरा रेशा मिलता है।",
      "en": "Treat seeds before March–April sowing, thin densely packed seedlings early, and use clean slow water or ribbon retting for Grade-A fiber."
    },
    "steps": {
      "bn": [
        "বপনের আগে প্রতি কেজি পাট বীজে ২ গ্রাম প্রোভেক্স বা কার্বেন্ডাজিম দিয়ে শোধন করুন।",
        "চারা ১০–১৫ সে.মি. বড় হলে নিড়ানি দিয়ে ঘন চারা তুলে ৫–৭ সে.মি. দূরত্ব বজায় রাখুন।",
        "জলাবদ্ধতা হলে আইল কেটে পানি বের করুন; কাণ্ড পচা দেখা দিলে কপার অক্সিক্লোরাইড গোড়ায় দিন।",
        "পানি কম থাকলে রিবন রেটিং পদ্ধতিতে আঁশ ছাড়িয়ে পরিষ্কার পানিতে ৮–১০ দিনে পচান (মাটি ও কলার থোড় দিয়ে ঢাকবেন না)।"
      ],
      "hi": [
        "बुवाई से पहले प्रति किलो बीज 2 ग्राम कार्बेन्डाजिम से उपचारित करें।",
        "पौधे 10-15 सेमी होने पर निराई व विरलीकरण कर 5-7 सेमी की दूरी रखें।",
        "खेत में जलभराव न होने दें; तना सड़न पर कॉपर ऑक्सीक्लोराइड का प्रयोग करें।",
        "साफ पानी में बंडल डुबोएं—मिट्टी या केले के तने के बजाय साफ कंकड़ से दबाएं ताकि रेशा काला न पड़े।"
      ],
      "en": [
        "Treat jute seed at 2g/kg with fungicide before sowing in late March–April.",
        "Weed and thin seedlings at 10–15 cm height to maintain 5–7 cm plant spacing.",
        "Drain standing rainwater quickly and drench stem-rot patches with copper oxychloride.",
        "Weight bundles with bamboo/concrete rather than mud or banana stems during 12–15 day clean-water retting."
      ]
    },
    "fertilizerNote": {
      "bn": "প্রতি বিঘায় (৩৩ শতাংশ): ইউরিয়া ২৩–২৮ কেজি (অর্ধেক বপনে, অর্ধেক ৩৫–৪০ দিনে নিড়ানির পর), টিএসপি ৭–১০ কেজি, এমওপি ৯–১২ কেজি ও জিপসাম ১২ কেজি।",
      "hi": "प्रति बीघा (33 डिसमिल): यूरिया 23-28 किग्रा (आधा बुवाई, आधा 35-40 दिन पर), टीएसपी 7-10 किग्रा, एमओपी 9-12 किग्रा व जिप्सम 12 किग्रा।",
      "en": "Per 33-dec Bigha: Urea 23–28 kg (half basal, half at 35–40d after weeding), TSP 7–10 kg, MoP 9–12 kg & Gypsum 12 kg."
    },
    "audioScript": {
      "bn": "পাট পচানোর সময় জাঁগের ওপর সরাসরি কাদা মাটি বা কলার থোড় দিলে আঁশ কালো হয়ে যায়। পরিষ্কার পানিতে বাঁশ ও কংক্রিটের চাকা বা রিবন রেটিং করলে উজ্জ্বল সোনালি পাট পাওয়া যায়।",
      "hi": "पटसन सड़ाते समय मिट्टी या केले के तने से दबाने पर रेशा काला हो जाता है। साफ पानी और कंकड़ का उपयोग करने से चमकदार सुनहरा रेशा मिलता है।",
      "en": "Avoid covering jute bundles with mud or banana stems during retting, as iron stains turn fiber dark. Clean water or ribbon retting yields bright golden fiber."
    },
    "bookmarked": false
  }
];

export const SEED_MARKET_PRICES: MarketPrice[] = [
  {
    "id": "mkt-rice-br28",
    "cropId": "rice-br28",
    "category": "grain",
    "cropNameBn": "মিনিকেট / বিআর-২৮ চাল",
    "cropNameHi": "मिनिकिट / धान चावल",
    "cropNameEn": "Miniket / BR-28 Rice",
    "marketName": "বগুড়া রাজাবাজার",
    "district": "Bogura",
    "pricePerKg": 66,
    "pricePerMaund": 2640,
    "previousPricePerKg": 64,
    "trend": "up",
    "currency": "BDT",
    "updatedAt": "2026-11-24T06:18:11.698Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-potato-diamond",
    "cropId": "potato-diamond",
    "category": "vegetable",
    "cropNameBn": "ডায়মন্ড আলু (পাইকারি)",
    "cropNameHi": "डायमंड आलू (थोक)",
    "cropNameEn": "Diamond Potato (Wholesale)",
    "marketName": "জয়পুরহাট হাট",
    "district": "Bogura",
    "pricePerKg": 38,
    "pricePerMaund": 1520,
    "previousPricePerKg": 40,
    "trend": "down",
    "currency": "BDT",
    "updatedAt": "2026-11-24T05:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-tomato-local",
    "cropId": "tomato-local",
    "category": "vegetable",
    "cropNameBn": "দেশি পাকা টমেটো",
    "cropNameHi": "देसी पका टमाटर",
    "cropNameEn": "Ripe Local Tomato",
    "marketName": "কুমিল্লা নিমসার বাজার",
    "district": "Cumilla",
    "pricePerKg": 54,
    "pricePerMaund": 2160,
    "previousPricePerKg": 54,
    "trend": "stable",
    "currency": "BDT",
    "updatedAt": "2026-11-24T04:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-onion-desi",
    "cropId": "onion-desi",
    "category": "spice",
    "cropNameBn": "দেশি পেঁয়াজ",
    "cropNameHi": "देसी प्याज़",
    "cropNameEn": "Desi Red Onion",
    "marketName": "ফরিদপুর কানাইপুর হাট",
    "district": "Faridpur",
    "pricePerKg": 88,
    "pricePerMaund": 3520,
    "previousPricePerKg": 82,
    "trend": "up",
    "currency": "BDT",
    "updatedAt": "2026-11-24T03:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-mustard-seed",
    "cropId": "mustard-seed",
    "category": "grain",
    "cropNameBn": "টরি-৭ সরিষা দানা",
    "cropNameHi": "सरसों बीज",
    "cropNameEn": "Mustard Seed",
    "marketName": "রাজশাহী বানেশ্বর হাট",
    "district": "Rajshahi",
    "pricePerKg": 96,
    "pricePerMaund": 3840,
    "previousPricePerKg": 96,
    "trend": "stable",
    "currency": "BDT",
    "updatedAt": "2026-11-24T02:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-chili-green",
    "cropId": "chili-green",
    "category": "spice",
    "cropNameBn": "কাঁচা মরিচ",
    "cropNameHi": "हरी मिर्च",
    "cropNameEn": "Fresh Green Chili",
    "marketName": "যশোর খাজুরা বাজার",
    "district": "Jashore",
    "pricePerKg": 112,
    "pricePerMaund": 4480,
    "previousPricePerKg": 120,
    "trend": "down",
    "currency": "BDT",
    "updatedAt": "2026-11-24T04:48:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-mango-himsagar",
    "cropId": "mango-himsagar",
    "category": "fruit",
    "cropNameBn": "হিমসাগর / ক্ষীরসাপাতি আম",
    "cropNameHi": "हिमसागर आम",
    "cropNameEn": "Himsagar Mango",
    "marketName": "চাঁপাইনবাবগঞ্জ কানসাট",
    "district": "Rajshahi",
    "pricePerKg": 90,
    "pricePerMaund": 3600,
    "previousPricePerKg": 85,
    "trend": "up",
    "currency": "BDT",
    "updatedAt": "2026-11-24T00:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-wheat-nadia",
    "cropId": "wheat-nadia",
    "category": "grain",
    "cropNameBn": "গম (আটা শস্য)",
    "cropNameHi": "गेहूं (मंडी थोक)",
    "cropNameEn": "Milling Wheat",
    "marketName": "কৃষ্ণনগর কৃষি মণ্ডী",
    "district": "Nadia",
    "pricePerKg": 31,
    "pricePerMaund": 1240,
    "previousPricePerKg": 30,
    "trend": "up",
    "currency": "INR",
    "updatedAt": "2026-11-24T03:18:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-garlic-desi",
    "cropId": "garlic-desi",
    "category": "spice",
    "cropNameBn": "দেশি রসুন",
    "cropNameHi": "देसी लहसुन",
    "cropNameEn": "Desi Garlic",
    "marketName": "নাটোর গুরুদাসপুর হাট",
    "district": "Rajshahi",
    "pricePerKg": 195,
    "pricePerMaund": 7800,
    "previousPricePerKg": 190,
    "trend": "up",
    "currency": "BDT",
    "updatedAt": "2026-11-24T05:30:11.699Z",
    "syncStatus": "synced"
  },
  {
    "id": "mkt-lentil-masoor",
    "cropId": "lentil-masoor",
    "category": "grain",
    "cropNameBn": "দেশি মসুর ডাল",
    "cropNameHi": "देसी मसूर दाल",
    "cropNameEn": "Red Lentil (Masoor Dal)",
    "marketName": "ঢাকা কারওয়ান বাজার",
    "district": "Dhaka",
    "pricePerKg": 134,
    "pricePerMaund": 5360,
    "previousPricePerKg": 135,
    "trend": "down",
    "currency": "BDT",
    "updatedAt": "2026-11-24T05:45:11.699Z",
    "syncStatus": "synced"
  }
];
