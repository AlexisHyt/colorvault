import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPalettes } from "@/lib/actions/admin/palette/getPalettes";

export default async function PalettesPage() {
	const palettes = await getPalettes();

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">Color Palettes</h1>
				<p className="text-slate-400">
					Browse curated color palettes from popular design systems
				</p>
			</div>

			<p className="text-xl mb-2 font-semibold">Main palettes</p>
			<div className="grid grid-cols-3 gap-4 mb-8">
				{palettes
					.filter((palette) => palette.category === "main")
					.map((palette) => (
						<div key={palette.id} className="animated-border">
							<Card className="bg-slate-800 p-4 h-full">
								<CardHeader>
									<h2 className="font-bold text-white text-xl">
										{palette.name}
									</h2>
									<p className="text-sm m-0 p-0">{palette.description}</p>
									<p className="text-muted-foreground text-sm m-0 p-0">
										{palette.rows.flatMap((row) => row.colors).length} color
										{palette.rows.flatMap((row) => row.colors).length !== 1
											? "s"
											: ""}
									</p>
								</CardHeader>
								<CardContent>
									<Button variant="default" className="w-fit" asChild>
										<Link href={`/palettes/${palette.slug}`}>View colors</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					))}
			</div>

			<p className="text-xl mb-2 font-semibold">Other palettes</p>
			<div className="grid grid-cols-3 gap-4">
				{palettes
					.filter((palette) => palette.category !== "main")
					.map((palette) => (
						<Card
							key={palette.id}
							className="border-slate-700 bg-slate-800/50 p-4"
						>
							<CardHeader>
								<h2 className="font-bold text-white text-xl">{palette.name}</h2>
								<p className="text-sm m-0 p-0">{palette.description}</p>
								<p className="text-muted-foreground text-sm m-0 p-0">
									{palette.rows.flatMap((row) => row.colors).length} color
									{palette.rows.flatMap((row) => row.colors).length !== 1
										? "s"
										: ""}
								</p>
							</CardHeader>
							<CardContent>
								<Button variant="default" className="w-fit" asChild>
									<Link href={`/palettes/${palette.slug}`}>View colors</Link>
								</Button>
							</CardContent>
						</Card>
					))}
			</div>
		</main>
	);
}
