"use client";

import chroma from "chroma-js";
import { getPaletteSync } from "colorthief";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ColorRole } from "@/lib/generate-palette";
import { deriveHarmonies } from "@/lib/generate-palette";

type ExtractedColors = Record<ColorRole, string>;

function diversify(colors: string[]): string[] {
	const result = [...colors];
	for (let i = 1; i < result.length; i++) {
		for (let j = 0; j < i; j++) {
			if (chroma.deltaE(result[i], result[j]) < 10) {
				const harmonies = deriveHarmonies(result[0]);
				const vals = Object.values(harmonies);
				result[i] = vals[(i - 1) % vals.length];
				break;
			}
		}
	}
	return result;
}

export function ImageColorPickerButton({
	onExtract,
}: {
	onExtract: (colors: ExtractedColors) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			// Resize to max 200×200 for performance
			const MAX = 200;
			const scale = Math.min(MAX / img.width, MAX / img.height, 1);
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			const palette = getPaletteSync(canvas, { colorCount: 4 });
			URL.revokeObjectURL(url);

			if (!palette || palette.length < 4) return;

			const hexColors = diversify(palette.map((c) => c.hex()));
			const [primary, secondary, accent, other] = hexColors;

			onExtract({ primary, secondary, accent, other });
		};
		img.src = url;

		// Reset so same file can be re-selected
		e.target.value = "";
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFile}
			/>
			<Button
				variant="secondary"
				size="sm"
				className="gap-2 w-full"
				onClick={() => inputRef.current?.click()}
			>
				<ImageIcon className="w-4 h-4" />
				From image
			</Button>
		</>
	);
}
