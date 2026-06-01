import chroma from "chroma-js";

export type ColorFormats = {
	hex: string;
	rgb: string;
	rgba: string;
	hsl: string;
	hsla: string;
	hsv: string;
	cmyk: string;
	lab: string;
	lch: string;
	oklch: string;
};

export type ColorConversionResult = {
	formats: ColorFormats;
	previewHex: string;
};

function round(value: number, decimals = 2) {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function formatNumber(value: number, decimals = 2) {
	if (!Number.isFinite(value)) return "0";
	return round(value, decimals).toString();
}

function formatPercent(value: number, decimals = 1) {
	return `${formatNumber(value * 100, decimals)}%`;
}

function normalizeHue(value: number) {
	if (!Number.isFinite(value)) return 0;
	return ((value % 360) + 360) % 360;
}

function splitFunctionArguments(rawArgs: string) {
	return rawArgs
		.trim()
		.replace(/\s+/g, " ")
		.split(/\s*,\s*|\s+/)
		.filter(Boolean);
}

function parseHsvInput(input: string) {
	const match = input.trim().match(/^hsv\(\s*(.*?)\s*\)$/i);
	if (!match) return null;

	const [hRaw, sRaw, vRaw] = splitFunctionArguments(match[1]);
	if (!hRaw || !sRaw || !vRaw) return null;

	const h = Number.parseFloat(hRaw);
	const sValue = Number.parseFloat(sRaw.replace("%", ""));
	const vValue = Number.parseFloat(vRaw.replace("%", ""));
	if (![h, sValue, vValue].every((value) => Number.isFinite(value)))
		return null;

	const s = sRaw.includes("%") ? sValue / 100 : sValue;
	const v = vRaw.includes("%") ? vValue / 100 : vValue;
	return chroma.hsv(normalizeHue(h), clamp(s, 0, 1), clamp(v, 0, 1));
}

function parseCmykInput(input: string) {
	const match = input.trim().match(/^cmyk\(\s*(.*?)\s*\)$/i);
	if (!match) return null;

	const [cRaw, mRaw, yRaw, kRaw] = splitFunctionArguments(match[1]);
	if (!cRaw || !mRaw || !yRaw || !kRaw) return null;

	const cValue = Number.parseFloat(cRaw.replace("%", ""));
	const mValue = Number.parseFloat(mRaw.replace("%", ""));
	const yValue = Number.parseFloat(yRaw.replace("%", ""));
	const kValue = Number.parseFloat(kRaw.replace("%", ""));
	if (
		![cValue, mValue, yValue, kValue].every((value) => Number.isFinite(value))
	) {
		return null;
	}

	const c = cRaw.includes("%") ? cValue / 100 : cValue;
	const m = mRaw.includes("%") ? mValue / 100 : mValue;
	const y = yRaw.includes("%") ? yValue / 100 : yValue;
	const k = kRaw.includes("%") ? kValue / 100 : kValue;
	return chroma.cmyk(
		clamp(c, 0, 1),
		clamp(m, 0, 1),
		clamp(y, 0, 1),
		clamp(k, 0, 1),
	);
}

function parseColor(input: string) {
	const value = input.trim();
	if (!value) {
		throw new Error("Please enter a color value.");
	}

	const hsvColor = parseHsvInput(value);
	if (hsvColor) return hsvColor;

	const cmykColor = parseCmykInput(value);
	if (cmykColor) return cmykColor;

	if (!chroma.valid(value)) {
		throw new Error(
			"Invalid color. Try HEX, RGB(A), HSL(A), HSV, CMYK, LAB, LCH or OKLCH.",
		);
	}

	return chroma(value);
}

export function convertColor(input: string): ColorConversionResult {
	const color = parseColor(input);
	const [rRaw, gRaw, bRaw, aRaw] = color.rgba();
	const r = Math.round(clamp(rRaw, 0, 255));
	const g = Math.round(clamp(gRaw, 0, 255));
	const b = Math.round(clamp(bRaw, 0, 255));
	const alpha = clamp(aRaw, 0, 1);

	const [hHslRaw, sHslRaw, lHslRaw] = color.hsl();
	const [hHsvRaw, sHsvRaw, vHsvRaw] = color.hsv();
	const [cRaw, mRaw, yRaw, kRaw] = color.cmyk();
	const [lLabRaw, aLabRaw, bLabRaw] = color.lab();
	const [lLchRaw, cLchRaw, hLchRaw] = color.lch();
	const [lOklchRaw, cOklchRaw, hOklchRaw] = color.oklch();

	const hHsl = normalizeHue(hHslRaw);
	const hHsv = normalizeHue(hHsvRaw);
	const hLch = normalizeHue(hLchRaw);
	const hOklch = normalizeHue(hOklchRaw);

	return {
		previewHex: chroma.rgb(r, g, b).hex(),
		formats: {
			hex: chroma.rgb(r, g, b).hex().toUpperCase(),
			rgb: `rgb(${r}, ${g}, ${b})`,
			rgba: `rgba(${r}, ${g}, ${b}, ${formatNumber(alpha, 3)})`,
			hsl: `hsl(${formatNumber(hHsl, 1)} ${formatPercent(sHslRaw, 1)} ${formatPercent(lHslRaw, 1)})`,
			hsla: `hsla(${formatNumber(hHsl, 1)} ${formatPercent(sHslRaw, 1)} ${formatPercent(lHslRaw, 1)} / ${formatNumber(alpha, 3)})`,
			hsv: `hsv(${formatNumber(hHsv, 1)} ${formatPercent(sHsvRaw, 1)} ${formatPercent(vHsvRaw, 1)})`,
			cmyk: `cmyk(${formatPercent(cRaw, 1)}, ${formatPercent(mRaw, 1)}, ${formatPercent(yRaw, 1)}, ${formatPercent(kRaw, 1)})`,
			lab: `lab(${formatNumber(lLabRaw, 2)}% ${formatNumber(aLabRaw, 2)} ${formatNumber(bLabRaw, 2)})`,
			lch: `lch(${formatNumber(lLchRaw, 2)}% ${formatNumber(cLchRaw, 2)} ${formatNumber(hLch, 2)})`,
			oklch: `oklch(${formatNumber(lOklchRaw * 100, 2)}% ${formatNumber(cOklchRaw, 4)} ${formatNumber(hOklch, 2)})`,
		},
	};
}
