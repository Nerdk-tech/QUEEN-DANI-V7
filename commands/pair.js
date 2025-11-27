
const axios = require('axios');
const { sleep } = require('../lib/myfunc');

async function pairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "Please provide a valid WhatsApp number\nExample: .pair 92323XXXXX"
            });
        }

        const numbers = q.split(',')
            .map((v) => v.replace(/[^0-9]/g, ''))
            .filter((v) => v.length > 5 && v.length < 20);

        if (numbers.length === 0) {
            return await sock.sendMessage(chatId, {
                text: "Invalid number❌️ Please use the correct format!"
            });
        }

        for (const number of numbers) {
            const whatsappID = number + '@s.whatsapp.net';
            console.log("Checking WhatsApp ID:", whatsappID);

            const result = await sock.onWhatsApp(whatsappID);
            console.log("onWhatsApp result:", result);

            if (!result || result.length === 0 || !result[0]?.exists) {
                await sock.sendMessage(chatId, {
                    text: `That number (${number}) is not registered on WhatsApp❗️`
                });
                continue;
            }

            await sock.sendMessage(chatId, { text: "⏳ Please hold on..." });
            await sleep(3000);
            await sock.sendMessage(chatId, { text: "✅ Here’s your pairing code..." });

            try {
                const response = await axios.get(`https://arslan-md-pair-site.onrender.com/pair?number=${number}`);
                console.log("API response:", response.data);

                if (response.data && response.data.code) {
                    const code = response.data.code;
                    if (code === "Service Unavailable") {
                        throw new Error('Service Unavailable');
                    }

                    await sleep(5000);
                    await sock.sendMessage(chatId, {
                        text: `${code}\n\n> *ᴛʜɪꜱ ᴄᴏᴅᴇ ɪꜱ ꜰᴏʀ* ${number} *ᴏɴʟʏ.*`
                    });
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                const errorMessage = apiError.message === 'Service Unavailable'
                    ? "⚠️ Service is currently unavailable. Please try again later."
                    : "❌ Failed to generate pairing code. Please try again later.";

                await sock.sendMessage(chatId, { text: errorMessage });
            }
        }
    } catch (error) {
        console.error("pairCommand error:", error);
        await sock.sendMessage(chatId, {
            text: "⚠️ An error occurred. Please try again later."
        });
    }
}

module.exports = pairCommand;
