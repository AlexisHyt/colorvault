"use client";

import { LucideArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { WebsitePreview } from "@/components/WebsitePreview";
import { useFavorites } from "@/hooks/use-favorites";
import type { RawFavorite } from "@/lib/actions/favorites";
import type { Color, ColorPaletteWithColors } from "@/lib/types";
import {
	capitalize,
	cn,
	oklchaToHex,
	oklchaToHslStr,
	oklchaToRgbaStr,
	oklchaToRgbStr,
} from "@/lib/utils";

interface Props {
	palette: ColorPaletteWithColors;
	enableSearch?: boolean;
	enableBackArrow?: boolean;
	initialFavorites?: RawFavorite[];
	isAuthenticated?: boolean;
	enableFavorites?: boolean;
}

export function PaletteDetailClient({
	palette,
	enableSearch = false,
	enableBackArrow = true,
	initialFavorites = [],
	isAuthenticated = false,
	enableFavorites = true,
}: Props) {
	const allColors: Color[] = palette.rows.flatMap((row) => row.colors);
	const [selectedColor, setSelectedColor] = useState<Color>(allColors[0]);
	const [searchTerm, setSearchTerm] = useState("");
	const { isFavorite, toggleFavorite } = useFavorites(initialFavorites);

	const normalizedSearchTerm = searchTerm.trim().toLowerCase();
	const filteredRows =
		enableSearch && normalizedSearchTerm
			? palette.rows.filter((row) =>
					(row.name ?? "").toLowerCase().includes(normalizedSearchTerm),
				)
			: palette.rows;

	const hex = selectedColor ? oklchaToHex(selectedColor.color) : "#000000";
	const rgb = selectedColor
		? oklchaToRgbStr(selectedColor.color)
		: "rgb(0,0,0)";
	const rgba = selectedColor
		? oklchaToRgbaStr(selectedColor.color)
		: "rgba(0,0,0,1)";
	const hsl = selectedColor
		? oklchaToHslStr(selectedColor.color)
		: "hsl(0,0%,0%)";
	const oklcha = selectedColor?.color ?? "";

	const longestRowLength = Math.max(
		...filteredRows.map((row) => row.colors.length),
	);

	const getGridCols = () => {
		return `100px repeat(${longestRowLength + 1}, minmax(0, 1fr))`;
	};

	return (
		<div
			className="flex overflow-hidden"
			style={{ height: "calc(-65px + 100vh)" }}
		>
			{/* ── Left panel: color list ── */}
			<div className="flex flex-col border-r h-full border-slate-800 bg-slate-900/50 pt-4 pl-4 space-y-8 min-w-1/4">
				<div className="shrink-0">
					<div className="flex items-center gap-2 pr-12">
						{enableBackArrow && (
							<Button variant="ghost" asChild>
								<Link
									href={"/palettes"}
									className="text-white hover:text-slate-300"
								>
									<LucideArrowLeft />
								</Link>
							</Button>
						)}
						<h1 className="text-lg font-bold text-white truncate">
							{palette.name}
						</h1>
					</div>
					{palette.description && (
						<p className="text-xs text-slate-400 mt-0.5 max-w-[20vw] pr-4">
							{palette.description}
						</p>
					)}
					<p className="text-xs text-slate-500 mt-1">
						{allColors.length} color{allColors.length !== 1 ? "s" : ""}
					</p>
				</div>

				{enableSearch && (
					<div className="pr-4">
						<label
							htmlFor="search"
							className="block text-sm font-medium text-slate-400 mb-2"
						>
							Search
						</label>
						<input
							id="search"
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search rows..."
							className="w-full h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/60"
						/>
					</div>
				)}

				<div className="overflow-y-auto flex-1 grid grid-cols-1 pb-8">
					{filteredRows.map((row) => (
						<div
							key={row.id}
							className="grid gap-1 mt-1 h-fit"
							style={{ gridTemplateColumns: getGridCols() }}
						>
							<p>{capitalize(row.name)}</p>
							{row.colors.map((color) => {
								if (!color.color) return null;
								const isSelected = selectedColor?.id === color.id;
								return (
									<Tooltip key={color.id}>
										<TooltipTrigger
											type="button"
											onClick={() => setSelectedColor(color)}
											className={cn(
												"rounded-lg transition-all text-left cursor-pointer w-fit",
												isSelected ? "outline-4 outline-primary" : "",
											)}
										>
											<div
												className="w-8 h-8 rounded-md"
												style={{
													backgroundColor: oklchaToRgbaStr(color.color),
												}}
											/>
										</TooltipTrigger>
										<TooltipContent>{color.name}</TooltipContent>
									</Tooltip>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{/* ── Right panel ── */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top: website preview */}
				<div className="flex-1 p-6 overflow-hidden flex flex-col">
					<h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
						Preview
					</h2>
					<div className="flex-1 overflow-hidden">
						{selectedColor ? (
							<WebsitePreview color={selectedColor.color} hex={hex} />
						) : (
							<div className="flex items-center justify-center h-full text-slate-600">
								Select a color
							</div>
						)}
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-slate-800 mx-6" />

				{/* Bottom: color formats */}
				<div className="flex-1 p-6 overflow-y-auto">
					<div className="flex items-center gap-4 mb-4">
						<div
							className="w-12 h-12 rounded-xl border border-white/10 shrink-0 shadow-lg"
							style={{
								backgroundColor: selectedColor
									? oklchaToRgbaStr(selectedColor.color)
									: "transparent",
							}}
						/>
						<div className="flex-1">
							<h2 className="text-base font-bold text-white">
								{selectedColor?.name ?? "—"}
							</h2>
							<p className="text-xs text-slate-500">Color formats</p>
						</div>
						{enableFavorites && (
							<FavoriteButton
								colorId={selectedColor?.id}
								isFavorite={isFavorite(selectedColor?.id, undefined, undefined)}
								isAuthenticated={isAuthenticated}
								onToggle={toggleFavorite}
							/>
						)}
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<CopyButton label="HEX" value={hex} />
						<CopyButton label="RGB" value={rgb} />
						<CopyButton label="RGBA" value={rgba} />
						<CopyButton label="HSL" value={hsl} />
						<div className="sm:col-span-2">
							<CopyButton label="OKLCH" value={oklcha} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
