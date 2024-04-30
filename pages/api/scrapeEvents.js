const axios = require("axios");
const cheerio = require("cheerio");
const RSS = require("rss");
const { DateTime } = require("luxon");
import { siteUrl } from "@config/index";
import { captureException } from "@sentry/nextjs";
import createHash from "@utils/createHash";

const CITIES = {
  granollers: {
    defaultLocation: "Granollers",
    domain: "https://www.granollers.cat",
    url: "https://www.granollers.cat/agenda",
    encoding: "utf-8",
    listSelector: ".view-content .item-list > ul > li",
    titleSelector: "h3 a",
    urlSelector: ".node-event .wrap h3 a",
    dateSelector: ".date-info .date-day",
    timeSelector: "",
    descriptionSelector: "div > h3",
    imageSelector: ".responsive-image",
    locationSelector: "h4",
    urlImage: "/styles/home_agenda/public/",
    dateRegex: {
      regex:
        /^(\d{1,2})\s+([a-zA-zçÇ]+)(?:\.?)\s+(\d{4})\s+-\s+(\d{2}):(\d{2})h$/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  "bigues-i-riells": {
    defaultLocation: "Bigues i Riells",
    domain: "https://www.biguesiriells.cat",
    url: "https://www.biguesiriells.cat/ca/actualitat-2/agenda-1.htm",
    encoding: "iso-8859-1",
    listSelector:
      'div:has(h1:contains("Agenda")) > div:nth-child(3) > div[class]:not([class*=" "]) > div > div > div:not(:has(.calendariInici))',
    titleSelector: "h2 a",
    urlSelector: "h2 a",
    dateSelector: ".data",
    timeSelector: ".row.seccio-detall .text",
    descriptionSelector: "h2 a",
    imageSelector: ".img-fluid",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /Horari: (?:De )?(\d{1,2})\.(\d{2})/i,
  },
  "premia-de-dalt": {
    defaultLocation: "Premià de Dalt",
    domain: "https://www.premiadedalt.cat",
    url: "https://www.premiadedalt.cat/events",
    encoding: "utf-8",
    listSelector: "#content-core > section > article",
    titleSelector: ".tileHeadline > a > span",
    urlSelector: ".tileHeadline > a",
    dateSelector: ".cal_date",
    timeSelector: ".dtstart",
    descriptionSelector: ".description",
    imageSelector: ".newsImageContainer > a.swipebox > img",
    locationSelector: ".location",
    urlImage: "/",
    dateRegex: { regex: /^([a-zA-zçÇ]+)\s+(\d+)/i, swapDayMonthOrder: true },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "la-roca-del-valles": {
    defaultLocation: "La Roca del Vallès",
    domain: "http://www.laroca.cat",
    url: "http://www.laroca.cat/actualitat/que-esta-passant/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: ".text-maquetat",
    imageSelector: ".info_cap > img",
    locationSelector: ".info_cos .item_info:has(.fa.fa-map-marker)",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "arenys-de-munt": {
    defaultLocation: "Arenys de Munt",
    domain: "https://www.arenysdemunt.cat",
    url: "https://www.arenysdemunt.cat/actualitat/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: "",
    imageSelector: ".info_cap > img",
    locationSelector: ".dades_contacte > .item_info > span > strong",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "el-masnou": {
    defaultLocation: "El Masnou",
    domain: "https://www.elmasnou.cat",
    url: "https://www.elmasnou.cat/actualitat/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: ".text-maquetat",
    imageSelector: ".info_cap > img",
    locationSelector: ".dades_contacte > .item_info > span > strong",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "malgrat-de-mar": {
    defaultLocation: "Malgrat de Mar",
    domain: "https://www.ajmalgrat.cat",
    url: "https://www.ajmalgrat.cat/actualitat/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: ".text-maquetat",
    imageSelector: ".info_cap > img",
    locationSelector: ".dades_contacte > .item_info > span > a > strong",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "vilassar-de-dalt": {
    defaultLocation: "Vilassar de Dalt",
    domain: "https://www.vilassardedalt.cat",
    url: "https://www.vilassardedalt.cat/actualitat/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: ".text-maquetat",
    imageSelector: ".info_cap > img",
    locationSelector: ".dades_contacte > .item_info > span > a > strong",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "roda-de-ter": {
    defaultLocation: "Roda de Ter",
    domain: "https://www.rodadeter.cat/",
    url: "https://www.rodadeter.cat/actualitat/agenda",
    encoding: "utf-8",
    listSelector: ".llista_agenda > .agenda_item",
    titleSelector: ".info_cos > a > .titol",
    urlSelector: ".info_cos > a",
    dateSelector: ".data_inicial",
    timeSelector: ".info_cos > .item_info:has(.fa.fa-clock-o)",
    descriptionSelector: ".text-maquetat",
    imageSelector: ".info_cap > img",
    locationSelector: ".info_cos > .item_info:has(.fa.fa-map-marker)",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "vilassar-de-mar": {
    defaultLocation: "Vilassar de Mar",
    domain: "https://www.vilassardemar.cat",
    url: "https://www.vilassardemar.cat/actualitat/agenda-activitats",
    encoding: "utf-8",
    listSelector: ".view-content.col-lg-9 >  .row.m-0 > div",
    titleSelector: ".card-body__title",
    urlSelector: ".card-body__title > a",
    dateSelector: ".datetime:nth-child(1)",
    timeSelector: "",
    descriptionSelector: ".node__content > .field--name-body",
    imageSelector: "figure > img",
    locationSelector: ".location",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\s+([a-zA-zçÇ]+)\s+(\d{4}).*?(\d{1,2}):(\d{2})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  "l-esquirol": {
    defaultLocation: "L'esquirol",
    domain: "https://www.lesquirol.cat",
    url: "https://www.lesquirol.cat/ca/agenda",
    encoding: "utf-8",
    listSelector:
      "#block-system-main > div > div > div > div > div > div > div:nth-child(1) > div > div",
    titleSelector: "h5 > a",
    urlSelector: "h5 > a",
    dateSelector: ".date-display-single",
    timeSelector: "",
    descriptionSelector:
      ".node.node-agenda.view-mode-vista_agenda_principal > div > .col-sm-8 > h2",
    imageSelector: ".field-name-field-images > div > a > img",
    locationSelector:
      "#block-system-main > div > div > div:nth-child(1) > div > h4",
    urlImage: "/",
    dateRegex: {
      regex:
        /(\d{1,2})\s+([a-zA-zçÇ]+)(?:,?)\s+(\d{4})\s+-\s+(\d{2}):(\d{2})$/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  olost: {
    defaultLocation: "Olost",
    domain: "https://www.olost.cat",
    url: "https://www.olost.cat/agenda-virtual",
    encoding: "utf-8",
    listSelector: "body > div > div > div.col-md-9 > div",
    titleSelector: ".col-md-8 > h2",
    urlSelector: ".btn.btn-default.pull-right",
    dateSelector: ".col-md-8 > p",
    timeSelector: ".well.small.text-center > div:has(.fa.fa-clock-o)",
    descriptionSelector: "",
    imageSelector: ".img-responsive.img-thumbnail",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2}) de ([a-zA-zçÇ]+)(?:,?)/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  torello: {
    defaultLocation: "Torelló",
    domain: "https://torello.cat",
    url: "https://torello.cat/agenda-dactivitats/",
    encoding: "utf-8",
    listSelector: ".ectbe-wrapper.ectbe-list-wrapper.style-1 > div",
    titleSelector: ".ectbe-evt-title > a",
    urlSelector: ".ectbe-evt-title > a",
    dateSelector: ".ectbe-date-area",
    timeSelector: ".ectbe-evt-time",
    descriptionSelector: ".ectbe-evt-description",
    imageSelector: ".wp-block-image > img",
    locationSelector: ".ectbe-venue-details.ectbe-address",
    urlImage: "/",
    dateRegex: { regex: /(\d+)\s+([a-zA-zçÇ]+)/i, swapDayMonthOrder: false },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  viladrau: {
    defaultLocation: "Viladrau",
    domain: "https://www.viladrau.cat",
    url: "https://www.viladrau.cat/ca/agenda",
    encoding: "utf-8",
    listSelector: "#agendaenpaginaactual > div",
    titleSelector: ".agendatitulo > a",
    urlSelector: ".agendatitulo > a",
    dateSelector:
      "#main > div > div > article > div.field.field-name-field-fechafinal.field-type-datetime.field-label-hidden",
    timeSelector: ".agendahora",
    descriptionSelector: "",
    imageSelector:
      "#main > div > div > article > div.field.field-name-field-imageslloc.field-type-image.field-label-hidden > div > div > img",
    locationSelector: ".agendadireccion",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\s+([a-zA-zçÇ]+)(?:,?)\s+(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{1,2})(?:.(\d{2}))?/i,
  },
  amer: {
    defaultLocation: "Amer",
    domain: "https://amer.cat",
    url: "https://amer.cat/category/agenda-2/",
    encoding: "utf-8",
    listSelector:
      "div.uk-container.uk-container-small.padding-top-xlarge.padding-bottom-xlarge > article",
    titleSelector: ".post_title2 > a",
    urlSelector: ".post_title2 > a",
    dateSelector: ".post_date",
    timeSelector: "",
    descriptionSelector: ".post_excerpt",
    imageSelector: ".post-thumbnail > img",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  brunyola: {
    defaultLocation: "Brunyola i Sant Martí Sapresa",
    domain: "https://www.brunyola.cat",
    url: "https://www.brunyola.cat/agenda/mes/",
    encoding: "utf-8",
    listSelector:
      "#main > div > div > div > div.tribe-events-calendar-latest-past > div",
    titleSelector:
      ".tribe-events-calendar-latest-past__event-title-link.tribe-common-anchor-thin",
    urlSelector:
      ".tribe-events-calendar-latest-past__event-title-link.tribe-common-anchor-thin",
    dateSelector: ".tribe-events-calendar-latest-past__event-date-tag-datetime",
    timeSelector: ".tribe-event-date-start",
    descriptionSelector:
      ".tribe-events-calendar-latest-past__event-description.tribe-common-b2 tribe-common-a11y-hidden",
    imageSelector:
      ".tribe-events-calendar-latest-past__event-featured-image-link > img",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /^([a-zA-ZçÇ]+)(?:.?)\s+(\d{1,2})\s+(\d{4})$/i,
      swapDayMonthOrder: true,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  riudarenes: {
    defaultLocation: "Riudarenes",
    domain: "https://ajuntamentderiudarenes.cat",
    url: "https://ajuntamentderiudarenes.cat/informacio-municipal/",
    encoding: "utf-8",
    listSelector:
      "#main > div.uk-container.uk-container-small.padding-top-xlarge.padding-bottom-xlarge > article",
    titleSelector: ".post_title2 > a",
    urlSelector: ".post_title2 > a",
    dateSelector: ".post_date",
    timeSelector: "",
    descriptionSelector: ".post_excerpt",
    imageSelector: ".post-thumbnail > img",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  "riudellots-de-la-selva": {
    defaultLocation: "Riudellots de la Selva",
    domain: "https://www.riudellots.cat/",
    url: "https://www.riudellots.cat/agenda",
    encoding: "utf-8",
    listSelector:
      "body > div.wrapper > div.main-content > div > div > div > div.col-lg-9.col-md-8 > div:nth-child(1) > .col-lg-4.col-sm-6",
    titleSelector: ".event-post-content > div > h5 > a",
    urlSelector: ".event-post-content > div > h5 > a",
    dateSelector: ".event-meta > li:has(.far.fa-calendar-alt)",
    timeSelector: ".event-meta > li:has(.far.fa-clock)",
    descriptionSelector: ".event-post-content > .new-txt > .text-justify",
    imageSelector: ".thumb > img",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /^(\d{1,2})\s+([a-zA-ZçÇ]+)(?:,?)/i,
      swapDayMonthOrder: false,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  "sant-hilari-sacalm": {
    defaultLocation: "Sant Hilari Sacalm",
    domain: "https://www.santhilari.cat",
    url: "https://www.santhilari.cat/agenda",
    encoding: "utf-8",
    listSelector:
      "body > section > div > div.items-medium-news-wrapper.items-agenda > div > div",
    titleSelector: ".item-medium__description.rows-8 > h2",
    urlSelector: ".item.item-medium--wrapper > a",
    dateSelector: ".date",
    timeSelector: "",
    descriptionSelector: ".item-medium__description.rows-8 > p",
    imageSelector: ".item-medium__image > img",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /^.*?(\d{1,2})\s*de\s*(\w+)/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  "santa-coloma-de-farners": {
    defaultLocation: "Santa Coloma de Farners",
    domain: "https://www.scf.cat",
    url: "https://www.scf.cat/ca/agenda.html?filtre_categories=all&filtre_espais=all&filtre_historic=0&vista=line",
    encoding: "utf-8",
    listSelector:
      '#page_content > div.llistat_productes_categoria_nocats.vista-line.no-sidebars > div > div > div:not(:has(.accions:contains("Finalitzat")))',
    titleSelector: ".titol",
    urlSelector: ".titol",
    dateSelector: ".data.curta",
    timeSelector: ".data.curta",
    descriptionSelector: ".presentacio",
    imageSelector: '#fitxa_content [id*="foto"]',
    locationSelector: ".espai",
    urlImage: "/",
    dateRegex: { regex: /^.*?(\d{1,2})\.(\d{1,2})/i, swapDayMonthOrder: false },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  susqueda: {
    defaultLocation: "Susqueda",
    domain: "https://susqueda.cat/",
    url: "https://susqueda.cat/agenda/",
    encoding: "utf-8",
    listSelector:
      "#main > div.uk-container.uk-container-small.padding-top-xlarge.padding-bottom-xlarge > article",
    titleSelector: ".post_title2 > a",
    urlSelector: ".post_title2 > a",
    dateSelector: ".post_date",
    timeSelector: "",
    descriptionSelector: ".post_excerpt",
    imageSelector: "",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      swapDayMonthOrder: false,
    },
    timeRegex: null,
  },
  vidreres: {
    defaultLocation: "Vidreres",
    domain: "https://vidreres.cat",
    url: "https://www.vidreres.cat/agenda/",
    encoding: "utf-8",
    listSelector:
      "#main-content-row > div > div > div.tribe-events-calendar-list > div",
    titleSelector:
      ".tribe-events-calendar-list__event-title-link.tribe-common-anchor-thin",
    urlSelector:
      ".tribe-events-calendar-list__event-title-link.tribe-common-anchor-thin",
    dateSelector: ".tribe-event-date-start",
    timeSelector: ".tribe-event-date-start",
    descriptionSelector:
      ".tribe-events-calendar-list__event-description.tribe-common-b2.tribe-common-a11y-hidden > p",
    imageSelector: "",
    locationSelector:
      ".tribe-events-calendar-list__event-venue-title.tribe-common-b2--bold",
    urlImage: "/",
    dateRegex: {
      regex: /^([a-zA-ZçÇ]+)\s+(\d{1,2})/i,
      swapDayMonthOrder: true,
    },
    timeRegex: /(\d{2}):(\d{2})/i,
  },
  /**"montmelo": {
    defaultLocation: "Montmeló",
    domain: "https://www.montmelo.cat",
    url: "https://www.montmelo.cat/actualitat/agenda/",
    encoding: "utf-8",
    listSelector: '.article-list > li',
    titleSelector: ".title",
    urlSelector: "",
    dateSelector: "",
    descriptionSelector: "",
    imageSelector: "",
    locationSelector: "",
    urlImage: "/",
    dateRegex: {regex: /^/i, swapDayMonthOrder: false},
    timeRegex: null,
  }**/
};

function convertToRSSDate(dateString, timeString, dateRegex, timeRegex) {
  const monthMap = {
    gener: "01",
    febrer: "02",
    març: "03",
    abril: "04",
    maig: "05",
    juny: "06",
    juliol: "07",
    agost: "08",
    setembre: "09",
    octubre: "10",
    novembre: "11",
    desembre: "12",
  };

  const match = dateString.match(dateRegex.regex);
  const timeMatch = timeString ? timeString.match(timeRegex) : null;
  if (match) {
    const day = !dateRegex.swapDayMonthOrder
      ? parseInt(match[1], 10)
      : parseInt(match[2], 10);
    const month = !dateRegex.swapDayMonthOrder ? match[2] : match[1];
    const year = !isNaN(match[3])
      ? parseInt(match[3], 10)
      : new Date().getFullYear();
    const hour = !isNaN(match[4])
      ? parseInt(match[4], 10)
      : timeMatch
      ? timeMatch[1]
      : 0;
    const minute = !isNaN(match[5])
      ? parseInt(match[5], 10)
      : timeMatch
      ? timeMatch[2]
      : 0;

    const monthNumber = !isNaN(month)
      ? +month
      : monthMap[
          Object.keys(monthMap).find((key) => key.includes(month.toLowerCase()))
        ];
    if (!monthNumber) {
      const error = `Invalid month value: ${month}`;
      console.error(error);
      captureException(error);
      return null;
    }
    const date = DateTime.fromObject(
      {
        day: day,
        month: parseInt(monthNumber),
        year: year,
        hour: hour,
        minute: minute,
      },
      {
        zone: "Europe/Madrid",
      }
    );

    return date;
  }

  return null;
}

async function fetchHtmlContent(url, selectors) {
  const { encoding } = selectors;

  let retries = 3; // Nr of retries
  let delay = 1000; // Delay in ms

  while (retries > 0) {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const decoder = new TextDecoder(encoding);
      return decoder.decode(response.data);
    } catch (error) {
      retries--;
      console.error("Error fetching HTML content, retries left: ", retries);
      if (retries === 0) {
        throw new Error(
          "Error fetching HTML content response status: ",
          error.status
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function exhaustiveSearch(
  url,
  selectors,
  date,
  time,
  location,
  description,
  image
) {
  const {
    locationSelector,
    dateSelector,
    timeSelector,
    descriptionSelector,
    imageSelector,
  } = selectors;
  const html = await fetchHtmlContent(url, selectors);
  const $ = cheerio.load(html);

  if (!date && dateSelector !== "") date = $(dateSelector).text().trim();
  if (!time && timeSelector !== "") time = $(timeSelector).text().trim();
  if (!location && locationSelector !== "")
    location = $(locationSelector).text().trim();
  if (!description && descriptionSelector !== "")
    description = $(descriptionSelector).text().trim();
  if (!image && imageSelector !== "") image = $(imageSelector).attr("src");
  return { date, time, location, description, image };
}

async function extractEventDetails(html, selectors) {
  const {
    defaultLocation,
    domain,
    listSelector,
    titleSelector,
    urlSelector,
    locationSelector,
    dateSelector,
    timeSelector,
    descriptionSelector,
    imageSelector,
    dateRegex,
    timeRegex,
    urlImage,
  } = selectors;
  const $ = cheerio.load(html);
  const events = [];
  let exhaustiveResults = [];

  const timeout = 120000; // 60 segons
  await new Promise((resolve, reject) => {
    let completed = 0;
    const totalItems = $(listSelector).length;
    $(listSelector).each(async (_, element) => {
      const title = $(element).find(titleSelector).text().trim();
      const url = $(element).find(urlSelector).attr("href");
      let date = $(element).find(dateSelector).text().trim();
      let time = $(element).find(timeSelector).text().trim();
      let location = $(element)
        .find(locationSelector)
        .text()
        .trim()
        .replace(/\s+/g, " ");
      let description = $(element).find(descriptionSelector).text().trim();
      let image = $(element).find(imageSelector).attr("src");
      const rssUrl = url && url.includes(domain) ? url : `${domain}${url}`;
      if (
        url &&
        ((!date && dateSelector !== "") ||
          (!location && locationSelector !== "") ||
          (!description && descriptionSelector !== "") ||
          (!image && imageSelector !== "") ||
          (!time && timeSelector !== ""))
      ) {
        exhaustiveResults = await exhaustiveSearch(
          rssUrl,
          selectors,
          date,
          time,
          location,
          description,
          image
        );
        if (!date && exhaustiveResults.date) date = exhaustiveResults.date;
        if (!time && exhaustiveResults.time) time = exhaustiveResults.time;
        if (!location && exhaustiveResults.location)
          location = exhaustiveResults.location;
        if (!description && exhaustiveResults.description)
          description = exhaustiveResults.description;
        if (!image && exhaustiveResults.image) image = exhaustiveResults.image;
      }
      if (!location) location = defaultLocation;
      if (!description) description = title;
      const hash = createHash(title, url, location, date);
      const rssDate =
        date && convertToRSSDate(date, time, dateRegex, timeRegex);
      const rssImage = image
        ? image.includes(domain)
          ? image.replace(urlImage, "/")
          : `${domain}${image.replace(urlImage, "/")}`
        : image;

      description =
        description +
        (rssImage ? ` <div class="hidden">${rssImage}</div>` : "");
      events.push({
        id: hash,
        url: rssUrl,
        title,
        location,
        date: rssDate,
        description,
        image: rssImage,
      });

      completed++;

      if (completed === totalItems) {
        console.log(
          "Number of scraped events: ",
          completed + " from " + defaultLocation
        );
        resolve();
      }
    });
    setTimeout(() => {
      reject(
        new Error(
          "Execution timeout when " + defaultLocation + " events was scrapping"
        )
      );
    }, timeout);
  });

  return events;
}

function createRssFeed(events, city) {
  const feed = new RSS({
    title: `Esdeveniments a ${city}`,
    description: `Esdeveniments a ${city}`,
    feed_url: `${siteUrl}/api/scrapeEvents?city=${city}`,
    site_url: siteUrl,
    generator: "Esdeveniments.cat",
  });

  events.forEach((event) => {
    if (!event.title) return;
    feed.item({
      guid: event.id,
      title: event.title,
      description: event.description,
      url: event.url,
      date: event.date,
      enclosure: { url: event.image },
      custom_elements: [{ location: event.location }],
    });
  });

  return feed.xml({ indent: true });
}

async function createEventRss(city) {
  const cityData = CITIES[city];

  if (!cityData) {
    throw new Error("Invalid city");
  }

  try {
    const html = await fetchHtmlContent(cityData.url, cityData);
    const events = await extractEventDetails(html, cityData);
    const rssXml = createRssFeed(events, city);
    return rssXml;
  } catch (error) {
    console.error("Error creating RSS feed:", error);
    throw new Error("Failed to create RSS feed", error);
  }
}

export default async function handler(req, res) {
  const { city } = req.query;

  if (!city) {
    res.status(400).json({ error: "City parameter is missing" });
    return;
  }

  try {
    const rssXml = await createEventRss(city);
    res.status(200).send(rssXml);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create RSS feed", details: error });
    captureException(error);
  }
}

export const config = {
  runtime: "edge",
};
