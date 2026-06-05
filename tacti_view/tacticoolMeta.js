const fs = require('fs');
const path = require('path');

// Parse live data from the local Charles packet file watcher (packet.bin in repo root).
// This module replaces the official meta API fetch.

let liveCache = {
  packetFile: null,
  updatedAt: 0,
  playerId: null,
  nickname: null,
  kills: null,
  wins: null,
  losses: null,
  matches: null,
  clanName: null,
  rating: null,
  level: null,
};

const packetsDir = path.join(__dirname, '..', 'packet.bin');
const DEFAULT_TTL_MS = 10_000;

function cleanBinaryToText(buffer) {
  // Keep ASCII + Arabic range, replace the rest.
  // This is heuristic, but good enough to locate keywords and numbers.
  const rawText = buffer.toString('utf-8');
  return rawText.replace(/[^\x20-\x7E\u0600-\u06FF]+/g, ' ');
}

function findPlayerId(rawText) {
  // UUID-like values appear inside packet.bin
  const ids = rawText.match(/[a-zA-Z0-9_\-\.]{36}/g) || [];
  for (const id of ids) {
    if ((id.match(/-/g) || []).length === 4) return id;
  }
  return null;
}

function parseNumberAfterKeywords(text, keywords) {
  for (const kw of keywords) {
    const re = new RegExp(`(?:${kw})\\s*[:=\\-\\"]?\\s*([0-9]+)`, 'i');
    const m = text.match(re);
    if (m && m[1]) return Number.parseInt(m[1], 10);
  }
  return null;
}

function parseKeywordString(text, keywords) {
  for (const kw of keywords) {
    const re = new RegExp(
      `(?:${kw})\\s*[:=\\-\\"]?\\s*([a-zA-Z0-9_\\s🔥\\[\\]\\-\\.\\u0600-\\u06FF]{3,60})`,
      'i'
    );
    const m = text.match(re);
    if (m && m[1]) {
      const s = m[1].trim().replace(/\s+/g, ' ');
      if (s.length >= 3) return s;
    }
  }
  return null;
}

function parseLatestFromPacketFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const text = cleanBinaryToText(buffer);

  const playerId = findPlayerId(text);

  const nickname = parseKeywordString(text, ['nick', 'nickname', 'name']);
  const kills = parseNumberAfterKeywords(text, ['kills', 'stat_kills', 'k']);
  const wins = parseNumberAfterKeywords(text, ['wins', 'victory', 'win']);
  const losses = parseNumberAfterKeywords(text, ['losses', 'defeat', 'loss']);
  const rating = parseNumberAfterKeywords(text, ['rating', 'mmr', 'score', 'rr']);
  const level = parseNumberAfterKeywords(text, ['level', 'rank', 'lvl']);

  // clan name often follows clan/clanName/tribe keywords
  const clanName = parseKeywordString(text, ['clan', 'clanname', 'faction']);

  const matches =
    (typeof wins === 'number' ? wins : 0) + (typeof losses === 'number' ? losses : 0);

  // If we didn't find anything meaningful, keep old values.
  const meaningful = playerId || nickname || kills !== null || wins !== null || losses !== null;

  if (!meaningful) return null;

  return {
    packetFile: filePath,
    updatedAt: Date.now(),
    playerId,
    nickname,
    kills,
    wins,
    losses,
    matches: Number.isFinite(matches) ? matches : null,
    clanName,
    rating,
    level,
  };
}

function getLatestPacketFilePath() {
  // packet.bin is a directory.
  // latest file = newest mtime
  if (!fs.existsSync(packetsDir)) return null;
  const entries = fs.readdirSync(packetsDir);
  const bins = entries.filter((e) => e.endsWith('.bin'));
  if (!bins.length) return null;
  let newest = null;
  let newestTime = 0;
  for (const f of bins) {
    const full = path.join(packetsDir, f);
    const stat = fs.statSync(full);
    if (stat.mtimeMs > newestTime) {
      newestTime = stat.mtimeMs;
      newest = full;
    }
  }
  return newest;
}

function refreshCacheBestEffort() {
  const latestFile = getLatestPacketFilePath();
  if (!latestFile) return null;

  // avoid re-reading too frequently
  if (liveCache.updatedAt && Date.now() - liveCache.updatedAt < DEFAULT_TTL_MS) {
    return liveCache;
  }

  try {
    const parsed = parseLatestFromPacketFile(latestFile);
    if (parsed) liveCache = { ...liveCache, ...parsed };
    return liveCache;
  } catch {
    return liveCache;
  }
}

/**
 * Mimics the old signature used by /view and /connect.
 * @param {string} playerId - optional filter
 */
async function fetchTacticoolPlayerMeta(playerId) {
  refreshCacheBestEffort();

  const id = String(playerId || '').trim();

  // Only accept if the live sniffer currently recognizes this playerId (or playerId is empty)
  if (id && liveCache.playerId && id !== liveCache.playerId) return null;

  const hasAny =
    liveCache.playerId ||
    liveCache.nickname ||
    liveCache.kills != null ||
    liveCache.wins != null ||
    liveCache.losses != null;

  if (!hasAny) return null;

  return {
    displayName: liveCache.nickname || liveCache.playerId || id || 'Unknown',
    kills: liveCache.kills, // may be null if not parsed yet
    wins: liveCache.wins,
    losses: liveCache.losses,
    matches: liveCache.matches,
    clanName: liveCache.clanName,
    rating: liveCache.rating,
    level: liveCache.level,
    levelBorder: null,
    avatar: null,
  };
}

// Export both API-like function and the raw cache (connect verification needs it).
module.exports = {
  fetchTacticoolPlayerMeta,
  liveCache,
  refreshCacheBestEffort,
};

