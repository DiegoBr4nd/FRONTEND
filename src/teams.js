// teams.js — Equipos clasificados al Mundial 2026
// Mapeo: nombre en español (UI) -> nombre en inglés (API, dataset martj42) + abreviatura de 3 letras
// Agrupados por confederación para el selector.

export const TEAMS = [
  // CONMEBOL
  { es: 'Argentina', en: 'Argentina', abbr: 'ARG', conf: 'CONMEBOL' },
  { es: 'Brasil', en: 'Brazil', abbr: 'BRA', conf: 'CONMEBOL' },
  { es: 'Colombia', en: 'Colombia', abbr: 'COL', conf: 'CONMEBOL' },
  { es: 'Ecuador', en: 'Ecuador', abbr: 'ECU', conf: 'CONMEBOL' },
  { es: 'Paraguay', en: 'Paraguay', abbr: 'PAR', conf: 'CONMEBOL' },
  { es: 'Uruguay', en: 'Uruguay', abbr: 'URU', conf: 'CONMEBOL' },

  // UEFA
  { es: 'Alemania', en: 'Germany', abbr: 'GER', conf: 'UEFA' },
  { es: 'Austria', en: 'Austria', abbr: 'AUT', conf: 'UEFA' },
  { es: 'Bélgica', en: 'Belgium', abbr: 'BEL', conf: 'UEFA' },
  { es: 'Croacia', en: 'Croatia', abbr: 'CRO', conf: 'UEFA' },
  { es: 'Escocia', en: 'Scotland', abbr: 'SCO', conf: 'UEFA' },
  { es: 'España', en: 'Spain', abbr: 'ESP', conf: 'UEFA' },
  { es: 'Francia', en: 'France', abbr: 'FRA', conf: 'UEFA' },
  { es: 'Inglaterra', en: 'England', abbr: 'ENG', conf: 'UEFA' },
  { es: 'Noruega', en: 'Norway', abbr: 'NOR', conf: 'UEFA' },
  { es: 'Países Bajos', en: 'Netherlands', abbr: 'NED', conf: 'UEFA' },
  { es: 'Portugal', en: 'Portugal', abbr: 'POR', conf: 'UEFA' },
  { es: 'Suecia', en: 'Sweden', abbr: 'SWE', conf: 'UEFA' },
  { es: 'Suiza', en: 'Switzerland', abbr: 'SUI', conf: 'UEFA' },
  { es: 'Türkiye', en: 'Turkey', abbr: 'TUR', conf: 'UEFA' },

  // CONCACAF
  { es: 'Canadá', en: 'Canada', abbr: 'CAN', conf: 'CONCACAF', host: true },
  { es: 'Estados Unidos', en: 'United States', abbr: 'USA', conf: 'CONCACAF', host: true },
  { es: 'México', en: 'Mexico', abbr: 'MEX', conf: 'CONCACAF', host: true },
  { es: 'Curazao', en: 'Curaçao', abbr: 'CUW', conf: 'CONCACAF' },
  { es: 'Haití', en: 'Haiti', abbr: 'HAI', conf: 'CONCACAF' },

  // AFC
  { es: 'Arabia Saudí', en: 'Saudi Arabia', abbr: 'KSA', conf: 'AFC' },
  { es: 'Australia', en: 'Australia', abbr: 'AUS', conf: 'AFC' },
  { es: 'Corea del Sur', en: 'South Korea', abbr: 'KOR', conf: 'AFC' },
  { es: 'Emiratos Árabes Unidos', en: 'United Arab Emirates', abbr: 'UAE', conf: 'AFC' },
  { es: 'Irán', en: 'Iran', abbr: 'IRN', conf: 'AFC' },
  { es: 'Irak', en: 'Iraq', abbr: 'IRQ', conf: 'AFC' },
  { es: 'Japón', en: 'Japan', abbr: 'JPN', conf: 'AFC' },
  { es: 'Jordania', en: 'Jordan', abbr: 'JOR', conf: 'AFC' },
  { es: 'Qatar', en: 'Qatar', abbr: 'QAT', conf: 'AFC' },
  { es: 'Uzbekistán', en: 'Uzbekistan', abbr: 'UZB', conf: 'AFC' },

  // CAF
  { es: 'Argelia', en: 'Algeria', abbr: 'ALG', conf: 'CAF' },
  { es: 'Cabo Verde', en: 'Cape Verde', abbr: 'CPV', conf: 'CAF' },
  { es: 'Costa de Marfil', en: 'Ivory Coast', abbr: 'CIV', conf: 'CAF' },
  { es: 'Egipto', en: 'Egypt', abbr: 'EGY', conf: 'CAF' },
  { es: 'Ghana', en: 'Ghana', abbr: 'GHA', conf: 'CAF' },
  { es: 'Marruecos', en: 'Morocco', abbr: 'MAR', conf: 'CAF' },
  { es: 'R.D. del Congo', en: 'DR Congo', abbr: 'COD', conf: 'CAF' },
  { es: 'Senegal', en: 'Senegal', abbr: 'SEN', conf: 'CAF' },
  { es: 'Sudáfrica', en: 'South Africa', abbr: 'RSA', conf: 'CAF' },
  { es: 'Túnez', en: 'Tunisia', abbr: 'TUN', conf: 'CAF' },

  // OFC
  { es: 'Nueva Zelanda', en: 'New Zealand', abbr: 'NZL', conf: 'OFC' },
];

// Búsquedas rápidas
export const EN_BY_ES = Object.fromEntries(TEAMS.map(t => [t.es, t.en]));
export const ABBR_BY_ES = Object.fromEntries(TEAMS.map(t => [t.es, t.abbr]));
export const TEAM_BY_ES = Object.fromEntries(TEAMS.map(t => [t.es, t]));
