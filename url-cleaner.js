(function attachVotrixain(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VotrixainUrl = api;
})(globalThis, function createVotrixainUrl() {
  "use strict";

  const TRACKING_KEYS = new Set([
    "fbclid", "gclid", "dclid", "gbraid", "wbraid", "msclkid",
    "igshid", "cplk", "mc_cid", "mc_eid", "mkt_tok", "srsltid",
    "ttclid", "twclid", "li_fat_id", "epik", "obrf", "fb_action_ids",
    "fb_action_types", "fb_source", "scid"
  ]);

  function cleanUrl(raw) {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) {
      throw new Error("Paste a link to get started");
    }

    let url;
    try {
      url = new URL(trimmed);
    } catch {
      throw new Error("Enter a complete link beginning with https:// or http://");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Votrixain only processes http and https links");
    }

    const original = url.href;
    const isInstagramContent = /(^|\.)instagram\.com$/i.test(url.hostname) &&
      /^\/(?:reel|p)\/[^/]+\/?$/i.test(url.pathname);
    const isGitHubUrl = /(^|\.)github\.com$/i.test(url.hostname);
    const isXStatusUrl = /(^|\.)(?:x|twitter)\.com$/i.test(url.hostname) &&
      /^\/[^/]+\/status\/[^/]+\/?$/i.test(url.pathname);
    const fullQueryRule = isInstagramContent || isGitHubUrl || isXStatusUrl;
    const hasQueryDelimiter = trimmed.slice(0, trimmed.indexOf("#") === -1 ? undefined : trimmed.indexOf("#")).includes("?");
    const removedKeys = [];
    let removedCount = 0;

    if (fullQueryRule) {
      for (const [key] of url.searchParams) {
        removedKeys.push(key);
        removedCount += 1;
      }
      url.search = "";
    } else {
      const keys = [...new Set(url.searchParams.keys())];
      for (const key of keys) {
        const normalized = key.toLowerCase();
        if (normalized.startsWith("utm_") || TRACKING_KEYS.has(normalized)) {
          removedCount += url.searchParams.getAll(key).length;
          removedKeys.push(key);
          url.searchParams.delete(key);
        }
      }
    }

    let cleaned = url.href;
    // Keep the empty query delimiter shown in canonical X status links supplied by users.
    if (isXStatusUrl && hasQueryDelimiter) {
      const hashIndex = cleaned.indexOf("#");
      cleaned = hashIndex === -1
        ? `${cleaned}?`
        : `${cleaned.slice(0, hashIndex)}?${cleaned.slice(hashIndex)}`;
    }

    return {
      cleaned,
      changed: cleaned !== original,
      removedCount,
      removedKeys: [...new Set(removedKeys)],
      instagramRule: isInstagramContent,
      fullQueryRule
    };
  }

  return { cleanUrl };
});
