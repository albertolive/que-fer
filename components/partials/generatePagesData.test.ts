// Unit tests for: generatePagesData

import { siteUrl } from "@config/index";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { generatePagesData, PageData, GeneratePagesDataProps } from "./generatePagesData";
import { monthsName } from "@utils/helpers";

jest.mock("@config/index", () => ({
  siteUrl: "https://example.com",
}));

jest.mock("@utils/helpers", () => ({
  monthsName: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  getPlaceTypeAndLabel: jest.fn(),
}));

describe("generatePagesData() generatePagesData method", () => {
  const currentMonth = monthsName[new Date().getMonth()];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Happy paths", () => {
    it("should generate page data for Catalunya with no place or date", () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "region",
        label: "Catalunya",
      });
      const props: GeneratePagesDataProps = { currentYear: 2023 };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer a Catalunya. Agenda 2023`,
        subTitle: `Viu aquest ${currentMonth} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
        metaTitle: `Descobreix esdeveniments a Catalunya aquest 2023`,
        metaDescription: `Descobreix els millors esdeveniments de Catalunya: concerts, exposicions, mercats i més. Participa en l'agenda cultural i fes-la créixer!`,
        canonical: siteUrl,
        notFoundText: `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it("should generate page data for a region without a date", () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "region",
        label: "Barcelona",
      });

      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "barcelona",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer al Barcelona. Agenda 2023`,
        subTitle: `Les millors coses per fer al Barcelona: mercats, exposicions,
      descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir aquest ${currentMonth}!`,
        metaTitle: `Esdeveniments destacats al Barcelona. Agenda 2023`,
        metaDescription: `Descobreix amb els millors actes culturals clau aquest ${currentMonth} al Barcelona. Des de concerts fins a exposicions, la nostra agenda col·laborativa t'espera.`,
        canonical: `${siteUrl}/barcelona`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments al Barcelona. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it("should generate page data for a town without a date", () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "town",
        label: "Girona",
      });

      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "girona",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer a Girona. Agenda 2023`,
        subTitle: `Explora les millors activitats a Girona: mercats, exposicions, passejades, concerts, i més. Viu intensament Girona aquest ${currentMonth}.`,
        metaTitle: `Guia d'activitats a Girona - ${currentMonth} 2023`,
        metaDescription: `Descobreix els esdeveniments imperdibles a Girona aquest 2023. Concerts, exposicions, i més t'esperen. Suma't a la nostra agenda col·laborativa.`,
        canonical: `${siteUrl}/girona`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments a Girona. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it('should generate page data for a place with a specific date "avui"', () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "town",
        label: "Girona",
      });

      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "girona",
        byDate: "avui",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer avui a Girona`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        metaTitle: `Esdeveniments avui a Girona`,
        metaDescription: `Què fer avui a Girona. Us oferim tota la informació per gaudir Girona i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/girona/avui`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments avui a Girona. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle an unknown place type gracefully", () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "unknown",
        label: "UnknownPlace",
      });

      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "unknownplace",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer a Catalunya. Agenda 2023`,
        subTitle: `Viu aquest ${currentMonth} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... 
    No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
        metaTitle: `Descobreix esdeveniments a Catalunya aquest 2023`,
        metaDescription: `Descobreix els millors esdeveniments de Catalunya: concerts, exposicions, mercats i més. Participa en l'agenda cultural i fes-la créixer!`,
        canonical: siteUrl,
        notFoundText: `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it("should handle an empty place and date", () => {
      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "",
        byDate: "",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer a Catalunya. Agenda 2023`,
        subTitle: `Viu aquest ${currentMonth} com mai amb les millors activitats de la temporada: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... No et quedis sense provar tots aquests plans imprescindibles per aprofitar-lo al màxim!`,
        metaTitle: `Descobreix esdeveniments a Catalunya aquest 2023`,
        metaDescription: `Descobreix els millors esdeveniments de Catalunya: concerts, exposicions, mercats i més. Participa en l'agenda cultural i fes-la créixer!`,
        canonical: siteUrl,
        notFoundText: `Ho sentim, però no hi ha esdeveniments a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it("should handle a date without a place", () => {
      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        byDate: "setmana",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Agenda setmanal a Catalunya`,
        subTitle: `Us proposem activitats d'oci i cultura a Catalunya per a tots els gustos i butxaques aquesta setmana.`,
        metaTitle: `Esdeveniments aquesta setmana a Catalunya`,
        metaDescription: `Què fer aquesta setmana a Catalunya. Teniu ganes de gaudir de aquesta setmana? Teatre, cinema, música, art i altres excuses per no parar de descobrir Catalunya!`,
        canonical: `${siteUrl}/setmana`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments aquesta setmana a Catalunya. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });

    it("should handle a place with an invalid date", () => {
      (getPlaceTypeAndLabel as jest.Mock).mockReturnValue({
        type: "town",
        label: "Gironas",
      });

      const props: GeneratePagesDataProps = {
        currentYear: 2023,
        place: "gironas",
        byDate: "avui",
      };
      const result: PageData = generatePagesData(props);

      expect(result).toEqual({
        title: `Què fer avui a Gironas`,
        subTitle: `Aprofita el teu temps i troba el que necessites: el millor del dia al teu abast.`,
        metaTitle: `Esdeveniments avui a Gironas`,
        metaDescription: `Què fer avui a Gironas. Us oferim tota la informació per gaudir Gironas i de la seva enorme activitat cultural: cinema, museus, teatre, mercats, familiar.`,
        canonical: `${siteUrl}/gironas/avui`,
        notFoundText: `Ho sentim, però no hi ha esdeveniments avui a Gironas. Hem rebuscat en l'agenda i pot ser que també t'agradin aquestes altres opcions.`,
      });
    });
  });
});

// End of unit tests for: generatePagesData
