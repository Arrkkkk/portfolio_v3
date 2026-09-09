/**
 * The twelve zodiac constellations, as real sky positions.
 *
 * Coordinates are J2000 right ascension / declination in degrees, with
 * apparent visual magnitude. They are converted to ecliptic longitude and
 * latitude at runtime (see ConstellationField), which is what lets the signs
 * string along a true ecliptic band rather than a decorative arc.
 *
 * `lines` are index pairs into `stars`, giving each sign's asterism — the
 * familiar join-the-dots figure, not the IAU boundary. Several conventions
 * exist for these; the shapes below follow the common modern figures.
 *
 * Accuracy note: the bright stars of each sign are well established and
 * confidently placed. The fainter members carry more uncertainty, and the
 * three faint sprawling signs — Cancer, Aquarius and Pisces — are deliberately
 * kept to their skeleton, since a half-remembered figure is worse than a
 * simple one. Corrections welcome; this file is the single place to make them.
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
  lines: [number, number][];
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
      { ra: 68.98, dec: 16.509, mag: 0.85, name: "Aldebaran" }, // α
      { ra: 81.573, dec: 28.608, mag: 1.65, name: "Elnath" }, // β — north horn
      { ra: 84.411, dec: 21.143, mag: 3.0, name: "Tianguan" }, // ζ — south horn
      { ra: 67.165, dec: 15.962, mag: 3.4, name: "Theta Tauri" },
      { ra: 64.948, dec: 15.628, mag: 3.65, name: "Gamma Tauri" }, // apex of the V
      { ra: 66.009, dec: 17.542, mag: 3.77, name: "Delta Tauri" },
      { ra: 67.154, dec: 19.18, mag: 3.53, name: "Epsilon Tauri" },
      { ra: 60.17, dec: 12.49, mag: 3.47, name: "Lambda Tauri" },
      { ra: 56.871, dec: 24.105, mag: 2.87, name: "Alcyone" }, // Pleiades
    ],
    // The Hyades V, opening east to the two horn tips.
    lines: [
      [7, 4],
      [4, 5],
      [5, 6],
      [6, 1],
      [4, 3],
      [3, 0],
      [0, 2],
    ],
  },
  {
    key: "gemini",
    label: "Gemini",
    stars: [
      { ra: 116.329, dec: 28.026, mag: 1.14, name: "Pollux" }, // β
      { ra: 113.65, dec: 31.888, mag: 1.58, name: "Castor" }, // α
      { ra: 99.428, dec: 16.399, mag: 1.9, name: "Alhena" }, // γ
      { ra: 95.74, dec: 22.514, mag: 2.87, name: "Tejat" }, // μ
      { ra: 100.983, dec: 25.131, mag: 2.98, name: "Mebsuta" }, // ε
      { ra: 93.719, dec: 22.507, mag: 3.28, name: "Propus" }, // η
      { ra: 110.031, dec: 21.982, mag: 3.53, name: "Wasat" }, // δ
      { ra: 106.027, dec: 20.57, mag: 3.79, name: "Mekbuda" }, // ζ
      { ra: 116.112, dec: 24.398, mag: 3.57, name: "Kappa Geminorum" },
    ],
    // Two figures joined at the shoulders.
    lines: [
      [1, 0],
      [1, 4],
      [4, 3],
      [3, 5],
      [0, 8],
      [0, 6],
      [6, 7],
      [7, 2],
    ],
  },
  {
    key: "cancer",
    label: "Cancer",
    stars: [
      { ra: 124.129, dec: 9.186, mag: 3.5, name: "Tarf" }, // β
      { ra: 131.171, dec: 18.154, mag: 3.94, name: "Asellus Australis" }, // δ
      { ra: 134.622, dec: 11.858, mag: 4.25, name: "Acubens" }, // α
      { ra: 130.821, dec: 21.469, mag: 4.66, name: "Asellus Borealis" }, // γ
      { ra: 131.674, dec: 28.76, mag: 4.02, name: "Iota Cancri" },
    ],
    // The faint inverted Y.
    lines: [
      [2, 1],
      [1, 0],
      [1, 3],
      [3, 4],
    ],
  },
  {
    key: "leo",
    label: "Leo",
    stars: [
      { ra: 152.093, dec: 11.967, mag: 1.36, name: "Regulus" }, // α
      { ra: 177.265, dec: 14.572, mag: 2.14, name: "Denebola" }, // β
      { ra: 154.993, dec: 19.841, mag: 2.08, name: "Algieba" }, // γ
      { ra: 168.527, dec: 20.524, mag: 2.56, name: "Zosma" }, // δ
      { ra: 146.463, dec: 23.774, mag: 2.98, name: "Algenubi" }, // ε
      { ra: 168.56, dec: 15.43, mag: 3.32, name: "Chertan" }, // θ
      { ra: 154.173, dec: 23.417, mag: 3.44, name: "Adhafera" }, // ζ
      { ra: 148.19, dec: 26.007, mag: 3.88, name: "Rasalas" }, // μ
      { ra: 151.833, dec: 16.763, mag: 3.51, name: "Eta Leonis" },
    ],
    // The Sickle, then the body and hindquarters.
    lines: [
      [0, 8],
      [8, 2],
      [2, 6],
      [6, 7],
      [7, 4],
      [2, 3],
      [3, 1],
      [1, 5],
      [5, 0],
    ],
  },
  {
    key: "virgo",
    label: "Virgo",
    stars: [
      { ra: 201.298, dec: -11.161, mag: 1.04, name: "Spica" }, // α
      { ra: 195.544, dec: 10.959, mag: 2.83, name: "Vindemiatrix" }, // ε
      { ra: 190.415, dec: -1.449, mag: 2.74, name: "Porrima" }, // γ
      { ra: 203.673, dec: -0.596, mag: 3.38, name: "Heze" }, // ζ
      { ra: 193.901, dec: 3.398, mag: 3.38, name: "Auva" }, // δ
      { ra: 177.674, dec: 1.765, mag: 3.6, name: "Zavijava" }, // β
      { ra: 214.004, dec: -6.001, mag: 4.07, name: "Syrma" }, // ι
      { ra: 184.977, dec: -0.667, mag: 3.89, name: "Zaniah" }, // η
    ],
    lines: [
      [5, 7],
      [7, 2],
      [2, 4],
      [4, 1],
      [2, 0],
      [0, 3],
      [3, 4],
      [3, 6],
    ],
  },
  {
    key: "libra",
    label: "Libra",
    stars: [
      { ra: 229.252, dec: -9.383, mag: 2.61, name: "Zubeneschamali" }, // β
      { ra: 222.72, dec: -16.042, mag: 2.75, name: "Zubenelgenubi" }, // α
      { ra: 226.018, dec: -25.282, mag: 3.29, name: "Brachium" }, // σ
      { ra: 233.882, dec: -14.79, mag: 3.91, name: "Zubenelhakrabi" }, // γ
    ],
    lines: [
      [1, 0],
      [0, 3],
      [3, 1],
      [1, 2],
    ],
  },
  {
    key: "scorpius",
    label: "Scorpius",
    stars: [
      { ra: 247.352, dec: -26.432, mag: 1.06, name: "Antares" }, // α
      { ra: 263.402, dec: -37.104, mag: 1.62, name: "Shaula" }, // λ
      { ra: 264.33, dec: -42.998, mag: 1.86, name: "Sargas" }, // θ
      { ra: 252.541, dec: -34.293, mag: 2.29, name: "Larawag" }, // ε
      { ra: 240.083, dec: -22.622, mag: 2.32, name: "Dschubba" }, // δ
      { ra: 265.622, dec: -39.03, mag: 2.39, name: "Girtab" }, // κ
      { ra: 241.359, dec: -19.805, mag: 2.56, name: "Acrab" }, // β
      { ra: 262.691, dec: -37.296, mag: 2.7, name: "Lesath" }, // υ
      { ra: 248.971, dec: -28.216, mag: 2.82, name: "Paikauhale" }, // τ
      { ra: 239.713, dec: -26.114, mag: 2.89, name: "Fang" }, // π
      { ra: 252.968, dec: -38.048, mag: 3.0, name: "Xamidimura" }, // μ
      { ra: 266.896, dec: -40.127, mag: 3.03, name: "Iota Scorpii" },
    ],
    // Head, heart, then the long curving tail to the stinger.
    lines: [
      [6, 4],
      [4, 9],
      [9, 0],
      [0, 8],
      [8, 3],
      [3, 10],
      [10, 2],
      [2, 11],
      [11, 5],
      [5, 1],
      [1, 7],
    ],
  },
  {
    key: "sagittarius",
    label: "Sagittarius",
    stars: [
      { ra: 276.043, dec: -34.385, mag: 1.85, name: "Kaus Australis" }, // ε
      { ra: 283.816, dec: -26.297, mag: 2.05, name: "Nunki" }, // σ
      { ra: 285.653, dec: -29.88, mag: 2.6, name: "Ascella" }, // ζ
      { ra: 275.249, dec: -29.828, mag: 2.7, name: "Kaus Media" }, // δ
      { ra: 276.993, dec: -25.421, mag: 2.81, name: "Kaus Borealis" }, // λ
      { ra: 271.452, dec: -30.424, mag: 2.98, name: "Alnasl" }, // γ
      { ra: 281.414, dec: -26.991, mag: 3.17, name: "Phi Sagittarii" },
      { ra: 286.735, dec: -27.67, mag: 3.32, name: "Tau Sagittarii" },
    ],
    // The Teapot: spout, base, handle, lid.
    lines: [
      [5, 3],
      [3, 0],
      [0, 2],
      [2, 1],
      [1, 6],
      [6, 4],
      [4, 3],
      [2, 7],
      [7, 6],
    ],
  },
  {
    key: "capricornus",
    label: "Capricornus",
    stars: [
      { ra: 326.76, dec: -16.127, mag: 2.85, name: "Deneb Algedi" }, // δ
      { ra: 305.253, dec: -14.781, mag: 3.05, name: "Dabih" }, // β
      { ra: 304.513, dec: -12.545, mag: 3.57, name: "Algedi" }, // α
      { ra: 325.023, dec: -16.662, mag: 3.68, name: "Nashira" }, // γ
      { ra: 321.667, dec: -22.411, mag: 3.74, name: "Zeta Capricorni" },
      { ra: 312.955, dec: -26.919, mag: 4.11, name: "Omega Capricorni" },
      { ra: 316.487, dec: -17.233, mag: 4.07, name: "Theta Capricorni" },
    ],
    // The closed triangle / boat.
    lines: [
      [2, 1],
      [1, 5],
      [5, 4],
      [4, 3],
      [3, 0],
      [0, 6],
      [6, 2],
    ],
  },
  {
    key: "aquarius",
    label: "Aquarius",
    stars: [
      { ra: 322.89, dec: -5.571, mag: 2.87, name: "Sadalsuud" }, // β
      { ra: 331.446, dec: -0.32, mag: 2.94, name: "Sadalmelik" }, // α
      { ra: 343.663, dec: -15.821, mag: 3.27, name: "Skat" }, // δ
      { ra: 337.208, dec: -0.02, mag: 3.65, name: "Zeta Aquarii" },
      { ra: 343.153, dec: -7.58, mag: 3.73, name: "Lambda Aquarii" },
      { ra: 311.918, dec: -9.496, mag: 3.77, name: "Albali" }, // ε
      { ra: 335.414, dec: -1.387, mag: 3.84, name: "Sadachbia" }, // γ
    ],
    // Shoulders and the water jar; the stream is left implied.
    lines: [
      [5, 0],
      [0, 1],
      [1, 6],
      [6, 3],
      [1, 4],
      [4, 2],
    ],
  },
  {
    key: "pisces",
    label: "Pisces",
    stars: [
      { ra: 30.512, dec: 2.764, mag: 3.82, name: "Alrescha" }, // α — the knot
      { ra: 22.871, dec: 15.346, mag: 3.62, name: "Alpherg" }, // η
      { ra: 349.291, dec: 3.282, mag: 3.69, name: "Gamma Piscium" },
      { ra: 359.828, dec: 6.863, mag: 4.01, name: "Omega Piscium" },
      { ra: 354.99, dec: 5.626, mag: 4.13, name: "Iota Piscium" },
      { ra: 12.176, dec: 7.585, mag: 4.43, name: "Delta Piscium" },
    ],
    // The western circlet, the cord east to the knot, then north.
    lines: [
      [2, 4],
      [4, 3],
      [3, 5],
      [5, 0],
      [0, 1],
    ],
  },
];

/** The sign drawn permanently — the owner's own. */
export const FEATURED_SIGN = "aries";
