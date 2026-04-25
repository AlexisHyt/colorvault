"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function isAdmin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session?.user.role === "admin";
}

export async function redirectIfNotAdmin() {
	const asA = await isAdmin();

	if (!asA) {
		redirect("/");
	}
}
