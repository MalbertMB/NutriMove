/**
 * Food database for the meal editor.
 *
 * - Nutrition values are per 100 g (or per 100 ml for liquids).
 * - `searchFoods` and `scaleFood` are the intended public API; consumers
 *   shouldn't need to touch the array directly.
 * - Adding a new food: append an entry to `FOOD_DATA` with a unique `id`.
 *   The search index is built once at module load.
 */

// Strip combining accents and lowercase. Pre-applied to every food name so
// the per-keystroke search doesn't re-do this work for each item.
function normalize(s) {
	return String(s ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();
}

const FOOD_DATA = [
	// ── Cereals & farinacis ─────────────────────────────────────────
	{ id: "arros-blanc",        name: "Arròs blanc cuit",      kcal: 130, carbs: 28,   protein: 2.7, fat: 0.3 },
	{ id: "arros-integral",     name: "Arròs integral cuit",   kcal: 112, carbs: 23,   protein: 2.6, fat: 0.9 },
	{ id: "pasta-blanca",       name: "Pasta blanca cuita",    kcal: 131, carbs: 25,   protein: 5,   fat: 1.1 },
	{ id: "pasta-integral",     name: "Pasta integral cuita",  kcal: 124, carbs: 23,   protein: 5,   fat: 1   },
	{ id: "quinoa",             name: "Quinoa cuita",          kcal: 120, carbs: 21,   protein: 4.4, fat: 1.9 },
	{ id: "cuscus",             name: "Cuscús cuit",           kcal: 112, carbs: 23,   protein: 3.8, fat: 0.2 },
	{ id: "civada-flocs",       name: "Civada en flocs",       kcal: 379, carbs: 67,   protein: 13,  fat: 7   },
	{ id: "farina-civada",      name: "Farina de civada",      kcal: 371, carbs: 56,   protein: 13,  fat: 7   },
	{ id: "pa-blanc",           name: "Pa blanc",              kcal: 265, carbs: 49,   protein: 9,   fat: 3.2 },
	{ id: "pa-integral",        name: "Pa integral",           kcal: 247, carbs: 41,   protein: 9,   fat: 3.5 },
	{ id: "pa-motlle-integral", name: "Pa de motlle integral", kcal: 247, carbs: 41,   protein: 13,  fat: 4.2 },
	{ id: "tortilla-blat",      name: "Tortilla de blat",      kcal: 308, carbs: 50,   protein: 8,   fat: 7   },
	{ id: "patata",             name: "Patata bullida",        kcal: 87,  carbs: 20,   protein: 1.9, fat: 0.1 },
	{ id: "moniato",            name: "Moniato bullit",        kcal: 86,  carbs: 20,   protein: 1.6, fat: 0.1 },
	{ id: "galetes-integrals",  name: "Galetes integrals",     kcal: 471, carbs: 65,   protein: 7,   fat: 21  },

	// ── Llegums & proteïnes vegetals ────────────────────────────────
	{ id: "llentilles",         name: "Llentilles cuites",     kcal: 116, carbs: 20,   protein: 9,   fat: 0.4 },
	{ id: "cigrons",            name: "Cigrons cuits",         kcal: 164, carbs: 27,   protein: 9,   fat: 2.6 },
	{ id: "fesols",             name: "Fesols cuits",          kcal: 127, carbs: 22,   protein: 8,   fat: 0.5 },
	{ id: "mongetes-negres",    name: "Mongetes negres cuites",kcal: 132, carbs: 24,   protein: 9,   fat: 0.5 },
	{ id: "tofu",               name: "Tofu",                  kcal: 76,  carbs: 2,    protein: 8,   fat: 4.5 },
	{ id: "seitan",             name: "Seitàn",                kcal: 125, carbs: 6,    protein: 25,  fat: 2   },

	// ── Carns ───────────────────────────────────────────────────────
	{ id: "pit-pollastre",      name: "Pit de pollastre",      kcal: 165, carbs: 0,    protein: 31,  fat: 3.6 },
	{ id: "pit-gall-dindi",     name: "Pit de gall dindi",     kcal: 135, carbs: 0,    protein: 28,  fat: 2   },
	{ id: "vedella-magra",      name: "Vedella magra",         kcal: 158, carbs: 0,    protein: 26,  fat: 5   },
	{ id: "llom-porc",          name: "Llom de porc magre",    kcal: 143, carbs: 0,    protein: 24,  fat: 5   },
	{ id: "conill",             name: "Conill cuit",           kcal: 173, carbs: 0,    protein: 33,  fat: 3.5 },
	{ id: "pernil-dolc",        name: "Pernil dolç",           kcal: 107, carbs: 1,    protein: 18,  fat: 3.5 },
	{ id: "pernil-serra",       name: "Pernil serrà",          kcal: 195, carbs: 0,    protein: 31,  fat: 8   },
	{ id: "pernil-iberic",      name: "Pernil ibèric",         kcal: 350, carbs: 0,    protein: 30,  fat: 25  },

	// ── Peix & marisc ───────────────────────────────────────────────
	{ id: "salmo",              name: "Salmó",                 kcal: 208, carbs: 0,    protein: 20,  fat: 13  },
	{ id: "tonyina",            name: "Tonyina al natural",    kcal: 116, carbs: 0,    protein: 26,  fat: 1   },
	{ id: "bacalla",            name: "Bacallà fresc",         kcal: 82,  carbs: 0,    protein: 18,  fat: 0.7 },
	{ id: "lluc",               name: "Lluç fresc",            kcal: 71,  carbs: 0,    protein: 17,  fat: 0.4 },
	{ id: "llenguado",          name: "Llenguado",             kcal: 91,  carbs: 0,    protein: 18.8,fat: 1.2 },
	{ id: "orada",              name: "Orada",                 kcal: 96,  carbs: 0,    protein: 19,  fat: 2   },
	{ id: "sardines-oli",       name: "Sardines en oli",       kcal: 208, carbs: 0,    protein: 25,  fat: 11.5},
	{ id: "calamars",           name: "Calamars",              kcal: 92,  carbs: 3.1,  protein: 16,  fat: 1.4 },
	{ id: "gambes",             name: "Gambes cuites",         kcal: 99,  carbs: 0,    protein: 24,  fat: 0.3 },

	// ── Ous, lactis & begudes vegetals ──────────────────────────────
	{ id: "ou",                 name: "Ou sencer",             kcal: 155, carbs: 1.1,  protein: 13,  fat: 11  },
	{ id: "llet-sencera",       name: "Llet sencera",          kcal: 61,  carbs: 4.8,  protein: 3.2, fat: 3.3 },
	{ id: "llet-semi",          name: "Llet semi",             kcal: 47,  carbs: 4.9,  protein: 3.4, fat: 1.5 },
	{ id: "llet-desnatada",     name: "Llet desnatada",        kcal: 35,  carbs: 5,    protein: 3.4, fat: 0.1 },
	{ id: "iogurt-natural",     name: "Iogurt natural",        kcal: 61,  carbs: 4.7,  protein: 3.5, fat: 3.3 },
	{ id: "iogurt-grec",        name: "Iogurt grec",           kcal: 97,  carbs: 3.6,  protein: 9,   fat: 5   },
	{ id: "iogurt-grec-0",      name: "Iogurt grec 0%",        kcal: 59,  carbs: 3.6,  protein: 10,  fat: 0.4 },
	{ id: "mato",               name: "Mató",                  kcal: 98,  carbs: 3,    protein: 11,  fat: 4.3 },
	{ id: "formatge-cottage",   name: "Formatge cottage",      kcal: 98,  carbs: 3.4,  protein: 11,  fat: 4.3 },
	{ id: "mozzarella",         name: "Mozzarella",            kcal: 280, carbs: 2.2,  protein: 17,  fat: 22  },
	{ id: "manchego",           name: "Manchego curat",        kcal: 376, carbs: 0.5,  protein: 32,  fat: 28  },
	{ id: "parmesa",            name: "Parmesà",               kcal: 431, carbs: 4.1,  protein: 38,  fat: 29  },
	{ id: "mantega",            name: "Mantega",               kcal: 717, carbs: 0.1,  protein: 0.9, fat: 81  },
	{ id: "beguda-soja",        name: "Beguda de soja",        kcal: 33,  carbs: 1.8,  protein: 3,   fat: 1.8 },
	{ id: "beguda-avena",       name: "Beguda d'avena",        kcal: 47,  carbs: 7,    protein: 1,   fat: 1.5 },

	// ── Fruites ─────────────────────────────────────────────────────
	{ id: "platan",             name: "Plàtan",                kcal: 89,  carbs: 23,   protein: 1.1, fat: 0.3 },
	{ id: "poma",               name: "Poma",                  kcal: 52,  carbs: 14,   protein: 0.3, fat: 0.2 },
	{ id: "pera",               name: "Pera",                  kcal: 57,  carbs: 15,   protein: 0.4, fat: 0.1 },
	{ id: "taronja",            name: "Taronja",               kcal: 47,  carbs: 12,   protein: 0.9, fat: 0.1 },
	{ id: "mandarina",          name: "Mandarina",             kcal: 53,  carbs: 13,   protein: 0.8, fat: 0.3 },
	{ id: "kiwi",               name: "Kiwi",                  kcal: 61,  carbs: 15,   protein: 1.1, fat: 0.5 },
	{ id: "pressec",            name: "Préssec",               kcal: 39,  carbs: 10,   protein: 0.9, fat: 0.3 },
	{ id: "raim",               name: "Raïm",                  kcal: 69,  carbs: 18,   protein: 0.7, fat: 0.2 },
	{ id: "maduixes",           name: "Maduixes",              kcal: 32,  carbs: 7.7,  protein: 0.7, fat: 0.3 },
	{ id: "nabius",             name: "Nabius",                kcal: 57,  carbs: 14,   protein: 0.7, fat: 0.3 },
	{ id: "mango",              name: "Mango",                 kcal: 60,  carbs: 15,   protein: 0.8, fat: 0.4 },
	{ id: "pinya",              name: "Pinya",                 kcal: 50,  carbs: 13,   protein: 0.5, fat: 0.1 },
	{ id: "sindria",            name: "Síndria",               kcal: 30,  carbs: 7.6,  protein: 0.6, fat: 0.2 },
	{ id: "melo",               name: "Meló",                  kcal: 34,  carbs: 8,    protein: 0.8, fat: 0.2 },
	{ id: "datils",             name: "Dàtils",                kcal: 282, carbs: 75,   protein: 2.5, fat: 0.4 },
	{ id: "avocado",            name: "Avocado",               kcal: 160, carbs: 9,    protein: 2,   fat: 15  },

	// ── Verdures & hortalisses ──────────────────────────────────────
	{ id: "tomaquet",           name: "Tomàquet",              kcal: 18,  carbs: 3.9,  protein: 0.9, fat: 0.2 },
	{ id: "enciam",             name: "Enciam",                kcal: 15,  carbs: 2.9,  protein: 1.4, fat: 0.2 },
	{ id: "cogombre",           name: "Cogombre",              kcal: 16,  carbs: 3.6,  protein: 0.7, fat: 0.1 },
	{ id: "carbasso",           name: "Carbassó",              kcal: 17,  carbs: 3.1,  protein: 1.2, fat: 0.3 },
	{ id: "xampinyons",         name: "Xampinyons",            kcal: 22,  carbs: 3.3,  protein: 3.1, fat: 0.3 },
	{ id: "espinacs",           name: "Espinacs cuits",        kcal: 23,  carbs: 3.6,  protein: 3,   fat: 0.5 },
	{ id: "alberginia",         name: "Albergínia",            kcal: 25,  carbs: 6,    protein: 1,   fat: 0.2 },
	{ id: "coliflor",           name: "Coliflor",              kcal: 25,  carbs: 5,    protein: 1.9, fat: 0.3 },
	{ id: "pebrot-vermell",     name: "Pebrot vermell",        kcal: 31,  carbs: 6,    protein: 1,   fat: 0.3 },
	{ id: "brocoli",            name: "Bròcoli cuit",          kcal: 35,  carbs: 5,    protein: 3,   fat: 0.5 },
	{ id: "ceba",               name: "Ceba",                  kcal: 40,  carbs: 9,    protein: 1.1, fat: 0.1 },
	{ id: "pastanaga",          name: "Pastanaga",             kcal: 41,  carbs: 10,   protein: 0.9, fat: 0.2 },
	{ id: "carxofa",            name: "Carxofa cuita",         kcal: 53,  carbs: 12,   protein: 2.9, fat: 0.3 },
	{ id: "pesols",             name: "Pèsols",                kcal: 81,  carbs: 14,   protein: 5.4, fat: 0.4 },
	{ id: "olives-verdes",      name: "Olives verdes",         kcal: 145, carbs: 4,    protein: 1,   fat: 15  },

	// ── Llavors, fruits secs & olis ─────────────────────────────────
	{ id: "llavors-chia",       name: "Llavors de chia",       kcal: 486, carbs: 42,   protein: 17,  fat: 31  },
	{ id: "ametlles",           name: "Ametlles",              kcal: 579, carbs: 22,   protein: 21,  fat: 50  },
	{ id: "anacards",           name: "Anacards",              kcal: 553, carbs: 30,   protein: 18,  fat: 44  },
	{ id: "cacauets",           name: "Cacauets",              kcal: 567, carbs: 16,   protein: 26,  fat: 49  },
	{ id: "pistatxos",          name: "Pistatxos",             kcal: 562, carbs: 28,   protein: 20,  fat: 45  },
	{ id: "avellanes",          name: "Avellanes",             kcal: 628, carbs: 17,   protein: 15,  fat: 61  },
	{ id: "nous",               name: "Nous",                  kcal: 654, carbs: 14,   protein: 15,  fat: 65  },
	{ id: "fruits-secs",        name: "Fruits secs mixtos",    kcal: 607, carbs: 14,   protein: 21,  fat: 55  },
	{ id: "mantega-cacauet",    name: "Mantega de cacauet",    kcal: 598, carbs: 20,   protein: 22,  fat: 50  },
	{ id: "oli-oliva",          name: "Oli d'oliva",           kcal: 884, carbs: 0,    protein: 0,   fat: 100 },

	// ── Dolços, condiments & esport ─────────────────────────────────
	{ id: "mel",                name: "Mel",                   kcal: 304, carbs: 82,   protein: 0.3, fat: 0   },
	{ id: "sucre",              name: "Sucre blanc",           kcal: 387, carbs: 100,  protein: 0,   fat: 0   },
	{ id: "xocolata-negra-85",  name: "Xocolata negra 85%",    kcal: 600, carbs: 22,   protein: 13,  fat: 52  },
	{ id: "cacau-pols",         name: "Cacau en pols",         kcal: 355, carbs: 14,   protein: 22,  fat: 24  },
	{ id: "maionesa",           name: "Maionesa",              kcal: 680, carbs: 0.6,  protein: 1,   fat: 75  },
	{ id: "salsa-soja",         name: "Salsa de soja",         kcal: 53,  carbs: 5,    protein: 8,   fat: 0.6 },
	{ id: "hummus",             name: "Hummus",                kcal: 166, carbs: 14,   protein: 8,   fat: 10  },
	{ id: "barreta-energetica", name: "Barreta energètica",    kcal: 380, carbs: 58,   protein: 10,  fat: 11  },
	{ id: "batut-proteines",    name: "Batut de proteïnes",    kcal: 120, carbs: 6,    protein: 24,  fat: 2   },
];

/** Public, immutable list of foods. */
export const FOODS = Object.freeze(FOOD_DATA.map((f) => Object.freeze(f)));

/** Parallel index of accent-stripped, lowercased names for fast search. */
const SEARCH_INDEX = FOODS.map((f) => normalize(f.name));

/** Conversion to grams used by the meal editor. */
export const UNIT_GRAMS = Object.freeze({ g: 1, ml: 1, unitat: 100 });

/**
 * Substring search by name. Accent- and case-insensitive. Stops scanning
 * once `limit` matches are collected.
 *
 * @param {string} query
 * @param {number} [limit=7]
 * @returns {ReadonlyArray<typeof FOODS[number]>}
 */
export function searchFoods(query, limit = 7) {
	const q = normalize(query);
	if (q.length < 2) return [];

	const out = [];
	for (let i = 0; i < FOODS.length; i++) {
		if (SEARCH_INDEX[i].includes(q)) {
			out.push(FOODS[i]);
			if (out.length >= limit) break;
		}
	}
	return out;
}

/**
 * Scale a food's per-100g macros to a given quantity + unit. Returns
 * integer-rounded macros, or `null` if `food` is missing.
 *
 * @param {typeof FOODS[number] | null | undefined} food
 * @param {number} quantity
 * @param {keyof typeof UNIT_GRAMS} [unit='g']
 */
export function scaleFood(food, quantity, unit = "g") {
	if (!food) return null;
	const qty = Number(quantity) || 0;
	const grams = qty * (UNIT_GRAMS[unit] ?? 1);
	const factor = grams / 100;
	return {
		kcal:    Math.round(food.kcal    * factor),
		carbs:   Math.round(food.carbs   * factor),
		protein: Math.round(food.protein * factor),
		fat:     Math.round(food.fat     * factor),
	};
}
