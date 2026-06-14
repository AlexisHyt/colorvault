import { useCallback, useState } from "react";
import {
	addFavorite,
	type RawFavorite,
	removeFavorite,
} from "@/lib/actions/favorites";

export function useFavorites(initialFavorites: RawFavorite[] = []) {
	const [favorites, setFavorites] = useState<RawFavorite[]>(initialFavorites);

	const isFavorite = useCallback(
		(
			colorId?: number,
			gradientId?: number,
			websiteColorId?: number,
			technologyColorId?: number,
		) => {
			return favorites.some(
				(fav) =>
					(colorId !== undefined && fav.colorId === colorId) ||
					(gradientId !== undefined && fav.gradientId === gradientId) ||
					(websiteColorId !== undefined &&
						fav.websiteColorId === websiteColorId) ||
					(technologyColorId !== undefined &&
						fav.technologyColorId === technologyColorId),
			);
		},
		[favorites],
	);

	const toggleFavorite = useCallback(
		async (
			colorId?: number,
			gradientId?: number,
			websiteColorId?: number,
			technologyColorId?: number,
		) => {
			const existing = favorites.find(
				(fav) =>
					(colorId !== undefined && fav.colorId === colorId) ||
					(gradientId !== undefined && fav.gradientId === gradientId) ||
					(websiteColorId !== undefined &&
						fav.websiteColorId === websiteColorId) ||
					(technologyColorId !== undefined &&
						fav.technologyColorId === technologyColorId),
			);

			if (existing) {
				// Optimistic remove
				setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
				try {
					await removeFavorite(existing.id);
				} catch {
					// Rollback on error
					setFavorites((prev) => [...prev, existing]);
				}
			} else {
				try {
					const created = await addFavorite({
						colorId,
						gradientId,
						websiteColorId,
						technologyColorId,
					});
					setFavorites((prev) => [...prev, created]);
				} catch (err) {
					console.error("Failed to add favorite", err);
				}
			}
		},
		[favorites],
	);

	return { favorites, isFavorite, toggleFavorite };
}
