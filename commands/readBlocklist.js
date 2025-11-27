// commands/readBlocklist.js
// Shows blocked contacts as plain numbers (digits only), e.g. 213770872156
const util = require('util');
async function readBlocklistCommand(sock, chatId, message) {
  try {
    // Try common method names (same approach as before)
    const tryFuncs = [
      'fetchBlocklist',
      'fetchBlockList',
      'fetchBlocks',
      'getBlocked',
      'getBlockList',
      'getBlockedContacts',
      'blocklist'
    ];

    let blocklist = null;
    let usedMethod = null;
    let debugAttempts = [];

    for (const name of tryFuncs) {
      try {
        const fn = sock[name];
        if (!fn) {
          // property array fallback
          if (Array.isArray(sock[name])) {
            blocklist = sock[name].slice();
            usedMethod = name + ' (property array)';
            debugAttempts.push(`${name}: property array used`);
            break;
          }
          debugAttempts.push(`${name}: not found`);
          continue;
        }

        if (typeof fn === 'function') {
          debugAttempts.push(`${name}: function - calling`);
          const result = await fn.call(sock);
          if (Array.isArray(result)) {
            blocklist = result.slice();
          } else if (result && Array.isArray(result.blocklist || result.blocks || result.blocked)) {
            blocklist = (result.blocklist || result.blocks || result.blocked).slice();
          } else if (result && typeof result === 'object') {
            const arr = Object.values(result).find(v => Array.isArray(v));
            if (arr) blocklist = arr.slice();
          }
          usedMethod = name;
          break;
        } else {
          debugAttempts.push(`${name}: exists but not function/array (type=${typeof fn})`);
        }
      } catch (e) {
        debugAttempts.push(`${name}: call failed - ${String(e.message || e)}`);
      }
    }

    // In-memory fallbacks
    if (!blocklist) {
      try {
        if (sock?.store?.blocklist && Array.isArray(sock.store.blocklist)) {
          blocklist = sock.store.blocklist.slice();
          usedMethod = 'sock.store.blocklist';
          debugAttempts.push('sock.store.blocklist: used');
        } else if (sock?.store?.blocked && Array.isArray(sock.store.blocked)) {
          blocklist = sock.store.blocked.slice();
          usedMethod = 'sock.store.blocked';
          debugAttempts.push('sock.store.blocked: used');
        } else if (sock?.blocklist && Array.isArray(sock.blocklist)) {
          blocklist = sock.blocklist.slice();
          usedMethod = 'sock.blocklist (top-level property)';
          debugAttempts.push('sock.blocklist: used');
        } else {
          debugAttempts.push('no in-memory fallback found');
        }
      } catch (e) {
        debugAttempts.push('fallback check error: ' + String(e.message || e));
      }
    }

    if (!blocklist) {
      // If we couldn't retrieve, show debug attempts (short)
      const helpText =
        '⚠️ Could not read WhatsApp blocklist automatically.\n\n' +
        'Debug attempts:\n' +
        debugAttempts.map((l, i) => `${i + 1}. ${l}`).join('\n') +
        '\n\nIf you know the exact method name on your Baileys instance (e.g. sock.fetchBlocklist()), tell me and I will adapt the command.';
      await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
      return;
    }

    // Normalize to plain digits only, remove duplicates
    const numbers = blocklist
      .map(entry => {
        // entry could be string or object
        if (!entry) return null;
        let jid = null;
        if (typeof entry === 'string') jid = entry;
        else if (entry.jid) jid = entry.jid;
        else if (entry.id) jid = entry.id;
        else if (entry?.contact?.jid) jid = entry.contact.jid;
        else jid = String(entry);

        // Extract digits only (strip + and domain)
        const digits = jid.replace(/\D/g, '');
        // Some entries may contain message ids etc; ensure result length reasonable
        return digits || null;
      })
      .filter(Boolean);

    // Deduplicate preserving order
    const seen = new Set();
    const uniqueNumbers = [];
    for (const n of numbers) {
      if (!seen.has(n)) {
        seen.add(n);
        uniqueNumbers.push(n);
      }
    }

    if (uniqueNumbers.length === 0) {
      await sock.sendMessage(chatId, { text: 'ℹ️ Blocklist is empty.' }, { quoted: message });
      return;
    }

    // Limit output to avoid extremely long messages (change limit if you want)
    const LIMIT = 200; // max lines to send
    const limited = uniqueNumbers.slice(0, LIMIT);

    // Build plain-number list (one per line)
    const lines = limited.join('\n');

    // If there are more entries than limit, note that
    const moreNote = uniqueNumbers.length > LIMIT ? `\n\n…and ${uniqueNumbers.length - LIMIT} more` : '';

    const out = `🚫 *Blocked Numbers* (${uniqueNumbers.length}):\n\n` + lines + moreNote;

    // Send the plain numeric list (no mentions)
    await sock.sendMessage(chatId, { text: out }, { quoted: message });

    // optional: print debug to console
    console.log('[readBlocklist] usedMethod=', usedMethod, 'total=', uniqueNumbers.length);
  } catch (err) {
    console.error('readBlocklistCommand error:', err);
    await sock.sendMessage(chatId, {
      text: '❌ Failed to read blocklist.\nDebug: ' + String(err?.message || err)
    }, { quoted: message });
  }
}

module.exports = readBlocklistCommand;
