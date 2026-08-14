const REQUEST_TIMEOUT = 10_000;
const MAX_EXCERPT = 1_800;

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value, limit = MAX_EXCERPT) {
  const text = cleanText(value);
  return text.length > limit ? `${text.slice(0, limit).trim()}…` : text;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Infomorph/1.0 (educational research prototype)",
        ...options.headers,
      },
    });
    if (!response.ok) throw new Error(`academic_source_${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

function abstractFromIndex(index) {
  if (!index || typeof index !== "object") return "";
  return Object.entries(index)
    .flatMap(([word, positions]) => positions.map((position) => [position, word]))
    .sort((a, b) => a[0] - b[0])
    .map(([, word]) => word)
    .join(" ");
}

function dateFromParts(parts) {
  const values = parts?.[0] || [];
  if (!values.length) return "Sin fecha";
  return [values[0], String(values[1] || 1).padStart(2, "0"), String(values[2] || 1).padStart(2, "0")].join("-");
}

export async function searchOpenAlex(query) {
  const params = new URLSearchParams({
    search: query,
    filter: "has_abstract:true,is_retracted:false",
    "per-page": "7",
  });
  const data = await fetchJson(`https://api.openalex.org/works?${params}`);
  return (data.results || [])
    .filter((work) => work.title && work.abstract_inverted_index)
    .slice(0, 5)
    .map((work, index) => {
      const location = work.primary_location || {};
      const source = location.source || {};
      const doi = work.doi?.replace("https://doi.org/", "");
      const authors = (work.authorships || [])
        .slice(0, 4)
        .map((item) => item.author?.display_name)
        .filter(Boolean);
      return {
        id: `openalex-${String(work.id).split("/").pop() || index}`,
        institution: source.display_name || "Revista científica indexada",
        title: cleanText(work.title),
        date: work.publication_date || String(work.publication_year || "Sin fecha"),
        url: doi ? `https://doi.org/${doi}` : location.landing_page_url || work.id,
        provider: "OpenAlex / DOI",
        authors,
        doi,
        evidence: shortText(abstractFromIndex(work.abstract_inverted_index)),
        evidenceUsed: true,
        peerReviewed: source.type === "journal",
      };
    });
}

export async function searchAlicia(query) {
  const params = new URLSearchParams({
    lookfor: query,
    type: "AllFields",
    limit: "8",
  });
  const data = await fetchJson(
    `https://alicia.concytec.gob.pe/vufind/api/v1/search?${params}`,
  );
  return (data.records || [])
    .filter((record) => record.title && record.urls?.[0]?.url)
    .slice(0, 5)
    .map((record) => ({
      id: `alicia-${record.id}`,
      institution:
        record.dcPublisher?.[0] ||
        `Repositorio ${String(record.id).split("_")[0] || "ALICIA"}`,
      title: cleanText(record.title),
      date: record.dcDateIssued?.[0] || "Sin fecha",
      url: record.urls[0].url.replace(/^http:/, "https:"),
      provider: "ALICIA — CONCYTEC",
      authors: Object.keys(record.authors?.primary || {}).slice(0, 4),
      evidenceUsed: false,
      peerReviewed: false,
    }));
}

async function searchElsevierApi(query, apiKey) {
  if (!apiKey) return [];
  const params = new URLSearchParams({ query, count: "5", view: "STANDARD" });
  const data = await fetchJson(
    `https://api.elsevier.com/content/search/sciencedirect?${params}`,
    { headers: { "X-ELS-APIKey": apiKey } },
  );
  return (data["search-results"]?.entry || []).map((entry, index) => ({
    id: `sciencedirect-${entry["dc:identifier"] || index}`,
    institution: entry["prism:publicationName"] || "ScienceDirect",
    title: cleanText(entry["dc:title"]),
    date: entry["prism:coverDate"] || "Sin fecha",
    url:
      entry.link?.find((link) => link["@ref"] === "scidir")?.["@href"] ||
      entry["prism:url"],
    provider: "ScienceDirect",
    authors: entry["dc:creator"] ? [entry["dc:creator"]] : [],
    evidence: shortText(entry["dc:description"] || ""),
    evidenceUsed: Boolean(entry["dc:description"]),
    peerReviewed: true,
  }));
}

async function searchElsevierCrossref(query) {
  const params = new URLSearchParams({
    "query.bibliographic": query,
    "query.publisher-name": "Elsevier",
    rows: "6",
    select: "DOI,title,publisher,published,author,URL,abstract,type",
  });
  const data = await fetchJson(`https://api.crossref.org/works?${params}`);
  return (data.message?.items || [])
    .filter((item) => /elsevier/i.test(item.publisher || "") && item.title?.[0])
    .slice(0, 4)
    .map((item, index) => ({
      id: `elsevier-${item.DOI || index}`,
      institution: item.publisher || "Elsevier",
      title: cleanText(item.title[0]),
      date: dateFromParts(item.published?.["date-parts"]),
      url: item.DOI ? `https://doi.org/${item.DOI}` : item.URL,
      provider: "ScienceDirect / Crossref",
      authors: (item.author || [])
        .slice(0, 4)
        .map((author) => [author.given, author.family].filter(Boolean).join(" ")),
      doi: item.DOI,
      evidence: shortText(item.abstract || ""),
      evidenceUsed: Boolean(item.abstract),
      peerReviewed: ["journal-article", "proceedings-article"].includes(item.type),
    }));
}

export async function searchAcademicSources(query, { elsevierApiKey } = {}) {
  const settled = await Promise.allSettled([
    searchOpenAlex(query),
    searchAlicia(query),
    elsevierApiKey
      ? searchElsevierApi(query, elsevierApiKey)
      : searchElsevierCrossref(query),
  ]);
  const [openAlex, alicia, elsevier] = settled.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  return {
    evidence: [...openAlex, ...elsevier.filter((source) => source.evidenceUsed)],
    readings: [...elsevier, ...alicia],
    providerStatus: {
      openAlex: settled[0].status === "fulfilled",
      alicia: settled[1].status === "fulfilled",
      scienceDirect: settled[2].status === "fulfilled",
      scienceDirectMode: elsevierApiKey ? "official-api" : "crossref-metadata",
    },
  };
}
