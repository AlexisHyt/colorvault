"use client";

import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ColorInput } from "@/components/generate/ColorInput";
import { ExportDialog } from "@/components/generate/ExportDialog";
import { ImageColorPickerButton } from "@/components/generate/ImageColorPickerButton";
import { LoadPaletteButton } from "@/components/generate/LoadPaletteButton";
import { PalettePreview } from "@/components/generate/PalettePreview";
import { PaletteRow } from "@/components/generate/PaletteRow";
import { SavePaletteButton } from "@/components/generate/SavePaletteButton";
import { WcagPanel } from "@/components/generate/WcagPanel";
import { Button } from "@/components/ui/button";
import type { SavedPalette } from "@/lib/actions/saved-palettes";
import { DEFAULT_PRIMARY } from "@/lib/generate/constants";
import { hslToHex } from "@/lib/generate/hslToHex";
import { isValidHex } from "@/lib/generate/isValidHex";
import {
	type ColorRole,
	deriveHarmonies,
	generateWebPalette,
	type SemanticTokenPalette,
	toSemanticTokens,
	type WebPalette,
} from "@/lib/generate-palette";
import { oklchaToHex } from "@/lib/utils";

const SEMANTIC_TOKEN_ORDER: (keyof SemanticTokenPalette)[] = [
	"background",
	"foreground",
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"muted",
	"muted-foreground",
	"border",
	"input",
	"ring",
	"destructive",
];

const EDITABLE_COLOR_CONTROLS: Array<{
	role: ColorRole;
	label: string;
	description: string;
}> = [
	{
		role: "primary",
		label: "Primary (--primary)",
		description: "Main brand color used for key actions.",
	},
	{
		role: "secondary",
		label: "Secondary (--secondary)",
		description: "Support color for secondary actions and surfaces.",
	},
	{
		role: "accent",
		label: "Ring (--ring)",
		description: "Focus and highlight color used for emphasis.",
	},
	{
		role: "other",
		label: "Background (--background)",
		description: "Base background tone used to derive neutral surfaces.",
	},
];

