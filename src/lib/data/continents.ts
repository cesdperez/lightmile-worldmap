/**
 * ISO 3166-1 alpha-2 -> continent code, plus display names.
 *
 * Used for the coarse "continent tier" of pin clustering: when zoomed far out,
 * every conquered city in a continent collapses into a single marker so Europe
 * (a dozen small countries) reads as one dot instead of a crush (see cluster.ts).
 *
 * Assignments follow the common seven-continent convention (Russia -> Europe,
 * transcontinental states by their larger/political landmass). Covers every code
 * in ALPHA2_TO_NUMERIC; schema.ts fails the build if a city's country is missing.
 */
export type ContinentCode = 'AF' | 'AS' | 'EU' | 'NA' | 'SA' | 'OC' | 'AN';

export const CONTINENT_NAMES: Record<ContinentCode, string> = {
  AF: 'Africa',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  SA: 'South America',
  OC: 'Oceania',
  AN: 'Antarctica'
};

export const ALPHA2_TO_CONTINENT: Record<string, ContinentCode> = {
  AF: 'AS', AX: 'EU', AL: 'EU', DZ: 'AF', AS: 'OC', AD: 'EU', AO: 'AF',
  AI: 'NA', AQ: 'AN', AG: 'NA', AR: 'SA', AM: 'AS', AW: 'NA', AU: 'OC',
  AT: 'EU', AZ: 'AS', BS: 'NA', BH: 'AS', BD: 'AS', BB: 'NA', BY: 'EU',
  BE: 'EU', BZ: 'NA', BJ: 'AF', BM: 'NA', BT: 'AS', BO: 'SA', BQ: 'NA',
  BA: 'EU', BW: 'AF', BV: 'AN', BR: 'SA', IO: 'AS', BN: 'AS', BG: 'EU',
  BF: 'AF', BI: 'AF', CV: 'AF', KH: 'AS', CM: 'AF', CA: 'NA', KY: 'NA',
  CF: 'AF', TD: 'AF', CL: 'SA', CN: 'AS', CX: 'OC', CC: 'OC', CO: 'SA',
  KM: 'AF', CG: 'AF', CD: 'AF', CK: 'OC', CR: 'NA', CI: 'AF', HR: 'EU',
  CU: 'NA', CW: 'NA', CY: 'EU', CZ: 'EU', DK: 'EU', DJ: 'AF', DM: 'NA',
  DO: 'NA', EC: 'SA', EG: 'AF', SV: 'NA', GQ: 'AF', ER: 'AF', EE: 'EU',
  SZ: 'AF', ET: 'AF', FK: 'SA', FO: 'EU', FJ: 'OC', FI: 'EU', FR: 'EU',
  GF: 'SA', PF: 'OC', TF: 'AN', GA: 'AF', GM: 'AF', GE: 'AS', DE: 'EU',
  GH: 'AF', GI: 'EU', GR: 'EU', GL: 'NA', GD: 'NA', GP: 'NA', GU: 'OC',
  GT: 'NA', GG: 'EU', GN: 'AF', GW: 'AF', GY: 'SA', HT: 'NA', HM: 'AN',
  VA: 'EU', HN: 'NA', HK: 'AS', HU: 'EU', IS: 'EU', IN: 'AS', ID: 'AS',
  IR: 'AS', IQ: 'AS', IE: 'EU', IM: 'EU', IL: 'AS', IT: 'EU', JM: 'NA',
  JP: 'AS', JE: 'EU', JO: 'AS', KZ: 'AS', KE: 'AF', KI: 'OC', KP: 'AS',
  KR: 'AS', KW: 'AS', KG: 'AS', LA: 'AS', LV: 'EU', LB: 'AS', LS: 'AF',
  LR: 'AF', LY: 'AF', LI: 'EU', LT: 'EU', LU: 'EU', MO: 'AS', MG: 'AF',
  MW: 'AF', MY: 'AS', MV: 'AS', ML: 'AF', MT: 'EU', MH: 'OC', MQ: 'NA',
  MR: 'AF', MU: 'AF', YT: 'AF', MX: 'NA', FM: 'OC', MD: 'EU', MC: 'EU',
  MN: 'AS', ME: 'EU', MS: 'NA', MA: 'AF', MZ: 'AF', MM: 'AS', NA: 'AF',
  NR: 'OC', NP: 'AS', NL: 'EU', NC: 'OC', NZ: 'OC', NI: 'NA', NE: 'AF',
  NG: 'AF', NU: 'OC', NF: 'OC', MK: 'EU', MP: 'OC', NO: 'EU', OM: 'AS',
  PK: 'AS', PW: 'OC', PS: 'AS', PA: 'NA', PG: 'OC', PY: 'SA', PE: 'SA',
  PH: 'AS', PN: 'OC', PL: 'EU', PT: 'EU', PR: 'NA', QA: 'AS', RE: 'AF',
  RO: 'EU', RU: 'EU', RW: 'AF', BL: 'NA', SH: 'AF', KN: 'NA', LC: 'NA',
  MF: 'NA', PM: 'NA', VC: 'NA', WS: 'OC', SM: 'EU', ST: 'AF', SA: 'AS',
  SN: 'AF', RS: 'EU', SC: 'AF', SL: 'AF', SG: 'AS', SX: 'NA', SK: 'EU',
  SI: 'EU', SB: 'OC', SO: 'AF', ZA: 'AF', GS: 'AN', SS: 'AF', ES: 'EU',
  LK: 'AS', SD: 'AF', SR: 'SA', SJ: 'EU', SE: 'EU', CH: 'EU', SY: 'AS',
  TW: 'AS', TJ: 'AS', TZ: 'AF', TH: 'AS', TL: 'AS', TG: 'AF', TK: 'OC',
  TO: 'OC', TT: 'NA', TN: 'AF', TR: 'AS', TM: 'AS', TC: 'NA', TV: 'OC',
  UG: 'AF', UA: 'EU', AE: 'AS', GB: 'EU', US: 'NA', UM: 'OC', UY: 'SA',
  UZ: 'AS', VU: 'OC', VE: 'SA', VN: 'AS', VG: 'NA', VI: 'NA', WF: 'OC',
  EH: 'AF', YE: 'AS', ZM: 'AF', ZW: 'AF'
};

export function continentOf(alpha2: string): ContinentCode | undefined {
  return ALPHA2_TO_CONTINENT[alpha2.toUpperCase()];
}

export function hasContinent(alpha2: string): boolean {
  return alpha2.toUpperCase() in ALPHA2_TO_CONTINENT;
}
