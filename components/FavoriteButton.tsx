"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
	colorId?: number;
	gradientId?: number;
	websiteColorId?: number;
	isFavorite: boolean;
	isAuthenticated: boolean;
	onToggle: (
		colorId?: number,
		gradientId?: number,
		websiteColorId?: number,
	) => void;
	className?: string;
}

export function FavoriteButton({
	colorId,
	gradientId,
	websiteColorId,
	isFavorite,
	isAuthenticated,
	onToggle,
	className,
}: Props) {
	if (!isAuthenticated) return null;

	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onToggle(colorId, gradientId, websiteColorId);
			}}
			className={cn(
				"p-1.5 rounded-full transition-colors cursor-pointer",
				isFavorite
					? "text-red-500 hover:text-red-400"
					: "text-slate-400 hover:text-red-400",
				className,
			)}
			aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
		>
			<Heart
				size={18}
				className={cn(
					"transition-all",
					isFavorite ? "fill-red-500" : "fill-none",
				)}
			/>
		</button>
	);
}
