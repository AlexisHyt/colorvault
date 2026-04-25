import { Palette, Sparkles, Waves, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<main className="min-h-screen">
			{/* Hero Section */}
			<section className="container mx-auto px-4 py-20 text-center">
				<div className="space-y-6 max-w-2xl mx-auto">
					<h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
						ColorVault
					</h1>
					<p className="text-xl text-slate-300">
						Discover and explore amazing color palettes, website brand colors,
						and beautiful gradients in multiple formats
					</p>

					<div className="flex flex-wrap justify-center gap-4 pt-4">
						<Link href="/palettes">
							<Button variant="bigBlue" size="xl">
								Browse Palettes
							</Button>
						</Link>
						<Link href="/websites">
							<Button variant="bigBlue" size="xl">
								Browse Websites
							</Button>
						</Link>
						<Link href="/gradients">
							<Button variant="bigBlue" size="xl">
								Browse Gradients
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 py-20">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-white text-center mb-16">
						Features
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
						<div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-blue-600/20 p-3 rounded-lg">
									<Palette className="w-8 h-8 text-blue-400" />
								</div>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Color Palettes
							</h3>
							<p className="text-slate-400">
								Curated palettes from Material Design, Bootstrap, Tailwind, and
								more
							</p>
						</div>

						<div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-cyan-600/20 p-3 rounded-lg">
									<Sparkles className="w-8 h-8 text-cyan-400" />
								</div>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Brand Colors
							</h3>
							<p className="text-slate-400">
								Explore the primary colors of famous websites and brands
							</p>
						</div>

						<div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-orange-600/20 p-3 rounded-lg">
									<Waves className="w-8 h-8 text-orange-400" />
								</div>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Gradients
							</h3>
							<p className="text-slate-400">
								Grab beautiful gradients for your designs
							</p>
						</div>

						<div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-teal-600/20 p-3 rounded-lg">
									<Zap className="w-8 h-8 text-teal-400" />
								</div>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Multiple Formats
							</h3>
							<p className="text-slate-400">
								Copy colors in HEX, RGB, RGBA, or HSL format with one click
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="container mx-auto px-4 py-20 text-center">
				<div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-12">
					<h2 className="text-3xl font-bold text-white mb-4">
						Start Exploring
					</h2>
					<p className="text-slate-300 mb-8 max-w-xl mx-auto">
						Sign in to save your favorite colors and gradients for later use
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link href="/palettes">
							<Button className="bg-blue-600 hover:bg-blue-700 text-white">
								View All Palettes
							</Button>
						</Link>
						<Link href="/websites">
							<Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
								Website Colors
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
