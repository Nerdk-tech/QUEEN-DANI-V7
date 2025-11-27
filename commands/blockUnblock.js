// commands/blockUnblock.js
const settings = require('../settings'); // adjust path if your commands folder is elsewhere

// Normalize a JID or owner string into just the phone digits (e.g. "2567xxx@s.whatsapp.net" -> "2567xxx")
function digitsOnly(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

// Accept ownerNumber as string or array (support "2567..." or ["2567...", "..."])
function getOwnersNormalized() {
  const raw = settings.ownerNumber;
  const owners = Array.isArray(raw) ? raw : String(raw).split?.(',') || [raw];
  return owners.map(o => digitsOnly(o));
}

async function blockUnblockCommand(sock, chatId, message, q) {
  try {
    // get command (.block or .unblock)
    const commandText = message.message?.conversation
      || message.message?.extendedTextMessage?.text
      || message.message?.imageMessage?.caption
      || message.message?.videoMessage?.caption
      || '';
    const command = commandText.trim().split(/\s+/)[0].toLowerCase().replace('.', '');

    if (!['block', 'unblock'].includes(command)) return;

    // determine who sent the message (works in groups and private)
    const rawSenderJid = message.key?.participant || message.key?.remoteJid || '';
    const senderDigits = digitsOnly(rawSenderJid);

    // owner(s) from settings (normalized)
    const owners = getOwnersNormalized();

    // debug log (console only)
    console.log('[blockUnblock] rawSenderJid=', rawSenderJid, 'senderDigits=', senderDigits, 'owners=', owners);

    // allow if sender matches one of owners OR message came from bot itself
    if (!owners.includes(senderDigits) && !message.key?.fromMe) {
      // send helpful debug info so you can see what the bot actually sees
      return await sock.sendMessage(chatId, {
        text:
          `❌ Only the bot owner can use this command.\n\n` +
          `Detected sender JID: ${rawSenderJid}\n` +
          `Detected sender number: ${senderDigits || '(none)'}\n` +
          `Owner number(s) configured: ${owners.join(', ')}`
          
      }, { quoted: message });
    }

    // determine target jid to block/unblock
    let jid;

    // reply -> quoted message's sender
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      // quoted message may have contextInfo.sender (older structure) or contextInfo.quotedMessage.sender
      const quoted = message.message.extendedTextMessage.contextInfo;
      // try typical fields:
      jid = quoted?.participant || quoted?.quotedMessage?.sender || quoted?.quotedMessage?.key?.participant || quoted?.quotedMessage?.key?.remoteJid;
    }

    // mention -> mentionedJid array
    if (!jid) {
      const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
        || message.message?.extendedTextMessage?.mentionedJid
        || [];
      if (mentioned.length > 0) jid = mentioned[0];
    }

    // argument provided -> accept plain number or full jid
    if (!jid && q) {
      const arg = q.trim();
      if (arg.includes('@')) {
        jid = arg.replace(/\s/g, '');
      } else {
        const num = digitsOnly(arg);
        if (num.length >= 6 && num.length <= 15) {
          jid = `${num}@s.whatsapp.net`;
        }
      }
    }

    if (!jid) {
      return await sock.sendMessage(chatId, { text: '⚠️ Please reply to a user OR mention them OR pass a phone number after the command.'
      }, { quoted: message });
    }

    // final normalization (ensure it's a proper jid)
    jid = String(jid).replace(/\s/g, '');
    if (!jid.includes('@')) jid = `${digitsOnly(jid)}@s.whatsapp.net`;

    // perform block / unblock
    await sock.updateBlockStatus(jid, command); // 'block' or 'unblock'

    await sock.sendMessage(chatId, {
      text: `✅ Successfully ${command === 'block' ? 'blocked' : 'unblocked'} @${jid.split('@')[0]}`,
      mentions: [jid]
      
    }, { quoted: message });

  } catch (err) {
    console.error('Block/Unblock error:', err);
    await sock.sendMessage(chatId, { text: '❌ Failed to process block/unblock command.' }, { quoted: message });
  }
}

module.exports = blockUnblockCommand;
