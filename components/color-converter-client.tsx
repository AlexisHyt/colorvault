"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertColor } from "@/lib/color-converter";

const DEFAULT_COLOR = "#6366f1";

const EXAMPLES = [
	"#3366FF",
	"rgb(51, 102, 255)",
	"rgba(51, 102, 255, 0.5)",
	"hsl(220 100% 60%)",
	"hsla(220 100% 60% / 0.5)",
	"hsv(220, 80%, 100%)",
	"cmyk(80%, 60%, 0%, 0%)",
	"lab(54.29% 80.82 69.88)",
	"lch(54.29% 106.84 40.86)",
	"oklch(62.79% 0.2577 29.23)",
];

const RESULT_LABELS: Array<{
	key: keyof ReturnType<typeof convertColor>["formats"];
	label: string;
}> = [
	{ key: "hex", label: "HEX" },
	{ key: "rgb", label: "RGB" },
	{ key: "rgba", label: "RGBA" },
	{ key: "hsl", label: "HSL" },
	{ key: "hsla", label: "HSLA" },
	{ key: "hsv", label: "HSV" },
	{ key: "cmyk", label: "CMYK" },
	{ key: "lab", label: "LAB" },
	{ key: "lch", label: "LCH" },
	{ key: "oklch", label: "OKLCH" },
];

export function ColorConverterClient() {
	const [input, setInput] = useState(DEFAULT_COLOR);

	const conversion = useMemo(() => {
		try {
			return {
				result: convertColor(input),
				error: null as string | null,
			};
		} catch (error) {
			return {
				result: null,
				error:
					error instanceof Error
						? error.message
						: "Invalid color. Please verify your input.",
			};
		}
	}, [input]);

	return (
		<div className="space-y-8">
			<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end">
					<div className="space-y-3">
						<Label className="text-white font-semibold">Color Input</Label>
						<p className="text-xs text-slate-400">
							Accepted formats: HEX, RGB, RGBA, HSL, HSLA, HSV, CMYK, LAB, LCH,
							OKLCH.
						</p>
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="#6366f1"
							className="font-mono text-sm bg-slate-800 border-slate-600 text-white"
						/>
					</div>

					<div className="flex items-end gap-3">
						<input
							type="color"
							value={conversion.result?.previewHex ?? DEFAULT_COLOR}
							onChange={(e) => setInput(e.target.value.toUpperCase())}
							className="w-14 h-14 rounded-md border border-slate-600 cursor-pointer bg-transparent"
							aria-label="Pick a color"
						/>
						<div
							className="w-14 h-14 rounded-md border border-slate-600"
							style={{
								backgroundColor:
									conversion.result?.formats.rgba ?? "transparent",
							}}
						/>
					</div>
				</div>

				<div className="mt-6 pt-6 border-t border-slate-700">
					<p className="text-xs text-slate-400 mb-3">Quick examples</p>
					<div className="flex flex-wrap gap-2">
						{EXAMPLES.map((example) => (
							<Button
								key={example}
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setInput(example)}
								className="border-slate-600 bg-slate-900 text-slate-200 hover:text-white"
							>
								{example}
							</Button>
						))}
					</div>
				</div>
			</div>

			{conversion.error && (
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
					{conversion.error}
				</div>
			)}

			{conversion.result && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{RESULT_LABELS.map(({ key, label }) => (
						<CopyButton
							key={label}
							label={label}
							value={conversion.result.formats[key]}
						/>
					))}
				</div>
			)}
		</div>
	);
}
