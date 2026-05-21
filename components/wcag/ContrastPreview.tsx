"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	COLORBLIND_LABELS,
	type ColorblindType,
	simulateColorblind,
} from "@/lib/generate/colorblind";

interface ContrastPreviewProps {
	foreground: string;
	background: string;
	visionMode: ColorblindType | "all";
}

export function ContrastPreview({
	foreground,
	background,
	visionMode,
}: ContrastPreviewProps) {
	const [previewText, setPreviewText] = useState("Aa Sample Text");
	const modes: ColorblindType[] =
		visionMode === "all"
			? ["normal", "deuteranopia", "protanopia", "tritanopia"]
			: [visionMode];

	return (
		<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
			<div className="flex flex-col gap-4">
				<div>
					<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
						Preview
					</p>
				</div>

				<div className="flex flex-col gap-3">
					<p className="text-xs text-slate-500">Preview Text</p>
					<Input
						value={previewText}
						onChange={(e) => setPreviewText(e.target.value)}
						className="font-mono text-sm bg-slate-800 border-slate-600 text-white"
						placeholder="Preview text"
						maxLength={100}
					/>
				</div>

				<div
					className={
						modes.length > 1
							? "grid grid-cols-1 xl:grid-cols-2 gap-4"
							: "flex flex-col"
					}
				>
					{modes.map((mode) => {
						const simulatedForeground = simulateColorblind(foreground, mode);
						const simulatedBackground = simulateColorblind(background, mode);

						return (
							<div
								key={mode}
								className="border border-slate-700 rounded-lg p-3 bg-slate-900/40 flex flex-col gap-3"
							>
								<p className="text-[11px] text-slate-300 font-semibold uppercase tracking-widest">
									{COLORBLIND_LABELS[mode]}
								</p>

								<div className="flex flex-col gap-2">
									<p className="text-xs text-slate-500">Normal Text (14px)</p>
									<div
										className="p-5 rounded-lg flex items-center justify-center min-h-20"
										style={{ backgroundColor: simulatedBackground }}
									>
										<p
											className="text-base"
											style={{ color: simulatedForeground }}
										>
											{previewText}
										</p>
									</div>
								</div>

								<div className="flex flex-col gap-2">
									<p className="text-xs text-slate-500">
										Large Text (18px+, bold)
									</p>
									<div
										className="p-5 rounded-lg flex items-center justify-center min-h-20"
										style={{ backgroundColor: simulatedBackground }}
									>
										<p
											className="text-2xl font-bold"
											style={{ color: simulatedForeground }}
										>
											{previewText}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
