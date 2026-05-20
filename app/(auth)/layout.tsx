import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign In — ColorVault",
	description:
		"Sign in to your ColorVault account to save and manage your favorite colors, palettes, and gradients.",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
