import {
  barcelones,
  osona,
  selva,
  baixLlobregat,
  altEmporda,
  anoia,
  bages,
  llucanes,
  altPenedes,
  garraf,
  maresme,
  vallesOccidental,
  vallesOriental,
  baixEmporda,
  bergueda,
  moianes,
  urgell,
  tarragones,
} from "@utils/cities";

export const MAX_RESULTS = 15;

export const DAYS: string[] = [
  "Diumenge",
  "Dilluns",
  "Dimarts",
  "Dimecres",
  "Dijous",
  "Divendres",
  "Dissabte",
];

export const MONTHS: string[] = [
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

export const MONTHS_URL: string[] = [
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

export interface Categories {
  [key: string]: string;
}

export const CATEGORIES: Categories = {
  "Festes Majors": "Festa Major",
  Festivals: "Festival",
  Familiar: "Familiar",
  Música: "Música",
  Cinema: "Cinema",
  Teatre: "Teatre",
  Exposicions: "Exposició",
  Fires: "Fira",
  Espectacles: "Espectacles",
};

export const SEARCH_TERMS_SUBSET: string[] = [
  "Festa Major",
  "Festival",
  "Familiar",
  "Música",
];

export const CATEGORY_NAMES_MAP: Categories = Object.fromEntries(
  Object.entries(CATEGORIES).map(([displayName, searchTerm]) => [
    searchTerm,
    displayName,
  ])
);

interface DateOption {
  value: string;
  label: string;
}

export const BYDATES: DateOption[] = [
  { value: "avui", label: "Avui" },
  { value: "dema", label: "Demà" },
  { value: "cap-de-setmana", label: "Cap de setmana" },
  { value: "setmana", label: "Aquesta setmana" },
];

interface DateFunctions {
  [key: string]: string;
}

export const dateFunctions: DateFunctions = {
  avui: "today",
  dema: "tomorrow",
  setmana: "week",
  "cap-de-setmana": "weekend",
};

export const DISTANCES: number[] = [5, 10, 25, 50, 100];

export interface RegionData {
  label: string;
  towns: string[];
}

export type CitiesData = Map<string, RegionData>;

export const CITIES_DATA = new Map([
  barcelones,
  osona,
  selva,
  baixLlobregat,
  altEmporda,
  anoia,
  bages,
  llucanes,
  altPenedes,
  garraf,
  maresme,
  vallesOccidental,
  vallesOriental,
  baixEmporda,
  bergueda,
  moianes,
  urgell,
  tarragones,
]);
