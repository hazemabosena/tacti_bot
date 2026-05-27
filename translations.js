const languages = [
  { name: "English", value: "en" },
  { name: "Русский (Russian)", value: "ru" },
  { name: "Français (French)", value: "fr" },
  { name: "Polski (Polish)", value: "pl" },
  { name: "한국어 (Korean)", value: "ko" },
  { name: "Deutsch (German)", value: "de" },
  { name: "Italiano (Italian)", value: "it" },
  { name: "Español (Spanish)", value: "es" },
  { name: "Português (Portugal)", value: "pt-PT" },
  { name: "Português (Brasil)", value: "pt-BR" },
  { name: "ภาษาไทย (Thai)", value: "th" },
  { name: "日本語 (Japanese)", value: "ja" },
  { name: "Türkçe (Turkish)", value: "tr" },
  { name: "简体中文 (Simplified Chinese)", value: "zh-CN" },
  { name: "繁體中文 (Traditional Chinese)", value: "zh-TW" },
  { name: "Bahasa Melayu (Malay)", value: "ms" },
  { name: "العربية (Arabic)", value: "ar" },
  { name: "Indonesian", value: "id" },
  { name: "Українська (Ukrainian)", value: "uk" }
];

const missionTranslations = {
  "Skip": {
    en: "Skip", ru: "Пропустить", fr: "Ignorer", pl: "Pomiń", ko: "건너뛰기",
    de: "Überspringen", it: "Salta", es: "Omitir", "pt-PT": "Ignorar", "pt-BR": "Pular",
    th: "ข้าม", ja: "スキップ", tr: "Atla", "zh-CN": "跳过", "zh-TW": "跳過",
    ms: "Langkau", ar: "تخطي", id: "Lewati", uk: "Пропустити"
  },
  "Breach": {
    en: "Breach", ru: "Прорыв", fr: "Brèche", pl: "Wyłom", ko: "돌파",
    de: "Durchbruch", it: "Breccia", es: "Brecha", "pt-PT": "Rutura", "pt-BR": "Invasão",
    th: "ฝ่าแนว", ja: "突破", tr: "Yarma", "zh-CN": "突破", "zh-TW": "突破",
    ms: "Serbuan", ar: "اختراق", id: "Terobosan", uk: "Прорив"
  },
  "B.S.S": {
    en: "B.S.S", ru: "Б.С.С", fr: "B.S.S", pl: "B.S.S", ko: "B.S.S",
    de: "B.S.S", it: "B.S.S", es: "B.S.S", "pt-PT": "B.S.S", "pt-BR": "B.S.S",
    th: "B.S.S", ja: "B.S.S", tr: "B.S.S", "zh-CN": "B.S.S", "zh-TW": "B.S.S",
    ms: "B.S.S", ar: "B.S.S", id: "B.S.S", uk: "B.S.S"
  },
  "Basic Mission": {
    en: "Basic Mission", ru: "Базовая миссия", fr: "Mission de base", pl: "Misja podstawowa", ko: "기본 임무",
    de: "Grundmission", it: "Missione base", es: "Misión básica", "pt-PT": "Missão básica", "pt-BR": "Missão básica",
    th: "ภารกิจพื้นฐาน", ja: "基本ミッション", tr: "Temel görev", "zh-CN": "基础任务", "zh-TW": "基礎任務",
    ms: "Misi asas", ar: "مهمة أساسية", id: "Misi Dasar", uk: "Базова місія"
  },
  "Bayonet": {
    en: "Bayonet", ru: "Штык", fr: "Baïonnette", pl: "Bagnet", ko: "총검",
    de: "Bajonett", it: "Baionetta", es: "Bayoneta", "pt-PT": "Baioneta", "pt-BR": "Baioneta",
    th: "ดาบปลายปืน", ja: "銃剣", tr: "Süngü", "zh-CN": "刺刀", "zh-TW": "刺刀",
    ms: "Bayonet", ar: "حربة", id: "Bayonet", uk: "Багнет"
  },
  "Clean Up": {
    en: "Clean Up", ru: "Зачистка", fr: "Nettoyage", pl: "Czyszczenie", ko: "정리",
    de: "Säuberung", it: "Ripulitura", es: "Limpieza", "pt-PT": "Limpeza", "pt-BR": "Limpeza",
    th: "กวาดล้าง", ja: "掃討", tr: "Temizlik", "zh-CN": "清理", "zh-TW": "清理",
    ms: "Pembersihan", ar: "تطهير", id: "Pembersihan", uk: "Зачистка"
  },
  "Common Only": {
    en: "Common Only", ru: "Только обычные", fr: "Communs uniquement", pl: "Tylko zwykli", ko: "일반만",
    de: "Nur gewöhnlich", it: "Solo comuni", es: "Solo comunes", "pt-PT": "Só comuns", "pt-BR": "Apenas comuns",
    th: "เฉพาะทั่วไป", ja: "コモンのみ", tr: "Sadece yaygın", "zh-CN": "仅普通", "zh-TW": "僅普通",
    ms: "Biasa sahaja", ar: "العادي فقط", id: "Hanya Umum", uk: "Лише звичайні"
  },
  "Cover": {
    en: "Cover", ru: "Прикрытие", fr: "Couverture", pl: "Osłona", ko: "엄호",
    de: "Deckung", it: "Copertura", es: "Cobertura", "pt-PT": "Cobertura", "pt-BR": "Cobertura",
    th: "คุ้มกัน", ja: "援護", tr: "Koruma", "zh-CN": "掩护", "zh-TW": "掩護",
    ms: "Perlindungan", ar: "تغطية", id: "Perlindungan", uk: "Прикриття"
  },
  "Hammer": {
    en: "Hammer", ru: "Молот", fr: "Marteau", pl: "Młot", ko: "해머",
    de: "Hammer", it: "Martello", es: "Martillo", "pt-PT": "Martelo", "pt-BR": "Martelo",
    th: "ค้อน", ja: "ハンマー", tr: "Çekiç", "zh-CN": "重锤", "zh-TW": "重錘",
    ms: "Tukul", ar: "مطرقة", id: "Palu", uk: "Молот"
  },
  "HILDR": {
    en: "HILDR", ru: "ХИЛДР", fr: "HILDR", pl: "HILDR", ko: "HILDR",
    de: "HILDR", it: "HILDR", es: "HILDR", "pt-PT": "HILDR", "pt-BR": "HILDR",
    th: "HILDR", ja: "HILDR", tr: "HILDR", "zh-CN": "HILDR", "zh-TW": "HILDR",
    ms: "HILDR", ar: "HILDR", id: "HILDR", uk: "HILDR"
  },
  "Knife": {
    en: "Knife", ru: "Нож", fr: "Couteau", pl: "Nóż", ko: "칼",
    de: "Messer", it: "Coltello", es: "Cuchillo", "pt-PT": "Faca", "pt-BR": "Faca",
    th: "มีด", ja: "ナイフ", tr: "Bıçak", "zh-CN": "匕首", "zh-TW": "匕首",
    ms: "Pisau", ar: "سكين", id: "Pisau", uk: "Ніж"
  },
  "Local": {
    en: "Local", ru: "Местные", fr: "Local", pl: "Lokalna", ko: "로컬",
    de: "Lokal", it: "Locale", es: "Local", "pt-PT": "Local", "pt-BR": "Local",
    th: "ท้องถิ่น", ja: "ローカル", tr: "Yerel", "zh-CN": "本地", "zh-TW": "本地",
    ms: "Tempatan", ar: "محلي", id: "Lokal", uk: "Місцева"
  },
  "Logistics": {
    en: "Logistics", ru: "Логистика", fr: "Logistique", pl: "Logistyka", ko: "군수",
    de: "Logistik", it: "Logistica", es: "Logística", "pt-PT": "Logística", "pt-BR": "Logística",
    th: "โลจิสติกส์", ja: "兵站", tr: "Lojistik", "zh-CN": "后勤", "zh-TW": "後勤",
    ms: "Logistik", ar: "إمداد", id: "Logistik", uk: "Логістика"
  },
  "Rare Only": {
    en: "Rare Only", ru: "Только редкие", fr: "Rares uniquement", pl: "Tylko rzadcy", ko: "희귀만",
    de: "Nur selten", it: "Solo rari", es: "Solo raros", "pt-PT": "Só raros", "pt-BR": "Apenas raros",
    th: "เฉพาะหายาก", ja: "レアのみ", tr: "Sadece nadir", "zh-CN": "仅稀有", "zh-TW": "僅稀有",
    ms: "Jarang sahaja", ar: "النادر فقط", id: "Hanya Langka", uk: "Лише рідкісні"
  },
  "Recon": {
    en: "Recon", ru: "Разведка", fr: "Reconnaissance", pl: "Rozpoznanie", ko: "정찰",
    de: "Aufklärung", it: "Ricognizione", es: "Reconocimiento", "pt-PT": "Reconhecimento", "pt-BR": "Reconhecimento",
    th: "ลาดตระเวน", ja: "偵察", tr: "Keşif", "zh-CN": "侦察", "zh-TW": "偵察",
    ms: "Tinjauan", ar: "استطلاع", id: "Pengintaian", uk: "Розвідка"
  },
  "Showdown": {
    en: "Showdown", ru: "Решающая схватка", fr: "Affrontement", pl: "Starcie", ko: "결전",
    de: "Showdown", it: "Resa dei conti", es: "Enfrentamiento", "pt-PT": "Confronto", "pt-BR": "Confronto",
    th: "ดวลตัดสิน", ja: "決戦", tr: "Hesaplaşma", "zh-CN": "决战", "zh-TW": "決戰",
    ms: "Pertarungan akhir", ar: "مواجهة حاسمة", id: "Pertarungan", uk: "Вирішальна сутичка"
  },
  "Uncommon Only": {
    en: "Uncommon Only", ru: "Только необычные", fr: "Inhabituels uniquement", pl: "Tylko niepospolici", ko: "고급만",
    de: "Nur ungewöhnlich", it: "Solo non comuni", es: "Solo poco comunes", "pt-PT": "Só incomuns", "pt-BR": "Apenas incomuns",
    th: "เฉพาะไม่ธรรมดา", ja: "アンコモンのみ", tr: "Sadece az yaygın", "zh-CN": "仅优秀", "zh-TW": "僅優秀",
    ms: "Tidak biasa sahaja", ar: "غير الشائع فقط", id: "Hanya Tidak Umum", uk: "Лише незвичайні"
  }
};

