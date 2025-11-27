const os = require('os');
const settings = require('../settings.js');

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        
        const emojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹', '💎', '🏆', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // React instantly with a random emoji
           await sock.sendMessage(chatId, { 
                     react: { text: randomEmoji }
                     }, { quoted: message });
        
        
        
        const end = Date.now();
        const ping = Math.round((end - start) / 2);
        
            // Speed categorization
        let badge = '🐢 Slow', color = '🔴';
        if (ping <= 50) {
            badge = '🚀 Super Fast';
            color = '🟢';
        } else if (ping <= 100) {
            badge = '⚡ Fast';
            color = '🟡';
        } else if (ping <= 150) {
            badge = '⚠️ Medium';
            color = '🟠';
        }

        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);

        const botInfo = `> * 𝐁𝐎𝐓 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄: ${ping} ms ${randomEmoji}*\n> *sᴛᴀᴛᴜs: ${color} ${badge}*\n> *ᴜᴘᴛɪᴍᴇ: ${uptimeFormatted}*\n> *ᴠᴇʀsɪᴏɴ: ${settings.version}*`;

        // Reply to the original message with the bot info
        

await sock.sendMessage(chatId, {
            text: botInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363377534493877@newsletter',
                    newsletterName: '𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰 𝑺𝑼𝑷𝑷𝑶𝑹𝑻',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });


    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;
