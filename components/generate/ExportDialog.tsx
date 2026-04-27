import { ChevronDown, Wand2 } from "lucide-react";
import { CodeBlock } from "@/components/generate/CodeBlock";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	exportAsCSSVariables,
	exportAsFigmaTokens,
	exportAsSCSSVariables,
	exportAsTailwindConfig,
	exportAsTailwindV4CSS,
	type WebPalette,
} from "@/lib/generate-palette";

export function ExportDialog({ palette }: { palette: WebPalette }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Wand2 className="w-4 h-4" />
					Export palette
					<ChevronDown className="w-4 h-4 opacity-60" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
				<DialogHeader>
					<DialogTitle>Export palette</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="css">
					<TabsList className="bg-slate-800 w-full grid grid-cols-5">
						<TabsTrigger value="css">CSS Vars</TabsTrigger>
						<TabsTrigger value="tailwind3">Tailwind v3</TabsTrigger>
						<TabsTrigger value="tailwind4">Tailwind v4</TabsTrigger>
						<TabsTrigger value="scss">SCSS</TabsTrigger>
						<TabsTrigger value="figma">Figma Tokens</TabsTrigger>
					</TabsList>

					<TabsContent value="css" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Native CSS variables — paste into your <code>:root</code>.
						</p>
						<CodeBlock code={exportAsCSSVariables(palette)} />
					</TabsContent>

					<TabsContent value="tailwind3" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Tailwind CSS v3 config — paste into{" "}
							<code>tailwind.config.js</code>.
						</p>
						<CodeBlock code={exportAsTailwindConfig(palette)} />
					</TabsContent>

					<TabsContent value="tailwind4" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Tailwind CSS v4 — paste into your global CSS file under{" "}
							<code>@theme</code>.
						</p>
						<CodeBlock code={exportAsTailwindV4CSS(palette)} />
					</TabsContent>

					<TabsContent value="scss" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							SCSS variables — import into your <code>_variables.scss</code>{" "}
							file.
						</p>
						<CodeBlock code={exportAsSCSSVariables(palette)} />
					</TabsContent>

					<TabsContent value="figma" className="mt-4">
						<p className="text-slate-400 text-sm mb-3">
							Figma Design Tokens (W3C format) — import via the Tokens Studio
							plugin.
						</p>
						<CodeBlock code={exportAsFigmaTokens(palette)} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
