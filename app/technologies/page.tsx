import type { Metadata } from "next";
import { TechnologiesClient } from "@/components/technologies-client";
import { getFavorites } from "@/lib/actions/favorites";
import { getTechnologyColors } from "@/lib/actions/technology-colors";
import { getVerifiedSession } from "@/lib/auth-utils";

export const metadata: Metadata = {
	title: "Technology Brand Colors — ColorVault",
	description:
		"Explore the official brand colors of popular programming languages, frameworks, databases, tools and platforms. Based on the Simple Icons project.",
	openGraph: {
		title: "Technology Brand Colors — ColorVault",
		description:
			"Explore the official brand colors of popular programming languages, frameworks, databases, tools and platforms.",
		url: "https://colorvault.alexishayat.me/technologies",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Technology Brand Colors — ColorVault",
		description:
			"Explore the official brand colors of popular programming languages, frameworks, databases and tools.",
	},
};

export default async function TechnologiesPage() {
	const [technologies, session] = await Promise.all([
		getTechnologyColors(),
		getVerifiedSession(),
	]);
	const isVerifiedUser = !!session?.user;

	const initialFavorites = isVerifiedUser
		? await getFavorites(session.user.id)
		: [];

	return (
		<main className="container mx-auto px-4 py-8">
			<TechnologiesClient
				technologies={technologies}
				initialFavorites={initialFavorites}
				isAuthenticated={isVerifiedUser}
			/>
		</main>
	);
}
