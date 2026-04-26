"use client";

import { Copy } from "lucide-react";
import { useMemo, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFavorites } from "@/hooks/use-favorites";
import type { Gradient } from "@/lib/actions/gradients";
import type { RawFavorite } from "@/lib/actions/favorites";

interface Props {
	gradients: Gradient[];
	initialFavorites?: RawFavorite[];
	isAuthenticated?: boolean;
}

export function GradientsClient({ gradients, initialFavorites = [], isAuthenticated = false }: Props) {
	const { isFavorite, toggleFavorite } = useFavorites(initialFavorites);

	const categories = useMemo(
		() => [...new Set(gradients.map((g) => g.category))],
		[gradients],
	);

	const [selectedCategory, setSelectedCategory] = useState<string>(
		categories[0] ?? "",
	);
	const [copied, setCopied] = useState<number | null>(null);

	const filteredGradients = gradients.filter(
		(g) => g.category === selectedCategory,
	);

	const copyToClipboard = (text: string, id: number) => {
		navigator.clipboard.writeText(text);
		setCopied(id);
		setTimeout(() => setCopied(null), 2000);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Sidebar */}
			<div className="lg:col-span-1">
				<Card className="border-slate-700 bg-slate-800/50 p-4">
					<h2 className="font-semibold text-white">Categories</h2>
					<div className="space-y-2">
						{categories.map((category) => (
							<button
								key={category}
								type="button"
								onClick={() => setSelectedCategory(category)}
								className={`w-full text-left px-3 py-2 rounded text-sm transition capitalize ${
									selectedCategory === category
										? "bg-blue-600 text-white"
										: "text-slate-300 hover:bg-slate-700"
								}`}
							>
								{category}
							</button>
						))}
					</div>
				</Card>
			</div>

			{/* Gradients Grid */}
			<div className="lg:col-span-3">
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold text-white capitalize">
							{selectedCategory}
						</h2>
						<span className="text-sm text-slate-400">
							{filteredGradients.length} gradients
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredGradients.map((gradient) => (
							<Card
								key={gradient.id}
								className="overflow-hidden border-slate-700 bg-slate-800/50"
							>
								<div className="relative">
									<div
										className="w-full h-32"
										style={{ background: gradient.gradientString }}
									/>
									<div className="absolute top-2 right-2">
										<FavoriteButton
											gradientId={gradient.id}
											isFavorite={isFavorite(undefined, gradient.id, undefined)}
											isAuthenticated={isAuthenticated}
											onToggle={toggleFavorite}
											className="bg-black/30 hover:bg-black/50"
										/>
									</div>
								</div>

								<div className="p-4 space-y-3">
									<div>
										<h3 className="font-semibold text-white mb-1">
											{gradient.name}
										</h3>
										{gradient.description && (
											<p className="text-sm text-slate-400">
												{gradient.description}
											</p>
										)}
									</div>

									<div className="flex gap-2">
										<div className="flex-1 flex gap-2 text-xs">
											<div
												className="w-6 h-6 rounded border border-slate-600"
												style={{ backgroundColor: gradient.colorStart }}
												title={gradient.colorStart}
											/>
											{gradient.colorMid && (
												<>
													<span className="text-slate-400 flex items-center">
														→
													</span>
													<div
														className="w-6 h-6 rounded border border-slate-600"
														style={{ backgroundColor: gradient.colorMid }}
														title={gradient.colorMid}
													/>
												</>
											)}
											<span className="text-slate-400 flex items-center">
												→
											</span>
											<div
												className="w-6 h-6 rounded border border-slate-600"
												style={{ backgroundColor: gradient.colorEnd }}
												title={gradient.colorEnd}
											/>
										</div>
									</div>

									<SyntaxHighlighter language="css" style={atomOneDark}>
										{gradient.gradientString}
									</SyntaxHighlighter>

									<Button
										type="button"
										variant="default"
										onClick={() =>
											copyToClipboard(gradient.gradientString, gradient.id)
										}
										className="w-full cursor-pointer px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded flex items-center justify-center gap-2 transition"
									>
										<Copy size={16} />
										{copied === gradient.id ? "Copied!" : "Copy CSS"}
									</Button>
								</div>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
