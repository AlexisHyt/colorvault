import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "ColorVault - Find & Explore Amazing Color Palettes",
	description:
		"Discover color palettes, website brand colors, and gradients in multiple formats. Sign in to save your favorites.",
	generator: "v0.app",
	icons: {
		icon: [
			{
				url: "/ColorVault.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/ColorVault.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/ColorVault.ico",
				type: "image/vnd",
			},
		],
		apple: "/ColorVault.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className="font-sans antialiased bg-slate-950 text-slate-50">
				<Header />
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster />
			</body>
		</html>
	);
}
