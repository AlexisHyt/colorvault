import { oklchaToRgba } from "chromakit-react";
import chroma from "chroma-js";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function oklchaToHex(color: string): string {
	const parsed = oklchaStrToObj(color);
	const rgba = oklchaToRgba(parsed);
	const r = Math.round(rgba.r).toString(16).padStart(2, "0");
	const g = Math.round(rgba.g).toString(16).padStart(2, "0");
	const b = Math.round(rgba.b).toString(16).padStart(2, "0");
	return `#${r}${g}${b}`.toUpperCase();
}

export function hexToOklchaStr(hex: string): string {
	const [L, C, h] = chroma(hex).oklch();
	return `oklcha(${L.toFixed(4)}, ${C.toFixed(4)}, ${Number.isNaN(h) ? 0 : h.toFixed(4)}, 1)`;
}

export function oklchaToRgbStr(color: string): string {
	const parsed = oklchaStrToObj(color);
	const rgba = oklchaToRgba(parsed);
	return `rgb(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)})`;
}

export function oklchaToHslStr(color: string): string {
	const parsed = oklchaStrToObj(color);
	const rgba = oklchaToRgba(parsed);
	const r = rgba.r / 255;
	const g = rgba.g / 255;
	const b = rgba.b / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}
	return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function oklchaStrToObj(color: string) {
	const oklchaRegex =
		/oklcha\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/;
	const match = color.match(oklchaRegex);

	if (!match) {
		return {
			L: 0.0,
			C: 0.0,
			h: 0.0,
			a: 1.0,
		};
	}

	const [_, L, C, h, a] = match;
	return {
		L: parseFloat(L),
		C: parseFloat(C),
		h: parseFloat(h),
		a: parseFloat(a),
	};
}

export function oklchaToRgbaStr(color: string) {
	const parsed = oklchaStrToObj(color);
	const rgba = oklchaToRgba(parsed);

	return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

export function capitalize(str: string | null) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string) {
	return str.toLowerCase().replace(/\s+/g, "-");
}
