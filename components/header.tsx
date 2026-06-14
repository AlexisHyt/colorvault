"use client";

import { Menu, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";

export function Header() {
	const router = useRouter();
	const { data: session } = useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const isVerifiedUser = !!session?.user && session.user.emailVerified;
	const navLinks = [
		{ href: "/palettes", label: "Palettes" },
		{ href: "/websites", label: "Website Colors" },
		{ href: "/technologies", label: "Tech Colors" },
		{ href: "/gradients", label: "Gradients" },
		{ href: "/generate", label: "Generator" },
		{ href: "/convert", label: "Converter" },
		{ href: "/wcag", label: "WCAG Checker" },
		{ href: "/harmonies", label: "Harmonies" },
		{ href: "/favorites", label: "Favorites", verifiedOnly: true },
	];

	const handleSignOut = async () => {
		await signOut();
		setIsMobileMenuOpen(false);
		router.push("/");
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
			<nav className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<Link
						href="/"
						className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400 flex items-center justify-center gap-2"
					>
						<Image
							src={"ColorVault.png"}
							alt={"ColorVault"}
							height={40}
							width={40}
						/>
						ColorVault
					</Link>

					<div className="hidden md:flex items-center gap-6 text-sm">
						{navLinks.map((link) => {
							if (link.verifiedOnly && !isVerifiedUser) {
								return null;
							}

							return (
								<Link
									key={link.href}
									href={link.href}
									className="text-slate-300 hover:text-white transition"
								>
									{link.label}
								</Link>
							);
						})}
					</div>
				</div>

				<div className="hidden md:flex items-center gap-4">
					{session?.user ? (
						<>
							{isVerifiedUser && session.user.role === "admin" && (
								<Link href="/admin">
									<Button
										variant="outline"
										size="sm"
										className="border-slate-600 text-slate-300 hover:text-white"
									>
										Admin
									</Button>
								</Link>
							)}
							<Link
								href="/account"
								className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
							>
								<UserCircle size={16} />
								{session.user.name || session.user.email}
							</Link>
							<Button
								variant="outline"
								size="sm"
								onClick={handleSignOut}
								className="border-slate-600 text-slate-300 hover:text-white"
							>
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Link href="/signin">
								<Button
									variant="ghost"
									size="sm"
									className="text-slate-300 hover:text-white"
								>
									Sign In
								</Button>
							</Link>
							<Link href="/signup">
								<Button variant="default" size="sm">
									Sign Up
								</Button>
							</Link>
						</>
					)}
				</div>

				<Button
					variant="ghost"
					size="icon"
					className="md:hidden text-slate-200 hover:text-white"
					onClick={() => setIsMobileMenuOpen((prev) => !prev)}
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
				>
					<Menu className="size-5" />
				</Button>
			</nav>

			{isMobileMenuOpen && (
				<>
					<button
						type="button"
						className="md:hidden fixed inset-0 top-16 bg-black/30"
						onClick={() => setIsMobileMenuOpen(false)}
						aria-label="Close mobile menu"
					/>
					<div className="md:hidden fixed top-16 left-0 right-0 z-50 w-screen border-b border-slate-700 bg-slate-900/95 backdrop-blur-md">
						<div className="flex flex-col px-4 py-3">
							{navLinks.map((link) => {
								if (link.verifiedOnly && !isVerifiedUser) {
									return null;
								}

								return (
									<Link
										key={`mobile-${link.href}`}
										href={link.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="py-3 text-base text-slate-200 hover:text-white transition"
									>
										{link.label}
									</Link>
								);
							})}

							<div className="my-2 h-px w-full bg-slate-700" />

							{session?.user ? (
								<>
									{isVerifiedUser && session.user.role === "admin" && (
										<Link
											href="/admin"
											onClick={() => setIsMobileMenuOpen(false)}
											className="py-3 text-base text-slate-200 hover:text-white transition"
										>
											Admin
										</Link>
									)}
									<Link
										href="/account"
										onClick={() => setIsMobileMenuOpen(false)}
										className="py-3 text-base text-slate-200 hover:text-white transition"
									>
										Account
									</Link>
									<Button
										variant="outline"
										size="sm"
										onClick={handleSignOut}
										className="mt-2 border-slate-600 text-slate-300 hover:text-white"
									>
										Sign Out
									</Button>
								</>
							) : (
								<>
									<Link
										href="/signin"
										onClick={() => setIsMobileMenuOpen(false)}
										className="py-3 text-base text-slate-200 hover:text-white transition"
									>
										Sign In
									</Link>
									<Link
										href="/signup"
										onClick={() => setIsMobileMenuOpen(false)}
										className="py-3 text-base text-slate-200 hover:text-white transition"
									>
										Sign Up
									</Link>
								</>
							)}
						</div>
					</div>
				</>
			)}
		</header>
	);
}
