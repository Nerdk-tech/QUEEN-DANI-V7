const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json, text/plain, */*'
	}
};

async function tryRequest(getter, attempts = 3) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await getter();
		} catch (err) {
			lastError = err;
			if (attempt < attempts) {
				await new Promise(r => setTimeout(r, 1000 * attempt));
			}
		}
	}
	throw lastError;
}

async function getIzumiDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=mp3`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.result?.download) return res.data.result;
	throw new Error('Izumi youtube?url returned no download');
}

async function getIzumiDownloadByQuery(query) {
	const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/youtube-play?query=${encodeURIComponent(query)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.result?.download) return res.data.result;
	throw new Error('Izumi youtube-play returned no download');
}

async function getOkatsuDownloadByUrl(youtubeUrl) {
	const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.dl) {
		return {
			download: res.data.dl,
			title: res.data.title,
			thumbnail: res.data.thumb
		};
	}
	throw new Error('Okatsu ytmp3 returned no download');
}

async function fetchLikes(videoId) {
	try {
		// optional: if you have YOUTUBE_API_KEY, set it in process.env
		const apiKey = process.env.YOUTUBE_API_KEY || null;
		if (!apiKey) return 'N/A';
		const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`);
		return res.data?.items?.[0]?.statistics?.likeCount || 'N/A';
	} catch {
		return 'N/A';
	}
}

async function songCommand(sock, chatId, message) {
	try {
		const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
		if (!text) {
			await sock.sendMessage(chatId, { text: '🎵 *Usage:* .song <song name or YouTube link>' }, { quoted: message });
			return;
		}

		let video;
		if (text.includes('youtube.com') || text.includes('youtu.be')) {
			const search = await yts({ videoId: text.split('v=')[1] || text.split('/').pop() });
			video = search || { url: text };
		} else {
			const search = await yts(text);
			if (!search || !search.videos.length) {
				await sock.sendMessage(chatId, { text: '❌ No results found.' }, { quoted: message });
				return;
			}
			video = search.videos[0];
		}

		const likes = await fetchLikes(video.videoId || '');

		// 🎧 Show full metadata before download
		const infoMessage = `
╭━『 🎧 *_SONG DETAILS_* 🎶 』━╮
* 🎵 *Title:* ${video.title || 'Unknown'}
* 👁 *Views:* ${video.views?.toLocaleString?.() || 'N/A'}
* 👍 *Likes:* ${likes}
* 📺 *Channel:* ${video.author?.name || 'Unknown'}
* ⏱ *Duration:* ${video.timestamp || 'N/A'}
╰━━━━━━━━━━━━━━━━━╯
╭━『 📝 *_DISCRIPTION_* 📝 』━╮
${video.description ? video.description.slice(0, 400) + (video.description.length > 400 ? '...' : '') : 'No description available.'}
╰━━━━━━━━━━━━━━━━━╯
> ⏳ *𝑸𝑼𝑬𝑬𝑵 𝑫𝑨𝑵𝑰 𝑺𝑼𝑷𝑷𝑶𝑹𝑻* 
`;

		await sock.sendMessage(chatId, {
			image: { url: video.thumbnail },
			caption: infoMessage
		}, { quoted: message });

		// Try Izumi primary, fallback to Okatsu
		let audioData;
		try {
			audioData = await getIzumiDownloadByUrl(video.url);
		} catch (e1) {
			try {
				audioData = await getIzumiDownloadByQuery(video.title || text);
			} catch (e2) {
				audioData = await getOkatsuDownloadByUrl(video.url);
			}
		}

		await sock.sendMessage(chatId, {
			audio: { url: audioData.download || audioData.dl || audioData.url },
			mimetype: 'audio/mpeg',
			fileName: `${(audioData.title || video.title || 'song')}.mp3`,
			ptt: false
		}, { quoted: message });

	} catch (err) {
		console.error('Song command error:', err);
		await sock.sendMessage(chatId, { text: '❌ Failed to download song.' }, { quoted: message });
	}
}

module.exports = songCommand;