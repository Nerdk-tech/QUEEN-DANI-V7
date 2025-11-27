const axios = require("axios");
const { ttdl } = require("ruhend-scraper");

const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
  try {
    // Prevent duplicate message processing
    if (processedMessages.has(message.key.id)) return;
    processedMessages.add(message.key.id);
    setTimeout(() => processedMessages.delete(message.key.id), 5 * 60 * 1000);

    const text =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text;

    if (!text) {
      return await sock.sendMessage(chatId, {
        text: "Please provide a TikTok video link.",
      });
    }

    const url = text.split(" ").slice(1).join(" ").trim();
    if (!url) {
      return await sock.sendMessage(chatId, {
        text: "Please provide a TikTok video link.",
      });
    }

    // Validate TikTok URL
    const valid = /(https?:\/\/(www\.)?(vm\.|vt\.)?tiktok\.com\/[^\s]+)/i;
    if (!valid.test(url)) {
      return await sock.sendMessage(chatId, {
        text: "âŒ Invalid TikTok link. Please send a proper TikTok URL.",
      });
    }

    await sock.sendMessage(chatId, { react: { text: "â³", key: message.key } });

    const apis = [
      `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(
        url
      )}`,
      `https://bk9.fun/download/tiktok2?url=${encodeURIComponent(url)}`,
      `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(
        url
      )}`,
    ];

    let videoUrl = null;

    // Try each API in sequence
    for (const api of apis) {
      try {
        const { data } = await axios.get(api, { timeout: 15000 });

        if (data?.status && data?.data?.meta?.media) {
          // Delirius API
          videoUrl = data.data.meta.media.find((v) => v.type === "video")?.org;
        } else if (data?.BK9?.video?.noWatermark) {
          // BK9 API
          videoUrl = data.BK9.video.noWatermark;
        } else if (data?.result && Array.isArray(data.result)) {
          // Jawad-Tech API
          videoUrl = data.result[0]?.url || data.result[0]?.video;
        }

        if (videoUrl) break;
      } catch (err) {
        console.log(`âš ï¸ API failed: ${api.split("/")[2]} â€” ${err.message}`);
        continue;
      }
    }

    // Fallback to ruhend-scraper if all APIs fail
    if (!videoUrl) {
      try {
        const dl = await ttdl(url);
        if (dl?.data?.[0]?.url) videoUrl = dl.data[0].url;
      } catch (e) {
        console.log("😞 Ruhend fallback failed:", e.message);
      }
    }

    if (!videoUrl) {
      return await sock.sendMessage(chatId, {
        text: "😔 All TikTok APIs failed. Please try again later.",
      });
    }

    // Send final video
    await sock.sendMessage(
      chatId,
      {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: "> 📷*𝕼𝖀𝕰𝕰𝕹 𝕯𝕬𝕹𝕴 𝖁7*",
      },
      { quoted: message }
    );

    await sock.sendMessage(chatId, { react: { text: "âœ…", key: message.key } });
  } catch (err) {
    console.error("TikTok Command Error:", err);
    await sock.sendMessage(chatId, {
      text: "😠 Error while processing TikTok link. Try again later.",
    });
  }
}

module.exports = tiktokCommand;