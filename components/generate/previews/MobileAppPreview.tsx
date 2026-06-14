import type { PreviewTemplateProps } from "./types";

export function MobileAppPreview({ theme }: PreviewTemplateProps) {
	return (
		<div className="p-4" style={{ backgroundColor: theme.bgPage }}>
			<div
				className="mx-auto w-42.5 rounded-[20px] border p-2 space-y-2"
				style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
			>
				<div
					className="h-6 rounded-lg"
					style={{ backgroundColor: theme.primary, opacity: 0.9 }}
				/>
				<div className="grid grid-cols-2 gap-2">
					<div
						className="h-14 rounded-lg"
						style={{ backgroundColor: theme.secondary, opacity: 0.85 }}
					/>
					<div
						className="h-14 rounded-lg"
						style={{ backgroundColor: theme.muted, opacity: 0.85 }}
					/>
				</div>
				<div
					className="h-16 rounded-lg"
					style={{ backgroundColor: theme.ring, opacity: 0.8 }}
				/>
				<div className="grid grid-cols-4 gap-1">
					{[theme.primary, theme.secondary, theme.ring, theme.destructive].map(
						(color, index) => (
							<div
								key={`${color}-${index}`}
								className="h-4 rounded"
								style={{ backgroundColor: color, opacity: 0.85 }}
							/>
						),
					)}
				</div>
			</div>
		</div>
	);
}
