import { siteUrl } from "@config/index";
import { monthsName } from "@utils/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";

const month = monthsName[new Date().getMonth()];

export function generatePagesData({ currentYear, place, byDate }) {
  let { type, label } = getPlaceTypeAndLabel(place);
  const labelEmpty = label;

  const feminineRegions = ["selva"];
  if (type === "region") {
    if (feminineRegions.includes(label.toLowerCase())) {
      label = `a la ${label}`;
    } else if (
      ["a", "e", "i", "o", "u", "h"].includes(label.charAt(0).toLowerCase())
    ) {
      label = `a ${label}`;
    } else {
      label = `al ${label}`;
    }
  } else if (type === "town") {
    label = `a ${label}`;
  }

  if (!place && !byDate) {
    return {
      title: `Què fer a Catalunya. Agenda ${currentYear}`,
      subTitle: `Viu aquest ${month} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... 
      No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
      metaTitle: `Descobreix esdeveniments a Catalunya aquest ${currentYear}`,
      metaDescription: `Descobreix els millors esdeveniments de Catalunya: concerts, exposicions, mercats i més. Participa en l'agenda cultural i fes-la créixer!`,
      canonical: siteUrl,
      notFoundText: `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (type === "region" && !byDate) {
    return {
      title: `Què fer ${label}. Agenda ${currentYear}`,
      subTitle: `Les millors coses per fer ${label}: mercats, exposicions,
      descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir aquest ${month}!`,
      metaTitle: `Esdeveniments destacats ${label}. Agenda ${currentYear}`,
      metaDescription: `Descobreix amb els millors actes culturals clau aquest ${month} ${label}. Des de concerts fins a exposicions, la nostra agenda col·laborativa t'espera.`,
      canonical: `${siteUrl}/${place}`,
      notFoundText: `Ho sentim, però no hi ha esdeveniments ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (type === "town" && !byDate) {
    return {
      title: `Què fer ${label}. Agenda ${currentYear}`,
      subTitle: `Explora les millors activitats ${label}: mercats, exposicions, passejades, concerts, i més. Viu intensament ${labelEmpty} aquest ${month}.`,
      metaTitle: `Guia d'activitats ${label} - ${month} ${currentYear}`,
      metaDescription: `Descobreix els esdeveniments imperdibles ${label} aquest ${currentYear}. Concerts, exposicions, i més t'esperen. Suma't a la nostra agenda col·laborativa.`,
      canonical: `${siteUrl}/${place}`,
      notFoundText: `Ho sentim, però no hi ha esdeveniments ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (byDate && place) {
    if (byDate === "avui") {
      return {
        title: `Què fer ${byDate} ${label}`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        metaTitle: `Esdeveniments ${byDate} ${label}`,
        metaDescription: `Què fer ${byDate} ${label}. Us oferim tota la informació per gaudir ${labelEmpty} i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/${place}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments avui ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "dema") {
      return {
        title: `Què fer demà ${label}`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor de demà al teu abast.`,
        metaTitle: `Esdeveniments demà ${label}`,
        metaDescription: `Què fer demà ${label}. Us oferim tota la informació per gaudir ${labelEmpty} i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/${place}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments demà ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "setmana") {
      return {
        title: `Agenda setmanal ${label}`,
        subTitle: `Us proposem activitats d'oci i cultura ${label} per a tots els gustos i butxaques aquesta ${byDate}.`,
        metaTitle: `Esdeveniments aquesta ${byDate} ${label}`,
        metaDescription: `Què fer aquesta ${byDate} ${label}. Teniu ganes de gaudir de aquesta setmana? Teatre, cinema, música, art i altres excuses per no parar de descobrir ${labelEmpty}!`,
        canonical: `${siteUrl}/${place}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments aquesta setmana ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "cap-de-setmana") {
      return {
        title: `Què fer aquest cap de setmana ${label}`,
        subTitle: `Les millors propostes per esprémer al màxim el cap de setmana ${label}, de divendres a diumenge.`,
        metaTitle: `Plans per aquest cap de setmana ${label}`,
        metaDescription: `Què fer aquest cap de setmana ${label}. Les millors propostes culturals per esprémer al màxim el cap de setmana, de divendres a diumenge.`,
        canonical: `${siteUrl}/${place}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments aquest cap de setmana ${label}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    }
  }

  if (byDate) {
    if (byDate === "avui") {
      return {
        title: `Què fer ${byDate} a Catalunya`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        metaTitle: `Esdeveniments ${byDate} a Catalunya`,
        metaDescription: `Què fer ${byDate} a Catalunya. Us oferim tota la informació per gaudir de Catalunya i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar. . Us oferim tota la informació per gaudir de Catalunya i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments ${byDate} a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "dema") {
      return {
        title: `Què fer demà a Catalunya`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        metaTitle: `Esdeveniments demà a Catalunya`,
        metaDescription: `Què fer demà a Catalunya. Us oferim tota la informació per gaudir de Catalunya i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar. . Us oferim tota la informació per gaudir de Catalunya i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments ${byDate} a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "setmana") {
      return {
        title: `Coses per fer a Catalunya aquesta ${byDate}`,
        subTitle: `Us proposem activitats d'oci i cultura a Catalunya per a tots els gustos i butxaques.`,
        metaTitle: `Esdeveniments aquesta ${byDate} a Catalunya`,
        metaDescription: `Què fer aquesta ${byDate} a Catalunya. Teniu ganes de gaudir de aquesta setmana? Teatre, cinema, música, art i altres excuses per no parar de descobrir Catalunya!`,
        canonical: `${siteUrl}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments aquesta ${byDate} a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    } else if (byDate === "cap-de-setmana") {
      return {
        title: `Què fer aquest cap de setmana a Catalunya`,
        subTitle: `Les millors propostes per esprémer al màxim el cap de setmana a Catalunya, de divendres a diumenge.`,
        metaTitle: `Esdeveniments aquest cap de setmana a Catalunya`,
        metaDescription: `Què fer aquest cap de setmana a Catalunya. Les millors propostes culturals per esprémer al màxim el cap de setmana, de divendres a diumenge.`,
        canonical: `${siteUrl}/${byDate}`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments aquest cap de setmana a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      };
    }
  }
}
