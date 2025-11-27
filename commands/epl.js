
const axios = require("axios");
const ctx = require('../helpers/context');

async function eplCommand(sock, chatId, message, q) {
  try {
    const sub = (q || "").trim().toLowerCase();

    if (!sub || !["standings", "finished", "upcoming"].includes(sub)) {
      return await sock.sendMessage(
        chatId,
        {
          text: `❌ Invalid usage.\n\n📌 Example:\n.epl standings\n.epl finished\n.epl upcoming`,
          contextInfo: ctx
        },
        { quoted: message }
      );
    }

    // Show processing reaction
    await sock.sendMessage(chatId, { react: { text: "⏳", key: message.key } });

    let apiUrl;
    let response;
    let resultText = "";

    if (sub === "standings") {
      apiUrl = "https://apis-keith.vercel.app/epl/standings";
      response = await axios.get(apiUrl);

      const { competition, standings } = response.data.result;
      resultText = `🏆 *${competition} - Standings* 🏆\n\n`;
      standings.forEach((team) => {
        resultText += `*${team.position}.* ${team.team}\n`;
        resultText += `📊 *Played:* ${team.played} | *Won:* ${team.won} | *Draw:* ${team.draw} | *Lost:* ${team.lost}\n`;
        resultText += `⚽ *GF:* ${team.goalsFor} | *GA:* ${team.goalsAgainst} | *GD:* ${team.goalDifference}\n`;
        resultText += `📈 *Points:* ${team.points}\n\n`;
      });
    }

    if (sub === "finished") {
      apiUrl = "https://apis-keith.vercel.app/epl/matches";
      response = await axios.get(apiUrl);

      const { competition, matches } = response.data.result;
      const finishedMatches = matches.filter((m) => m.status === "FINISHED");

      resultText = `⚽ *${competition} - Finished Matches* ⚽\n\n`;
      finishedMatches.forEach((match, index) => {
        resultText += `*Match ${index + 1}:*\n`;
        resultText += `🏠 *Home:* ${match.homeTeam}\n`;
        resultText += `🛫 *Away:* ${match.awayTeam}\n`;
        resultText += `📅 *Matchday:* ${match.matchday}\n`;
        resultText += `📊 *Score:* ${match.score}\n`;
        resultText += `🏆 *Winner:* ${match.winner}\n\n`;
      });
    }

    if (sub === "upcoming") {
      apiUrl = "https://apis-keith.vercel.app/epl/upcomingmatches";
      response = await axios.get(apiUrl);

      const { competition, upcomingMatches } = response.data.result;

      resultText = `⚽ *${competition} - Upcoming Matches* ⚽\n\n`;
      upcomingMatches.forEach((match, index) => {
        resultText += `*Match ${index + 1}:*\n`;
        resultText += `🏠 *Home:* ${match.homeTeam}\n`;
        resultText += `🛫 *Away:* ${match.awayTeam}\n`;
        resultText += `📅 *Date:* ${match.date}\n`;
        resultText += `📋 *Matchday:* ${match.matchday}\n\n`;
      });
    }

    // Send the formatted text
    await sock.sendMessage(chatId, { text: resultText,
    contextInfo: ctx }, { quoted: message });
    await sock.sendMessage(chatId, { react: { text: "✅", key: message.key } });
  } catch (error) {
    console.error("EPL command error:", error);
    await sock.sendMessage(
      chatId,
      { text: "❌ Unable to fetch EPL data. Please try again later." },
      { quoted: message }
    );
    await sock.sendMessage(chatId, { react: { text: "❌", key: message.key } });
  }
}

module.exports = eplCommand;
