const languages = {
  English: {
    title: "🔔 Clan Missions Reset!",
    message: "Don't forget to send your operators.",
    footer: "Good luck, soldiers."
  },
  Arabic: {
    title: "🔔 تم إعادة تعيين مهام العشيرة!",
    message: "لا تنس إرسال العملاء إلى المهام.",
    footer: "بالتوفيق أيها الجنود."
  },
  Spanish: {
    title: "🔔 ¡Las misiones del clan se han reiniciado!",
    message: "No olvides enviar a tus operadores.",
    footer: "Buena suerte, soldados."
  },
  Portuguese: {
    title: "🔔 As missões do clã foram reiniciadas!",
    message: "Não se esqueça de enviar seus operadores.",
    footer: "Boa sorte, soldados."
  },
  Russian: {
    title: "🔔 Миссии клана сброшены!",
    message: "Не забудьте отправить своих оперативников.",
    footer: "Удачи, солдаты."
  },
  French: {
    title: "🔔 Les missions de clan ont été réinitialisées !",
    message: "N'oubliez pas d'envoyer vos opérateurs.",
    footer: "Bonne chance, soldats."
  },
  German: {
    title: "🔔 Die Clan-Missionen wurden zurückgesetzt!",
    message: "Vergesst nicht, eure Operatoren zu schicken.",
    footer: "Viel Glück, Soldaten."
  },
  Turkish: {
    title: "🔔 Klan görevleri sıfırlandı!",
    message: "Operatörlerinizi göndermeyi unutmayın.",
    footer: "İyi şanslar askerler."
  },
  Indonesian: {
    title: "🔔 Misi klan telah direset!",
    message: "Jangan lupa mengirim operator Anda.",
    footer: "Semoga berhasil, prajurit."
  },
  Polish: {
    title: "🔔 Misje klanu zostały zresetowane!",
    message: "Nie zapomnij wysłać swoich operatorów.",
    footer: "Powodzenia, żołnierze."
  },
  Italian: {
    title: "🔔 Le missioni del clan sono state ripristinate!",
    message: "Non dimenticare di inviare i tuoi operatori.",
    footer: "Buona fortuna, soldati."
  },
  Ukrainian: {
    title: "🔔 Кланові місії скинуто!",
    message: "Не забудьте відправити своїх оперативників.",
    footer: "Успіхів, солдати."
  },
  Japanese: {
    title: "🔔 クランミッションがリセットされました！",
    message: "オペレーターの派遣を忘れないでください。",
    footer: "幸運を、兵士たち。"
  },
  Korean: {
    title: "🔔 클랜 미션이 초기화되었습니다!",
    message: "오퍼레이터를 보내는 것을 잊지 마세요.",
    footer: "행운을 빕니다, 병사들."
  },
  Vietnamese: {
    title: "🔔 Nhiệm vụ bang hội đã được đặt lại!",
    message: "Đừng quên cử các đặc vụ của bạn.",
    footer: "Chúc may mắn, các chiến binh."
  },
  Thai: {
    title: "🔔 ภารกิจแคลนถูกรีเซ็ตแล้ว!",
    message: "อย่าลืมส่งโอเปอเรเตอร์ของคุณ.",
    footer: "โชคดีนะทหาร."
  },
  Chinese: {
    title: "🔔 战队任务已重置！",
    message: "别忘了派遣你的特工。",
    footer: "祝你好运，士兵们。"
  },
  Hindi: {
    title: "🔔 क्लैन मिशन रीसेट हो गए हैं!",
    message: "अपने ऑपरेटर भेजना न भूलें।",
    footer: "शुभकामनाएँ, सैनिकों।"
  },
  Dutch: {
    title: "🔔 Clanmissies zijn gereset!",
    message: "Vergeet niet je operators te sturen.",
    footer: "Succes, soldaten."
  },
  Swedish: {
    title: "🔔 Klanuppdragen har återställts!",
    message: "Glöm inte att skicka dina operatörer.",
    footer: "Lycka till, soldater."
  },
  Czech: {
    title: "🔔 Klanové mise byly resetovány!",
    message: "Nezapomeň poslat své operátory.",
    footer: "Hodně štěstí, vojáci."
  },
  Hungarian: {
    title: "🔔 A klánküldetések visszaálltak!",
    message: "Ne felejtsd el elküldeni az operátoraidat.",
    footer: "Sok szerencsét, katonák."
  },
  Romanian: {
    title: "🔔 Misiunile clanului au fost resetate!",
    message: "Nu uita să îți trimiți operatorii.",
    footer: "Mult noroc, soldați."
  }
};

function getLanguageChoices() {
  return Object.keys(languages).map((lang) => ({
    name: lang,
    value: lang,
  }));
}

module.exports = {
  getLanguageChoices,
  languages,
};