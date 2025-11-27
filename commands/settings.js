const fs = require('fs');
const ctx = require('../helpers/context');

function readJsonSafe(path, fallback) {
    try {
        const txt = fs.readFileSync(path, 'utf8');
        return JSON.parse(txt);
    } catch (_) {
        return fallback;
    }
}

async function settingsCommand(sock, chatId, message) {
    try {
        // Owner-only
        if (!message.key.fromMe) {
            await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!' }, { quoted: message });
            return;
        }

        const isGroup = chatId.endsWith('@g.us');
        const dataDir = './data';

        const mode = readJsonSafe(`${dataDir}/messageCount.json`, { isPublic: true });
        const autoStatus = readJsonSafe(`${dataDir}/autoStatus.json`, { enabled: false });
        const autoread = readJsonSafe(`${dataDir}/autoread.json`, { enabled: false });
        const autotyping = readJsonSafe(`${dataDir}/autotyping.json`, { enabled: false });
        const autorecording = readJsonSafe(`${dataDir}/autorecording.json`, { enabled: false });
        const pmblocker = readJsonSafe(`${dataDir}/pmblocker.json`, { enabled: false });
        const anticall = readJsonSafe(`${dataDir}/anticall.json`, { enabled: false });
        const userGroupData = readJsonSafe(`${dataDir}/userGroupData.json`, {
            antilink: {}, antibadword: {}, welcome: {}, goodbye: {}, chatbot: {}, antitag: {}
        });
        const autoReaction = Boolean(userGroupData.autoReaction);

        // Per-group features
        const groupId = isGroup ? chatId : null;
        const antilinkOn = groupId ? Boolean(userGroupData.antilink && userGroupData.antilink[groupId]) : false;
        const antibadwordOn = groupId ? Boolean(userGroupData.antibadword && userGroupData.antibadword[groupId]) : false;
        const welcomeOn = groupId ? Boolean(userGroupData.welcome && userGroupData.welcome[groupId]) : false;
        const goodbyeOn = groupId ? Boolean(userGroupData.goodbye && userGroupData.goodbye[groupId]) : false;
        const chatbotOn = groupId ? Boolean(userGroupData.chatbot && userGroupData.chatbot[groupId]) : false;
        const antitagCfg = groupId ? (userGroupData.antitag && userGroupData.antitag[groupId]) : null;

        const lines = [];
        lines.push('╭═══✦〔 *BOT SETTINGS* 〕✦═╮');
        lines.push('│');
        lines.push(`│ 🌍 *ᴍᴏᴅᴇ*         : ${mode.isPublic ? '👥ᴘᴜʙʟɪᴄ' : '👤ᴘʀɪᴠᴀᴛᴇ'}`);
        lines.push(`│ ⛳ *ᴀᴜᴛᴏ ꜱᴛᴀᴛᴜꜱ*  : ${autoStatus.enabled ? '✅' : '❌'}`);
        lines.push(`│ 📄 *ᴀᴜᴛᴏʀᴇᴀᴅ*.    : ${autoread.enabled ? '✅' : '❌'}`);
        lines.push(`│ 📝 *ᴀᴜᴛᴏᴛʏᴘɪɴɢ*   : ${autotyping.enabled ? '✅' : '❌'}`);
        lines.push(`│ 🎤 *ᴀᴜᴛᴏʀᴇᴄᴏʀᴅɪɴɢ*   : ${autorecording.enabled ? '✅' : '❌'}`);
        lines.push(`│ 🛡️ *ᴘᴍ ʙʟᴏᴄᴋᴇʀ*   : ${pmblocker.enabled ? '✅' : '❌'}`);
        lines.push(`│ 📵 *ᴀɴᴛɪᴄᴀʟʟ*      : ${anticall.enabled ? '✅' : '❌'}`);
        lines.push(`│ ☣️ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛɪᴏɴ*: ${autoReaction ? '✅' : '❌'}`);
        if (groupId) {
            lines.push('');
            lines.push(`Group: ${groupId}`);
            if (antilinkOn) {
                const al = userGroupData.antilink[groupId];
                lines.push(`• Antilink: ON (action: ${al.action || 'delete'})`);
            } else {
                lines.push('• Antilink: OFF');
            }
            if (antibadwordOn) {
                const ab = userGroupData.antibadword[groupId];
                lines.push(`• Antibadword: ON (action: ${ab.action || 'delete'})`);
            } else {
                lines.push('• Antibadword: OFF');
            }
            lines.push(`• Welcome: ${welcomeOn ? 'ON' : 'OFF'}`);
            lines.push(`• Goodbye: ${goodbyeOn ? 'ON' : 'OFF'}`);
            lines.push(`• Chatbot: ${chatbotOn ? 'ON' : 'OFF'}`);
            if (antitagCfg && antitagCfg.enabled) {
                lines.push(`• Antitag: ON (action: ${antitagCfg.action || 'delete'})`);
            } else {
                lines.push('• Antitag: OFF');
            }
        } else {
            lines.push('│');
            lines.push('│🗒️ *ɴᴏᴛᴇ*: Per-group settings will be');
            lines.push('│shown when used inside a group.');
            lines.push('╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯');
        }

        await sock.sendMessage(chatId, { text: lines.join('\n'), contextInfo: ctx }, { quoted: message });
    } catch (error) {
        console.error('Error in settings command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to read settings.' }, { quoted: message });
    }
}

module.exports = settingsCommand;


