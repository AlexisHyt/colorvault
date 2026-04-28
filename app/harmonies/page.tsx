import type { Metadata } from "next";
import { HarmoniesClient } from "@/components/harmonies-client";

export const metadata: Metadata = {
	title: "Harmonies de couleurs — ColorVault",
	description:
		"Visualisez les harmonies chromatiques (complémentaires, triadiques, analogues, split-complémentaires) de n'importe quelle couleur sur une roue chromatique interactive.",
};

export default function HarmoniesPage() {
	return (
		<main className="container mx-auto px-4 py-10">
			<div className="mb-10">
				<h1 className="text-4xl font-bold text-white mb-2">
					Harmonies de couleurs
				</h1>
				<p className="text-slate-400 max-w-2xl">
					Choisissez une couleur de base et explorez ses harmonies sur la roue
					chromatique — complémentaire, triadique, analogue,
					split-complémentaire ou tétradique. Cliquez sur chaque couleur pour
					copier son code hex.
				</p>
			</div>
			<HarmoniesClient />
		</main>
	);
}
