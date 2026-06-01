import { textOn } from "@/lib/generate/textOn";
import type { PreviewTemplateProps } from "./types";

export function LandingPagePreview({ theme }: PreviewTemplateProps) {
	const {
		primary,
		secondary,
		accent,
		neutral,
		textOnAccent,
		textBody,
		textMuted,
	} = theme;

	return (
		<>
			<div
				className="flex items-center justify-between px-5 py-3 shrink-0"
				style={{ backgroundColor: primary }}
			>
				<div className="flex items-center gap-2">
					<div
						className="w-5 h-5 rounded"
						style={{ backgroundColor: theme.textOnPrimary, opacity: 0.9 }}
					/>
					<span
						className="text-sm font-bold"
						style={{ color: theme.textOnPrimary }}
					>
						Brand
					</span>
				</div>
				<div className="flex gap-4">
					{["Home", "About", "Contact"].map((item) => (
						<span
							key={item}
							className="text-xs"
							style={{ color: theme.textOnPrimary, opacity: 0.7 }}
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

			<div
				className="flex flex-col items-center justify-center gap-3 px-6 py-5"
				style={{ backgroundColor: theme.bgPage }}
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
					style={{ backgroundColor: secondary, color: theme.textOnSecondary }}
				>
					Discover more
				</div>
			</div>

			<div
				className="flex gap-2 px-4 py-4 shrink-0"
				style={{ backgroundColor: theme.bgPage }}
			>
				{([primary, secondary, accent] as const).map((bg, i) => {
					const txt = textOn(bg);
					return (
						<div
							key={bg}
							className="flex-1 rounded-lg p-3 flex flex-col gap-2"
							style={{
								backgroundColor: i === 0 ? bg : theme.cardBg,
								border: `1px solid ${i === 0 ? "transparent" : theme.borderSoft}`,
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
						</div>
					);
				})}
			</div>

			<div
				className="px-5 py-3 flex items-center justify-between shrink-0"
				style={{ backgroundColor: neutral }}
			>
				<div
					className="h-1.5 rounded-full w-16"
					style={{ backgroundColor: theme.textOnNeutral, opacity: 0.4 }}
				/>
				<div className="flex gap-2">
					{[primary, secondary, accent].map((c) => (
						<div
							key={c}
							className="w-4 h-4 rounded-full"
							style={{ backgroundColor: c, opacity: 0.8 }}
						/>
					))}
				</div>
			</div>
		</>
	);
}
