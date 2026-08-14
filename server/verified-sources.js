export const VERIFIED_TOPICS = [
  {
    id: "climate-change",
    aliases: ["clima", "climático", "climatico", "calentamiento global"],
    title: "Cambio climático",
    content:
      "El cambio climático es una alteración de largo plazo del sistema climático. La causa principal del calentamiento actual son las emisiones humanas de gases de efecto invernadero, especialmente por el uso de combustibles fósiles. Sus efectos incluyen olas de calor, cambios en las lluvias, pérdida de hielo y aumento del nivel del mar. Las respuestas incluyen mitigación, para reducir emisiones, y adaptación, para disminuir riesgos.",
    sources: [
      {
        id: "ipcc-ar6",
        institution: "IPCC",
        title: "Climate Change 2023: Synthesis Report",
        date: "2023-03-20",
        url: "https://www.ipcc.ch/report/ar6/syr/",
      },
      {
        id: "nasa-climate",
        institution: "NASA",
        title: "What Is Climate Change?",
        date: "2024-04-18",
        url: "https://science.nasa.gov/climate-change/what-is-climate-change/",
      },
    ],
  },
  {
    id: "earthquakes",
    aliases: ["terremoto", "terremotos", "sismo", "sismos"],
    title: "Terremotos",
    content:
      "Un terremoto ocurre cuando se libera energía acumulada en la corteza terrestre y el suelo se mueve. El movimiento puede hacer vibrar edificios y objetos. Durante un sismo se recomienda proteger la cabeza, alejarse de ventanas y seguir las indicaciones de las autoridades de emergencia.",
    sources: [
      {
        id: "usgs-earthquakes",
        institution: "USGS",
        title: "Earthquake Hazards Program",
        date: "2025-01-01",
        url: "https://www.usgs.gov/programs/earthquake-hazards",
      },
    ],
  },
];
export function findVerifiedTopic(query) {
  const normalized = query.toLocaleLowerCase("es");
  return VERIFIED_TOPICS.find((topic) =>
    topic.aliases.some((alias) => normalized.includes(alias)),
  );
}
