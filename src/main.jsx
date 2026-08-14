import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  BookOpen,
  UserRound,
  Landmark,
  FileSearch,
  CalendarDays,
  ExternalLink,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Newspaper,
} from "lucide-react";
import "./styles.css";

const AGE_GROUPS = ["6–9", "10–13", "14–17", "18–30", "31+"];
const ANSWERS = {
  "6–9": {
    lead: "El clima de la Tierra está cambiando.",
    body: [
      "Nuestro planeta se está calentando porque algunas actividades humanas producen gases que guardan demasiado calor.",
      "Eso puede causar días más calurosos, tormentas fuertes y menos hielo.",
    ],
    example:
      "🌍 Imagina que la Tierra tiene una manta: algunos gases hacen que esa manta sea demasiado gruesa.",
  },
  "10–13": {
    lead: "El cambio climático es un cambio a largo plazo en las temperaturas y los patrones del clima de la Tierra.",
    body: [
      "Sucede principalmente porque actividades humanas, como usar carbón, petróleo y gas, liberan gases que atrapan el calor del Sol en la atmósfera.",
      "Sus efectos incluyen olas de calor, tormentas más intensas, derretimiento de glaciares y cambios en las lluvias.",
    ],
    example:
      "Piensa críticamente: distintas fuentes pueden explicar este tema de formas diferentes.",
  },
  "14–17": {
    lead: "El cambio climático describe alteraciones sostenidas del sistema climático, especialmente el calentamiento global observado desde la era industrial.",
    body: [
      "La principal causa actual es el aumento de gases de efecto invernadero por la quema de combustibles fósiles, la deforestación y algunos procesos agrícolas.",
      "Sus impactos no son iguales en todas partes: afectan ecosistemas, salud, disponibilidad de agua, producción de alimentos y economías.",
    ],
    example:
      "Conviene distinguir entre clima —tendencias de décadas— y tiempo —condiciones de un día concreto—.",
  },
  "18–30": {
    lead: "El cambio climático es una transformación persistente de los patrones climáticos globales y regionales, impulsada hoy principalmente por emisiones humanas de gases de efecto invernadero.",
    body: [
      "El dióxido de carbono, el metano y otros gases alteran el balance energético del planeta. La evidencia procede de mediciones atmosféricas, registros de temperatura, océanos, glaciares y modelos climáticos.",
      "Los riesgos combinan impactos físicos, sociales y económicos. Las respuestas se agrupan en mitigación —reducir emisiones— y adaptación —reducir vulnerabilidad—.",
    ],
    example:
      "Para evaluar una afirmación, revisa el método, la fecha y si otras fuentes independientes llegan a conclusiones similares.",
  },
  "31+": {
    lead: "El cambio climático es una alteración de largo plazo del sistema climático. El calentamiento observado en la era industrial se atribuye principalmente a actividades humanas.",
    body: [
      "Las emisiones de CO₂, metano y óxido nitroso intensifican el efecto invernadero y modifican el balance radiativo. La atribución se sustenta en múltiples líneas de evidencia observacional y modelos físicos.",
      "Sus consecuencias incluyen extremos térmicos, cambios hidrológicos, aumento del nivel del mar y riesgos interconectados para salud, infraestructura, biodiversidad y seguridad alimentaria.",
    ],
    example:
      "La calidad de una afirmación depende de la evidencia, su metodología, incertidumbre declarada y concordancia con fuentes independientes.",
  },
};
const SOURCES = [
  {
    org: "IPCC",
    title: "Cambio climático 2023: Informe de síntesis",
    date: "20 mar 2023",
  },
  {
    org: "NASA Ciencia",
    title: "¿Qué es el cambio climático?",
    date: "18 abr 2024",
  },
  {
    org: "Organización Meteorológica Mundial",
    title: "El estado del clima mundial",
    date: "19 mar 2024",
  },
];