const operatorNames = [
  "Apollon", "Batya", "Boris", "Capisce", "Charon", "Chen li", "David", "Diana",
  "Dmitry", "Dutch", "Hawk", "Jason", "JB", "Kirin", "Klaus", "Lens", "Mcmean",
  "Mia", "Miro", "Mishka", "Moses", "Owen", "Phoenix", "Ray", "Rick", "Rookie",
  "Shi", "Snek", "Spencer", "Syndrome", "Thor", "Travis", "Valera", "Varg",
  "Victor", "Whisper", "Zloy"
];

const operatorOverrides = {
  "Chen li": { ru: "Чэнь Ли", ko: "첸 리", ja: "チェン・リー", "zh-CN": "陈立", "zh-TW": "陳立", ar: "تشين لي", uk: "Чень Лі" },
  "Dmitry": { ru: "Дмитрий", uk: "Дмитро", ar: "دميتري" },
  "Mishka": { ru: "Мишка", uk: "Мішка", ar: "ميشكا" },
  "Moses": { ru: "Моисей", fr: "Moïse", es: "Moisés", "pt-PT": "Moisés", "pt-BR": "Moisés", ar: "موسى", uk: "Мойсей" },
  "Rookie": { ru: "Новичок", fr: "Recrue", pl: "Rekrut", ko: "루키", de: "Neuling", it: "Recluta", es: "Novato", "pt-PT": "Recruta", "pt-BR": "Recruta", th: "มือใหม่", ja: "ルーキー", tr: "Çaylak", "zh-CN": "新兵", "zh-TW": "新兵", ms: "Rekrut", ar: "مبتدئ", id: "Pemula", uk: "Новачок" },
  "Whisper": { ru: "Шепот", fr: "Murmure", pl: "Szept", ko: "위스퍼", de: "Flüstern", it: "Sussurro", es: "Susurro", "pt-PT": "Sussurro", "pt-BR": "Sussurro", th: "กระซิบ", ja: "ウィスパー", tr: "Fısıltı", "zh-CN": "低语", "zh-TW": "低語", ms: "Bisikan", ar: "همس", id: "Bisikan", uk: "Шепіт" },
  "Zloy": { ru: "Злой", uk: "Злий", ar: "زلوي" }
};

