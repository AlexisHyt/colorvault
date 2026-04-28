"use client";

import { useState } from "react";
import { WcagBadge } from "@/components/generate/WcagBadge";
import { contrastRatio, WCAG_PAIRS, wcagLevel } from "@/lib/generate/wcag";
import type { PaletteScale } from "@/lib/generate-palette";
import { cn } from "@/lib/utils";

interface WcagPanelProps {
	scale: PaletteScale;
}

export function WcagPanel({ scale }: WcagPanelProps) {
	const [largeText, setLargeText] = useState(false);

	return (
		<div className="mt-4 space-y-3">
			{/* Toggle large / normal text */}
			<div className="flex items-center gap-2">
				<span className="text-xs text-slate-400">Text size:</span>
				<button
					type="button"
					onClick={() => setLargeText(false)}
					className={cn(
						"text-xs px-2 py-0.5 rounded border transition-colors",
						!largeText
							? "bg-slate-600 border-slate-500 text-white"
							: "border-slate-700 text-slate-500 hover:text-slate-300",
					)}
				>
					Normal
				</button>
				<button
					type="button"
					onClick={() => setLargeText(true)}
					className={cn(
						"text-xs px-2 py-0.5 rounded border transition-colors",
						largeText
							? "bg-slate-600 border-slate-500 text-white"
							: "border-slate-700 text-slate-500 hover:text-slate-300",
					)}
				>
					Large
				</button>
			</div>

			{/* Pairs */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{WCAG_PAIRS.map(([fg, bg]) => {
					const fgHex = scale[fg];
					const bgHex = scale[bg];
					const ratio = contrastRatio(fgHex, bgHex);
					const level = wcagLevel(ratio, largeText);

					return (
						<div
							key={`${fg}-${bg}`}
							className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2"
						>
							{/* Swatch preview */}
							<div
								className="shrink-0 w-10 h-8 rounded flex items-center justify-center text-[9px] font-bold select-none"
								style={{ backgroundColor: bgHex, color: fgHex }}
							>
								Aa
							</div>

							{/* Labels */}
							<div className="flex flex-col gap-0.5 text-[10px] text-slate-500 leading-tight min-w-0">
								<span>
									<span className="text-slate-300 font-mono">{fg}</span>
									{" on "}
									<span className="text-slate-300 font-mono">{bg}</span>
								</span>
								<div className="flex items-center gap-1">
									<span
										className="inline-block w-3 h-3 rounded-sm border border-white/10"
										style={{ backgroundColor: fgHex }}
									/>
									<span className="font-mono truncate">{fgHex}</span>
									<span className="mx-0.5">·</span>
									<span
										className="inline-block w-3 h-3 rounded-sm border border-white/10"
										style={{ backgroundColor: bgHex }}
									/>
									<span className="font-mono truncate">{bgHex}</span>
								</div>
							</div>

							{/* Badge */}
							<div className="ml-auto shrink-0">
								<WcagBadge level={level} ratio={ratio} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
