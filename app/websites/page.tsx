import { WebsitesClient } from "@/components/websites-client";
import { getFavorites } from "@/lib/actions/favorites";
import { getWebsiteColors } from "@/lib/actions/website-colors";
import { getVerifiedSession } from "@/lib/auth-utils";

export default async function WebsitesPage() {
	const [websites, session] = await Promise.all([
		getWebsiteColors(),
		getVerifiedSession(),
	]);
	const isVerifiedUser = !!session?.user;

	const initialFavorites = isVerifiedUser
		? await getFavorites(session.user.id)
		: [];

	return (
		<main className="container mx-auto px-4 py-8">
			<WebsitesClient
				websites={websites}
				initialFavorites={initialFavorites}
				isAuthenticated={isVerifiedUser}
			/>
		</main>
	);
}
