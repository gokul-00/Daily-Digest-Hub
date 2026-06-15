import { fetchTranscript, toPlainText } from "youtube-transcript-plus";

import type { SourceType } from "./classify";

export type YoutubeExtractResult = {
  url: string;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: "youtube-transcript-plus";
};

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./, "") === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export async function extractYoutube(url: string): Promise<YoutubeExtractResult> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const result = await fetchTranscript(url, { videoDetails: true });
  const segments = "segments" in result ? result.segments : result;
  const body = toPlainText(segments);

  return {
    url,
    title: "videoDetails" in result ? result.videoDetails?.title : undefined,
    body,
    metadata: {
      sourceType: "youtube" satisfies SourceType,
      videoId,
      segmentCount: segments.length,
    },
    provider: "youtube-transcript-plus",
  };
}
