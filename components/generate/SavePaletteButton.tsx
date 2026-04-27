import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SavedPalette, savePalette } from "@/lib/actions/saved-palettes";
import type { ColorRole } from "@/lib/generate-palette";

export function SavePaletteButton({
	colorInputs,
	isAuthenticated,
	onSaved,
}: {
	colorInputs: Record<ColorRole, string>;
	isAuthenticated: boolean;
	onSaved: (palette: SavedPalette) => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [saved, setSaved] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Reset "saved" state when any base color changes
	const colorsKey = `${colorInputs.primary}|${colorInputs.secondary}|${colorInputs.accent}|${colorInputs.other}`;
	// biome-ignore lint/correctness/useExhaustiveDependencies: colorsKey is intentionally tracked to detect color changes
	useEffect(() => {
		setSaved(false);
	}, [colorsKey]);

	if (!isAuthenticated) return null;

	const handleSave = async () => {
		if (!name.trim()) {
			setError("Please enter a name for the palette.");
			return;
		}
		setLoading(true);
		setError(null);
		const result = await savePalette({
			name,
			primary: colorInputs.primary,
			secondary: colorInputs.secondary,
			accent: colorInputs.accent,
			neutral: colorInputs.other,
		});
		setLoading(false);
		if ("error" in result) {
			setError(result.error);
		} else {
			onSaved(result.palette);
			setSaved(true);
			setOpen(false);
			setName("");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				if (!v) {
					setError(null);
					setName("");
				}
			}}
		>
			<DialogTrigger asChild>
				<button
					type="button"
					className="p-1.5 rounded-full transition-colors cursor-pointer"
					aria-label={saved ? "Palette saved" : "Save palette"}
				>
					<Heart
						size={20}
						className={
							saved
								? "fill-red-500 text-red-500"
								: "text-slate-400 hover:text-red-400"
						}
					/>
				</button>
			</DialogTrigger>
			<DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
				<DialogHeader>
					<DialogTitle>Save palette</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pt-2">
					<div className="flex gap-2">
						{[
							colorInputs.primary,
							colorInputs.secondary,
							colorInputs.accent,
							colorInputs.other,
						].map((c, i) => (
							<div
								key={i}
								className="flex-1 h-8 rounded-md border border-white/10"
								style={{ backgroundColor: c }}
							/>
						))}
					</div>
					<div className="space-y-1.5">
						<Label className="text-white">
							Palette name <span className="text-red-400">*</span>
						</Label>
						<Input
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								setError(null);
							}}
							placeholder="My awesome palette"
							className="bg-slate-800 border-slate-600 text-white"
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
						/>
						{error && <p className="text-red-400 text-xs">{error}</p>}
					</div>
					<Button
						onClick={handleSave}
						disabled={loading || !name.trim()}
						className="w-full gap-2"
					>
						<Heart size={14} />
						{loading ? "Saving…" : "Save palette"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
