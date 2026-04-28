"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { HarmonyColor } from "@/lib/generate-palette";

function SwatchCard({ color }: { color: HarmonyColor }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(color.hex);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex items-center gap-4 rounded-xl border border-slate-700/60 overflow-hidden bg-slate-800/40 hover:border-slate-500 transition-colors">
			{/* Color block */}
			<div
				className="w-16 h-16 shrink-0"
				style={{ backgroundColor: color.hex }}
			/>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-0.5">
					{color.label}
				</p>
				<p className="text-sm font-mono text-white font-semibold">
					{color.hex.toUpperCase()}
				</p>
				<p className="text-xs text-slate-500 mt-0.5">
					{Math.round(color.angleDeg)}°
				</p>
			</div>

			{/* Copy button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={handleCopy}
				className="mr-3 h-8 w-8 p-0 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors shrink-0"
				title={`Copy ${color.hex}`}
			>
				{copied ? (
					<Check size={14} className="text-emerald-400" />
				) : (
					<Copy size={14} />
				)}
			</Button>
		</div>
	);
}

export function HarmonySwatchList({ colors }: { colors: HarmonyColor[] }) {
	return (
		<div className="flex flex-col gap-3">
			{colors.map((c) => (
				<SwatchCard key={c.label} color={c} />
			))}
		</div>
	);
}
