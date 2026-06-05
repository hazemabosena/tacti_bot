import re

file_name = "2026051498_000002_server.bin"

with open(file_name, "rb") as f:
    raw_data = f.read()

# هنستخرج أي نص إنجليزي أو أرقام طولها أكبر من 3 حروف
strings = re.findall(b"[a-zA-Z0-9_\-\.\/]{3,}", raw_data)

if strings:
    print(f"🎉 تم قفش {len(strings)} كلمة واضحة! جاري حفظهم...")
    
    # هنحفظهم في ملف وكل كلمة في سطر عشان تقرأهم بروقان
    with open("readable_strings.txt", "w", encoding="utf-8") as out:
        for s in strings:
            decoded_word = s.decode('utf-8', errors='ignore')
            out.write(decoded_word + "\n")
            
    print("💾 ادخل افتح ملف readable_strings.txt حالا في الـ VS Code وشوف جواه إيه!")
else:
    print("❌ ملقتش كلمات واضحة.")