import type { PreviewTemplateProps } from "./types";

export function DashboardSaasPreview({ theme }: PreviewTemplateProps) {
	return (
		<>
			<div
				className="px-4 py-3 flex items-center justify-between"
				style={{
					backgroundColor: theme.background,
					borderBottom: `1px solid ${theme.border}`,
				}}
			>
				<div
					className="text-xs font-semibold"
					style={{ color: theme.foreground }}
				>
					SaaS Suite
				</div>
				<div className="flex gap-2">
					<div
						className="w-12 h-2 rounded-full"
						style={{ backgroundColor: theme.mutedForeground, opacity: 0.35 }}
					/>
					<div
						className="w-8 h-2 rounded-full"
						style={{ backgroundColor: theme.ring }}
					/>
				</div>
			</div>

			<div
				className="grid grid-cols-[56px_1fr]"
				style={{ backgroundColor: theme.bgPage }}
			>
				<div
					className="px-2 py-3 flex flex-col gap-2 border-r"
					style={{
						borderColor: theme.border,
						backgroundColor: theme.muted,
					}}
				>
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-6 rounded"
							style={{
								backgroundColor: i === 2 ? theme.secondary : theme.input,
								opacity: 0.7,
							}}
						/>
					))}
				</div>
				<div className="p-3 space-y-2">
					<div className="grid grid-cols-3 gap-2">
						{[theme.primary, theme.secondary, theme.ring].map(
							(color, index) => (
								<div
									key={`${color}-${index}`}
									className="h-12 rounded-md"
									style={{ backgroundColor: color, opacity: 0.9 }}
								/>
							),
						)}
					</div>
					<div
						className="h-16 rounded-md border"
						style={{
							borderColor: theme.border,
							backgroundColor: theme.cardBg,
						}}
					/>
					<div
						className="h-10 rounded-md"
						style={{ backgroundColor: theme.destructive, opacity: 0.65 }}
					/>
				</div>
			</div>
		</>
	);
}
