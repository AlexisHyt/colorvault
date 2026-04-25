"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, isPending } = useSession();

	useEffect(() => {
		if (!isPending && (!session?.user || session.user.role !== "admin")) {
			router.push("/");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (!session?.user || session.user.role !== "admin") {
		return null;
	}

	return <>{children}</>;
}
