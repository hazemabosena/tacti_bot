import os
import re
from flask import Flask, jsonify

app = Flask(__name__)

# المسار المباشر للفولدر اللي بتنزل فيه ملفات الـ bin بتاعة تشارلز
# . تعني نفس الفولدر الحالي اللي فيه السكريبت
PACKETS_DIR = "." 

def extract_strings_from_bin(file_path):
    """برمجية لقراءة ملف الباينري وشفط النصوص الإنجليزية والأرقام منه"""
    try:
        with open(file_path, "rb") as f:
            raw_data = f.read()
        
        # بنلقط أي نصوص صريحة طولها من 3 لـ 100 حرف (أسماء لاعبين، عروض، سيرفرات، شات)
        strings = re.findall(b"[a-zA-Z0-9_\-\.\/]{3,100}", raw_data)
        return [s.decode('utf-8', errors='ignore') for s in strings]
    except Exception as e:
        return []

@app.route('/api/latest_data', methods=['GET'])
def get_latest_tacticool_data():
    """حفظ وقراءة آخر باكت سيرفر نزل لتقديمه كـ JSON API"""
    try:
        # 1. البحث عن كل ملفات السيرفر والكلينت جوه الفولدر
        all_files = [os.path.join(PACKETS_DIR, f) for f in os.listdir(PACKETS_DIR) if f.endswith('.bin')]
        
        if not all_files:
            return jsonify({
                "status": "error",
                "message": "🚨 لم يتم العثور على أي ملفات باكت .bin في الفولدر الحالي"
            }), 404

        # 2. ترتيب الملفات عشان نجيب أحدث باكت السيرفر بعته حالاً
        all_files.sort(key=os.path.getmtime, reverse=True)
        latest_file = all_files[0]
        
        # 3. استخراج الداتا المقروءة من الباكت
        extracted_data = extract_strings_from_bin(latest_file)
        
        # 4. تصنيف الداتا بشكل ذكي عشان البوت يفهمها
        player_id = None
        store_items = []
        regions = []
        chat_messages = []
        
        for item in extracted_data:
            if "com.panzerdog" in item:
                store_items.append(item)
            elif item.count('-') == 4 and len(item) == 36: # شكل الـ UUID بتاع الـ Player ID
                player_id = item
            elif item in ['eu-central-1', 'us-east-1', 'ap-south-1', 'sa-east-1', 'af-south-1']:
                regions.append(item)
            elif len(item) > 10 and not item.startswith("com."):
                # لو نص طويل مش تبع روابط المتجر، غالباً هيكون رسايل شات أو أسماء كلانات
                chat_messages.append(item)

        # الرد المتقشر على شكل JSON نقي
        return jsonify({
            "status": "success",
            "source_file": os.path.basename(latest_file),
            "data": {
                "player_id": player_id,
                "regions_detected": list(set(regions)),
                "shop_offers": list(set(store_items)),
                "raw_captured_text": chat_messages[:20] # أعلى 20 رسالة ملقوطة
            }
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("🔥 Tacticool Local API Proxy Is Running!")
    print("🌐 URL: http://127.0.0.1:5000/api/latest_data")
    app.run(host='0.0.0.0', port=5000, debug=True)