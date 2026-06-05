# 🌐 Tacticool Dashboard - Web Setup Guide

## ✅ آيه اللي اتعمل؟

تم إضافة موقع ويب وـ API محلي بجانب البوت في نفس الفولدر والبورت!

### الملفات الجديدة:
- ✨ **`public/index.html`** - لوحة التحكم (Dashboard) جميلة وحديثة
- 🔧 **`index.js`** - تحديث البوت ليستخدم Express بدلاً من http الخام

---

## 🚀 كيفية التشغيل

### محلياً (Localhost):
```bash
cd "d:\mazen\discord bot\TACTIOPBOT"
node index.js
```

بعدها افتح المتصفح وروح إلى:
- 🎮 **Dashboard**: `http://localhost:3000`
- 📡 **API Endpoint**: `http://localhost:3000/api/tacticool`
- 🏥 **Health Check**: `http://localhost:3000/health`

---

## 🎨 الميزات

### على الموقع:
✅ عرض Session ID (Player ID)
✅ عرض السيرفرات المتاحة (Regions)
✅ عرض عروض المتجر النشطة (Shop Offers)
✅ تحديث البيانات تلقائي كل 10 ثواني
✅ عرض الـ JSON Response كاملة
✅ مؤشر الحالة (Online/Offline)
✅ تصميم dark mode جميل

### على البوت:
✅ الأمر `!tacticool` يعمل بدون مشاكل
✅ يستهلك من نفس الـ API
✅ البوت والموقع على نفس البورت

---

## 📡 كيفية الربط مع tacticool_api.js

الموقع بتاعك يستقرأ من الـ API endpoint:

```
GET /api/tacticool
```

Response:
```json
{
  "status": "success",
  "data": {
    "playerId": "12345678-1234-1234-1234-123456789012",
    "shopOffers": ["com.panzerdog.offer1", "com.panzerdog.offer2"],
    "regions": ["eu-central-1", "us-east-1"]
  },
  "timestamp": "2026-05-30T12:00:00.000Z"
}
```

---

## 🌐 لما تستضيف على BotHosting.net

1. **البوت هيشغل عادي** - مش محتاج تغيير في TOKEN
2. **الموقع هيبقى لايف** - على اللينك اللي الاستضافة هتديهولك
3. **البورت**: الاستضافة هتديك واحد - express هتشتغل عليه تلقائياً (مش محتاج تعديل)

### العملية:
```
BotHosting.net
     ↓ (يفتح البورت)
     ↓
PORT=xxxx node index.js
     ↓
Express App يبدأ
     ↓
     ├─→ 🌐 يخدم الـ HTML من `public/`
     ├─→ 📡 API endpoint `/api/tacticool`
     └─→ 🤖 Discord Bot يتسجل
```

---

## ⚠️ نقطة مهمة

**الموقع بتاعك هياخد بيانات من `packet.bin` اللي في نفس الفولدر.**

لو أنت على كمبيوتر مختلف عن اللي تشغل Charles فيه:
- البيانات مش هتتحدث تلقائياً
- محتاج تخلي شيء يبعت الداتا إلى الاستضافة (FTP، Git، API، إلخ)

---

## 🧪 اختبر الآن

```bash
node index.js
```

بعدها:
1. افتح `http://localhost:3000` في المتصفح
2. شوف اللوحة تحميل البيانات
3. اختبر الأمر `!tacticool` في الديسكورد

---

## 📝 الملاحظات

- ✅ Express تخدم الـ static files تلقائياً من `public/`
- ✅ الـ API على نفس البورت
- ✅ البوت والموقع في نفس الـ process
- ✅ لا تحتاج لفتح أكثر من بورت واحد

**Good to go! 🚀**
