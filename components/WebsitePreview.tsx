import { oklchaToRgbaStr } from "@/lib/utils";

export function WebsitePreview({ color, hex }: { color: string; hex: string }) {
	const rgba = oklchaToRgbaStr(color);

	// Determine if the color is "light" (to choose contrasting text)
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	const isLight = luminance > 0.5;
	const textOnColor = isLight ? "#1e293b" : "#f8fafc";
	const textMuted = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";

	return (
		<div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-900 flex flex-col select-none">
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
			</div>

			{/* Navbar */}
			<div
				className="flex items-center justify-between px-5 py-3 shrink-0"
				style={{ backgroundColor: rgba }}
			>
				<div className="flex items-center gap-2">
					<div
						className="w-5 h-5 rounded"
						style={{ backgroundColor: textOnColor, opacity: 0.9 }}
					/>
					<span className="text-sm font-bold" style={{ color: textOnColor }}>
						Brand
					</span>
				</div>
				<div className="flex gap-4">
					{["Home", "About", "Contact"].map((item) => (
						<span key={item} className="text-xs" style={{ color: textMuted }}>
							{item}
						</span>
					))}
				</div>
				<div
					className="px-3 py-1 rounded text-xs font-semibold"
					style={{
						backgroundColor: textOnColor,
						color: rgba,
					}}
				>
					Get Started
				</div>
			</div>

			{/* Hero section */}
			<div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-4 bg-slate-950/60">
				<div
					className="w-full max-w-xs h-2 rounded-full"
					style={{ backgroundColor: rgba, opacity: 0.9 }}
				/>
				<div className="w-full max-w-xxs h-1.5 rounded-full bg-slate-700/60" />
				<div className="w-3/4 h-1.5 rounded-full bg-slate-700/40" />
				<div
					className="mt-2 px-5 py-2 rounded text-xs font-semibold"
					style={{ backgroundColor: rgba, color: textOnColor }}
				>
					Call to action
				</div>
			</div>

			{/* Card row */}
			<div className="flex gap-2 px-4 pb-4 shrink-0">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="flex-1 rounded-lg p-3 flex flex-col gap-1.5"
						style={{
							backgroundColor: i === 1 ? rgba : undefined,
							border: `1px solid ${i === 1 ? "transparent" : "#334155"}`,
							background: i === 1 ? rgba : "#1e293b",
						}}
					>
						<div
							className="h-1.5 rounded-full w-3/4"
							style={{
								backgroundColor: i === 1 ? textOnColor : "#475569",
								opacity: 0.8,
							}}
						/>
						<div
							className="h-1 rounded-full w-1/2"
							style={{
								backgroundColor: i === 1 ? textOnColor : "#334155",
								opacity: 0.5,
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
