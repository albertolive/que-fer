import { monthsName } from "@utils/helpers";
import { addArticleToMonth, fixArticles } from "@utils/normalize";
import { getTownLabel, getRegionLabel } from "@utils/helpers";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
const month = monthsName[new Date().getMonth()];
const normalizedMonth = addArticleToMonth(month);

export function generatePagesData({ currentYear, region, town, byDate }) {
  const townLabel = getTownLabel(town);
  const regionLabel = getRegionLabel(region);

  if (!region && !town && !byDate) {
    return {
      title: `Agenda ${currentYear}`,
      subTitle: `Viu aquest ${month} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... 
     No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
      description:
        "Vols viure experiències úniques i emocionants? La cultura és el lloc on cal estar! Us oferim una gran varietat d'opcions perquè mai us avorriu i sempre tingueu alguna cosa interessant per fer. Descobriu tot el que passa a Catalunya i voltants, i deixeu-vos sorprendre per la seva riquesa cultural.",
      metaTitle: `Agenda ${currentYear} - Esdeveniments.cat`,
      metaDescription: `Esdeveniments.cat és una iniciativa ciutadana per veure en un cop d'ull tots els actes culturals que es fan a. L'agenda és col·laborativa.`,
      canonical: siteUrl,
      notFoundText: `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (region && !town && !byDate) {
    return {
      metaTitle: `Agenda ${regionLabel} ${currentYear} - Esdeveniments.cat`,
      metaDescription: `Esdeveniments.cat és una iniciativa ciutadana per veure en un cop d'ull tots els actes culturals que es fan a ${regionLabel}. L'agenda és col·laborativa.`,
      title: `Agenda ${regionLabel} ${currentYear}`,
      subTitle: `${fixArticles(`Les millors coses per fer ${regionLabel}: mercats, exposicions,
      descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir aquest ${month}!`)}`,
      description: `${fixArticles(`Voleu viure experiències úniques i emocionants? La cultura ${regionLabel} és el lloc on cal estar! Us oferim una gran varietat d'opcions perquè mai us avorriu i sempre tingueu
      alguna cosa interessant per fer. Descobriu tot el que passa ${regionLabel} i voltants, i deixeu-vos sorprendre per la seva riquesa cultural.`)}`,
      canonical: `${siteUrl}/${region}`,
      notFoundText: `Ho sentim, però no hi ha esdeveniments a ${regionLabel}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (region && town && !byDate) {
    const descriptionRegionTown = (
      <>
        Us donem un ventall de possibilitats perquè no us quedi temps per
        avorrir-vos. La cultura no descansa. Podeu veure què passa{" "}
        <Link href={`/${region}/${town}/avui`} prefetch={false}>
          <a className="font-medium text-black underline">avui</a>
        </Link>
        ,{" "}
        <Link href={`/${region}/${town}/setmana`} prefetch={false}>
          <a className="font-medium text-black underline">aquesta setmana</a>
        </Link>
        , o ve,{" "}
        <Link href={`/${region}/${town}cap-de-setmana`} prefetch={false}>
          <a className="font-medium text-black underline">el cap de setmana</a>
        </Link>{" "}
        a {townLabel}. Ja no teniu cap excusa, per no estar al dia, de tot el que
        passa a {townLabel} vinculat a la cultura!
      </>
    );

    return {
      metaTitle: `Agenda ${townLabel} ${currentYear} - Esdeveniments.cat`,
      metaDescription: `Esdeveniments.cat és una iniciativa ciutadana per veure en un cop d'ull tots els actes culturals que es fan a ${regionLabel}. L'agenda és col·laborativa.`,
      title: `Agenda ${townLabel} ${currentYear}`,
      subTitle: `Les millors coses per fer a ${townLabel}: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir de ${townLabel} ${normalizedMonth}!`,
      description: descriptionRegionTown,
      canonical: `${siteUrl}/${region}/${town}`,
      notFoundText: `Ho sentim, però no hi ha esdeveniments a ${townLabel}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    };
  }

  if (region && town && byDate) {
    const extraProps = {
      canonocal: `${siteUrl}/${region}/${town}/${byDate}`,
      notFoundText: `Ho sentim, però no hi ha esdeveniments ${byDate} a ${townLabel}. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
    }
    if (byDate === "avui") {
      return {
        title: `Què fer ${byDate} a ${townLabel}`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        description: (
          <>
            Les coses per fer a {townLabel} no descansen ni un dia.{" "}
            <Link href={`/${town}/setmana`} prefetch={false}>
              <a className="font-medium text-black underline">Cada setmana</a>
            </Link>
            , descobrireu centenars d&apos;activitats increïbles per tots els
            racons. Perquè us sigui més fàcil la tria, us ajudem a trobar el pla
            ideal per a vosaltres: cinema alternatiu, l&apos;exposició imperdible,
            l&apos;obra de teatre de la qual tothom parla, mercats, activitats
            familiars... Us oferim tota la informació per gaudir de {townLabel} i
            de la seva enorme activitat cultural. No cal moderació, la podeu
            gaudir a l&apos;engròs.
          </>
        ),
        metaTitle: `Què fer ${byDate} a ${townLabel}`,
        metaDescription: `Què fer ${byDate} a ${townLabel}. Us oferim tota la informació per gaudir de ${townLabel} i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar. . Us oferim tota la informació per gaudir de ${townLabel} i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        ...extraProps,
      };
    } else if (byDate === "setmana") {
      return {
        title: `Coses per fer a ${townLabel} aquesta ${byDate}`,
        subTitle: `Us proposem activitats d'oci i cultura a ${townLabel} per a tots els gustos i butxaques.`,
        description: `Teniu ganes de gaudir de aquesta setmana? Esteu en el lloc correcte! Us hem fet
        una selecció dels plans d'aquesta setmana que engloben el millor de
        tots els àmbits i per a tots els públics. Teatre, cinema, música, art i
        altres excuses per no parar de descobrir ${townLabel}!`,
        metaTitle: `Què fer aquesta ${byDate} a ${townLabel}`,
        metaDescription: `Què fer aquesta ${byDate} a ${townLabel}. Teniu ganes de gaudir de aquesta setmana? Teatre, cinema, música, art i altres excuses per no parar de descobrir ${townLabel}!`,
        ...extraProps,
      };
    } else if (byDate === "cap-de-setmana") {
      return {
        title: `Què fer aquest cap de setmana a ${townLabel}`,
        subTitle: `Les millors propostes per esprémer al màxim el cap de setmana a ${townLabel}, de divendres a diumenge.`,
        description: `Hem bussejat en l'agenda cultural de ${townLabel} i us portem una tria
        del milloret que podreu fer aquest cap de setmana. Art, cinema,
        teatre... No teniu excusa, us espera un cap de setmana increïble sense
        moure-us de ${townLabel}.`,
        metaTitle: `Què fer aquest cap de setmana a ${townLabel}`,
        metaDescription: `Què fer aquest cap de setmana a ${townLabel}. Les millors propostes culturals per esprémer al màxim el cap de setmana, de divendres a diumenge.`,
        ...extraProps,
      };
    }
  }
}
