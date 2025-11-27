const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '╭══✦〔 *ʟʏʀɪᴄꜱ ᴄᴍᴅ* 〕✦═╮\n│\n│🔍 Please enter the song name to get the lyrics!\n│ Usage: *lyrics <song name>*\n│\n╰═✦═✦═✦═✦═✦═✦═✦═╯'
        });
        return;
    }

    try {
        // Fetch song lyrics using the some-random-api.com API
        const apiUrl = `https://some-random-api.com/lyrics?title=${encodeURIComponent(songTitle)}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        
        if (!json.lyrics) {
            await sock.sendMessage(chatId, { 
                text: `❌ Sorry, I couldn't find any lyrics for "${songTitle}".`
            });
            return;
        }
        
        // Sending the formatted result to the user
        await sock.sendMessage(chatId, {
            text: `╭══✦〔🎵 *ꜱᴏɴɢ ʟʏʀɪᴄꜱ* 🎶〕✦═╮\n│\n│ ▢ *Title:* ${json.title || songTitle}\n│ ▢ *Artist:* ${json.author || 'Unknown'}\n│ \n│ 📜 *Lyrics:*\n│ ${json.lyrics}\n│ \n│ Hope you enjoy the music! 🎧 🎶\n│\n╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯\n> 𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰 𝑺𝑼𝑷𝑷𝑶𝑹𝑻
        });
    } catch (error) {
        console.error('Error in lyrics command:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ An error occurred while fetching the lyrics for "${songTitle}".`
        });
    }
}

module.exports = { lyricsCommand };
