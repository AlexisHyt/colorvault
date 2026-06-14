import type { PreviewTemplateProps } from "./types";

export function BlogPreview({ theme }: PreviewTemplateProps) {
	return (
		<div className="p-4 space-y-2" style={{ backgroundColor: theme.bgPage }}>
			<div
				className="h-20 rounded-lg"
				style={{ backgroundColor: theme.primary, opacity: 0.88 }}
			/>
			<div className="grid grid-cols-[1fr_70px] gap-2">
				<div
					className="rounded-lg border p-2.5 space-y-2"
					style={{
						borderColor: theme.border,
						backgroundColor: theme.cardBg,
					}}
				>
					<div
						className="h-2 w-3/4 rounded-full"
						style={{ backgroundColor: theme.textBody, opacity: 0.3 }}
					/>
					<div className="space-y-1">
						{[1, 2, 3, 4].map((line) => (
							<div
								key={line}
								className="h-1 rounded-full"
								style={{ backgroundColor: theme.textMuted, opacity: 0.4 }}
							/>
						))}
					</div>
					<div
						className="h-6 w-20 rounded"
						style={{ backgroundColor: theme.ring, opacity: 0.9 }}
					/>
				</div>
				<div className="space-y-2">
					{[theme.secondary, theme.muted, theme.destructive].map(
						(color, index) => (
							<div
								key={`${color}-${index}`}
								className="h-10.5 rounded-md"
								style={{ backgroundColor: color, opacity: 0.8 }}
							/>
						),
					)}
				</div>
			</div>
		</div>
	);
}
