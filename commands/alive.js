const settings = require("../settings");
async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `╭══✦〔 🤖 *ᴀʟɪᴠᴇ..!* 〕✦═╮\n│\n` +
                       `│ 🚀 *ᴠᴇʀsɪᴏɴ*    : ${settings.version}\n` +
                       `│ ⛳ *ꜱᴛᴀᴛᴜꜱ*    : Online\n` +
                       `│ 🌍 *ᴍᴏᴅᴇ*      : Public\n│\n` +
                       `│ 🌟 *ꜰᴇᴀᴛᴜʀᴇꜱ*:\n` +
                       `│  ➟ ᴠɪᴇᴡ ᴏɴᴄᴇ\n` +
                       `│  ➟ ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ\n` +
                       `│  ➟ ᴀɴᴛɪʟɪɴᴋ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ\n` +
                       `│  ➟ ꜰᴜɴ ᴄᴏᴍᴍᴀɴᴅꜱ\n` +
                       `│  ➟ ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ ᴠɪᴇᴡ\n` +
                       `│  ➟ ᴀᴜᴛᴏꜱᴛᴀᴛᴜꜱ ʀᴇᴀᴄᴛ \n` +
                       `│  ➟ ᴀɴᴅ ᴍᴏʀᴇ!\n` +
                       `│☄️ᴛʜᴀɴᴋꜱ ꜰᴏʀ ᴄʜᴇᴄᴋɪɴɢ 🙂\n│\n` +
                       `│ ᴛʏᴘᴇ *.menu* ꜰᴏʀ ꜰᴜʟʟ ᴄᴏᴍᴍᴀɴᴅ ʟɪꜱᴛ\n` +
                       `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363377534493877@newsletterr',
                    newsletterName: '𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗦𝗨𝗣𝗣𝗢𝗥𝗧',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'Bot is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;