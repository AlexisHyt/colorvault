"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Card } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import type { RawFavorite } from "@/lib/actions/favorites";
import type { WebsiteColor } from "@/lib/types";
import { oklchaToHex } from "@/lib/utils";

interface Props {
	websites: WebsiteColor[];
	initialFavorites?: RawFavorite[];
	isAuthenticated?: boolean;
}

export function WebsitesClient({
	websites,
	initialFavorites = [],
	isAuthenticated = false,
}: Props) {
	const [searchTerm, setSearchTerm] = useState("");
	const { isFavorite, toggleFavorite } = useFavorites(initialFavorites);

	const filteredWebsites = websites.filter((site) =>
		site.websiteName.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<>
			<div className="max-w-md mb-8">
				<input
					type="text"
					placeholder="Search websites..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredWebsites.map((website) => (
					<Card
						key={website.id}
						className="border-slate-700 bg-slate-800/50 overflow-hidden"
					>
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold text-white mb-2">
										{website.websiteName}
									</h3>
									{website.description && (
										<p className="text-sm text-slate-400 mb-4">
											{website.description}
										</p>
									)}
								</div>
								<FavoriteButton
									websiteColorId={website.id}
									isFavorite={isFavorite(undefined, undefined, website.id)}
									isAuthenticated={isAuthenticated}
									onToggle={toggleFavorite}
								/>
							</div>

							<div className="space-y-3">
								<div>
									<p className="text-xs text-slate-500 mb-2">Primary Color</p>
									<div className="flex items-center gap-2">
										<div
											className="w-10 h-10 rounded border border-slate-600 shrink-0"
											style={{
												backgroundColor: oklchaToHex(website.primaryColor),
											}}
										/>
										<div className="flex-1">
											<CopyButton
												value={oklchaToHex(website.primaryColor)}
												label="HEX"
											/>
										</div>
									</div>
								</div>

								{website.secondaryColor && (
									<div>
										<p className="text-xs text-slate-500 mb-2">
											Secondary Color
										</p>
										<div className="flex items-center gap-2">
											<div
												className="w-10 h-10 rounded border border-slate-600 shrink-0"
												style={{
													backgroundColor: oklchaToHex(website.secondaryColor),
												}}
											/>
											<div className="flex-1">
												<CopyButton
													value={oklchaToHex(website.secondaryColor)}
													label="HEX"
												/>
											</div>
										</div>
									</div>
								)}

								{website.accentColor && (
									<div>
										<p className="text-xs text-slate-500 mb-2">Accent Color</p>
										<div className="flex items-center gap-2">
											<div
												className="w-10 h-10 rounded border border-slate-600 shrink-0"
												style={{
													backgroundColor: oklchaToHex(website.accentColor),
												}}
											/>
											<div className="flex-1">
												<CopyButton
													value={oklchaToHex(website.accentColor)}
													label="HEX"
												/>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</Card>
				))}
			</div>

			{filteredWebsites.length === 0 && (
				<div className="text-center py-12">
					<p className="text-slate-400">
						No websites found matching your search
					</p>
				</div>
			)}
		</>
	);
}
