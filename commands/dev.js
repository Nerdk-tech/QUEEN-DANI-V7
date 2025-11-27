// commands/dev.js
async function devCommand(sock, chatId, message, q) {
  try {
    const senderJid = message.key?.participant || message.key?.remoteJid || message.sender || '';
    const pushname =
      message.pushName ||
      message.message?.pushName ||
      (senderJid ? senderJid.split('@')[0] : 'there');

    const name = pushname || 'there';

    const caption = `
╭─⌈ *👨‍💻 ʙᴏᴛ ᴅᴇᴠᴇʟᴏᴘᴇʀ* ⌋─
│
│ 👋 Hello, *${name}*!
│
│ 🤖 I'm DAMINĪ 😈. the creator and
│    maintainer of this smart WhatsApp bot. supported by my wife and my amazing members.
│
│ 👨‍💻 *ᴅᴇᴠ ɪɴꜰᴏ:*
│ ──────────
│ 🧠 *Name:* Dev Daminī 
│ 📞 *Contact:* wa.me/2348054671458
│ 📺 *YouTube:* Nerdktech
│     https://youtube.com/@Nerdktech
│
╰─────────

> 𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗩𝟕
    `.trim();

    const contextInfo = {
      mentionedJid: senderJid ? [senderJid] : [],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363377534493877@newsletter",
        newsletterName: "𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗩𝟕",
        serverMessageId: 143
      },
      externalAdReply: {
        title: "𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗩𝟕",
        body: "Include Dani. Enter the Abyss",
        thumbnailUrl: "https://files.catbox.moe/j562rg.jpg",
        mediaType: 1,
        renderSmallerThumbnail: true,
        showAdAttribution: true,
        mediaUrl: "https://youtube.com/@Nerdktech",
        sourceUrl: "https://youtube.com/@Nerdktech"
      }
    };

    await sock.sendMessage(
      chatId,
      {
        image: { url: "https://files.catbox.moe/j562rg.jpg" },
        caption,
        contextInfo
      },
      { quoted: message }
    );
  } catch (err) {
    console.error("devCommand error:", err);
    await sock.sendMessage(chatId, { text: `❌ Error showing dev info: ${err.message}` }, { quoted: message });
  }
}

module.exports = devCommand;
