import type { PreviewTemplateProps } from "./types";

export function PricingCardsPreview({ theme }: PreviewTemplateProps) {
	return (
		<div className="p-4" style={{ backgroundColor: theme.bgPage }}>
			<div className="grid grid-cols-3 gap-2">
				{[0, 1, 2].map((i) => {
					const featured = i === 1;
					return (
						<div
							key={i}
							className="rounded-lg border p-2.5 space-y-2"
							style={{
								borderColor: featured ? theme.ring : theme.border,
								backgroundColor: featured ? theme.secondary : theme.cardBg,
							}}
						>
							<div
								className="h-1.5 w-10 rounded-full"
								style={{
									backgroundColor: featured
										? theme.secondaryForeground
										: theme.textBody,
									opacity: 0.8,
								}}
							/>
							<div
								className="h-4 rounded"
								style={{
									backgroundColor: featured ? theme.primary : theme.muted,
									opacity: 0.7,
								}}
							/>
							<div className="space-y-1">
								{[1, 2, 3].map((line) => (
									<div
										key={line}
										className="h-1 rounded-full"
										style={{
											backgroundColor: featured
												? theme.secondaryForeground
												: theme.textMuted,
											opacity: 0.45,
										}}
									/>
								))}
							</div>
							<div
								className="h-6 rounded"
								style={{
									backgroundColor: featured ? theme.primary : theme.secondary,
									opacity: 0.9,
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