function Brand() {
  return (
    <div className="brand">
      Infomorph<span aria-hidden="true">✦</span>
    </div>
  );
}
function Register({ onComplete }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("10–13");
  return (
    <main className="onboarding">
      <div className="register-card">
        <section className="intro">
          <Brand />
          <div className="intro-art" aria-hidden="true">
            <span>?</span>
            <span>✓</span>
          </div>
          <div className="intro-copy">
            <h1>
              Investiga.
              <br />
              Comprende.
              <br />
              Verifica.
            </h1>
            <p>
              Infomorph te ayuda a explorar cualquier tema con información adaptada
              a tu edad.
            </p>
            <ul>
              <li>
                <CheckCircle2 /> Explicaciones fáciles de entender
              </li>
              <li>
                <CheckCircle2 /> Fuentes visibles y organizadas
              </li>
              <li>
                <CheckCircle2 /> Consejos para verificar información
              </li>
            </ul>
          </div>
          <div className="trust-note">
            <ShieldCheck />
            <span>La IA adapta el contenido; no decide qué es verdad.</span>
          </div>
        </section>
        <section className="signup">
          <div className="signup-heading">
            <div className="mini-brand">
              <Brand />
            </div>
            <h2>¡Hola! Vamos a conocernos</h2>
            <p>Cuéntanos un poco sobre ti para adaptar tu experiencia.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) onComplete(name.trim(), age);
            }}
          >
            <label>
              ¿Cómo te llamas?
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Escribe tu nombre"
                required
              />
            </label>
            <fieldset>
              <legend>¿Cuál es tu rango de edad?</legend>
              <div className="age-grid">
                {AGE_GROUPS.map((x) => (
                  <button
                    type="button"
                    className={age === x ? "selected" : ""}
                    onClick={() => setAge(x)}
                    key={x}
                  >
                    {x} años
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="primary" type="submit">
              Comenzar a explorar <ArrowRight />
            </button>
          </form>
          <p className="privacy">
            Sin cuenta, sin anuncios y sin datos innecesarios.
          </p>
        </section>
      </div>
    </main>
  );
}

function Verify() {
  const items = [
    [UserRound, "Autor", "¿Quién escribió o publicó esto?"],
    [Landmark, "Institución", "¿Es reconocida y transparente?"],
    [FileSearch, "Evidencia", "¿Incluye datos o referencias?"],
    [CalendarDays, "Fecha", "¿Cuándo se publicó o actualizó?"],
  ];
  return (
    <section className="verify">
      <h2>
        <BookOpen /> Aprende a verificar
      </h2>
      <p>Antes de confiar, revisa estos 4 criterios.</p>
      {items.map(([Icon, t, d]) => (
        <div className="criterion" key={t}>
          <Icon />
          <div>
            <strong>{t}</strong>
            <span>{d}</span>
          </div>
        </div>
      ))}
      <div className="yellow-note">
        <Sparkles /> Duda, compara y pregunta. Tú eliges qué información usar.
      </div>
    </section>
  );
}
function Challenge() {
  const [choice, setChoice] = useState(null);
  const [done, setDone] = useState(false);
  return (
    <section className="challenge">
      <header>
        <h2>Reto rápido</h2>
        <span>1 de 3</span>
      </header>
      <p>Una publicación no dice quién la escribió. ¿Qué harías primero?</p>
      {[
        "Compartirla si parece convincente",
        "Buscar el autor y comparar con otra fuente",
      ].map((x, i) => (
        <button
          key={x}
          className={choice === i ? "chosen" : ""}
          onClick={() => {
            setChoice(i);
            setDone(true);
          }}
        >
          <b>{String.fromCharCode(65 + i)}</b>
          {x}
        </button>
      ))}
      {done ? (
        <div className={choice === 1 ? "feedback good" : "feedback"}>
          {choice === 1
            ? "¡Buena decisión! Verificar antes de compartir reduce errores."
            : "Parece convincente no es evidencia. Busca quién lo afirma y compáralo."}
        </div>
      ) : (
        <small>No pasa nada si no estás seguro. Aquí practicamos.</small>
      )}
    </section>
  );
}
function Sources({ items = SOURCES }) {
  return (
    <section className="sources">
      <h2>¿De dónde viene esta información?</h2>
      <div className="source-head">
        <span>Institución</span>
        <span>Título</span>
        <span>Fecha</span>
        <span>Original</span>
      </div>
      {items.map((s) => (
        <div className="source" key={s.id || s.org}>
          <div className="source-origin">
            <strong>{s.institution || s.org}</strong>
            {s.provider ? <small>{s.provider}</small> : null}
          </div>
          <div className="source-title">
            <span>{s.title}</span>
            {s.authors?.length ? (
              <small>{s.authors.slice(0, 3).join(", ")}</small>
            ) : null}
          </div>
          <time>{s.date}</time>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir fuente: ${s.title}`}
          >
            <ExternalLink /> <span>Abrir</span>
          </a>
        </div>
      ))}
      <p className="source-note">
        La respuesta usa únicamente fuentes con extractos recuperados. ALICIA y
        ScienceDirect también aparecen como lecturas académicas para abrir y
        contrastar; su presencia no significa que Infomorph declare verdadero
        todo su contenido.
      </p>
    </section>
  );
}

function newsDate(value) {
  if (!value) return "Reciente";
  const compact = String(value).match(/^(\d{4})(\d{2})(\d{2})T/);
  const date = compact
    ? new Date(`${compact[1]}-${compact[2]}-${compact[3]}T00:00:00Z`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "Reciente";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CurrentNews({ items }) {
  if (!items?.length) return null;
  return (
    <section className="current-news">
      <div className="news-heading">
        <div>
          <h2>
            <Newspaper /> Actualidad sobre este tema
          </h2>
          <p>Publicaciones recientes para observar y contrastar.</p>
        </div>
        <span>Más recientes primero</span>
      </div>
      <div className="news-grid">
        {items.map((item, index) => {
          const initials = item.outlet
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase();
          return (
            <a
              className={index === 0 ? "news-card featured" : "news-card"}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
            >
              <div className="news-image">
                <span aria-hidden="true">{initials}</span>
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
              </div>
              <div className="news-copy">
                <div className="news-meta">
                  <strong>{item.outlet}</strong>
                  <time>{newsDate(item.date)}</time>
                </div>
                <h3>{item.title}</h3>
                <span className="news-open">
                  Leer noticia <ExternalLink />
                </span>
              </div>
            </a>
          );
        })}
      </div>
      <small className="news-caution">
        Actualidad no equivale a evidencia científica: revisa autor, fecha y
        contrasta el reporte con las fuentes de investigación.
      </small>
    </section>
  );
}
const VISUAL_IDEAS = {
  "6–9": ["🌍 Nuestro planeta", "☀️ Calor del Sol", "🌱 Cómo cuidarlo"],
  "10–13": ["🌡️ Temperatura", "🌧️ Cambios del clima", "🤝 Soluciones"],
  "14–17": ["📈 Tendencias", "🌊 Impactos", "🔎 Evidencia"],
  "18–30": [
    "Datos observables",
    "Riesgos conectados",
    "Mitigación y adaptación",
  ],
  "31+": [
    "Evidencia científica",
    "Impacto social y económico",
    "Decisiones informadas",
  ],
};
function LegacyVisualExplorer({ age, topic }) {
  const [visuals, setVisuals] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      try {
        const params = new URLSearchParams({
          action: "query",
          format: "json",
          formatversion: "2",
          generator: "search",
          gsrsearch: topic,
          gsrnamespace: "0",
          gsrlimit: "3",
          prop: "pageimages|info",
          piprop: "thumbnail",
          pithumbsize: "900",
          pilicense: "free",
          inprop: "url",
          origin: "*",
        });
        const response = await fetch(
          `https://es.wikipedia.org/w/api.php?${params}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("visual-api");
        const data = await response.json();
        const pages = (data.query?.pages || [])
          .filter((page) => page.thumbnail?.source)
          .map((page) => ({
            title: page.title,
            image: page.thumbnail.source,
            url: page.fullurl,
          }));
        setVisuals(pages);
        setStatus(pages.length ? "ready" : "empty");
      } catch (error) {
        if (error.name !== "AbortError") {
          setVisuals([]);
          setStatus("error");
        }
      }
    }
    load();
    return () => controller.abort();
  }, [topic]);
  const limit = age === "6–9" ? 1 : age === "10–13" ? 2 : 3;
  return (
    <section
      className={`visual-explorer age-${age.replace("–", "-").replace("+", "plus")}`}
    >
      <div className="visual-heading">
        <div>
          <h3>Explora con imágenes</h3>
          <p>Apoyo visual relacionado con tu búsqueda.</p>
        </div>
        <span>Wikimedia</span>
      </div>
      {status === "loading" ? (
        <div className="visual-loading">
          <span />
          <span />
          <span />
        </div>
      ) : visuals.length ? (
        <div className={`visual-grid count-${Math.min(limit, visuals.length)}`}>
          {visuals.slice(0, limit).map((item, index) => (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="visual-item"
              key={item.url}
            >
              <img
                src={item.image}
                alt={`${item.title}, imagen educativa relacionada`}
                loading={index ? "lazy" : "eager"}
              />
              <span>{item.title}</span>
              <ExternalLink />
            </a>
          ))}
        </div>
      ) : (
        <div className="visual-fallback">
          <span>🌍</span>
          <p>
            No encontramos una imagen libre para este tema, pero puedes seguir
            explorando sus ideas clave.
          </p>
        </div>
      )}
      <div className="idea-strip">
        {VISUAL_IDEAS[age].map((idea) => (
          <span key={idea}>{idea}</span>
        ))}
      </div>
      <small>
        Las imágenes son apoyo contextual de Wikipedia/Wikimedia y no determinan
        la veracidad de la respuesta.
      </small>
    </section>
  );
}
const ICONIFY_ICONS = [
  ["mdi:thermometer", "Temperatura"],
  ["mdi:weather-pouring", "Cambios"],
  ["mdi:leaf", "Soluciones"],
];
const iconifyUrl = (name) => {
  const [set, icon] = name.split(":");
  return `https://api.iconify.design/${set}/${icon}.svg?color=%230755d9`;
};
function VisualExplorer({ age, topic }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(age !== "18–30" && age !== "31+");
  const isChild = age === "6–9";
  const isPreteen = age === "10–13";
  const isTeen = age === "14–17";
  const content = ANSWERS[age];

  useEffect(() => {
    if (!isChild && !isPreteen && !isTeen) {
      setMedia([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadMedia() {
      setLoading(true);
      try {
        if (isChild || isPreteen) {
          const cleaned = topic.toLowerCase().includes("clim")
            ? "clima"
            : topic
                .replace(/[¿?]/g, " ")
                .split(/\s+/)
                .find((word) => word.length > 4) || topic;
          const response = await fetch(
            `https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(cleaned)}`,
            { signal: controller.signal },
          );
          if (!response.ok) throw new Error("arasaac-api");
          const pictograms = (await response.json())
            .slice(0, isChild ? 3 : 1)
            .map((item) => ({
              title: item.keywords?.[0]?.keyword || cleaned,
              image: `https://static.arasaac.org/pictograms/${item._id}/${item._id}_500.png`,
              source: "ARASAAC",
            }));
          setMedia(pictograms);
        } else {
          const params = new URLSearchParams({
            action: "query",
            format: "json",
            formatversion: "2",
            generator: "search",
            gsrsearch: topic,
            gsrnamespace: "0",
            gsrlimit: "2",
            prop: "pageimages|info",
            piprop: "thumbnail",
            pithumbsize: "900",
            pilicense: "free",
            inprop: "url",
            origin: "*",
          });
          const response = await fetch(
            `https://es.wikipedia.org/w/api.php?${params}`,
            { signal: controller.signal },
          );
          if (!response.ok) throw new Error("wikimedia-api");
          const data = await response.json();
          setMedia(
            (data.query?.pages || [])
              .filter((page) => page.thumbnail?.source)
              .map((page) => ({
                title: page.title,
                image: page.thumbnail.source,
                url: page.fullurl,
                source: "Wikimedia",
              })),
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") setMedia([]);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
    return () => controller.abort();
  }, [age, topic, isChild, isPreteen, isTeen]);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      [content.lead, ...content.body].join(" "),
    );
    utterance.lang = "es-ES";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }

  if (isChild)
    return (
      <section className="age-experience child-experience">
        <div className="experience-title">
          <div>
            <h3>Lo vemos paso a paso</h3>
            <p>Pictogramas y palabras sencillas.</p>
          </div>
          <button onClick={speak} type="button">
            🔊 Escuchar
          </button>
        </div>
        <div className="pictogram-row">
          {loading
            ? [0, 1, 2].map((n) => <span className="picto-skeleton" key={n} />)
            : media.length
              ? media.map((item) => (
                  <figure key={item.image}>
                    <img src={item.image} alt={`Pictograma: ${item.title}`} />
                    <figcaption>{item.title}</figcaption>
                  </figure>
                ))
              : VISUAL_IDEAS[age].map((idea) => (
                  <figure className="picto-fallback" key={idea}>
                    <span>{idea.split(" ")[0]}</span>
                    <figcaption>{idea.slice(3)}</figcaption>
                  </figure>
                ))}
        </div>
        <small>
          Pictogramas: Sergio Palao · ARASAAC · CC BY-NC-SA. Son apoyo visual,
          no fuentes factuales.
        </small>
      </section>
    );

  if (isPreteen)
    return (
      <section className="age-experience preteen-experience">
        <div className="experience-title">
          <div>
            <h3>Ideas clave</h3>
            <p>Tarjetas visuales para recordar lo importante.</p>
          </div>
          <span>ARASAAC + Iconify</span>
        </div>
        {media[0] ? (
          <div className="occasional-picto">
            <img src={media[0].image} alt={`Pictograma: ${media[0].title}`} />
            <span>
              Una pista visual: <strong>{media[0].title}</strong>
            </span>
          </div>
        ) : (
          <div className="occasional-picto picto-unavailable">
            <span className="picto-mark">▧</span>
            <span>Pista visual preparada para ARASAAC.</span>
          </div>
        )}
        <div className="concept-cards">
          {ICONIFY_ICONS.map(([icon, label], index) => (
            <article key={icon}>
              <img src={iconifyUrl(icon)} alt="" />
              <strong>{label}</strong>
              <p>{VISUAL_IDEAS[age][index].replace(/^\S+\s/, "")}</p>
            </article>
          ))}
        </div>
        <small>
          ARASAAC se usa de forma puntual; los demás símbolos provienen de
          Iconify.
        </small>
      </section>
    );

  if (isTeen)
    return (
      <section className="age-experience teen-experience">
        <div className="experience-title">
          <div>
            <h3>Contexto visual</h3>
            <p>
              Imágenes y una miniinfografía para conectar causas e impactos.
            </p>
          </div>
          <span>Iconify + Wikimedia</span>
        </div>
        <div className="teen-visuals">
          {media.slice(0, 2).map((item) => (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              key={item.image}
            >
              <img src={item.image} alt={item.title} />
              <span>{item.title}</span>
            </a>
          ))}
          {!media.length
            ? ICONIFY_ICONS.slice(0, 2).map(([icon, label]) => (
                <div className="teen-visual-fallback" key={icon}>
                  <img src={iconifyUrl(icon)} alt="" />
                  <span>{label}</span>
                </div>
              ))
            : null}
        </div>
        <div className="mini-infographic">
          {ICONIFY_ICONS.map(([icon, label], index) => (
            <React.Fragment key={icon}>
              <div>
                <img src={iconifyUrl(icon)} alt="" />
                <strong>{label}</strong>
              </div>
              {index < 2 ? <ArrowRight /> : null}
            </React.Fragment>
          ))}
        </div>
        <small>
          Las imágenes contextualizan; revisa las fuentes verificadas antes de
          sacar conclusiones.
        </small>
      </section>
    );

  return (
    <section className="age-experience adult-experience">
      <div className="experience-title">
        <div>
          <h3>Lectura estructurada</h3>
          <p>Organiza la evidencia antes de interpretar una afirmación.</p>
        </div>
        <span>18+</span>
      </div>
      <div className="adult-structure">
        <article>
          <strong>Qué sabemos</strong>
          <p>{content.lead}</p>
        </article>
        <article>
          <strong>Qué conviene contrastar</strong>
          <p>{content.example}</p>
        </article>
      </div>
      <div
        className="analysis-chart"
        role="img"
        aria-label="Gráfico de ruta de análisis: evidencia, contexto y fuentes"
      >
        <div>
          <span>Evidencia</span>
          <i style={{ width: "92%" }} />
        </div>
        <div>
          <span>Contexto</span>
          <i style={{ width: "76%" }} />
        </div>
        <div>
          <span>Fuentes</span>
          <i style={{ width: "84%" }} />
        </div>
      </div>
      <small>
        El gráfico organiza la lectura; no representa mediciones científicas.
      </small>
    </section>
  );
}
const pictogramCache = new Map();

function findPictogram(words) {
  const query = words.find(Boolean)?.trim().toLowerCase();
  if (!query) return Promise.resolve(null);
  if (pictogramCache.has(query)) return pictogramCache.get(query);

  const request = fetch(
    `https://api.arasaac.org/api/pictograms/es/search/${encodeURIComponent(query)}`,
  )
    .then((response) => {
      if (!response.ok) throw new Error("arasaac-api");
      return response.json();
    })
    .then((items) => {
      const item = items[0];
      if (!item?._id) return null;
      return {
        src: `https://static.arasaac.org/pictograms/${item._id}/${item._id}_500.png`,
        label: item.keywords?.[0]?.keyword || query,
      };
    })
    .catch(() => null);

  pictogramCache.set(query, request);
  return request;
}

function ChildBlockVisual({ words, title }) {
  const [pictogram, setPictogram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    findPictogram(words).then((result) => {
      if (active) {
        setPictogram(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [words]);

  return (
    <div className={`child-block-visual ${loading ? "is-loading" : ""}`}>
      {pictogram ? (
        <img src={pictogram.src} alt={`Pictograma de ${pictogram.label}`} />
      ) : (
        <span aria-hidden="true">✦</span>
      )}
      <small>{loading ? "Buscando imagen…" : title}</small>
    </div>
  );
}

function AgentPlan({ plan, age }) {
  if (!plan) return null;
  const isYoungChild = age === "6–9";
  const isFlow = ["cause_effect", "step_by_step", "timeline"].includes(
    plan.format,
  );
  return (
    <section
      className={`agent-plan format-${plan.format} level-${age.replace("–", "-").replace("+", "plus")}`}
    >
      <div className="agent-plan-heading">
        <div>
          <h3>{plan.title}</h3>
          <p>{plan.summary}</p>
        </div>
        <span>{plan.format.replaceAll("_", " → ")}</span>
      </div>
      <div className={`agent-blocks ${isFlow ? "flow" : ""}`}>
        {plan.blocks.map((block, index) => (
          <React.Fragment key={`${block.title}-${index}`}>
            <article>
              <span className="block-number">{index + 1}</span>
              <div>
                {isYoungChild ? (
                  <ChildBlockVisual
                    words={block.visualKeywords}
                    title={block.title}
                  />
                ) : null}
                <h4>{block.title}</h4>
                <p>{block.text}</p>
                {!isYoungChild ? (
                  <div className="visual-queries">
                    {block.visualKeywords.map((word) => (
                      <span key={word}>{word}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
            {isFlow && index < plan.blocks.length - 1 ? (
              <ArrowRight className="flow-arrow" />
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div className="agent-verification">
        <ShieldCheck />
        <span>{plan.verificationTip}</span>
      </div>
      {isYoungChild ? (
        <small className="agent-media-credit">
          Pictogramas: Sergio Palao · ARASAAC · CC BY-NC-SA. Son apoyo
          visual; las fuentes factuales aparecen más abajo.
        </small>
      ) : null}
    </section>
  );
}
function Dashboard({ profile, onReset }) {
  const [query, setQuery] = useState("¿Qué es el cambio climático?");
  const [topic, setTopic] = useState("cambio climático");
  const [searched, setSearched] = useState(true);
  const [age, setAge] = useState(profile.age);
  const [plan, setPlan] = useState(null);
  const [verifiedSources, setVerifiedSources] = useState(null);
  const [currentNews, setCurrentNews] = useState([]);
  const [agentStatus, setAgentStatus] = useState("loading");
  const [agentError, setAgentError] = useState("");
  const content = ANSWERS[age];
  useEffect(() => {
    const controller = new AbortController();
    async function adapt() {
      setAgentStatus("loading");
      setAgentError("");
      try {
        const response = await fetch("/api/adapt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: topic, ageRange: age }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "No se pudo adaptar el contenido");
        setPlan(data.plan);
        setVerifiedSources(data.sources);
        setCurrentNews(data.news || []);
        setAgentError(data.warning || "");
        setAgentStatus(data.plan ? "ready" : "sources-only");
      } catch (error) {
        if (error.name !== "AbortError") {
          setPlan(null);
          setVerifiedSources(null);
          setCurrentNews([]);
          setAgentError(error.message);
          setAgentStatus("fallback");
        }
      }
    }
    adapt();
    return () => controller.abort();
  }, [age, topic]);
  return (
    <>
      <header className="topbar">
        <Brand />
        <div className="profile">
          <select
            aria-label="Rango de edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          >
            {AGE_GROUPS.map((x) => (
              <option key={x} value={x}>
                {profile.name}, {x} años
              </option>
            ))}
          </select>
          <button className="reset" onClick={onReset} title="Cambiar usuario">
            <RefreshCw />
          </button>
        </div>
      </header>
      <main className="app">
        <section className="research">
          <div className="hello">
            <div>
              <h1>Hola, {profile.name}</h1>
              <p>Investiga cualquier tema</p>
            </div>
            <div className="doodle" aria-hidden="true">
              ⌕ <span>━</span>
            </div>
          </div>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              const nextTopic = query.trim();
              setSearched(Boolean(nextTopic));
              if (nextTopic) setTopic(nextTopic);
            }}
          >
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tema o pregunta"
            />
            <button>Buscar</button>
          </form>
          {searched ? (
            <article className="answer">
              <header>
                <div className="answer-title">
                  <span className="bulb">✦</span>
                  <div>
                    <h2>Respuesta de Infomorph</h2>
                    <p>
                      <CheckCircle2 /> Información adaptada a tu edad a partir
                      de fuentes verificadas.
                    </p>
                  </div>
                </div>
                <span className="disclaimer">
                  Infomorph adapta, no decide la verdad.
                </span>
              </header>
              <div className="answer-body">
                <p className="lead">
                  {plan?.summary ||
                    (agentStatus === "sources-only"
                      ? `Encontramos fuentes académicas sobre “${topic}”. Puedes abrirlas y contrastarlas mientras se restablece la adaptación por edad.`
                      : content.lead)}
                </p>
                {!plan && agentStatus === "fallback"
                  ? content.body.map((p) => <p key={p}>{p}</p>)
                  : null}
                {agentStatus !== "sources-only" ? (
                  <div className="critical">
                    <Sparkles />
                    <span>
                      {plan
                        ? "Compara la explicación con las noticias recientes y revisa cuáles fuentes sostienen cada afirmación."
                        : content.example}
                    </span>
                  </div>
                ) : null}
              </div>
              <CurrentNews items={currentNews} />
              {agentStatus === "loading" ? (
                <div className="agent-loading">
                  <span />
                  <span />
                  <span />
                  <p>
                    El diseñador educativo está preparando la mejor
                    representación…
                  </p>
                </div>
              ) : null}
              {plan ? (
                <AgentPlan plan={plan} age={age} />
              ) : agentStatus === "fallback" ? (
                <VisualExplorer age={age} topic={topic} />
              ) : null}
              {agentError ? (
                <p className="agent-error">
                  {agentError}
                  {agentStatus === "fallback"
                    ? " Se muestra la adaptación local."
                    : ""}
                </p>
              ) : null}
              <Sources items={verifiedSources || SOURCES} />
            </article>
          ) : (
            <div className="empty">
              Escribe un tema para comenzar a investigar.
            </div>
          )}
        </section>
        <aside>
          <Verify />
          <Challenge />
        </aside>
      </main>
    </>
  );
}
function App() {
  const [profile, setProfile] = useState(null);
  return profile ? (
    <Dashboard profile={profile} onReset={() => setProfile(null)} />
  ) : (
    <Register onComplete={(name, age) => setProfile({ name, age })} />
  );
}

createRoot(document.getElementById("root")).render(<App />);
