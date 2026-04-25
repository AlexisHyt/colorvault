import { GradientsClient } from "@/components/gradients-client";
import { getGradients } from "@/lib/actions/gradients";

export default async function GradientsPage() {
	const gradients = await getGradients();

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">Gradients</h1>
				<p className="text-slate-400">
					Beautiful gradient combinations ready to use
				</p>
			</div>

			<GradientsClient gradients={gradients} />
		</main>
	);
}
