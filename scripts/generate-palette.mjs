import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Configuration ────────────────────────────────────────────────────────────
const config = {
	// Palette metadata
	name: "Bootstrap",
	description: "Bootstrap 5.3 color palette (all color families)",
	category: "main",
	outputFile: "palette-bootstrap.json",

	// Color families: each key becomes a row name, each nested key is a shade label
	colors: {
		blue: {
			100: "#cfe2ff",
			200: "#9ec5fe",
			300: "#6ea8fe",
			400: "#3d8bfd",
			500: "#0d6efd",
			600: "#0a58ca",
			700: "#084298",
			800: "#052c65",
			900: "#031633",
		},
		indigo: {
			100: "#e0cffc",
			200: "#c29ffa",
			300: "#a370f7",
			400: "#8540f5",
			500: "#6610f2",
			600: "#520dc2",
			700: "#3d0a91",
			800: "#290661",
			900: "#140330",
		},
		purple: {
			100: "#e2d9f3",
			200: "#c5b3e6",
			300: "#a98eda",
			400: "#8c68cd",
			500: "#6f42c1",
			600: "#59359a",
			700: "#432874",
			800: "#2c1a4d",
			900: "#160d27",
		},
		pink: {
			100: "#f7d6e6",
			200: "#efadd0",
			300: "#e685ba",
			400: "#de5ca3",
			500: "#d63384",
			600: "#ab296a",
			700: "#801f4f",
			800: "#561435",
			900: "#2b0a1a",
		},
		red: {
			100: "#f8d7da",
			200: "#f1aeb5",
			300: "#ea868f",
			400: "#e35d6a",
			500: "#dc3545",
			600: "#b02a37",
			700: "#842029",
			800: "#58151c",
			900: "#2c0b0e",
		},
		orange: {
			100: "#ffe5d0",
			200: "#fecba1",
			300: "#feb272",
			400: "#fd9843",
			500: "#fd7e14",
			600: "#ca6510",
			700: "#984c0c",
			800: "#653208",
			900: "#331904",
		},
		yellow: {
			100: "#fff3cd",
			200: "#ffe69c",
			300: "#ffda6a",
			400: "#ffcd39",
			500: "#ffc107",
			600: "#cc9a06",
			700: "#997404",
			800: "#664d03",
			900: "#332701",
		},
		green: {
			100: "#d1e7dd",
			200: "#a3cfbb",
			300: "#75b798",
			400: "#479f76",
			500: "#198754",
			600: "#146c43",
			700: "#0f5132",
			800: "#0a3622",
			900: "#051b11",
		},
		teal: {
			100: "#d2f4ea",
			200: "#a6e9d5",
			300: "#79dfc1",
			400: "#4dd4ac",
			500: "#20c997",
			600: "#1aa179",
			700: "#13795b",
			800: "#0d503c",
			900: "#06281e",
		},
		cyan: {
			100: "#cff4fc",
			200: "#9eeaf9",
			300: "#6edff6",
			400: "#3dd5f3",
			500: "#0dcaf0",
			600: "#0aa2c0",
			700: "#087990",
			800: "#055160",
			900: "#032830",
		},
		gray: {
			100: "#f8f9fa",
			200: "#e9ecef",
			300: "#dee2e6",
			400: "#ced4da",
			500: "#adb5bd",
			600: "#6c757d",
			700: "#495057",
			800: "#343a40",
			900: "#212529",
		},
	},
};
// ─────────────────────────────────────────────────────────────────────────────

// Convert hex to linear RGB
function hexToLinear(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	return [r, g, b].map((c) =>
		c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
	);
}

// Linear RGB to XYZ (D65)
function linearToXYZ(r, g, b) {
	return [
		r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
		r * 0.2126729 + g * 0.7151522 + b * 0.072175,
		r * 0.0193339 + g * 0.119192 + b * 0.9503041,
	];
}

// XYZ to OKLab
function xyzToOklab(x, y, z) {
	const l = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
	const m = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
	const s = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

// OKLab to OKLCH
function oklabToOklch(L, a, b) {
	const C = Math.sqrt(a * a + b * b);
	let H = Math.atan2(b, a) * (180 / Math.PI);
	if (H < 0) H += 360;
	return [L, C, H];
}

function hexToOklch(hex) {
	const [r, g, b] = hexToLinear(hex);
	const [x, y, z] = linearToXYZ(r, g, b);
	const [L, a, ob] = xyzToOklab(x, y, z);
	const [lch_L, lch_C, lch_H] = oklabToOklch(L, a, ob);
	return [
		Math.round(lch_L * 1000) / 1000,
		Math.round(lch_C * 1000) / 1000,
		Math.round(lch_H * 1000) / 1000,
	];
}

// Build palette JSON from config
const rows = Object.entries(config.colors).map(([colorName, shades]) => {
	const colors = Object.entries(shades).map(([shade, hex]) => {
		const [L, C, H] = hexToOklch(hex);
		return {
			name: `${colorName}-${shade}`,
			color: `oklcha(${L}, ${C}, ${H}, 1)`,
		};
	});
	return { name: colorName, colors };
});

const palette = {
	palette: {
		name: config.name,
		description: config.description,
		category: config.category,
	},
	rows,
};

const outputPath = join(__dirname, "palettes", config.outputFile);
writeFileSync(outputPath, JSON.stringify(palette, null, 2));
console.log("Generated:", outputPath);
