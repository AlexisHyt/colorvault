import type { Metadata } from "next";
import { HarmoniesClient } from "@/components/harmonies-client";

export const metadata: Metadata = {
	title: "Color Harmonies — ColorVault",
	description:
		"Visualize chromatic harmonies (complementary, triadic, analogous, split-complementary) of any color on an interactive color wheel.",
};

export default function HarmoniesPage() {
	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-4xl font-bold text-white mb-2">Color Harmonies</h1>
				<p className="text-slate-400 max-w-2xl">
					Pick a base color and explore its harmonies on the color wheel —
					complementary, triadic, analogous, split-complementary, or tetradic.
					Click any color to copy its hex code.
				</p>
			</div>
			<HarmoniesClient />
		</main>
	);
}
