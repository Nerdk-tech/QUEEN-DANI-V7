// commands/check.js
const axios = require("axios");

// Convert ISO code (UG, ZW, etc.) to 🇺🇬 🇿🇼 flag emoji
function getFlagEmoji(code) {
  if (!code) return "";
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

async function checkCommand(sock, chatId, message, q) {
  try {
    if (!q) {
      return await sock.sendMessage(
        chatId,
        { text: "❌ Please provide a country code. Example: `.check 263`" },
        { quoted: message }
      );
    }

    const code = q.replace(/\D/g, ""); // keep only digits

    console.log("[check] fetching countries for query:", q, "normalized:", code);

    // Always use v3.1
    const { data } = await axios.get("https://restcountries.com/v3.1/all");

    // find matches
    const matches = [];
    for (const c of data) {
      if (c.idd?.root && c.idd?.suffixes?.length) {
        const root = c.idd.root.replace("+", "");
        for (const suf of c.idd.suffixes) {
          const candidate = (root + suf).replace(/\D/g, "");
          if (candidate === code) {
            matches.push({
              name: c.name?.common || "Unknown",
              flag: getFlagEmoji(c.cca2),
              fullCode: `+${candidate}`,
            });
          }
        }
      }
    }

    console.log("[check] matches found:", matches.length);

    if (!matches.length) {
      return await sock.sendMessage(
        chatId,
        { text: `❌ No country found for code ${code}.` },
        { quoted: message }
      );
    }

    const text = `✅ *Country Code:* +${code}\n\n` +
      matches.map((m, i) => `${i + 1}. ${m.flag} ${m.name} (${m.fullCode})`).join("\n");

    await sock.sendMessage(chatId, { text }, { quoted: message });
  } catch (err) {
    console.error("[check] error:", err.response?.status, err.response?.data || err.message);
    await sock.sendMessage(
      chatId,
      {
        text: `❌ Failed to fetch country info.\nDebug: ${
          err.response?.status || err.message
        }`,
      },
      { quoted: message }
    );
  }
}

module.exports = checkCommand;
