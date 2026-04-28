import { notFound } from "next/navigation";
import { PaletteDetailClient } from "@/components/palette-detail-client";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { getFavorites } from "@/lib/actions/favorites";
import { getVerifiedSession } from "@/lib/auth-utils";

interface Props {
	params: Promise<{ slug: string }>;
}

export default async function PalettePage({ params }: Props) {
	const { slug } = await params;
	const [palettes, session] = await Promise.all([
		getPalettes(),
		getVerifiedSession(),
	]);
	const isVerifiedUser = !!session?.user;
	const palette = palettes.find((p) => p.slug === slug);

	if (!palette) {
		notFound();
	}

	const initialFavorites = isVerifiedUser
		? await getFavorites(session.user.id)
		: [];

	return (
		<PaletteDetailClient
			palette={palette}
			initialFavorites={initialFavorites}
			isAuthenticated={isVerifiedUser}
		/>
	);
}
