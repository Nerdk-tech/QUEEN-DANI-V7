/**
 * 𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗩𝟕
 * Autorecording Command - Shows fake recording status
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecording.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autorecording feature
async function autorecordingCommand(sock, chatId, message) {
    try {
        // Check if sender is the owner (bot itself)
        if (!message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363348739987203@newsletter',
                        newsletterName: 'Arslan Tech Hub Bot',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Initialize or read config
        const config = initConfig();
        
        // Toggle based on argument or toggle current state if no argument
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.enabled = true;
            } else if (action === 'off' || action === 'disable') {
                config.enabled = false;
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid option! Use: .autorecording on/off',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363377534493877@newsletter',
                            newsletterName: '𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗦𝗨𝗣𝗣𝗢𝗥𝗧',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
        } else {
            // Toggle current state
            config.enabled = !config.enabled;
        }
        
        // Save updated configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        // Send confirmation message
        await sock.sendMessage(chatId, {
            text: `✅ Auto-recording has been ${config.enabled ? 'enabled' : 'disabled'}!`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363377534493877@newsletter',
                    newsletterName: '𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗦𝗨𝗣𝗣𝗢𝗥𝗧',
                    serverMessageId: -1
                }
            }
        });
        
    } catch (error) {
        console.error('Error in autorecording command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363377534493877@newsletter',
                    newsletterName: '𝗤𝗨𝗘𝗘𝗡 𝗗𝗔𝗡𝗜 𝗦𝗨𝗣𝗣𝗢𝗥𝗧',
                    serverMessageId: -1
                }
            }
        });
    }
}

// Function to check if autorecording is enabled
function isAutorecordingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autorecording status:', error);
        return false;
    }
}

// Function to handle autorecording for regular messages
async function handleAutorecordingForMessage(sock, chatId, userMessage) {
    if (isAutorecordingEnabled()) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Then send the recording status
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Simulate recording time based on message length with increased minimum time
            const recordingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, recordingDelay));
            
            // Send recording again to ensure it stays visible
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates recording was shown
        } catch (error) {
            console.error('❌ Error sending recording indicator:', error);
            return false; // Indicates recording failed
        }
    }
    return false; // Autorecording is disabled
}

// Function to handle autorecording for commands - BEFORE command execution (not used anymore)
async function handleAutorecordingForCommand(sock, chatId) {
    if (isAutorecordingEnabled()) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Then send the recording status
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Keep recording indicator active for commands with increased duration
            const commandRecordingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandRecordingDelay));
            
            // Send recording again to ensure it stays visible
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates recording was shown
        } catch (error) {
            console.error('❌ Error sending command recording indicator:', error);
            return false; // Indicates recording failed
        }
    }
    return false; // Autorecording is disabled
}

// Function to show recording status AFTER command execution
async function showRecordingAfterCommand(sock, chatId) {
    if (isAutorecordingEnabled()) {
        try {
            // This function runs after the command has been executed and response sent
            // So we just need to show a brief recording indicator
            
            // Subscribe to presence updates
            await sock.presenceSubscribe(chatId);
            
            // Show recording status briefly
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Keep recording visible for a short time
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Then pause
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('❌ Error sending post-command recording indicator:', error);
            return false;
        }
    }
    return false; // Autorecording is disabled
}

module.exports = {
    autorecordingCommand,
    isAutorecordingEnabled,
    handleAutorecordingForMessage,
    handleAutorecordingForCommand,
    showRecordingAfterCommand
};