import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { SavedPalette } from "@/lib/actions/saved-palettes";
import { oklchaToHex } from "@/lib/utils";

export function LoadPaletteButton({
	savedPalettes,
	isAuthenticated,
	onLoad,
}: {
	savedPalettes: SavedPalette[];
	isAuthenticated: boolean;
	onLoad: (palette: SavedPalette) => void;
}) {
	const [open, setOpen] = useState(false);

	if (!isAuthenticated || savedPalettes.length === 0) return null;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="secondary" size="sm" className="gap-2 w-full">
					<FolderOpen className="w-3.5 h-3.5" />
					Load saved
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[70vh]">
				<DialogHeader>
					<DialogTitle>Load a saved palette</DialogTitle>
				</DialogHeader>
				<div className="space-y-2 max-h-96 overflow-y-auto pr-1 mt-2">
					{savedPalettes.map((p) => {
						const colors = [
							p.primaryColor,
							p.secondaryColor,
							p.accentColor,
							p.neutralColor,
						];
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => {
									onLoad(p);
									setOpen(false);
								}}
								className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 transition-colors text-left cursor-pointer"
							>
								<div className="flex gap-1 shrink-0">
									{colors.map((c, i) => (
										<div
											key={i}
											className="w-6 h-6 rounded"
											style={{ backgroundColor: oklchaToHex(c) }}
										/>
									))}
								</div>
								<span className="text-sm text-white font-medium truncate">
									{p.name}
								</span>
							</button>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
