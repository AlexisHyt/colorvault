import type { PreviewTemplateProps } from "./types";

export function FormPreview({ theme }: PreviewTemplateProps) {
	return (
		<div className="p-4" style={{ backgroundColor: theme.bgPage }}>
			<div
				className="rounded-lg border p-4 space-y-3"
				style={{ borderColor: theme.borderSoft, backgroundColor: theme.cardBg }}
			>
				<div
					className="h-2 w-24 rounded-full"
					style={{ backgroundColor: theme.textBody, opacity: 0.25 }}
				/>
				{[1, 2, 3].map((i) => (
					<div key={i} className="space-y-1.5">
						<div
							className="h-1.5 w-14 rounded-full"
							style={{ backgroundColor: theme.textMuted, opacity: 0.65 }}
						/>
						<div
							className="h-7 rounded border"
							style={{
								borderColor: i === 2 ? theme.accent : theme.borderSoft,
								backgroundColor: theme.bgPage,
							}}
						/>
					</div>
				))}
				<div className="flex gap-2 pt-1">
					<div
						className="h-7 flex-1 rounded"
						style={{ backgroundColor: theme.secondary, opacity: 0.8 }}
					/>
					<div
						className="h-7 flex-1 rounded"
						style={{ backgroundColor: theme.primary, opacity: 0.95 }}
					/>
				</div>
			</div>
		</div>
	);
}
