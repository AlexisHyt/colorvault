import type { Metadata } from "next";
import { ColorConverterClient } from "@/components/color-converter-client";

export const metadata: Metadata = {
	title: "Color Converter - ColorVault",
	description:
		"Convert any color between HEX, RGB, RGBA, HSL, HSLA, HSV, CMYK, LAB, LCH and OKLCH.",
};

export default function ConvertPage() {
	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-4xl font-bold text-white mb-2">Color Converter</h1>
				<p className="text-slate-400 max-w-2xl">
					Convert colors instantly in all popular formats and copy the result
					with one click.
				</p>
			</div>

			<ColorConverterClient />
		</main>
	);
}
