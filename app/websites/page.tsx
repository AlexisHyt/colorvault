import type { Metadata } from "next";
import { WebsitesClient } from "@/components/websites-client";
import { getFavorites } from "@/lib/actions/favorites";
import { getWebsiteColors } from "@/lib/actions/website-colors";
import { getVerifiedSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Brand Colors from Websites — ColorVault",
	description:
		"Explore the primary brand colors of famous websites and companies. Discover color schemes used by top brands.",
	openGraph: {
		title: "Brand Colors from Websites — ColorVault",
		description:
			"Explore the primary brand colors of famous websites and companies. Discover color schemes used by top brands.",
		url: "https://colorvault.alexishayat.me/websites",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Brand Colors from Websites — ColorVault",
		description:
			"Explore the primary brand colors of famous websites and companies.",
	},
};

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
