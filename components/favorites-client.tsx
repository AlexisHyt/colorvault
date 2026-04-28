"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Card } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import type { FavoriteItem } from "@/lib/actions/favorites";
import {
	deleteSavedPalette,
	type SavedPalette,
} from "@/lib/actions/saved-palettes";
import { oklchaToHex, oklchaToRgbaStr } from "@/lib/utils";

interface Props {
	items: FavoriteItem[];
	savedPalettes: SavedPalette[];
}

export function FavoritesClient({
	items,
	savedPalettes: initialSavedPalettes,
}: Props) {
	const [savedPalettes, setSavedPalettes] = useState(initialSavedPalettes);

	const seedFavorites = items.map((item) => ({
		id: item.favoriteId,
		userId: "",
		colorId: item.type === "color" ? item.id : null,
		gradientId: item.type === "gradient" ? item.id : null,
		websiteColorId: item.type === "website" ? item.id : null,
		createdAt: "",
	}));

	const { favorites, isFavorite, toggleFavorite } = useFavorites(seedFavorites);

	const activeIds = new Set(favorites.map((f) => f.id));
	const activeItems = items.filter((item) => activeIds.has(item.favoriteId));

	const favoriteColors = activeItems.filter((i) => i.type === "color");
	const favoriteGradients = activeItems.filter((i) => i.type === "gradient");
	const favoriteWebsites = activeItems.filter((i) => i.type === "website");

	const handleDeletePalette = async (name: string) => {
		await deleteSavedPalette(name);
		setSavedPalettes((prev) => prev.filter((p) => p.name !== name));
	};

	const isEmpty = activeItems.length === 0 && savedPalettes.length === 0;

	if (isEmpty) {
		return (
			<div className="text-center py-12 text-slate-400">
				<Heart size={48} className="mx-auto mb-4 opacity-50" />
				<p className="text-lg mb-4">No favorites yet</p>
				<p className="text-sm mb-8">
					Start adding colors, gradients and websites to your favorites!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-12">
			{/* Generated Palettes */}
			{savedPalettes.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold text-white mb-4">
						Generated Palettes ({savedPalettes.length})
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{savedPalettes.map((palette) => {
							const roles = [
								{ label: "Primary", color: palette.primaryColor },
								{ label: "Secondary", color: palette.secondaryColor },
								{ label: "Accent", color: palette.accentColor },
								{ label: "Neutral", color: palette.neutralColor },
							];
							return (
								<Card
									key={palette.id}
									className="overflow-hidden border-slate-700 bg-slate-800/50"
								>
									<div className="flex h-12">
										{roles.map(({ label, color }) => (
											<div
												key={label}
												className="flex-1"
												style={{ backgroundColor: oklchaToHex(color) }}
												title={`${label}: ${oklchaToHex(color)}`}
											/>
										))}
									</div>
									<div className="p-4 space-y-3">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-white truncate pr-2">
												{palette.name}
											</h3>
											<button
												type="button"
												onClick={() => handleDeletePalette(palette.name)}
												className="p-1.5 rounded-full transition-colors cursor-pointer text-red-500 hover:text-red-400 shrink-0"
												aria-label="Remove palette"
											>
												<Heart size={18} className="fill-red-500" />
											</button>
										</div>
										<div className="space-y-1.5">
											{roles.map(({ label, color }) => {
												const hex = oklchaToHex(color);
												return (
													<div key={label} className="flex items-center gap-2">
														<div
															className="w-5 h-5 rounded border border-slate-600 shrink-0"
															style={{ backgroundColor: hex }}
														/>
														<span className="text-xs text-slate-400 w-16 shrink-0">
															{label}
														</span>
														<CopyButton value={hex} label={hex} />
													</div>
												);
											})}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Colors */}
			{favoriteColors.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold text-white mb-4">
						Colors ({favoriteColors.length})
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
						{favoriteColors.map((item) => {
							if (item.type !== "color") return null;
							const hex = oklchaToHex(item.color);
							const rgba = oklchaToRgbaStr(item.color);
							return (
								<Card
									key={item.favoriteId}
									className="overflow-hidden border-slate-700 bg-slate-800/50"
								>
									<div
										className="w-full h-12"
										style={{ backgroundColor: rgba }}
									/>
									<div className="p-4 space-y-2">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold text-white">{item.name}</h3>
											<FavoriteButton
												colorId={item.id}
												isFavorite={isFavorite(item.id, undefined, undefined)}
												isAuthenticated={true}
												onToggle={toggleFavorite}
											/>
										</div>
										<CopyButton value={hex} label="HEX" />
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Gradients */}
			{favoriteGradients.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold text-white mb-4">
						Gradients ({favoriteGradients.length})
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{favoriteGradients.map((item) => {
							if (item.type !== "gradient") return null;
							return (
								<Card
									key={item.favoriteId}
									className="overflow-hidden border-slate-700 bg-slate-800/50"
								>
									<div className="relative">
										<div
											className="w-full h-32"
											style={{ background: item.gradientString }}
										/>
										<div className="absolute top-2 right-2">
											<FavoriteButton
												gradientId={item.id}
												isFavorite={isFavorite(undefined, item.id, undefined)}
												isAuthenticated={true}
												onToggle={toggleFavorite}
												className="bg-black/30 hover:bg-black/50"
											/>
										</div>
									</div>
									<div className="p-4">
										<h3 className="font-semibold text-white mb-2">
											{item.name}
										</h3>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded border border-slate-600 shrink-0"
													style={{ backgroundColor: item.colorStart }}
												/>
												<CopyButton value={item.colorStart} label="Start" />
											</div>
											{item.colorMid && (
												<div className="flex items-center gap-2">
													<div
														className="w-6 h-6 rounded border border-slate-600 shrink-0"
														style={{ backgroundColor: item.colorMid }}
													/>
													<CopyButton value={item.colorMid} label="Mid" />
												</div>
											)}
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded border border-slate-600 shrink-0"
													style={{ backgroundColor: item.colorEnd }}
												/>
												<CopyButton value={item.colorEnd} label="End" />
											</div>
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* Websites */}
			{favoriteWebsites.length > 0 && (
				<div>
					<h2 className="text-2xl font-semibold text-white mb-4">
						Websites ({favoriteWebsites.length})
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{favoriteWebsites.map((item) => {
							if (item.type !== "website") return null;
							return (
								<Card
									key={item.favoriteId}
									className="overflow-hidden border-slate-700 bg-slate-800/50"
								>
									<div className="p-4">
										<div className="flex items-start justify-between mb-3">
											<h3 className="font-semibold text-white">
												{item.websiteName}
											</h3>
											<FavoriteButton
												websiteColorId={item.id}
												isFavorite={isFavorite(undefined, undefined, item.id)}
												isAuthenticated={true}
												onToggle={toggleFavorite}
											/>
										</div>
										{item.description && (
											<p className="text-xs text-slate-400 mb-3">
												{item.description}
											</p>
										)}
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded border border-slate-600 shrink-0"
													style={{
														backgroundColor: oklchaToHex(item.primaryColor),
													}}
												/>
												<CopyButton
													value={oklchaToHex(item.primaryColor)}
													label="Primary"
												/>
											</div>
											{item.secondaryColor && (
												<div className="flex items-center gap-2">
													<div
														className="w-6 h-6 rounded border border-slate-600 shrink-0"
														style={{
															backgroundColor: oklchaToHex(item.secondaryColor),
														}}
													/>
													<CopyButton
														value={oklchaToHex(item.secondaryColor)}
														label="Secondary"
													/>
												</div>
											)}
											{item.accentColor && (
												<div className="flex items-center gap-2">
													<div
														className="w-6 h-6 rounded border border-slate-600 shrink-0"
														style={{
															backgroundColor: oklchaToHex(item.accentColor),
														}}
													/>
													<CopyButton
														value={oklchaToHex(item.accentColor)}
														label="Accent"
													/>
												</div>
											)}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
