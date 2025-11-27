
async function clearCommand(sock, chatId) {
    try {
        // Send a test message
        const message = await sock.sendMessage(chatId, { text: 'Clearing bot messages...' });

        // Delete the sent message
        await sock.sendMessage(chatId, { 
            delete: { 
                remoteJid: chatId, 
                id: message.key.id, 
                fromMe: true 
            } 
        });

    } catch (error) {
        console.error('Error clearing messages:', error);
        await sock.sendMessage(chatId, { text: '❌ An error occurred while clearing messages.' });
    }
}

module.exports = { clearCommand };
