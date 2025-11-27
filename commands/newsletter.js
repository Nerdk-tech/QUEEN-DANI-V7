// commands/newsletter.js
// Standalone command to fetch WhatsApp Channel (newsletter) info.
// Usage examples:
//   .newsletter https://whatsapp.com/channel/xxxxxxxx
//   .newsletter 120363348739987203@newsletter
//   .newsletter 120363348739987203

async function newsletterCommand(sock, chatId, message, q) {
  try {
    if (!q || !q.trim()) {
      return await sock.sendMessage(chatId, {
        text: `❎ Please provide a WhatsApp Channel link / id / jid.\n\nExamples:\n.newsletter https://whatsapp.com/channel/xxxxxxxxxx\n.newsletter 120363348739987203@newsletter\n.newsletter 120363348739987203`
      }, { quoted: message });
    }

    const raw = q.trim();
    // Try to extract invite id from different possible link forms
    const inviteMatch = raw.match(/(?:whatsapp\.com\/channel\/|whatsapp\.com\/invite\/|chat\.whatsapp\.com\/)([\w-]+)/i);
    const inviteId = inviteMatch?.[1];

    // If user passed a full jid like 12036...@newsletter use it directly
    let providedJid = null;
    if (raw.includes('@')) {
      providedJid = raw.split(/\s+/)[0]; // first token (in case user pasted extra text)
    } else if (!inviteId) {
      // if raw is digits-only (or mostly digits), assume it's an id and try jid form
      const digits = raw.replace(/[^0-9]/g, '');
      if (digits.length >= 6 && digits.length <= 20) {
        providedJid = `${digits}@newsletter`;
      }
    }

    let metadata = null;
    let lastError = null;

    // helper to attempt a fetch and record errors
    const attempt = async (type, value) => {
      try {
        console.log(`[newsletter] attempting metadata fetch -> type=${type}, value=${value}`);
        const md = await sock.newsletterMetadata(type, value);
        console.log(`[newsletter] fetched metadata (type=${type}) ->`, !!md);
        return md;
      } catch (err) {
        lastError = err;
        console.error(`[newsletter] metadata(${type}, ${value}) failed:`, err && err.message ? err.message : err);
        return null;
      }
    };

    // Try order:
    // 1) invite (if we parsed an invite code)
    // 2) jid using inviteId (inviteId@newsletter)
    // 3) jid using providedJid (if user passed a jid or numeric id)
    if (inviteId) {
      metadata = await attempt('invite', inviteId);
      if (!metadata) {
        // fallback: try treat inviteId as numeric id -> as jid
        metadata = await attempt('jid', `${inviteId}@newsletter`);
      }
    }

    if (!metadata && providedJid) {
      metadata = await attempt('jid', providedJid);
    }

    // final fallback: maybe q is short numeric -> try as jid one more time
    if (!metadata && raw && raw.replace(/\D/g, '').length >= 6) {
      const numericJid = `${raw.replace(/\D/g, '')}@newsletter`;
      metadata = await attempt('jid', numericJid);
    }

    if (!metadata || !metadata.id) {
      // Provide helpful error message for the user (and include last error for debugging)
      let errorNote = lastError?.message ? `\n\nDebug: ${String(lastError.message).slice(0, 300)}` : '';
      await sock.sendMessage(chatId, {
        text:
          `🚫 *Failed to fetch channel info.*\nDouble-check the link / id and try again.\n\nSuggestions:\n • Make sure you passed a Channel link (https://whatsapp.com/channel/...) or a channel JID (e.g. 12036...@newsletter).\n • If the channel is private or restricted the bot might not be able to fetch metadata.\n • Ensure your bot is running a recent Baileys version that supports newsletter metadata.\n\nIf you keep getting this, reply here with the channel link you used so I can inspect it.` + errorNote
      }, { quoted: message });
      return;
    }

    // Build readable info
    const followers = metadata.subscribers != null ? String(metadata.subscribers) : 'N/A';
    const created = metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString() : 'Unknown';

    const infoText =
`╭─❍『 📡 CHANNEL INFO 』❍─
│
│ 🔖 ID: ${metadata.id}
│ 🗂️ Name: ${metadata.name || 'Unknown'}
│ 👥 Followers: ${followers}
│ 📝 Description: ${metadata.about || metadata.description || 'N/A'}
│ 🗓️ Created: ${created}
│
╰─⭓ 𝕼𝖀𝕰𝕰𝕹 𝕯𝕬𝕹𝕴 𝖁7`;

    // If there's a preview path, try to send it as an image (if it's a full url use it directly)
    if (metadata.preview) {
      const previewUrl = metadata.preview.startsWith('http') ? metadata.preview : `https://pps.whatsapp.net${metadata.preview}`;
      await sock.sendMessage(chatId, {
        image: { url: previewUrl },
        caption: infoText
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text: infoText }, { quoted: message });
    }

  } catch (err) {
    console.error('[newsletter] unexpected error:', err);
    await sock.sendMessage(chatId, {
      text: '⚠️ An unexpected error occurred while fetching the channel info. Check the bot console for details.'
    }, { quoted: message });
  }
}

module.exports = newsletterCommand;
