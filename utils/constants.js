import { siteUrl } from "@config/index";

export const MAX_RESULTS = 50;

export const DAYS = [
  "Diumenge",
  "Dilluns",
  "Dimarts",
  "Dimecres",
  "Dijous",
  "Divendres",
  "Dissabte",
];

export const MONTHS = [
  "gener",
  "febrer",
  "març",
  "abril",
  "maig",
  "juny",
  "juliol",
  "agost",
  "setembre",
  "octubre",
  "novembre",
  "desembre",
];

export const MONTHS_URL = [
  "gener",
  "febrer",
  "marc",
  "abril",
  "maig",
  "juny",
  "juliol",
  "agost",
  "setembre",
  "octubre",
  "novembre",
  "desembre",
];

export const CATEGORIES = {
  Familiar: "Familiar",
  Música: "Música",
  Cinema: "Cinema",
  Teatre: "Teatre",
  Exposicions: "Exposició",
  Fires: "Fira",
  Espectacles: "Espectacles",
  "Festa Major": "Festa Major",
};

export const BYDATES = [
  { value: "avui", label: "Avui" },
  { value: "dema", label: "Demà" },
  { value: "cap-de-setmana", label: "Cap de setmana" },
  { value: "setmana", label: "Aquesta setmana" },
];

export const dateFunctions = {
  avui: "today",
  dema: "tomorrow",
  setmana: "week",
  "cap-de-setmana": "weekend",
};

export const DISTANCES = [1, 5, 10, 30, 50];

