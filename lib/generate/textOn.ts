import { luminance } from "@/lib/generate/luminance";

export function textOn(hex: string) {
	return luminance(hex) > 0.5 ? "#1e293b" : "#f8fafc";
}
