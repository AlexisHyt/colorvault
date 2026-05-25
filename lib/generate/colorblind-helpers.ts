import { simulateColorBlindness } from "@/lib/generate/colorblind";

export type ColorblindType =
	| "normal"
	| "protanopia"
	| "deuteranopia"
	| "tritanopia";

export const COLORBLIND_LABELS: Record<ColorblindType, string> = {
	normal: "Normal vision",
	protanopia: "Protanopia (no red)",
	deuteranopia: "Deuteranopia (no green)",
	tritanopia: "Tritanopia (no blue)",
};

export const COLORBLIND_ORDER: ColorblindType[] = [
	"normal",
	"protanopia",
	"deuteranopia",
	"tritanopia",
];

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function hexToRgb(hex: string): [number, number, number] | null {
	const match = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (!match) return null;
	let h = match[1];
	if (h.length === 3) {
		h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	}
	const int = parseInt(h, 16);
	return [(int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
	return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function simulateColorblind(hex: string, type: ColorblindType): string {
	if (!HEX_COLOR_RE.test(hex)) return hex;
	if (type === "normal") return hex.toLowerCase();

	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const [r, g, b] = simulateColorBlindness(rgb, type);
	return rgbToHex(r, g, b);
}