export function GeneratePaletteClient({
	isAuthenticated,
	savedPalettes: initialSavedPalettes,
}: {
	isAuthenticated: boolean;
	savedPalettes: SavedPalette[];
}) {
	const [savedPalettesList, setSavedPalettesList] =
		useState<SavedPalette[]>(initialSavedPalettes);
	const [baseColor, setBaseColor] = useState(DEFAULT_PRIMARY);
	const [manualOverrides, setManualOverrides] = useState<
		Partial<Record<ColorRole, boolean>>
	>({});
	const [colorInputs, setColorInputs] = useState<Record<ColorRole, string>>(
		() => {
			const harmonies = deriveHarmonies(DEFAULT_PRIMARY);
			return { primary: DEFAULT_PRIMARY, ...harmonies };
		},
	);
	const [palette, setPalette] = useState<WebPalette>(() =>
		generateWebPalette({
			primary: DEFAULT_PRIMARY,
			...deriveHarmonies(DEFAULT_PRIMARY),
		}),
	);
	const [wcagOpen, setWcagOpen] = useState(false);
	const secondaryLocked = !!manualOverrides.secondary;
	const accentLocked = !!manualOverrides.accent;
	const otherLocked = !!manualOverrides.other;

	const handlePrimaryChange = (hex: string) => {
		if (!isValidHex(hex)) return;
		setBaseColor(hex);
		const harmonies = deriveHarmonies(hex);
		setColorInputs((prev) => ({
			primary: hex,
			secondary: secondaryLocked ? prev.secondary : harmonies.secondary,
			accent: accentLocked ? prev.accent : harmonies.accent,
			other: otherLocked ? prev.other : harmonies.other,
		}));
	};

	const handleRoleChange = (role: ColorRole, hex: string) => {
		if (!isValidHex(hex)) return;
		setColorInputs((prev) => ({ ...prev, [role]: hex }));
	};

	const toggleLock = (role: ColorRole) => {
		if (role === "primary") return;
		setManualOverrides((prev) => {
			const next = { ...prev, [role]: !prev[role] };
			if (!next[role]) {
				const harmonies = deriveHarmonies(baseColor);
				setColorInputs((prev2) => ({
					...prev2,
					[role]: harmonies[role as keyof typeof harmonies],
				}));
			}
			return next;
		});
	};

	useEffect(() => {
		if (Object.values(colorInputs).every(isValidHex)) {
			setPalette(generateWebPalette(colorInputs));
		}
	}, [colorInputs]);

	const semanticTokens = useMemo(() => toSemanticTokens(palette), [palette]);

	const randomize = () => {
		const hue = Math.floor(Math.random() * 360);
		const sat = 0.5 + Math.random() * 0.3;
		const light = 0.45 + Math.random() * 0.15;
		const hex = hslToHex(hue, sat, light);
		handlePrimaryChange(hex);
		setManualOverrides({});
	};

	const loadPalette = (p: SavedPalette) => {
		const primary = oklchaToHex(p.colors.primary);
		const secondary = oklchaToHex(p.colors.secondary);
		const accent = oklchaToHex(p.colors.ring);
		const other = oklchaToHex(p.colors.background);
		setBaseColor(primary);
		setManualOverrides({ secondary: true, accent: true, other: true });
		setColorInputs({ primary, secondary, accent, other });
	};

	return (
		<div className="space-y-10">
			{/* Controls + Preview */}
			<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
				{/* Header row */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-white font-bold text-lg">
							Color configuration
						</h2>
						<p className="text-slate-400 text-sm">
							Pick your primary color — the others are derived automatically.
						</p>
					</div>
				</div>

				{/* Two-column layout */}
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left: vertical color inputs */}
					<div className="flex flex-col gap-5 lg:w-72 shrink-0">
						<div className="flex flex-col gap-2">
							<div className="flex justify-between items-center gap-2 w-full">
								{isAuthenticated && (
									<div className="w-full">
										<LoadPaletteButton
											savedPalettes={savedPalettesList}
											isAuthenticated={isAuthenticated}
											onLoad={(p) => {
												loadPalette(p);
											}}
										/>
									</div>
								)}
								<div className="w-full">
									<ImageColorPickerButton
										onExtract={(colors) => {
											setBaseColor(colors.primary);
											setManualOverrides({
												secondary: true,
												accent: true,
												other: true,
											});
											setColorInputs(colors);
										}}
									/>
								</div>
							</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={randomize}
								className="gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Randomize
							</Button>
						</div>
						{EDITABLE_COLOR_CONTROLS.map(({ role, label, description }) => (
							<ColorInput
								key={role}
								label={label}
								description={description}
								value={colorInputs[role]}
								onChange={(hex) => {
									if (role === "primary") handlePrimaryChange(hex);
									else handleRoleChange(role, hex);
								}}
								locked={role === "primary" ? true : !!manualOverrides[role]}
								onToggleLock={() => toggleLock(role)}
							/>
						))}

						<div className="flex items-center justify-start gap-2 pt-1">
							<ExportDialog palette={palette} />
							<SavePaletteButton
								colorInputs={colorInputs}
								isAuthenticated={isAuthenticated}
								onSaved={(p) => setSavedPalettesList((prev) => [...prev, p])}
							/>
						</div>

						<div className="pt-2 border-t border-slate-700/70">
							<p className="text-slate-400 text-[11px] uppercase tracking-widest font-semibold mb-2">
								Semantic tokens
							</p>
							<div className="space-y-1.5 max-h-74 overflow-y-auto pr-1">
								{SEMANTIC_TOKEN_ORDER.map((token) => {
									const color = semanticTokens[token];
									return (
										<div
											key={token}
											className="flex items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-900/50 px-2 py-1.5"
										>
											<div className="flex items-center gap-2 min-w-0">
												<div
													className="w-4 h-4 rounded-sm border border-white/15 shrink-0"
													style={{ backgroundColor: color }}
												/>
												<span className="text-[11px] text-slate-300 font-mono truncate">
													--{token}
												</span>
											</div>
											<span className="text-[10px] text-slate-500 font-mono truncate max-w-30">
												{color}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					{/* Right: website preview */}
					<div className="flex-1 flex flex-col gap-3 lg:ml-16">
						<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
							Preview
						</p>
						<PalettePreview semanticColors={semanticTokens} />
					</div>
				</div>
			</div>

			{/* Palette scales */}
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
						Scales
					</p>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setWcagOpen((v) => !v)}
						className="gap-2 text-xs text-slate-400 hover:text-white"
					>
						{wcagOpen ? (
							<EyeOff className="w-3.5 h-3.5" />
						) : (
							<Eye className="w-3.5 h-3.5" />
						)}
						{wcagOpen ? "Hide" : "Show"} WCAG accessibility
					</Button>
				</div>
				{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
					(role) => (
						<div
							key={role}
							className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6"
						>
							<PaletteRow role={role} scale={palette[role]} />
							{wcagOpen && <WcagPanel scale={palette[role]} />}
						</div>
					),
				)}
			</div>
		</div>
	);
}
