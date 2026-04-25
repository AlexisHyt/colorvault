import { headers } from 'next/headers';
import { notFound } from "next/navigation";
import { auth } from '@/lib/auth';
import { getFavorites } from '@/lib/actions/favorites';
import { PaletteDetailClient } from "@/components/palette-detail-client";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";

interface Props {
	params: Promise<{ slug: string }>;
}

export default async function PalettePage({ params }: Props) {
	const { slug } = await params;
	const [palettes, session] = await Promise.all([
		getPalettes(),
		auth.api.getSession({ headers: await headers() }),
	]);
	const palette = palettes.find((p) => p.slug === slug);

	if (!palette) {
		notFound();
	}

	const initialFavorites = session?.user
		? await getFavorites(session.user.id)
		: [];

	return (
		<PaletteDetailClient
			palette={palette}
			initialFavorites={initialFavorites}
			isAuthenticated={!!session?.user}
		/>
	);
}
