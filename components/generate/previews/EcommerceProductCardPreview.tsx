import type { PreviewTemplateProps } from "./types";

export function EcommerceProductCardPreview({ theme }: PreviewTemplateProps) {
	return (
		<div className="p-4" style={{ backgroundColor: theme.bgPage }}>
			<div
				className="mx-auto max-w-[220px] rounded-xl border overflow-hidden"
				style={{ borderColor: theme.border, backgroundColor: theme.cardBg }}
			>
				<div
					className="h-28"
					style={{
						background: `linear-gradient(135deg, ${theme.primary}, ${theme.ring})`,
					}}
				/>
				<div className="p-3 space-y-2">
					<div
						className="h-2 w-4/5 rounded-full"
						style={{ backgroundColor: theme.textBody, opacity: 0.35 }}
					/>
					<div
						className="h-1.5 w-1/2 rounded-full"
						style={{ backgroundColor: theme.textMuted, opacity: 0.55 }}
					/>
					<div className="flex items-center justify-between pt-1">
						<div
							className="h-4 w-12 rounded"
							style={{ backgroundColor: theme.secondary, opacity: 0.9 }}
						/>
						<div
							className="h-7 w-20 rounded"
							style={{ backgroundColor: theme.primary, opacity: 0.95 }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
