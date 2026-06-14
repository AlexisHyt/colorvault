"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Card } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import type { RawFavorite } from "@/lib/actions/favorites";
import type { TechnologyColor } from "@/lib/types";
import { cn, oklchaToHex } from "@/lib/utils";

const CATEGORIES = [
	{ value: "all", label: "All" },
	{ value: "language", label: "Language" },
	{ value: "framework", label: "Framework" },
	{ value: "database", label: "Database" },
	{ value: "tool", label: "Tool" },
	{ value: "platform", label: "Platform" },
	{ value: "cloud", label: "Cloud" },
] as const;

interface Props {
	technologies: TechnologyColor[];
	initialFavorites?: RawFavorite[];
	isAuthenticated?: boolean;
}

export function TechnologiesClient({
	technologies,
	initialFavorites = [],
	isAuthenticated = false,
}: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeCategory, setActiveCategory] = useState<string>("all");
	const [brokenIcons, setBrokenIcons] = useState<Set<string>>(new Set());
	const { isFavorite, toggleFavorite } = useFavorites(initialFavorites);

	const filtered = technologies.filter((tech) => {
		const matchesSearch = tech.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCategory =
			activeCategory === "all" || tech.category === activeCategory;
		return matchesSearch && matchesCategory;
	});

	return (
		<>
			<div className="mb-8 space-y-4">
				<div className="max-w-md">
					<input
						type="text"
						placeholder="Search technologies..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					{CATEGORIES.map((cat) => (
						<button
							key={cat.value}
							type="button"
							onClick={() => setActiveCategory(cat.value)}
							className={cn(
								"px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
								activeCategory === cat.value
									? "bg-blue-600 text-white"
									: "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700",
							)}
						>
							{cat.label}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filtered.map((tech) => {
					const hex = oklchaToHex(tech.color);
					const iconUnavailable = brokenIcons.has(tech.slug);
					return (
						<Card
							key={tech.id}
							className="border-slate-700 bg-slate-800/50 overflow-hidden"
						>
							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
											style={{
												backgroundColor: iconUnavailable ? hex : `${hex}22`,
											}}
										>
											{!iconUnavailable && (
												<img
													src={`https://cdn.simpleicons.org/${tech.slug}/ffffff`}
													alt={tech.name}
													width={24}
													height={24}
													loading="lazy"
													onError={() => {
														setBrokenIcons((prev) => {
															if (prev.has(tech.slug)) return prev;
															const next = new Set(prev);
															next.add(tech.slug);
															return next;
														});
													}}
												/>
											)}
										</div>
										<div>
											<h3 className="text-lg font-semibold text-white leading-tight">
												{tech.name}
											</h3>
											<span className="text-xs text-slate-400 capitalize">
												{tech.category}
											</span>
										</div>
									</div>
									<FavoriteButton
										technologyColorId={tech.id}
										isFavorite={isFavorite(
											undefined,
											undefined,
											undefined,
											tech.id,
										)}
										isAuthenticated={isAuthenticated}
										onToggle={toggleFavorite}
									/>
								</div>

								<div>
									<p className="text-xs text-slate-500 mb-2">Brand Color</p>
									<div className="flex items-center gap-2">
										<div
											className="w-10 h-10 rounded border border-slate-600 shrink-0"
											style={{ backgroundColor: hex }}
										/>
										<div className="flex-1">
											<CopyButton value={hex} label="HEX" />
										</div>
									</div>
								</div>
							</div>
						</Card>
					);
				})}
			</div>

			{filtered.length === 0 && (
				<div className="text-center py-12">
					<p className="text-slate-400">
						No technologies found matching your search
					</p>
				</div>
			)}
		</>
	);
}
