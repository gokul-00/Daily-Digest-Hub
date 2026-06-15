//#region node_modules/youtube-transcript-plus/dist/youtube-transcript-plus.mjs
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var RE_YOUTUBE = /(?:v=|\/|v\/|embed\/|watch\?.*v=|youtu\.be\/|\/v\/|e\/|watch\?.*vi?=|\/embed\/|\/v\/|vi?\/|watch\?.*vi?=|youtu\.be\/|\/vi?\/|\/e\/)([a-zA-Z0-9_-]{11})/i;
var RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
/** Thrown when YouTube is rate-limiting requests from your IP address. */
var YoutubeTranscriptTooManyRequestError = class extends Error {
	constructor() {
		super("YouTube is receiving too many requests from your IP address. Please try again later or use a proxy. If the issue persists, consider reducing the frequency of requests.");
		this.name = "YoutubeTranscriptTooManyRequestError";
	}
};
/** Thrown when the requested video is unavailable or has been removed. */
var YoutubeTranscriptVideoUnavailableError = class extends Error {
	constructor(videoId) {
		super(`The video with ID "${videoId}" is no longer available or has been removed. Please check the video URL or ID and try again.`);
		this.name = "YoutubeTranscriptVideoUnavailableError";
		this.videoId = videoId;
	}
};
/** Thrown when transcripts are disabled for the video by its owner. */
var YoutubeTranscriptDisabledError = class extends Error {
	constructor(videoId) {
		super(`Transcripts are disabled for the video with ID "${videoId}". This may be due to the video owner disabling captions or the video not supporting transcripts.`);
		this.name = "YoutubeTranscriptDisabledError";
		this.videoId = videoId;
	}
};
/** Thrown when no transcripts are available for the video. */
var YoutubeTranscriptNotAvailableError = class extends Error {
	constructor(videoId) {
		super(`No transcripts are available for the video with ID "${videoId}". This may be because the video does not have captions or the captions are not accessible.`);
		this.name = "YoutubeTranscriptNotAvailableError";
		this.videoId = videoId;
	}
};
/** Thrown when the transcript is not available in the requested language. */
var YoutubeTranscriptNotAvailableLanguageError = class extends Error {
	constructor(lang, availableLangs, videoId) {
		super(`No transcripts are available in "${lang}" for the video with ID "${videoId}". Available languages: ${availableLangs.join(", ")}. Please try a different language.`);
		this.name = "YoutubeTranscriptNotAvailableLanguageError";
		this.videoId = videoId;
		this.lang = lang;
		this.availableLangs = availableLangs;
	}
};
/** Thrown when the provided `lang` option is not a valid BCP 47 language code. */
var YoutubeTranscriptInvalidLangError = class extends Error {
	constructor(lang) {
		super(`Invalid language code "${lang}". Please provide a valid BCP 47 language code (e.g., "en", "fr", "pt-BR").`);
		this.name = "YoutubeTranscriptInvalidLangError";
		this.lang = lang;
	}
};
/** Thrown when the provided video ID or URL is invalid. */
var YoutubeTranscriptInvalidVideoIdError = class extends Error {
	constructor() {
		super("Invalid YouTube video ID or URL. Please provide a valid video ID or URL. Example: \"dQw4w9WgXcQ\" or \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\".");
		this.name = "YoutubeTranscriptInvalidVideoIdError";
	}
};
var RE_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
var RE_BCP47_LANG = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;
var XML_ENTITIES = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": "\"",
	"&#39;": "'",
	"&apos;": "'"
};
var RE_XML_ENTITY = /&(?:amp|lt|gt|quot|apos|#39);/g;
function decodeXmlEntities(text) {
	return text.replace(RE_XML_ENTITY, (match) => {
		var _a;
		return (_a = XML_ENTITIES[match]) !== null && _a !== void 0 ? _a : match;
	});
}
function retrieveVideoId(videoId) {
	if (RE_VIDEO_ID.test(videoId)) return videoId;
	const matchId = videoId.match(RE_YOUTUBE);
	if (matchId && matchId.length) return matchId[1];
	throw new YoutubeTranscriptInvalidVideoIdError();
}
/**
* Validate that a language code matches a BCP 47-like pattern.
* @throws {@link YoutubeTranscriptInvalidLangError} if the language code is invalid.
*/
function validateLang(lang) {
	if (!RE_BCP47_LANG.test(lang)) throw new YoutubeTranscriptInvalidLangError(lang);
}
function defaultFetch(params) {
	return __awaiter(this, void 0, void 0, function* () {
		const { url, lang, userAgent, method = "GET", body, headers = {}, signal } = params;
		const fetchOptions = {
			method,
			headers: Object.assign(Object.assign({ "User-Agent": userAgent || DEFAULT_USER_AGENT }, lang && { "Accept-Language": lang }), headers),
			signal
		};
		if (body && method === "POST") fetchOptions.body = body;
		return fetch(url, fetchOptions);
	});
}
/** Returns true if the HTTP status code is retryable (429 or 5xx). */
function isRetryableStatus(status) {
	return status === 429 || status >= 500 && status <= 599;
}
/**
* Wait for the given number of milliseconds, aborting early if the signal fires.
*/
function sleep(ms, signal) {
	return new Promise((resolve, reject) => {
		signal === null || signal === void 0 || signal.throwIfAborted();
		const timer = setTimeout(resolve, ms);
		if (signal) {
			const onAbort = () => {
				clearTimeout(timer);
				reject(signal.reason);
			};
			signal.addEventListener("abort", onAbort, { once: true });
		}
	});
}
/**
* Wrap a fetch call with retry logic using exponential backoff.
*
* Retries on 429 (Too Many Requests) and 5xx (Server Errors).
* Client errors (4xx other than 429) are returned immediately.
*
* @param fetchFn - Function that performs the fetch call.
* @param retries - Maximum number of retry attempts (0 = no retries).
* @param retryDelay - Base delay in milliseconds for exponential backoff.
* @param signal - Optional AbortSignal to cancel the operation.
* @returns The fetch Response.
*/
function fetchWithRetry(fetchFn, retries, retryDelay, signal) {
	return __awaiter(this, void 0, void 0, function* () {
		for (let attempt = 0; attempt <= retries; attempt++) {
			signal === null || signal === void 0 || signal.throwIfAborted();
			const response = yield fetchFn();
			if (!isRetryableStatus(response.status) || attempt === retries) return response;
			yield sleep(retryDelay * Math.pow(2, attempt), signal);
		}
		throw new Error("Unexpected: retry loop exited without returning");
	});
}
/**
* Convert transcript segments to plain text.
*
* @param segments - Array of transcript segments from {@link fetchTranscript}.
* @param separator - String to join segments with. Defaults to `'\n'`.
* @returns A plain text string with segments joined by the separator.
*
* @example
* ```typescript
* import { fetchTranscript, toPlainText } from 'youtube-transcript-plus';
* const transcript = await fetchTranscript('dQw4w9WgXcQ');
* const text = toPlainText(transcript);
* const paragraph = toPlainText(transcript, ' ');
*
* // With videoDetails enabled, use result.segments:
* const result = await fetchTranscript('dQw4w9WgXcQ', { videoDetails: true });
* const text2 = toPlainText(result.segments);
* ```
*/
function toPlainText(segments, separator = "\n") {
	return segments.map((segment) => segment.text).join(separator);
}
/**
* Fetches YouTube video transcripts and caption metadata using the Innertube API.
*
* Can be used as an instance (with shared config) or via static/convenience methods.
*
* @example
* ```typescript
* // Instance usage with shared config
* const yt = new YoutubeTranscript({ lang: 'en' });
* const transcript = await yt.fetchTranscript('dQw4w9WgXcQ');
* const languages = await yt.listLanguages('dQw4w9WgXcQ');
*
* // Static method
* const transcript = await YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ', { lang: 'en' });
*
* // Opt-in to video details
* const { videoDetails, segments } = await YoutubeTranscript.fetchTranscript('dQw4w9WgXcQ', {
*   videoDetails: true,
* });
*
* // Convenience export
* const transcript = await fetchTranscript('dQw4w9WgXcQ');
* const languages = await listLanguages('dQw4w9WgXcQ');
* ```
*/
var YoutubeTranscript = class YoutubeTranscript {
	constructor(config) {
		this.config = config;
	}
	/**
	* Fetch caption tracks and the player response from the Innertube player API.
	* Shared logic used by both fetchTranscript and listLanguages.
	*/
	_fetchCaptionTracks(identifier, lang) {
		return __awaiter(this, void 0, void 0, function* () {
			var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
			const userAgent = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.userAgent) !== null && _b !== void 0 ? _b : DEFAULT_USER_AGENT;
			const protocol = ((_c = this.config) === null || _c === void 0 ? void 0 : _c.disableHttps) ? "http" : "https";
			const retries = (_e = (_d = this.config) === null || _d === void 0 ? void 0 : _d.retries) !== null && _e !== void 0 ? _e : 0;
			const retryDelay = (_g = (_f = this.config) === null || _f === void 0 ? void 0 : _f.retryDelay) !== null && _g !== void 0 ? _g : 1e3;
			const signal = (_h = this.config) === null || _h === void 0 ? void 0 : _h.signal;
			const watchFetchParams = {
				url: `${protocol}://www.youtube.com/watch?v=${identifier}`,
				lang,
				userAgent,
				signal
			};
			const videoPageResponse = yield fetchWithRetry(() => {
				var _a;
				return ((_a = this.config) === null || _a === void 0 ? void 0 : _a.videoFetch) ? this.config.videoFetch(watchFetchParams) : defaultFetch(watchFetchParams);
			}, retries, retryDelay, signal);
			if (!videoPageResponse.ok) throw new YoutubeTranscriptVideoUnavailableError(identifier);
			const videoPageBody = yield videoPageResponse.text();
			if (videoPageBody.includes("class=\"g-recaptcha\"")) throw new YoutubeTranscriptTooManyRequestError();
			const apiKeyMatch = videoPageBody.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || videoPageBody.match(/INNERTUBE_API_KEY\\":\\"([^\\"]+)\\"/);
			if (!apiKeyMatch) throw new YoutubeTranscriptNotAvailableError(identifier);
			const playerFetchParams = {
				url: `${protocol}://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`,
				method: "POST",
				lang,
				userAgent,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					context: { client: {
						clientName: "ANDROID",
						clientVersion: "20.10.38"
					} },
					videoId: identifier
				}),
				signal
			};
			const playerRes = yield fetchWithRetry(() => {
				var _a;
				return ((_a = this.config) === null || _a === void 0 ? void 0 : _a.playerFetch) ? this.config.playerFetch(playerFetchParams) : defaultFetch(playerFetchParams);
			}, retries, retryDelay, signal);
			if (!playerRes.ok) throw new YoutubeTranscriptVideoUnavailableError(identifier);
			const playerJson = yield playerRes.json();
			const tracklist = (_k = (_j = playerJson.captions) === null || _j === void 0 ? void 0 : _j.playerCaptionsTracklistRenderer) !== null && _k !== void 0 ? _k : playerJson.playerCaptionsTracklistRenderer;
			const tracks = tracklist === null || tracklist === void 0 ? void 0 : tracklist.captionTracks;
			const isPlayableOk = ((_l = playerJson.playabilityStatus) === null || _l === void 0 ? void 0 : _l.status) === "OK";
			if (!playerJson.captions || !tracklist) {
				if (isPlayableOk) throw new YoutubeTranscriptDisabledError(identifier);
				throw new YoutubeTranscriptNotAvailableError(identifier);
			}
			if (!Array.isArray(tracks) || tracks.length === 0) throw new YoutubeTranscriptDisabledError(identifier);
			return {
				tracks,
				playerJson
			};
		});
	}
	/**
	* Extract VideoDetails from the Innertube player response.
	*/
	_extractVideoDetails(playerJson, identifier) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
		const raw = playerJson.videoDetails;
		return {
			videoId: (_a = raw === null || raw === void 0 ? void 0 : raw.videoId) !== null && _a !== void 0 ? _a : identifier,
			title: (_b = raw === null || raw === void 0 ? void 0 : raw.title) !== null && _b !== void 0 ? _b : "",
			author: (_c = raw === null || raw === void 0 ? void 0 : raw.author) !== null && _c !== void 0 ? _c : "",
			channelId: (_d = raw === null || raw === void 0 ? void 0 : raw.channelId) !== null && _d !== void 0 ? _d : "",
			lengthSeconds: parseInt((_e = raw === null || raw === void 0 ? void 0 : raw.lengthSeconds) !== null && _e !== void 0 ? _e : "0", 10),
			viewCount: parseInt((_f = raw === null || raw === void 0 ? void 0 : raw.viewCount) !== null && _f !== void 0 ? _f : "0", 10),
			description: (_g = raw === null || raw === void 0 ? void 0 : raw.shortDescription) !== null && _g !== void 0 ? _g : "",
			keywords: (_h = raw === null || raw === void 0 ? void 0 : raw.keywords) !== null && _h !== void 0 ? _h : [],
			thumbnails: (_k = (_j = raw === null || raw === void 0 ? void 0 : raw.thumbnail) === null || _j === void 0 ? void 0 : _j.thumbnails) !== null && _k !== void 0 ? _k : [],
			isLiveContent: (_l = raw === null || raw === void 0 ? void 0 : raw.isLiveContent) !== null && _l !== void 0 ? _l : false
		};
	}
	/**
	* Fetch the transcript for a YouTube video.
	*
	* When `videoDetails` is set to `true` in the config, returns a {@link TranscriptResult}
	* containing both video metadata and transcript segments. Otherwise returns an array of
	* {@link TranscriptSegment} objects.
	*
	* **Note:** The instance method returns a union type because `videoDetails` is set at
	* construction time. For automatic type narrowing, use the static method or the
	* `fetchTranscript` convenience export instead.
	*
	* @param videoId - A YouTube video ID (11 characters) or full YouTube URL.
	* @returns An array of transcript segments, or a TranscriptResult if `videoDetails` is enabled.
	* @throws {@link YoutubeTranscriptInvalidVideoIdError} if the video ID/URL is invalid.
	* @throws {@link YoutubeTranscriptVideoUnavailableError} if the video is unavailable.
	* @throws {@link YoutubeTranscriptDisabledError} if transcripts are disabled.
	* @throws {@link YoutubeTranscriptNotAvailableError} if no transcript is available.
	* @throws {@link YoutubeTranscriptNotAvailableLanguageError} if the requested language is unavailable.
	* @throws {@link YoutubeTranscriptTooManyRequestError} if rate-limited by YouTube.
	*/
	fetchTranscript(videoId) {
		return __awaiter(this, void 0, void 0, function* () {
			var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
			const identifier = retrieveVideoId(videoId);
			const lang = (_a = this.config) === null || _a === void 0 ? void 0 : _a.lang;
			if (lang) validateLang(lang);
			const userAgent = (_c = (_b = this.config) === null || _b === void 0 ? void 0 : _b.userAgent) !== null && _c !== void 0 ? _c : DEFAULT_USER_AGENT;
			const includeDetails = ((_d = this.config) === null || _d === void 0 ? void 0 : _d.videoDetails) === true;
			const cache = (_e = this.config) === null || _e === void 0 ? void 0 : _e.cache;
			const cacheTTL = (_f = this.config) === null || _f === void 0 ? void 0 : _f.cacheTTL;
			const cacheKey = includeDetails ? `yt:transcript+details:${identifier}:${lang !== null && lang !== void 0 ? lang : ""}` : `yt:transcript:${identifier}:${lang !== null && lang !== void 0 ? lang : ""}`;
			if (cache) {
				const cached = yield cache.get(cacheKey);
				if (cached) try {
					return JSON.parse(cached);
				} catch (_p) {}
			}
			const { tracks, playerJson } = yield this._fetchCaptionTracks(identifier, lang);
			const selectedTrack = lang ? tracks.find((t) => t.languageCode === lang) : tracks[0];
			if (!selectedTrack) throw new YoutubeTranscriptNotAvailableLanguageError(lang, tracks.map((t) => t.languageCode).filter(Boolean), identifier);
			const transcriptBaseURL = (_g = selectedTrack.baseUrl) !== null && _g !== void 0 ? _g : selectedTrack.url;
			if (!transcriptBaseURL) throw new YoutubeTranscriptNotAvailableError(identifier);
			let transcriptURL = transcriptBaseURL;
			transcriptURL = transcriptURL.replace(/&fmt=[^&]+/, "");
			if ((_h = this.config) === null || _h === void 0 ? void 0 : _h.disableHttps) transcriptURL = transcriptURL.replace(/^https:\/\//, "http://");
			const retries = (_k = (_j = this.config) === null || _j === void 0 ? void 0 : _j.retries) !== null && _k !== void 0 ? _k : 0;
			const retryDelay = (_m = (_l = this.config) === null || _l === void 0 ? void 0 : _l.retryDelay) !== null && _m !== void 0 ? _m : 1e3;
			const signal = (_o = this.config) === null || _o === void 0 ? void 0 : _o.signal;
			const transcriptFetchParams = {
				url: transcriptURL,
				lang,
				userAgent,
				signal
			};
			const transcriptResponse = yield fetchWithRetry(() => {
				var _a;
				return ((_a = this.config) === null || _a === void 0 ? void 0 : _a.transcriptFetch) ? this.config.transcriptFetch(transcriptFetchParams) : defaultFetch(transcriptFetchParams);
			}, retries, retryDelay, signal);
			if (!transcriptResponse.ok) {
				if (transcriptResponse.status === 429) throw new YoutubeTranscriptTooManyRequestError();
				throw new YoutubeTranscriptNotAvailableError(identifier);
			}
			const segments = [...(yield transcriptResponse.text()).matchAll(RE_XML_TRANSCRIPT)].map((m) => ({
				text: decodeXmlEntities(m[3]),
				duration: parseFloat(m[2]),
				offset: parseFloat(m[1]),
				lang: lang !== null && lang !== void 0 ? lang : selectedTrack.languageCode
			}));
			if (segments.length === 0) throw new YoutubeTranscriptNotAvailableError(identifier);
			const result = includeDetails ? {
				videoDetails: this._extractVideoDetails(playerJson, identifier),
				segments
			} : segments;
			if (cache) try {
				yield cache.set(cacheKey, JSON.stringify(result), cacheTTL);
			} catch (_q) {}
			return result;
		});
	}
	/**
	* List available caption languages for a YouTube video.
	*
	* Queries the Innertube player API to discover what caption tracks exist,
	* without downloading any transcript data.
	*
	* @param videoId - A YouTube video ID (11 characters) or full YouTube URL.
	* @returns An array of available caption track info objects.
	* @throws {@link YoutubeTranscriptInvalidVideoIdError} if the video ID/URL is invalid.
	* @throws {@link YoutubeTranscriptVideoUnavailableError} if the video is unavailable.
	* @throws {@link YoutubeTranscriptDisabledError} if transcripts are disabled.
	* @throws {@link YoutubeTranscriptNotAvailableError} if no captions are available.
	* @throws {@link YoutubeTranscriptTooManyRequestError} if rate-limited by YouTube.
	*
	* @example
	* ```typescript
	* const yt = new YoutubeTranscript();
	* const languages = await yt.listLanguages('dQw4w9WgXcQ');
	* // [
	* //   { languageCode: 'en', languageName: 'English', isAutoGenerated: false },
	* //   { languageCode: 'es', languageName: 'Spanish (auto-generated)', isAutoGenerated: true },
	* // ]
	* ```
	*/
	listLanguages(videoId) {
		return __awaiter(this, void 0, void 0, function* () {
			const identifier = retrieveVideoId(videoId);
			const { tracks } = yield this._fetchCaptionTracks(identifier);
			return tracks.map((track) => {
				var _a, _b;
				return {
					languageCode: track.languageCode,
					languageName: (_b = (_a = track.name) === null || _a === void 0 ? void 0 : _a.simpleText) !== null && _b !== void 0 ? _b : track.languageCode,
					isAutoGenerated: track.kind === "asr"
				};
			});
		});
	}
	static fetchTranscript(videoId, config) {
		return __awaiter(this, void 0, void 0, function* () {
			return new YoutubeTranscript(config).fetchTranscript(videoId);
		});
	}
	/**
	* Static convenience method to list available caption languages without creating an instance.
	*
	* @param videoId - A YouTube video ID (11 characters) or full YouTube URL.
	* @param config - Optional configuration options.
	* @returns An array of available caption track info objects.
	*/
	static listLanguages(videoId, config) {
		return __awaiter(this, void 0, void 0, function* () {
			return new YoutubeTranscript(config).listLanguages(videoId);
		});
	}
};
function fetchTranscript(videoId, config) {
	return YoutubeTranscript.fetchTranscript(videoId, config);
}
YoutubeTranscript.listLanguages;
//#endregion
export { toPlainText as n, fetchTranscript as t };