export const CITIES_DATA = new Map([
  [
    "barcelones",
    {
      label: "Barcelonès",
      towns: new Map([
        [
          "barcelona",
          {
            label: "Barcelona",
            rssFeed: `${siteUrl}/api/scrapeWebsite`,
            descriptionSelector: ".cos",
            imageSelector: ".img-destacada",
            postalCode: "08001",
            coords: { lat: 41.390205, lng: 2.154007 },
          },
        ],
      ]),
    },
  ],
  [
    "maresme",
    {
      label: "Maresme",
      towns: new Map([
        [
          "alella",
          {
            label: "Alella",
            rssFeed: "https://alella.cat/a.php?fer=SINDICACIO&seccio=2",
            descriptionSelector: ".cos",
            imageSelector: ".imatge_associada2",
            postalCode: "08328",
            coords: { lat: "41.4938", lng: "2.2945" },
          },
        ],
        [
          "arenys-de-mar",
          {
            label: "Arenys de Mar",
            rssFeed: "https://arenysdemar.cat/a.php?fer=SINDICACIO&seccio=2",
            descriptionSelector: ".cos",
            imageSelector: ".imatge_associada2",
            postalCode: "08350",
            coords: { lat: "41.5819", lng: "2.54936" },
          },
        ],
        [
          "argentona",
          {
            label: "Argentona",
            rssFeed: "https://argentona.cat/a.php?fer=SINDICACIO&seccio=2",
            descriptionSelector: ".cos",
            postalCode: "08310",
            coords: { lat: "41.5534", lng: "2.4035" },
            removeImage: true, // TODO: fix this
          },
        ],
      ]),
    },
  ],
  [
    "valles-oriental",
    {
      label: "Vallès Oriental",
      towns: new Map([
        [
          "cardedeu",
          {
            label: "Cardedeu",
            rssFeed: "https://www.culturacardedeu.com/rss.xml",
            descriptionSelector: "#description",
            imageSelector: "#image",
            locationSelector: "#location a",
            postalCode: "08440",
            coords: { lat: 41.6398, lng: 2.3574 },
          },
        ],
        [
          "llinars",
          {
            label: "Llinars del Vallès",
            rssFeed: "https://www.llinarsdelvalles.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08450",
            coords: { lat: 41.640555555556, lng: 2.4022222222222 },
          },
        ],
        [
          "canoves",
          {
            label: "Cànoves i Samalús",
            rssFeed: "https://www.canovesisamalus.cat/rss/15/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08445",
            coords: { lat: 41.693778, lng: 2.349269 },
          },
        ],
        [
          "llissa-de-vall",
          {
            label: "Lliçà de Vall",
            rssFeed: "https://www.llissadevall.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08185",
            coords: { lat: 41.583186, lng: 2.239658 },
          },
        ],
        [
          "sant-antoni-vilamajor",
          {
            label: "Sant Antoni de Vilamajor",
            rssFeed: "https://www.santantonidevilamajor.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08459",
            coords: { lat: 41.672559, lng: 2.399991 },
          },
        ],
        [
          "sant-pere-vilamajor",
          {
            label: "Sant Pere de Vilamajor",
            rssFeed: "https://www.vilamajor.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08458",
            coords: { lat: 41.68556, lng: 2.390001 },
          },
        ],
        [
          "santa-maria-palautordera",
          {
            label: "Santa Maria de Palautordera",
            rssFeed: "https://www.smpalautordera.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08460",
            coords: { lat: 41.69528, lng: 2.445832 },
          },
        ],
        [
          "sant-esteve-palautordera",
          {
            label: "Sant Esteve de Palautordera",
            rssFeed: "https://www.santestevedepalautordera.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08461",
            coords: { lat: 41.70528, lng: 2.435833 },
          },
        ],
        [
          "parets-del-valles",
          {
            label: "Parets del Vallès",
            rssFeed: "https://www.parets.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08150",
            coords: { lat: 41.57481, lng: 2.23306 },
          },
        ],
        [
          "sant-feliu-de-codines",
          {
            label: "Sant Feliu de Codines",
            rssFeed: "https://www.santfeliudecodines.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08182",
            coords: { lat: 41.69, lng: 2.165 },
          },
        ],
        [
          "caldes-de-montbui",
          {
            label: "Caldes de Montbui",
            rssFeed: "https://www.caldesdemontbui.cat/rss/28/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08140",
            coords: { lat: 41.63111, lng: 2.16867 },
          },
        ],
        [
          "la-garriga",
          {
            label: "La Garriga",
            rssFeed: "http://lagarriga.webmunicipal.diba.cat/rss/12/0",
            descriptionSelector: ".text-maquetat",
            imageSelector: ".justified-gallery",
            locationSelector: ".td_justificat",
            postalCode: "08530",
            coords: { lat: 41.680381, lng: 2.28334 },
          },
        ],
        [
          "granollers",
          {
            label: "Granollers",
            rssFeed: `${siteUrl}/api/scrapeEvents?city=granollers`,
            descriptionSelector: ".body-text",
            imageSelector: ".foto a",
            postalCode: "08400",
            coords: { lat: 41.60619270000001, lng: 2.287088899999958 },
          },
        ],
        [
          "ametlla-del-valles",
          {
            label: "L'Ametlla del Vallès",
            rssFeed: "https://www.ametlla.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08480",
            coords: { lat: 41.668325, lng: 2.260501 },
          },
        ],
        [
          "figaro-montmany",
          {
            label: "Figaró-Montmany",
            rssFeed: "https://www.figaro-montmany.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08590",
            coords: { lat: 41.72278, lng: 2.275 },
          },
        ],
        [
          "fogars-de-montclus",
          {
            label: "Fogars de Montclús",
            rssFeed: "https://www.fogarsdemontclus.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08479",
            coords: { lat: 41.72861, lng: 2.44444 },
          },
        ],
        [
          "la-llagosta",
          {
            label: "La Llagosta",
            rssFeed: "https://www.llagosta.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08120",
            coords: { lat: 41.668325, lng: 2.260501 },
          },
        ],
        [
          "martorelles",
          {
            label: "Martorelles",
            rssFeed: "https://www.martorelles.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08107",
            coords: { lat: 41.53148, lng: 2.23889 },
          },
        ],
        [
          "montseny",
          {
            label: "Montseny",
            rssFeed: "https://www.montseny.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08460",
            coords: { lat: 41.75, lng: 2.395 },
          },
        ],
        [
          "sant-fost-de-campsentelles",
          {
            label: "Sant Fost de Campsentelles",
            rssFeed: "https://www.santfost.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08105",
            coords: { lat: 41.50611, lng: 2.24 },
          },
        ],
        [
          "santa-maria-de-martorelles",
          {
            label: "Santa Maria de Martorelles",
            rssFeed: "https://www.santamariademartorelles.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08106",
            coords: { lat: 41.5167, lng: 2.25 },
          },
        ],
        [
          "vallgorguina",
          {
            label: "Vallgorguina",
            rssFeed: "https://www.vallgorguina.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08471",
            coords: { lat: 41.647738, lng: 2.510201 },
          },
        ],
        [
          "vallromanes",
          {
            label: "Vallromanes",
            rssFeed: "https://www.vallromanes.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08188",
            coords: { lat: 41.53389, lng: 2.44222 },
          },
        ],
        [
          "vilalba-sasserra",
          {
            label: "Vilalba Sasserra",
            rssFeed: "https://www.vilalbasasserra.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08455",
            coords: { lat: 41.65389, lng: 2.44222 },
          },
        ],
        [
          "vilanova-del-valles",
          {
            label: "Vilanova del Vallès",
            rssFeed: "https://www.vilanovadelvalles.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08410",
            coords: { lat: 41.53389, lng: 2.44222 },
          },
        ],
      ]),
    },
  ],
  [
    "valles-occidental",
    {
      label: "Vallès Occidental",
      towns: new Map([
        [
          "martorelles",
          {
            label: "Martorelles",
            rssFeed: "https://www.martorelles.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08107",
            coords: { lat: 41.5321, lng: 0.236 },
          },
        ],
        [
          "castellbisbal",
          {
            label: "Castellbisbal",
            rssFeed: "https://www.castellbisbal.cat/rss/48",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08755",
            coords: { lat: 41.4753, lng: 1.9817 },
          },
        ],
        [
          "matadepera",
          {
            label: "Matadepera",
            rssFeed: "https://www.matadepera.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08230",
            coords: { lat: 41.60361, lng: 2.02444 },
          },
        ],
        [
          "montcada-i-reixac",
          {
            label: "Montcada i Reixac",
            rssFeed: "https://www.montcada.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08110",
            coords: { lat: 41.4833, lng: 2.1833 },
          },
        ],
        [
          "rellinars",
          {
            label: "Rellinars",
            rssFeed: "https://www.rellinars.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08299",
            coords: { lat: 41.6333, lng: 1.9167 },
          },
        ],
        [
          "sant-llorenc-savall",
          {
            label: "Sant Llorenç Savall",
            rssFeed: "https://www.savall.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08212",
            coords: { lat: 41.67944, lng: 2.05778 },
          },
        ],
        [
          "santa-perpetua-de-mogoda",
          {
            label: "Santa Perpètua de Mogoda",
            rssFeed: "https://www.staperpetua.cat/rss/12/0/",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08130",
            coords: { lat: 41.5375, lng: 2.18194 },
          },
        ],
        [
          "ullastrell",
          {
            label: "Ullastrell",
            rssFeed: "https://www.ullastrell.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08231",
            coords: { lat: 41.5167, lng: 1.9333 },
          },
        ],
        [
          "polinya",
          {
            label: "Polinyà",
            rssFeed: "https://www.polinya.cat/rss/12",
            descriptionSelector: ".ddbbtext",
            imageSelector: ".first-image",
            postalCode: "08213",
            coords: { lat: 41.55, lng: 2.15 },
          },
        ],
      ]),
    },
  ],
]);
