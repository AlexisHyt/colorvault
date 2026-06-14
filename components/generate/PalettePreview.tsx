"use client";

import { Eye } from "lucide-react";
import dynamic from "next/dynamic";
import { type ComponentType, useState } from "react";
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
} from "@/lib/generate/colorblind-helpers";
import type { SemanticTokenPalette } from "@/lib/generate-palette";
import {
	PREVIEW_TEMPLATE_OPTIONS,
	type PreviewTemplateId,
	type PreviewTemplateProps,
	type PreviewTheme,
} from "./previews/types";

const templateLoadingFallback = (
	<div className="h-70 flex items-center justify-center text-xs text-slate-400 bg-slate-900/40">
		Loading preview...
	</div>
);

export const TEMPLATE_COMPONENTS: Record<
	PreviewTemplateId,
	ComponentType<PreviewTemplateProps>
> = {
	"landing-page": dynamic(
		() =>
			import("./previews/LandingPagePreview").then(
				(mod) => mod.LandingPagePreview,
			),
		{ loading: () => templateLoadingFallback },
	),
	"saas-dashboard": dynamic(
		() =>
			import("./previews/DashboardSaasPreview").then(
				(mod) => mod.DashboardSaasPreview,
			),
		{ loading: () => templateLoadingFallback },
	),
	form: dynamic(
		() => import("./previews/FormPreview").then((mod) => mod.FormPreview),
		{ loading: () => templateLoadingFallback },
	),
	"pricing-cards": dynamic(
		() =>
			import("./previews/PricingCardsPreview").then(
				(mod) => mod.PricingCardsPreview,
			),
		{ loading: () => templateLoadingFallback },
	),
	"mobile-app": dynamic(
		() =>
			import("./previews/MobileAppPreview").then((mod) => mod.MobileAppPreview),
		{ loading: () => templateLoadingFallback },
	),
	blog: dynamic(
		() => import("./previews/BlogPreview").then((mod) => mod.BlogPreview),
		{ loading: () => templateLoadingFallback },
	),
	"ecommerce-product-card": dynamic(
		() =>
			import("./previews/EcommerceProductCardPreview").then(
				(mod) => mod.EcommerceProductCardPreview,
			),
		{ loading: () => templateLoadingFallback },
	),
};

function buildPreviewTheme(
	semanticColors: SemanticTokenPalette,
	cbMode: ColorblindType,
) {
	const sim = (hex: string) => simulateColorblind(hex, cbMode);
	const primary = sim(semanticColors.primary);
	const secondary = sim(semanticColors.secondary);
	const ring = sim(semanticColors.ring);
	const background = sim(semanticColors.background);
	const foreground = sim(semanticColors.foreground);
	const muted = sim(semanticColors.muted);
	const mutedForeground = sim(semanticColors["muted-foreground"]);
	const border = sim(semanticColors.border);
	const input = sim(semanticColors.input);
	const destructive = sim(semanticColors.destructive);
	const primaryForeground = sim(semanticColors["primary-foreground"]);
	const secondaryForeground = sim(semanticColors["secondary-foreground"]);

	const theme: PreviewTheme = {
		background,
		foreground,
		primary,
		secondary,
		primaryForeground,
		secondaryForeground,
		muted,
		mutedForeground,
		border,
		input,
		ring,
		destructive,
		bgPage: background,
		cardBg: muted,
		textMuted: mutedForeground,
		textBody: foreground,
		borderSoft: border,
	};

	return theme;
}

export function PalettePreview({
	semanticColors,
}: {
	semanticColors: SemanticTokenPalette;
}) {
	const [cbMode, setCbMode] = useState<ColorblindType>("normal");
	const [templateId, setTemplateId] =
		useState<PreviewTemplateId>("landing-page");
	const theme = buildPreviewTheme(semanticColors, cbMode);
	const ActiveTemplate = TEMPLATE_COMPONENTS[templateId];

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
					value={templateId}
					onValueChange={(v) => setTemplateId(v as PreviewTemplateId)}
				>
					<SelectTrigger className="h-6 w-auto min-w-42.5 rounded border-slate-600 bg-slate-700/60 text-[11px] text-slate-300 gap-1 px-2">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="border-slate-700 bg-slate-800 text-slate-200 text-xs">
						{PREVIEW_TEMPLATE_OPTIONS.map((option) => (
							<SelectItem key={option.id} value={option.id} className="text-xs">
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={cbMode}
					onValueChange={(v) => setCbMode(v as ColorblindType)}
				>
					<SelectTrigger className="h-6 w-auto min-w-35 rounded border-slate-600 bg-slate-700/60 text-[11px] text-slate-300 gap-1 px-2">
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

			<ActiveTemplate theme={theme} />
		</div>
	);
}
