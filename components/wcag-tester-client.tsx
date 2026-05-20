"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContrastPreview } from "@/components/wcag/ContrastPreview";
import { ContrastResults } from "@/components/wcag/ContrastResults";
import { isValidHex } from "@/lib/generate/isValidHex";

export function WcagTesterClient() {
	const [foreground, setForeground] = useState("#ffffff");
	const [background, setBackground] = useState("#6366f1");

	const fgRaw = foreground;
	const bgRaw = background;

	const isValidFg = isValidHex(fgRaw);
	const isValidBg = isValidHex(bgRaw);

	return (
		<div className="space-y-10">
			{/* Color inputs */}
			<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Foreground color */}
					<div className="flex flex-col gap-3">
						<div>
							<Label className="text-white font-semibold">
								Foreground Color
							</Label>
							<p className="text-xs text-slate-400 mt-0.5">Text color</p>
						</div>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={isValidFg ? fgRaw : "#ffffff"}
								onChange={(e) => setForeground(e.target.value)}
								className="w-12 h-12 rounded-md border border-slate-600 cursor-pointer bg-transparent"
							/>
							<Input
								value={fgRaw}
								onChange={(e) => {
									const v = e.target.value;
									setForeground(v);
								}}
								className="font-mono text-sm bg-slate-800 border-slate-600 text-white flex-1"
								placeholder="#ffffff"
								maxLength={7}
							/>
							{isValidFg && (
								<div
									className="w-12 h-12 rounded-md border border-slate-600 flex-shrink-0"
									style={{ backgroundColor: fgRaw }}
								/>
							)}
						</div>
					</div>

					{/* Background color */}
					<div className="flex flex-col gap-3">
						<div>
							<Label className="text-white font-semibold">
								Background Color
							</Label>
							<p className="text-xs text-slate-400 mt-0.5">Background color</p>
						</div>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={isValidBg ? bgRaw : "#6366f1"}
								onChange={(e) => setBackground(e.target.value)}
								className="w-12 h-12 rounded-md border border-slate-600 cursor-pointer bg-transparent"
							/>
							<Input
								value={bgRaw}
								onChange={(e) => {
									const v = e.target.value;
									setBackground(v);
								}}
								className="font-mono text-sm bg-slate-800 border-slate-600 text-white flex-1"
								placeholder="#6366f1"
								maxLength={7}
							/>
							{isValidBg && (
								<div
									className="w-12 h-12 rounded-md border border-slate-600 flex-shrink-0"
									style={{ backgroundColor: bgRaw }}
								/>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Preview and results */}
			{isValidFg && isValidBg && (
				<div className="grid grid-cols-2 gap-6">
					<ContrastPreview foreground={fgRaw} background={bgRaw} />

					<ContrastResults foreground={fgRaw} background={bgRaw} />
				</div>
			)}

			{(!isValidFg || !isValidBg) && (
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
					Please enter valid hex colors (e.g., #ffffff)
				</div>
			)}
		</div>
	);
}
