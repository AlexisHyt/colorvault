/**
 * Colorblind simulation using LMS cone response matrices.
 * Based on Viénot, Brettel & Mollon (1999) + Machado et al. (2009).
 */

export type ColorblindType =
	| "normal"
	| "deuteranopia"
	| "protanopia"
	| "tritanopia";

export const COLORBLIND_LABELS: Record<ColorblindType, string> = {
	normal: "Normal vision",
	deuteranopia: "Deuteranopia (green-blind)",
	protanopia: "Protanopia (red-blind)",
	tritanopia: "Tritanopia (blue-blind)",
};

// sRGB → linear RGB
function toLinear(c: number): number {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// linear RGB → sRGB
function toSRGB(c: number): number {
	return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function hexToLinearRGB(hex: string): [number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	return [toLinear(r), toLinear(g), toLinear(b)];
}

function linearRGBToHex(r: number, g: number, b: number): string {
	const clamp = (v: number) => Math.max(0, Math.min(1, v));
	const toInt = (v: number) => Math.round(clamp(toSRGB(v)) * 255);
	return `#${toInt(r).toString(16).padStart(2, "0")}${toInt(g).toString(16).padStart(2, "0")}${toInt(b).toString(16).padStart(2, "0")}`;
}

// RGB → LMS (Hunt-Pointer-Estevez, D65)
function rgbToLMS(r: number, g: number, b: number): [number, number, number] {
	return [
		0.4002 * r + 0.7076 * g - 0.0808 * b,
		-0.2263 * r + 1.1653 * g + 0.0457 * b,
		0.9182 * b,
	];
}

// LMS → RGB
function lmsToRGB(l: number, m: number, s: number): [number, number, number] {
	return [
		3.2406 * l - 1.5372 * m - 0.4986 * s,
		-0.9689 * l + 1.8758 * m + 0.0415 * s,
		0.0557 * l - 0.204 * m + 1.057 * s,
	];
}

const MATRICES: Record<
	Exclude<ColorblindType, "normal">,
	[number, number, number, number, number, number, number, number, number]
> = {
	// Deuteranopia: missing M cones — project M onto L & S plane
	deuteranopia: [1, 0, 0, 0.494207, 0, 1.24827, 0, 0, 1],
	// Protanopia: missing L cones — project L onto M & S plane
	protanopia: [0, 2.02344, -2.52581, 0, 1, 0, 0, 0, 1],
	// Tritanopia: missing S cones — project S onto L & M plane
	tritanopia: [1, 0, 0, 0, 1, 0, -0.395913, 0.801109, 0],
};

export function simulateColorblind(hex: string, type: ColorblindType): string {
	if (type === "normal") return hex;

	const [lr, lg, lb] = hexToLinearRGB(hex);
	const [l, m, s] = rgbToLMS(lr, lg, lb);

	const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = MATRICES[type];

	const sl = m00 * l + m01 * m + m02 * s;
	const sm = m10 * l + m11 * m + m12 * s;
	const ss = m20 * l + m21 * m + m22 * s;

	const [r, g, b] = lmsToRGB(sl, sm, ss);
	return linearRGBToHex(r, g, b);
}
