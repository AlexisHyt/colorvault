import { headers } from "next/headers";
import { WebsitesClient } from "@/components/websites-client";
import { getFavorites } from "@/lib/actions/favorites";
import { getWebsiteColors } from "@/lib/actions/website-colors";
import { auth } from "@/lib/auth";

export default async function WebsitesPage() {
	const [websites, session] = await Promise.all([
		getWebsiteColors(),
		auth.api.getSession({ headers: await headers() }),
	]);

	const initialFavorites = session?.user
		? await getFavorites(session.user.id)
		: [];

	return (
		<main className="container mx-auto px-4 py-8">
			<WebsitesClient
				websites={websites}
				initialFavorites={initialFavorites}
				isAuthenticated={!!session?.user}
			/>
		</main>
	);
}
