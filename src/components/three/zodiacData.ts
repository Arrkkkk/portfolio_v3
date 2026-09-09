/**
 * The twelve zodiac constellations, as real sky positions.
 *
 * Coordinates are J2000 right ascension / declination in degrees, with
 * apparent visual magnitude. They are converted to ecliptic longitude and
 * latitude at runtime (see ConstellationField), which is what lets the signs
 * string along a true ecliptic band rather than a decorative arc.
 *
 * Only Aries carries `lines` — it is the sign that gets drawn as an asterism.
 * The rest contribute stars alone, so their exact geometry is never legible
 * as a shape and small positional error cannot read as "wrong".
 *
 * Star selection favours the naked-eye members of each figure; this is not a
 * complete catalogue and is not intended to be.
 */

export type ZodiacStar = {
  /** Right ascension, degrees (J2000). */
  ra: number;
  /** Declination, degrees (J2000). */
  dec: number;
  /** Apparent visual magnitude — lower is brighter. */
  mag: number;
  name?: string;
};

export type ZodiacSign = {
  key: string;
  label: string;
  stars: ZodiacStar[];
  /** Index pairs into `stars`, drawn as the asterism. */
  lines?: [number, number][];
};

export const ZODIAC: ZodiacSign[] = [
  {
    key: "aries",
    label: "Aries",
    stars: [
      { ra: 31.793, dec: 23.462, mag: 2.0, name: "Hamal" }, // α
      { ra: 28.66, dec: 20.808, mag: 2.64, name: "Sheratan" }, // β
      { ra: 28.383, dec: 19.294, mag: 3.86, name: "Mesarthim" }, // γ
      { ra: 42.5, dec: 27.261, mag: 3.63, name: "Bharani" }, // 41 Ari
      { ra: 47.907, dec: 19.727, mag: 4.35, name: "Botein" }, // δ
    ],
    // The IAU figure: Mesarthim — Sheratan — Hamal — 41 Arietis.
    lines: [
      [2, 1],
      [1, 0],
      [0, 3],
    ],
  },
  {
    key: "taurus",
    label: "Taurus",
    stars: [
      { ra: 68.98, dec: 16.509, mag: 0.85, name: "Aldebaran" },
      { ra: 81.573, dec: 28.608, mag: 1.65, name: "Elnath" },
      { ra: 84.411, dec: 21.143, mag: 3.0, name: "Tianguan" },
      { ra: 67.154, dec: 15.628, mag: 3.53, name: "Theta Tauri" },
      { ra: 64.948, dec: 15.628, mag: 3.65, name: "Gamma Tauri" },
      { ra: 66.009, dec: 17.542, mag: 3.77, name: "Delta Tauri" },
      { ra: 56.871, dec: 24.105, mag: 2.87, name: "Alcyone" },
    ],
  },
  {
    key: "gemini",
    label: "Gemini",
    stars: [
      { ra: 116.329, dec: 28.026, mag: 1.14, name: "Pollux" },
      { ra: 113.65, dec: 31.888, mag: 1.58, name: "Castor" },
      { ra: 99.428, dec: 16.399, mag: 1.9, name: "Alhena" },
      { ra: 95.74, dec: 22.514, mag: 2.87, name: "Mebsuta" },
      { ra: 100.983, dec: 25.131, mag: 3.06, name: "Mekbuda" },
      { ra: 93.719, dec: 22.507, mag: 3.36, name: "Tejat" },
    ],
  },
  {
    key: "cancer",
    label: "Cancer",
    stars: [
      { ra: 124.129, dec: 9.186, mag: 3.5, name: "Tarf" },
      { ra: 131.171, dec: 18.154, mag: 3.94, name: "Asellus Australis" },
      { ra: 134.622, dec: 11.858, mag: 4.25, name: "Acubens" },
      { ra: 130.821, dec: 21.469, mag: 4.66, name: "Asellus Borealis" },
    ],
  },
  {
    key: "leo",
    label: "Leo",
    stars: [
      { ra: 152.093, dec: 11.967, mag: 1.36, name: "Regulus" },
      { ra: 177.265, dec: 14.572, mag: 2.14, name: "Denebola" },
      { ra: 154.993, dec: 19.841, mag: 2.08, name: "Algieba" },
      { ra: 168.527, dec: 20.524, mag: 2.56, name: "Zosma" },
      { ra: 146.463, dec: 23.774, mag: 2.98, name: "Algenubi" },
      { ra: 168.56, dec: 15.43, mag: 3.32, name: "Chertan" },
      { ra: 154.173, dec: 23.417, mag: 3.44, name: "Adhafera" },
      { ra: 148.19, dec: 26.007, mag: 3.88, name: "Rasalas" },
    ],
  },
  {
    key: "virgo",
    label: "Virgo",
    stars: [
      { ra: 201.298, dec: -11.161, mag: 1.04, name: "Spica" },
      { ra: 195.544, dec: 10.959, mag: 2.83, name: "Vindemiatrix" },
      { ra: 190.415, dec: -1.449, mag: 2.74, name: "Porrima" },
      { ra: 203.673, dec: -0.596, mag: 3.38, name: "Heze" },
      { ra: 193.901, dec: 3.398, mag: 3.38, name: "Auva" },
      { ra: 177.674, dec: 1.765, mag: 3.6, name: "Zavijava" },
      { ra: 214.004, dec: -6.001, mag: 4.07, name: "Syrma" },
    ],
  },
  {
    key: "libra",
    label: "Libra",
    stars: [
      { ra: 229.252, dec: -9.383, mag: 2.61, name: "Zubeneschamali" },
      { ra: 222.72, dec: -16.042, mag: 2.75, name: "Zubenelgenubi" },
      { ra: 226.018, dec: -25.282, mag: 3.29, name: "Brachium" },
      { ra: 233.882, dec: -14.79, mag: 3.91, name: "Zubenelhakrabi" },
    ],
  },
  {
    key: "scorpius",
    label: "Scorpius",
    stars: [
      { ra: 247.352, dec: -26.432, mag: 1.06, name: "Antares" },
      { ra: 263.402, dec: -37.104, mag: 1.62, name: "Shaula" },
      { ra: 264.33, dec: -42.998, mag: 1.86, name: "Sargas" },
      { ra: 252.541, dec: -34.293, mag: 2.29, name: "Larawag" },
      { ra: 240.083, dec: -22.622, mag: 2.32, name: "Dschubba" },
      { ra: 265.622, dec: -39.03, mag: 2.39, name: "Girtab" },
      { ra: 241.359, dec: -19.805, mag: 2.56, name: "Acrab" },
      { ra: 262.691, dec: -37.296, mag: 2.7, name: "Lesath" },
      { ra: 248.971, dec: -28.216, mag: 2.82, name: "Paikauhale" },
      { ra: 239.713, dec: -26.114, mag: 2.89, name: "Fang" },
      { ra: 252.968, dec: -38.048, mag: 3.0, name: "Xamidimura" },
    ],
  },
  {
    key: "sagittarius",
    label: "Sagittarius",
    stars: [
      { ra: 276.043, dec: -34.385, mag: 1.85, name: "Kaus Australis" },
      { ra: 283.816, dec: -26.297, mag: 2.05, name: "Nunki" },
      { ra: 285.653, dec: -29.88, mag: 2.6, name: "Ascella" },
      { ra: 275.249, dec: -29.828, mag: 2.7, name: "Kaus Media" },
      { ra: 276.993, dec: -25.421, mag: 2.81, name: "Kaus Borealis" },
      { ra: 271.452, dec: -30.424, mag: 2.98, name: "Alnasl" },
      { ra: 281.414, dec: -26.991, mag: 3.17, name: "Phi Sagittarii" },
      { ra: 286.735, dec: -27.67, mag: 3.32, name: "Tau Sagittarii" },
    ],
  },
  {
    key: "capricornus",
    label: "Capricornus",
    stars: [
      { ra: 326.76, dec: -16.127, mag: 2.85, name: "Deneb Algedi" },
      { ra: 305.253, dec: -14.781, mag: 3.05, name: "Dabih" },
      { ra: 304.513, dec: -12.545, mag: 3.57, name: "Algedi" },
      { ra: 325.023, dec: -16.662, mag: 3.68, name: "Nashira" },
      { ra: 321.667, dec: -22.411, mag: 3.74 },
      { ra: 312.955, dec: -26.919, mag: 4.11 },
    ],
  },
  {
    key: "aquarius",
    label: "Aquarius",
    stars: [
      { ra: 322.89, dec: -5.571, mag: 2.87, name: "Sadalsuud" },
      { ra: 331.446, dec: -0.32, mag: 2.94, name: "Sadalmelik" },
      { ra: 343.663, dec: -15.821, mag: 3.27, name: "Skat" },
      { ra: 337.208, dec: -0.02, mag: 3.65 },
      { ra: 343.153, dec: -7.58, mag: 3.73 },
      { ra: 311.918, dec: -9.496, mag: 3.77, name: "Albali" },
      { ra: 335.414, dec: -1.387, mag: 3.84, name: "Sadachbia" },
    ],
  },
  {
    key: "pisces",
    label: "Pisces",
    stars: [
      { ra: 22.871, dec: 15.346, mag: 3.62, name: "Alpherg" },
      { ra: 349.291, dec: 3.282, mag: 3.69, name: "Gamma Piscium" },
      { ra: 30.512, dec: 2.764, mag: 3.82, name: "Alrescha" },
      { ra: 359.828, dec: 6.863, mag: 4.01, name: "Omega Piscium" },
      { ra: 354.99, dec: 5.626, mag: 4.13, name: "Iota Piscium" },
      { ra: 26.348, dec: 9.158, mag: 4.27, name: "Nu Piscium" },
    ],
  },
];

/** The sign drawn as an asterism. */
export const FEATURED_SIGN = "aries";
