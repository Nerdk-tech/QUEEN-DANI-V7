

// commands/kill.js

module.exports = async (sock, chatId, message) => {
  try {
    const body =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "";

    const args = body.split(" ").slice(1); // get target number if provided
    const target = args[0] || "unknown";

    const replyMsg = 
`❌ *Access Denied* ❌

⚠️ You tried to destroyed: *${target}*

This feature is for *VIP Members Only*.  
Please subscribe to unlock premium mode.
>!𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰 𝑺𝑼𝑷𝑷𝑶𝑹𝑻`;

    await sock.sendMessage(
      chatId,
      {
        text: replyMsg,
        footer: "𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰",
        templateButtons: [
          {
            index: 1,
            urlButton: {
              displayText: "💎 Subscribe VIP",
              url: `https://wa.me/2348054671458?text=Hello%20I%20want%20VIP%20access`
            }
          }
        ],
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363377534493877@newsletter',
            newsletterName: '𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰 𝑺𝑼𝑷𝑷𝑶𝑹𝑻',
            serverMessageId: -1
          }
        }
      },
      { quoted: message }
    );

    // React with a lock 🔒
    await sock.sendMessage(chatId, { react: { text: "🔒", key: message.key } });

  } catch (err) {
    console.error("Kill command error:", err);
    await sock.sendMessage(chatId, { text: "⚠️ Something went wrong." }, { quoted: message });
  }
};
