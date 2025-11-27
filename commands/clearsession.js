const fs = require('fs');
const path = require('path');
const os = require('os');

const channelInfo = {
    contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363377534493877@newsletter',
            newsletterName: '𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗩𝟕',
            serverMessageId: -1
        }
    }
};

async function clearSessionCommand(sock, chatId, msg) {
    try {
        // Check if sender is owner
        if (!msg.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!',
                ...channelInfo
            });
            return;
        }

        // Define session directory
        const sessionDir = path.join(__dirname, '../session');

        if (!fs.existsSync(sessionDir)) {
            await sock.sendMessage(chatId, { 
                text: '❌ Session directory not found!',
                ...channelInfo
            });
            return;
        }

        let filesCleared = 0;
        let errors = 0;
        let errorDetails = [];

        // Send initial status
        await sock.sendMessage(chatId, { 
            text: `🔍 Optimizing session files for better performance...`,
            ...channelInfo
        });

        const files = fs.readdirSync(sessionDir);
        
        // Count files by type for optimization
        let appStateSyncCount = 0;
        let preKeyCount = 0;

        for (const file of files) {
            if (file.startsWith('app-state-sync-')) appStateSyncCount++;
            if (file.startsWith('pre-key-')) preKeyCount++;
        }

        // Delete files
        for (const file of files) {
            if (file === 'creds.json') {
                // Skip creds.json file
                continue;
            }
            try {
                const filePath = path.join(sessionDir, file);
                fs.unlinkSync(filePath);
                filesCleared++;
            } catch (error) {
                errors++;
                errorDetails.push(`Failed to delete ${file}: ${error.message}`);
            }
        }

        // Send completion message
        const message = `╭══✦〔 *ᴄʟᴇᴀʀᴇᴅ ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ* 〕✦═╮:\n│ \n` +
                       `┊⭘ 📊 *ꜱᴛᴀᴛɪꜱᴛɪᴄꜱ:* \n` +
                       `┊⭘ ᴛᴏᴛᴀʟ ꜰɪʟᴇꜱ ᴄʟᴇᴀʀᴇᴅ: *${filesCleared}*\n` +
                       `┊⭘ ᴀᴘᴘ ꜱᴛᴀᴛᴇ ꜱʏɴᴄ ꜰɪʟᴇꜱ: *${appStateSyncCount}*\n` +
                       `┊⭘ ᴘʀᴇ-ᴋᴇʏ ꜰɪʟᴇꜱ: *${preKeyCount}*\n` +
                       `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`+
                       (errors > 0 ? `\n⚠️ Errors encountered: ${errors}\n${errorDetails.join('\n')}` : '');

        await sock.sendMessage(chatId, { 
            text: message,
            ...channelInfo
        });

    } catch (error) {
        console.error('Error in clearsession command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to clear session files!',
            ...channelInfo
        });
    }
}

module.exports = clearSessionCommand; 