const operatorTranslations = Object.fromEntries(
  operatorNames.map(name => [name, { en: name, ...(operatorOverrides[name] || {}) }])
);

const uiTranslations = {
  title: {
    en: "Best operator placement for your clan:",
    ru: "Лучшее размещение оперативников для клана:",
    fr: "Meilleur placement des opérateurs pour votre clan :",
    pl: "Najlepsze rozmieszczenie operatorów dla klanu:",
    ko: "클랜을 위한 최적 오퍼레이터 배치:",
    de: "Beste Operator-Platzierung für deinen Clan:",
    it: "Miglior disposizione degli operatori per il clan:",
    es: "Mejor colocación de operadores para tu clan:",
    "pt-PT": "Melhor distribuição de operadores para o teu clã:",
    "pt-BR": "Melhor distribuição de operadores para seu clã:",
    th: "การจัดวางโอเปอเรเตอร์ที่ดีที่สุดสำหรับแคลน:",
    ja: "クラン向けの最適なオペレーター配置:",
    tr: "Klanın için en iyi operatör yerleşimi:",
    "zh-CN": "你的氏族最佳干员分配:",
    "zh-TW": "你的氏族最佳幹員分配:",
    ms: "Penempatan operator terbaik untuk klan anda:",
    ar: "أفضل توزيع للمشغلين لعشيرتك:",
    id: "Penempatan operator terbaik untuk klanmu:",
    uk: "Найкраще розміщення операторів для клану:"
  },
  skipped: {
    en: "skipped", ru: "пропущено", fr: "ignoré", pl: "pominięto", ko: "건너뜀",
    de: "übersprungen", it: "saltato", es: "omitido", "pt-PT": "ignorado", "pt-BR": "pulado",
    th: "ข้ามแล้ว", ja: "スキップ", tr: "atlandı", "zh-CN": "已跳过", "zh-TW": "已跳過",
    ms: "dilangkau", ar: "تم التخطي", id: "dilewati", uk: "пропущено"
  },
  noOperators: {
    en: "No operators", ru: "Нет оперативников", fr: "Aucun opérateur", pl: "Brak operatorów", ko: "오퍼레이터 없음",
    de: "Keine Operatoren", it: "Nessun operatore", es: "Sin operadores", "pt-PT": "Sem operadores", "pt-BR": "Sem operadores",
    th: "ไม่มีโอเปอเรเตอร์", ja: "オペレーターなし", tr: "Operatör yok", "zh-CN": "无干员", "zh-TW": "無幹員",
    ms: "Tiada operator", ar: "لا يوجد مشغلون", id: "Tidak ada operator", uk: "Немає операторів"
  },
  mustPickMission: {
    en: "❌ You must pick at least one mission.",
    ru: "❌ Вы должны выбрать хотя бы одну миссию.",
    fr: "❌ Vous devez choisir au moins une mission.",
    pl: "❌ Musisz wybrać co najmniej jedną misję.",
    ko: "❌ 최소 하나의 임무를 선택해야 합니다.",
    de: "❌ Du musst mindestens eine Mission auswählen.",
    it: "❌ Devi scegliere almeno una missione.",
    es: "❌ Debes elegir al menos una misión.",
    "pt-PT": "❌ Tens de escolher pelo menos uma missão.",
    "pt-BR": "❌ Você precisa escolher pelo menos uma missão.",
    th: "❌ คุณต้องเลือกอย่างน้อยหนึ่งภารกิจ",
    ja: "❌ 少なくとも1つのミッションを選択してください。",
    tr: "❌ En az bir görev seçmelisin.",
    "zh-CN": "❌ 你必须至少选择一个任务。",
    "zh-TW": "❌ 你必須至少選擇一個任務。",
    ms: "❌ Anda mesti memilih sekurang-kurangnya satu misi.",
    ar: "❌ يجب اختيار مهمة واحدة على الأقل.",
    id: "❌ Kamu harus memilih setidaknya satu misi.",
    uk: "❌ Потрібно вибрати хоча б одну місію."
  }
};

function normalizeLanguage(language) {
  return languages.some(item => item.value === language) ? language : "en";
}

function translateFrom(table, key, language) {
  const lang = normalizeLanguage(language);
  return (table[key] && (table[key][lang] || table[key].en)) || key;
}

function translateMission(name, language) {
  return translateFrom(missionTranslations, name, language);
}

function translateOperator(name, language) {
  return translateFrom(operatorTranslations, name, language);
}

function translateUi(key, language) {
  return translateFrom(uiTranslations, key, language);
}

module.exports = {
  languages,
  translateMission,
  translateOperator,
  translateUi,
  normalizeLanguage
};
