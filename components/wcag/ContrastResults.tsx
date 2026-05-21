"use client";

import { WcagBadge } from "@/components/generate/WcagBadge";
import {
	COLORBLIND_LABELS,
	type ColorblindType,
	simulateColorblind,
} from "@/lib/generate/colorblind";
import { contrastRatio, wcagLevel } from "@/lib/generate/wcag";
import { cn } from "@/lib/utils";

interface ContrastResultsProps {
	foreground: string;
	background: string;
	visionMode: ColorblindType | "all";
}

function CompliancePill({
	label,
	passed,
}: {
	label: "AA" | "AAA";
	passed: boolean;
}) {
	return (
		<div
			className={
				passed
					? "inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1"
					: "inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-1"
			}
		>
			<span className="text-[10px] font-mono font-bold text-slate-200">
				{label}
			</span>
			<span
				className={
					passed
						? "text-[10px] font-semibold tracking-wide text-emerald-300"
						: "text-[10px] font-semibold tracking-wide text-rose-300"
				}
			>
				{passed ? "PASS" : "FAIL"}
			</span>
		</div>
	);
}

export function ContrastResults({
	foreground,
	background,
	visionMode,
}: ContrastResultsProps) {
	const modes: ColorblindType[] =
		visionMode === "all"
			? ["normal", "deuteranopia", "protanopia", "tritanopia"]
			: [visionMode];

	const scenarios = modes.map((mode) => {
		const simulatedForeground = simulateColorblind(foreground, mode);
		const simulatedBackground = simulateColorblind(background, mode);
		const ratio = contrastRatio(simulatedForeground, simulatedBackground);
		const markerPosition = Math.min(100, Math.max(0, ((ratio - 1) / 20) * 100));

		return {
			mode,
			ratio,
			markerPosition,
			normalLevel: wcagLevel(ratio, false),
			largeLevel: wcagLevel(ratio, true),
			normalAAPassed: ratio >= 4.5,
			normalAAAPassed: ratio >= 7,
			largeAAPassed: ratio >= 3,
			largeAAAPassed: ratio >= 4.5,
		};
	});

	return (
		<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
			<div className="flex flex-col gap-6">
				<div>
					<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-4">
						Contrast Results
					</p>
				</div>

				<div
					className={
						scenarios.length > 1
							? "grid grid-cols-1 xl:grid-cols-2 gap-4"
							: "flex flex-col"
					}
				>
					{scenarios.map((scenario) => (
						<div
							key={scenario.mode}
							className="border border-slate-700 rounded-lg p-4 bg-slate-900/40 flex flex-col gap-4"
						>
							<p className="text-slate-300 text-xs uppercase tracking-widest font-semibold">
								{COLORBLIND_LABELS[scenario.mode]}
							</p>

							<div className="flex items-center gap-4">
								<div>
									<p className="text-slate-400 text-sm mb-1">Contrast Ratio</p>
									<p className="text-3xl font-bold text-white font-mono">
										{scenario.ratio.toFixed(2)}:1
									</p>
								</div>
								<div className="relative flex-1">
									<div className="h-1 bg-linear-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
									<div
										className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-slate-950 shadow"
										style={{ left: `${scenario.markerPosition}%` }}
										aria-hidden="true"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="border border-slate-700 rounded-lg p-4 bg-slate-950/40">
									<p className="text-slate-400 text-xs mb-2 uppercase tracking-widest font-semibold">
										Normal Text (14px)
									</p>
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-3">
											<WcagBadge
												level={scenario.normalLevel}
												ratio={scenario.ratio}
											/>
										</div>
										<div
											className={cn(
												"flex items-center gap-2",
												visionMode === "all" && "flex-col items-start",
											)}
										>
											<CompliancePill
												label="AA"
												passed={scenario.normalAAPassed}
											/>
											<CompliancePill
												label="AAA"
												passed={scenario.normalAAAPassed}
											/>
										</div>
										<p className="text-slate-500 text-xs">
											Minimum: AA = 4.5:1 | AAA = 7:1
										</p>
									</div>
								</div>

								<div className="border border-slate-700 rounded-lg p-4 bg-slate-950/40">
									<p className="text-slate-400 text-xs mb-2 uppercase tracking-widest font-semibold">
										Large Text (18px+, bold)
									</p>
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-3">
											<WcagBadge
												level={scenario.largeLevel}
												ratio={scenario.ratio}
											/>
										</div>
										<div
											className={cn(
												"flex items-center gap-2",
												visionMode === "all" && "flex-col items-start",
											)}
										>
											<CompliancePill
												label="AA"
												passed={scenario.largeAAPassed}
											/>
											<CompliancePill
												label="AAA"
												passed={scenario.largeAAAPassed}
											/>
										</div>
										<p className="text-slate-500 text-xs">
											Minimum: AA = 3:1 | AAA = 4.5:1
										</p>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* WCAG guidelines info */}
				<div className="bg-slate-900/40 border border-slate-700 rounded-lg p-4">
					<p className="text-slate-300 text-xs font-semibold mb-2">
						WCAG 2.1 Standards
					</p>
					<p className="text-slate-400 text-xs leading-relaxed">
						Level AA is the recommended minimum for all web content. Level AAA
						provides enhanced contrast for users with low vision. Contrast
						requirements are different for normal text (≤18px) and large text
						(≥18px bold or ≥14px bold).
					</p>
					<p className="text-slate-400 text-xs leading-relaxed mt-4">
						See:{" "}
						<a
							href="https://www.w3.org/WAI/WCAG22/quickref/"
							className="underline"
							target="_blank"
							rel="noopener"
						>
							WCAG Quick Reference
						</a>{" "}
						for more
					</p>
				</div>
			</div>
		</div>
	);
}
