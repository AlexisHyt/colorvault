"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ColorInput } from "@/components/generate/ColorInput";
import { ExportDialog } from "@/components/generate/ExportDialog";
import { LoadPaletteButton } from "@/components/generate/LoadPaletteButton";
import { PalettePreview } from "@/components/generate/PalettePreview";
import { PaletteRow } from "@/components/generate/PaletteRow";
import { SavePaletteButton } from "@/components/generate/SavePaletteButton";
import { Button } from "@/components/ui/button";
import type { SavedPalette } from "@/lib/actions/saved-palettes";
import {
	DEFAULT_PRIMARY,
	ROLE_DESCRIPTIONS,
	ROLE_LABELS,
} from "@/lib/generate/constants";
import { hslToHex } from "@/lib/generate/hslToHex";
import { isValidHex } from "@/lib/generate/isValidHex";
import {
	type ColorRole,
	deriveHarmonies,
	generateWebPalette,
	type WebPalette,
} from "@/lib/generate-palette";
import { oklchaToHex } from "@/lib/utils";

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

	const handlePrimaryChange = useCallback(
		(hex: string) => {
			if (!isValidHex(hex)) return;
			setBaseColor(hex);
			const harmonies = deriveHarmonies(hex);
			setColorInputs((prev) => ({
				primary: hex,
				secondary: manualOverrides.secondary
					? prev.secondary
					: harmonies.secondary,
				accent: manualOverrides.accent ? prev.accent : harmonies.accent,
				other: manualOverrides.other ? prev.other : harmonies.other,
			}));
		},
		[manualOverrides],
	);

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

	const randomize = () => {
		const hue = Math.floor(Math.random() * 360);
		const sat = 0.5 + Math.random() * 0.3;
		const light = 0.45 + Math.random() * 0.15;
		const hex = hslToHex(hue, sat, light);
		handlePrimaryChange(hex);
		setManualOverrides({});
	};

	const loadPalette = (p: SavedPalette) => {
		const primary = oklchaToHex(p.primaryColor);
		const secondary = oklchaToHex(p.secondaryColor);
		const accent = oklchaToHex(p.accentColor);
		const other = oklchaToHex(p.neutralColor);
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
						<div className="flex items-center gap-2">
							<LoadPaletteButton
								savedPalettes={savedPalettesList}
								isAuthenticated={isAuthenticated}
								onLoad={(p) => {
									loadPalette(p);
								}}
							/>
							<Button
								variant="secondary"
								size="sm"
								onClick={randomize}
								className="gap-2 w-fit"
							>
								<RefreshCw className="w-4 h-4" />
								Randomize
							</Button>
						</div>
						{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
							(role) => (
								<ColorInput
									key={role}
									label={ROLE_LABELS[role]}
									description={ROLE_DESCRIPTIONS[role]}
									value={colorInputs[role]}
									onChange={(hex) => {
										if (role === "primary") handlePrimaryChange(hex);
										else handleRoleChange(role, hex);
									}}
									locked={role === "primary" ? true : !!manualOverrides[role]}
									onToggleLock={() => toggleLock(role)}
								/>
							),
						)}

						<div className="flex items-center justify-end gap-2 pt-1">
							<SavePaletteButton
								colorInputs={colorInputs}
								isAuthenticated={isAuthenticated}
								onSaved={(p) => setSavedPalettesList((prev) => [...prev, p])}
							/>
							<ExportDialog palette={palette} />
						</div>
					</div>

					{/* Right: website preview */}
					<div className="flex-1 flex flex-col gap-3 lg:ml-16">
						<p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
							Preview
						</p>
						<PalettePreview colors={colorInputs} />
						{/* Color chips legend */}
						<div className="flex gap-3 flex-wrap mt-1">
							{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
								(role) => (
									<div key={role} className="flex items-center gap-1.5">
										<div
											className="w-3 h-3 rounded-full border border-white/10"
											style={{ backgroundColor: colorInputs[role] }}
										/>
										<span className="text-xs text-slate-400">
											{ROLE_LABELS[role]}
										</span>
									</div>
								),
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Palette scales */}
			<div className="space-y-8">
				{(["primary", "secondary", "accent", "other"] as ColorRole[]).map(
					(role) => (
						<div
							key={role}
							className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6"
						>
							<PaletteRow role={role} scale={palette[role]} />
						</div>
					),
				)}
			</div>
		</div>
	);
}
