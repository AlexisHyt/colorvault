import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaletteDetailClient } from "@/components/palette-detail-client";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { getFavorites } from "@/lib/actions/favorites";
import { getVerifiedSession } from "@/lib/auth-utils";

interface Props {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const palettes = await getPalettes();
	const palette = palettes.find((p) => p.slug === slug);

	if (!palette) {
		return {
			title: "Palette Not Found — ColorVault",
			description: "The palette you're looking for could not be found.",
		};
	}

	const colorCount = palette.rows.flatMap((row) => row.colors).length;

	return {
		title: `${palette.name} Palette — ColorVault`,
		description:
			palette.description ||
			`Explore the ${palette.name} color palette with ${colorCount} colors. Copy colors in HEX, RGB, RGBA, or HSL format.`,
		openGraph: {
			title: `${palette.name} Palette — ColorVault`,
			description:
				palette.description ||
				`Explore the ${palette.name} color palette with ${colorCount} colors.`,
			url: `https://colorvault.alexishayat.me/palettes/${slug}`,
			type: "website",
		},
		twitter: {
			card: "summary",
			title: `${palette.name} Palette — ColorVault`,
			description:
				palette.description ||
				`Explore the ${palette.name} color palette with ${colorCount} colors.`,
		},
	};
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
