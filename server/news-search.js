const CACHE_TTL = 10 * 60 * 1000;
const cache = new Map();

const TRUSTED_DOMAINS = [
  "andina.pe",
  "gob.pe",
  "igp.gob.pe",
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "dw.com",
  "france24.com",
  "efe.com",
  "elpais.com",
  "rpp.pe",
  "gestion.pe",
  "elcomercio.pe",
  "un.org",
  "who.int",
  "nasa.gov",
  "noaa.gov",
  "usgs.gov",
];

function domainOf(value = "") {
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isTrusted(domain) {
  return TRUSTED_DOMAINS.some(
    (trusted) => domain === trusted || domain.endsWith(`.${trusted}`),
  );
}

function decodeXml(value = "") {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function tag(xml, name) {
  return decodeXml(
    xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "",
  );
}

async function fetchWithTimeout(url, timeout = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Infomorph/1.0 educational news reader" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function searchGdelt(query) {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    maxrecords: "75",
    timespan: "3months",
    sort: "datedesc",
  });
  const response = await fetchWithTimeout(
    `https://api.gdeltproject.org/api/v2/doc/doc?${params}`,
    4_500,
  );
  if (!response.ok) throw new Error(`gdelt_${response.status}`);
  const data = await response.json();
  return (data.articles || [])
    .map((article, index) => {
      const domain = domainOf(article.url) || article.domain;
      return {
        id: `gdelt-${article.seendate || index}-${domain}`,
        title: article.title,
        outlet: domain,
        domain,
        date: article.seendate,
        url: article.url,
        image: article.socialimage || null,
        language: article.language,
      };
    })
    .filter((article) => article.title && article.url && isTrusted(article.domain));
}

async function searchGoogleNews(query) {
  const params = new URLSearchParams({
    q: `${query} when:90d`,
    hl: "es-419",
    gl: "PE",
    ceid: "PE:es-419",
  });
  const response = await fetchWithTimeout(
    `https://news.google.com/rss/search?${params}`,
  );
  if (!response.ok) throw new Error(`google_news_${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match, index) => {
      const item = match[1];
      const sourceTag = item.match(/<source\s+url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/i);
      const sourceUrl = decodeXml(sourceTag?.[1] || "");
      const domain = domainOf(sourceUrl);
      return {
        id: `gnews-${index}-${domain}`,
        title: tag(item, "title").replace(/\s+-\s+[^-]+$/, ""),
        outlet: decodeXml(sourceTag?.[2] || domain),
        domain,
        date: tag(item, "pubDate"),
        url: tag(item, "link"),
        image: null,
        language: "Spanish",
      };
    })
    .filter((article) => article.title && article.url && isTrusted(article.domain));
}

export async function searchCurrentNews(query) {
  const key = query.trim().toLocaleLowerCase("es");
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL) return cached.items;

  const attempts = await Promise.allSettled([
    searchGdelt(query),
    searchGoogleNews(query),
  ]);
  const merged = attempts.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const seen = new Set();
  const items = merged
    .filter((article) => {
      const normalized = article.title.toLocaleLowerCase("es");
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
  cache.set(key, { createdAt: Date.now(), items });
  return items;
}
