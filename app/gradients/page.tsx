import { headers } from "next/headers";
import { GradientsClient } from "@/components/gradients-client";
import { getFavorites } from "@/lib/actions/favorites";
import { getGradients } from "@/lib/actions/gradients";
import { auth } from "@/lib/auth";

export default async function GradientsPage() {
	const [gradients, session] = await Promise.all([
		getGradients(),
		auth.api.getSession({ headers: await headers() }),
	]);

	const initialFavorites = session?.user
		? await getFavorites(session.user.id)
		: [];

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">Gradients</h1>
				<p className="text-slate-400">
					Beautiful gradient combinations ready to use
				</p>
			</div>

			<GradientsClient
				gradients={gradients}
				initialFavorites={initialFavorites}
				isAuthenticated={!!session?.user}
			/>
		</main>
	);
}
