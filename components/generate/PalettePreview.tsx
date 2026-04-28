"use client";

import { Eye } from "lucide-react";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	COLORBLIND_LABELS,
	type ColorblindType,
	simulateColorblind,
} from "@/lib/generate/colorblind";
import { luminance } from "@/lib/generate/luminance";
import { textOn } from "@/lib/generate/textOn";
import type { ColorRole } from "@/lib/generate-palette";

export function PalettePreview({
	colors,
}: {
	colors: Record<ColorRole, string>;
}) {
	const [cbMode, setCbMode] = useState<ColorblindType>("normal");

	const sim = (hex: string) => simulateColorblind(hex, cbMode);

	const primary = sim(colors.primary);
	const secondary = sim(colors.secondary);
	const accent = sim(colors.accent);
	const neutral = sim(colors.other);

	const textOnPrimary = textOn(primary);
	const textOnSecondary = textOn(secondary);
	const textOnAccent = textOn(accent);
	const isNeutralLight = luminance(neutral) > 0.5;
	const bgPage = isNeutralLight ? "#f1f5f9" : "#0f172a";
	const cardBg = isNeutralLight ? "#ffffff" : "#1e293b";
	const textMuted = isNeutralLight
		? "rgba(0,0,0,0.45)"
		: "rgba(255,255,255,0.45)";
	const textBody = isNeutralLight ? "#1e293b" : "#f1f5f9";

	return (
		<div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg flex flex-col select-none text-[0px]">
			{/* Browser chrome */}
			<div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border-b border-slate-700 shrink-0">
				<div className="flex gap-1.5">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
					<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
					<div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
				</div>
				<div className="flex-1 mx-2 h-5 bg-slate-700/60 rounded text-xs text-slate-500 flex items-center px-2 font-mono">
					yoursite.com
				</div>
				<Select
					value={cbMode}
					onValueChange={(v) => setCbMode(v as ColorblindType)}
				>
					<SelectTrigger className="h-6 w-auto min-w-[140px] rounded border-slate-600 bg-slate-700/60 text-[11px] text-slate-300 gap-1 px-2">
						<Eye className="w-3 h-3 shrink-0 text-slate-400" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="border-slate-700 bg-slate-800 text-slate-200 text-xs">
						{(
							Object.entries(COLORBLIND_LABELS) as [ColorblindType, string][]
						).map(([value, label]) => (
							<SelectItem key={value} value={value} className="text-xs">
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Navbar */}
			<div
				className="flex items-center justify-between px-5 py-3 shrink-0"
				style={{ backgroundColor: primary }}
			>
				<div className="flex items-center gap-2">
					<div
						className="w-5 h-5 rounded"
						style={{ backgroundColor: textOnPrimary, opacity: 0.9 }}
					/>
					<span className="text-sm font-bold" style={{ color: textOnPrimary }}>
						Brand
					</span>
				</div>
				<div className="flex gap-4">
					{["Home", "About", "Contact"].map((item) => (
						<span
							key={item}
							className="text-xs"
							style={{ color: textOnPrimary, opacity: 0.7 }}
						>
							{item}
						</span>
					))}
				</div>
				<div
					className="px-3 py-1 rounded text-xs font-semibold"
					style={{ backgroundColor: accent, color: textOnAccent }}
				>
					Get Started
				</div>
			</div>

			{/* Hero */}
			<div
				className="flex flex-col items-center justify-center gap-3 px-6 py-5"
				style={{ backgroundColor: bgPage }}
			>
				<div
					className="w-full max-w-xs h-2.5 rounded-full"
					style={{ backgroundColor: primary, opacity: 0.9 }}
				/>
				<div
					className="w-3/4 h-1.5 rounded-full"
					style={{ backgroundColor: textBody, opacity: 0.2 }}
				/>
				<div
					className="w-1/2 h-1.5 rounded-full"
					style={{ backgroundColor: textBody, opacity: 0.12 }}
				/>
				<div
					className="mt-1 px-5 py-2 rounded text-xs font-semibold"
					style={{ backgroundColor: secondary, color: textOnSecondary }}
				>
					Discover more
				</div>
			</div>

			{/* Cards row */}
			<div
				className="flex gap-2 px-4 py-4 shrink-0"
				style={{ backgroundColor: bgPage }}
			>
				{([primary, secondary, accent] as const).map((bg, i) => {
					const txt = textOn(bg);
					return (
						<div
							key={i}
							className="flex-1 rounded-lg p-3 flex flex-col gap-2"
							style={{
								backgroundColor: i === 0 ? bg : cardBg,
								border: `1px solid ${i === 0 ? "transparent" : "rgba(148,163,184,0.15)"}`,
							}}
						>
							<div
								className="h-1.5 rounded-full w-3/4"
								style={{
									backgroundColor: i === 0 ? txt : primary,
									opacity: 0.8,
								}}
							/>
							<div
								className="h-1 rounded-full w-1/2"
								style={{
									backgroundColor: i === 0 ? txt : textMuted,
									opacity: 0.5,
								}}
							/>
							{i === 2 && (
								<div
									className="mt-1 self-start px-2 py-0.5 rounded text-[9px] font-semibold"
									style={{ backgroundColor: accent, color: textOnAccent }}
								>
									Badge
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Footer */}
			<div
				className="px-5 py-3 flex items-center justify-between shrink-0"
				style={{ backgroundColor: neutral }}
			>
				<div
					className="h-1.5 rounded-full w-16"
					style={{ backgroundColor: textOn(neutral), opacity: 0.4 }}
				/>
				<div className="flex gap-2">
					{[primary, secondary, accent].map((c, i) => (
						<div
							key={i}
							className="w-4 h-4 rounded-full"
							style={{ backgroundColor: c, opacity: 0.8 }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
