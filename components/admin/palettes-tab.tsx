"use client";

import {
	LucideArrowDown,
	LucideArrowLeft,
	LucideArrowRight,
	LucideArrowUp,
	LucideTrash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PaletteAddColorFormDialog } from "@/components/admin/palettes/PaletteAddColorFormDialog";
import { PaletteAddFormDialog } from "@/components/admin/palettes/PaletteAddFormDialog";
import { PaletteAddRowFormDialog } from "@/components/admin/palettes/PaletteAddRowFormDialog";
import { PaletteEditColorFormDialog } from "@/components/admin/palettes/PaletteEditColorFormDialog";
import { PaletteEditFormDialog } from "@/components/admin/palettes/PaletteEditFormDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { deletePalette } from "@/lib/actions/admin/palette/deletePalette";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";
import { reorderPaletteColor } from "@/lib/actions/admin/palette/reorderPaletteColor";
import { reorderPaletteRow } from "@/lib/actions/admin/palette/reorderPaletteRow";
import { useSession } from "@/lib/auth-client";
import type { ColorPaletteWithColors } from "@/lib/types";

export function AdminPalettesTab() {
	const { data: session } = useSession();
	const [palettes, setPalettes] = useState<ColorPaletteWithColors[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		async function loadData() {
			if (session?.user && session.user.role === "admin") {
				setIsLoading(true);

				const result = await getPalettes();
				setPalettes(result);

				setIsLoading(false);
			}
		}
		loadData();
	}, [session]);

	const addPalettesRows = (palettes: ColorPaletteWithColors[]) => {
		setPalettes((prevPalettes) => [...prevPalettes, ...palettes]);
	};
	const updatePalettesRows = (palettes: ColorPaletteWithColors[]) => {
		setPalettes((prevPalettes) => {
			return prevPalettes.map((prevPalette) => {
				const updatedPalette = palettes.find(
					(newPalette) => newPalette.id === prevPalette.id,
				);
				return updatedPalette || prevPalette;
			});
		});
	};

	const handleDelete = async (id: number) => {
		const result = await deletePalette(id);

		if (result) {
			toast.success("Palette deleted successfully.");
			setPalettes((prev) => prev.filter((p) => p.id !== id));
		} else {
			toast.error("Failed to delete palette.");
		}
	};

	const handleReorderRow = async (
		rowId: number,
		direction: "up" | "down",
	) => {
		const result = await reorderPaletteRow(rowId, direction);
		if (result) {
			setPalettes(result);
		} else {
			toast.error("Failed to reorder row.");
		}
	};

	const handleReorderColor = async (
		colorId: number,
		direction: "left" | "right",
	) => {
		const result = await reorderPaletteColor(colorId, direction);
		if (result) {
			setPalettes(result);
		} else {
			toast.error("Failed to reorder color.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold text-white">Color Palettes</h2>
			</div>

			<div className="grid gap-4">
				{isLoading ? (
					<Spinner />
				) : palettes.length === 0 ? (
					<p>No palettes found.</p>
				) : (
					palettes.map((palette) => (
						<div
							key={palette.id}
							className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
						>
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">
									<span className="mr-4">{palette.name}</span>
									<PaletteEditFormDialog
										paletteId={palette.id}
										paletteName={palette.name}
										updatePalettes={updatePalettesRows}
									/>
									<Button
										variant="ghost"
										className="cursor-pointer"
										onClick={() => handleDelete(palette.id)}
									>
										<LucideTrash />
									</Button>
								</h3>
								<p className="text-sm text-slate-400 mb-2">
									{palette.description}
								</p>
								<p className="text-sm text-slate-400 mb-2">
									Category: {palette.category}
								</p>
							</div>
							<div className="mt-4">
								<div>
									{[...palette.rows]
										.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
										.map((row, rowIndex, sortedRows) => (
											<div key={row.id} className="flex items-center mb-2">
												<div className="flex flex-col mr-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-5 w-5 cursor-pointer"
														disabled={rowIndex === 0}
														onClick={() => handleReorderRow(row.id, "up")}
													>
														<LucideArrowUp className="h-3 w-3" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-5 w-5 cursor-pointer"
														disabled={rowIndex === sortedRows.length - 1}
														onClick={() => handleReorderRow(row.id, "down")}
													>
														<LucideArrowDown className="h-3 w-3" />
													</Button>
												</div>
												<span className="mr-2">{row.name}</span>
												{[...row.colors]
													.sort((a, b) => a.position - b.position)
													.map((color, colorIndex, sortedColors) => (
														<div key={color.id} className="flex items-center">
															<Button
																variant="ghost"
																size="icon"
																className="h-5 w-5 cursor-pointer"
																disabled={colorIndex === 0}
																onClick={() =>
																	handleReorderColor(color.id, "left")
																}
															>
																<LucideArrowLeft className="h-3 w-3" />
															</Button>
															<Tooltip>
																<TooltipTrigger>
																	<PaletteEditColorFormDialog
																		color={color}
																		updatePalettes={updatePalettesRows}
																	/>
																</TooltipTrigger>
																<TooltipContent>
																	<p>{color.name}</p>
																</TooltipContent>
															</Tooltip>
															<Button
																variant="ghost"
																size="icon"
																className="h-5 w-5 cursor-pointer"
																disabled={colorIndex === sortedColors.length - 1}
																onClick={() =>
																	handleReorderColor(color.id, "right")
																}
															>
																<LucideArrowRight className="h-3 w-3" />
															</Button>
														</div>
													))}
												<PaletteAddColorFormDialog
													rowPaletteId={row.id}
													updatePalettes={updatePalettesRows}
												/>
											</div>
										))}
									<PaletteAddRowFormDialog
										paletteId={palette.id}
										updatePalettes={updatePalettesRows}
									/>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			<PaletteAddFormDialog updatePalettes={addPalettesRows} />
		</div>
	);
}
