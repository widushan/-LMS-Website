// Extracts a YouTube videoId (11 chars) from common URL formats:
// - https://www.youtube.com/watch?v=VIDEOID
// - https://youtu.be/VIDEOID
// - https://www.youtube.com/embed/VIDEOID
// - https://www.youtube-nocookie.com/embed/VIDEOID
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== "string") return null;

  // Try URL parsing first (best for watch?v=)
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.replace("/", "").trim();
      return id ? id.split("?")[0].slice(0, 11) : null;
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (url.pathname === "/watch") {
        const v = url.searchParams.get("v");
        return v ? v.trim().slice(0, 11) : null;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]) {
        return parts[embedIdx + 1].trim().slice(0, 11);
      }

      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx !== -1 && parts[shortsIdx + 1]) {
        return parts[shortsIdx + 1].trim().slice(0, 11);
      }
    }
  } catch {
    // ignore and fall back to regex
  }

  // Regex fallback (grab 11-char videoId)
  const match = input.match(
    /(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

