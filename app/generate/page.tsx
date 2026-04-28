import type { Metadata } from "next";
import { GeneratePaletteClient } from "@/components/generate-palette-client";
import { getSavedPalettes } from "@/lib/actions/saved-palettes";
import { getVerifiedSession } from "@/lib/auth-utils";

export const metadata: Metadata = {
	title: "Web Palette Generator — ColorVault",
	description:
		"Generate a complete color palette for your website (primary, secondary, accent, neutral) and export it as CSS, Tailwind, SCSS or Figma Tokens.",
};

export default async function GeneratePage() {
	const session = await getVerifiedSession();
	const savedPalettes = session?.user
		? await getSavedPalettes(session.user.id)
		: [];

	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-4xl font-bold text-white mb-2">
					Web Palette Generator
				</h1>
				<p className="text-slate-400 max-w-2xl">
					Pick a primary color and instantly get a full palette (primary,
					secondary, accent, neutral) with shades from 50 to 950. Export as CSS
					variables, Tailwind v3/v4, SCSS or Figma Tokens.
				</p>
			</div>

			<GeneratePaletteClient
				isAuthenticated={!!session?.user}
				savedPalettes={savedPalettes}
			/>
		</main>
	);
}
