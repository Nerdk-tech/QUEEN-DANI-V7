const insults = [
    "Your status is like your pocket money limited and gone every month.",
    "Your moves are like a corrupt politician’s promises  all show, no substance.",
    "You’re the human version of 'low battery' whenever needed, you switch off.",
    "Your game settings are broken no graphics, no gameplay.",
    "Even my bot’s coding is better than you  at least it actually works! 😂",
    "Your thinking is like roadside tea cheap and everyone can use it.",
    "Your moves are like copying in an exam get caught and fail.",
    "Your game is like a corrupt file neither opens nor deletes.",
    "Talking to you is like buffering, boring and a total waste of time! 🚫",
    "Your jokes are like dial-up internet  slow and outdated.",
    "You’re like a software bug  annoying and impossible to ignore.",
    "Your style is like an old PC stuck in the past.",
    "You’re like a crashed app  nobody wants to deal with you.",
    "Your brain’s on airplane mode  no signals detected.",
    "Your logic is like a broken code  full of errors and won’t run."
];

async function insultCommand(sock, chatId, message) {
    try {
        if (!message || !chatId) {
            console.log('Invalid message or chatId:', { message, chatId });
            return;
        }

        let userToInsult;
        
        // Check for mentioned users
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToInsult = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToInsult = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToInsult) {
            await sock.sendMessage(chatId, { 
                text: 'Please mention someone or reply to their message to insult them!'
            });
            return;
        }

        const insult = insults[Math.floor(Math.random() * insults.length)];

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.sendMessage(chatId, { 
            text: `Hey @${userToInsult.split('@')[0]}, ${insult}`,
            mentions: [userToInsult]
        });
    } catch (error) {
        console.error('Error in insult command:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: 'Please try again in a few seconds.'
                });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: 'An error occurred while sending the insult.'
                });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

module.exports = { insultCommand };
