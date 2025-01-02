import { siteUrl } from "@config/index";
import { monthsName } from "@utils/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";

interface PageData {
  title: string;
  subTitle: string;
  metaTitle: string;
  metaDescription: string;
  canonical: string;
  notFoundText: string;
}

interface GeneratePagesDataProps {
  currentYear: string | number;
  place?: string;
  byDate?: string;
}

interface PlaceTypeAndLabel {
  type: string;
  label: string;
}

const month = monthsName[new Date().getMonth()];

const createPageData = (
  title: string,
  subTitle: string,
  metaTitle: string,
  metaDescription: string,
  canonical: string,
  notFoundText: string
): PageData => ({
  title,
  subTitle,
  metaTitle,
  metaDescription,
  canonical,
  notFoundText,
});

const feminineRegions = ["selva"];

const adjustPlaceLabel = (type: string, label: string): string => {
  if (type === "region") {
    const lowerLabel = label.toLowerCase();
    if (feminineRegions.includes(lowerLabel)) {
      return `a la ${label}`;
    } else if (["a", "e", "i", "o", "u", "h"].includes(lowerLabel.charAt(0))) {
      return `a ${label}`;
    } else {
      return `al ${label}`;
    }
  } else if (type === "town") {
    return `a ${label}`;
  }
  return label;
};

const generateDefaultPageData = (currentYear: string | number): PageData =>
  createPageData(
    `Què fer a Catalunya. Agenda ${currentYear}`,
    `Viu aquest ${month} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre...
      No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
    `Descobreix esdeveniments a Catalunya aquest ${currentYear}`,
    `Descobreix els millors esdeveniments de Catalunya: concerts, exposicions, mercats i més. Participa en l'agenda cultural i fes-la créixer!`,
    siteUrl,
    `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`
  );

const generateRegionPageData = (label: string, currentYear: string | number, place: string): PageData =>
  createPageData(
    `Què fer ${label}. Agenda ${currentYear}`,
    `Les millors coses per fer ${label}: mercats, exposicions,
      descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir aquest ${month}!`,
    `Esdeveniments destacats ${label}. Agenda ${currentYear}`,
    `Descobreix amb els millors actes culturals clau aquest ${month} ${label}. Des de concerts fins a exposicions, la nostra agenda col·laborativa t'espera.`,
    `${siteUrl}/${place}`,
    `Ho sentim, però no hi ha esdeveniments ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`
  );

const generateTownPageData = (label: string, labelEmpty: string, currentYear: string | number, place: string): PageData =>
  createPageData(
    `Què fer ${label}. Agenda ${currentYear}`,
    `Explora les millors activitats ${label}: mercats, exposicions, passejades, concerts, i més. Viu intensament ${labelEmpty} aquest ${month}.`,
    `Guia d'activitats ${label} - ${month} ${currentYear}`,
    `Descobreix els esdeveniments imperdibles ${label} aquest ${currentYear}. Concerts, exposicions, i més t'esperen. Suma't a la nostra agenda col·laborativa.`,
    `${siteUrl}/${place}`,
    `Ho sentim, però no hi ha esdeveniments ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`
  );

const generateByDateAndPlacePageData = (byDate: string, label: string, labelEmpty: string, place: string): PageData => {
  const byDateCapitalized = byDate.charAt(0).toUpperCase() + byDate.slice(1);
  const timeReference =
    byDate === "avui" ? "dia" : byDate === "dema" ? "demà" : `aquesta ${byDate}`;
  return createPageData(
    `Què fer ${byDate} ${label}`,
    `Aprofita el teu temps i troba el que necessites: el millor del ${timeReference} al teu abast.`,
    `Esdeveniments ${byDateCapitalized} ${label}`,
    `Què fer ${byDate} ${label}. Us oferim tota la informació per gaudir ${labelEmpty} i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
    `${siteUrl}/${place}/${byDate}`,
    `Ho sentim, però no hi ha esdeveniments ${byDate} ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`
  );
};

const generateByDateOnlyPageData = (byDate: string): PageData => {
  const byDateCapitalized = byDate.charAt(0).toUpperCase() + byDate.slice(1);
  const timeReference =
    byDate === "avui" ? "dia" : byDate === "dema" ? "demà" : `aquesta ${byDate}`;
  return createPageData(
    `Què fer ${byDate} a Catalunya`,
    `Aprofita el teu temps i troba el que necessites: el millor del ${timeReference} al teu abast.`,
    `Esdeveniments ${byDateCapitalized} a Catalunya`,
    `Què fer ${byDate} a Catalunya. Us oferim tota la informació per gaudir de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
    `${siteUrl}/${byDate}`,
    `Ho sentim, però no hi ha esdeveniments ${byDate} a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`
  );
};

export function generatePagesData({ currentYear, place = "", byDate = "" }: GeneratePagesDataProps): PageData {
  let { type, label: rawLabel }: PlaceTypeAndLabel = getPlaceTypeAndLabel(place);
  let label = adjustPlaceLabel(type, rawLabel);
  const labelEmpty = rawLabel;

  if (!place && !byDate) {
    return generateDefaultPageData(currentYear);
  }

  if (type === "region" && !byDate) {
    return generateRegionPageData(label, currentYear, place);
  }

  if (type === "town" && !byDate) {
    return generateTownPageData(label, labelEmpty, currentYear, place);
  }

  if (byDate && place) {
    return generateByDateAndPlacePageData(byDate, label, labelEmpty, place);
  }

  if (byDate && !place) {
    return generateByDateOnlyPageData(byDate);
  }

  // Default fallback - should ideally not be reached
  return generateDefaultPageData(currentYear);
}