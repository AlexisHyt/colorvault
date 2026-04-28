import chroma from "chroma-js";
import type { PaletteScale } from "@/lib/generate-palette";

export type WcagLevel = "Fail" | "AA" | "AAA";

/** WCAG 2.1 contrast ratio between two hex colors */
export function contrastRatio(hex1: string, hex2: string): number {
	return chroma.contrast(hex1, hex2);
}

/** WCAG level for a given ratio */
export function wcagLevel(ratio: number, largeText: boolean): WcagLevel {
	const aa = largeText ? 3 : 4.5;
	const aaa = largeText ? 4.5 : 7;
	if (ratio >= aaa) return "AAA";
	if (ratio >= aa) return "AA";
	return "Fail";
}

/** Predefined shade pairs [foreground shade, background shade] */
export const WCAG_PAIRS: [keyof PaletteScale, keyof PaletteScale][] = [
	[950, 50],
	[900, 50],
	[900, 100],
	[800, 100],
	[800, 200],
	[700, 200],
	[50, 900],
	[100, 800],
];
