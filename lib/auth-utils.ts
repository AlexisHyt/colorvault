"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function isAdmin() {
	const session = await getVerifiedSession();

	return session?.user.role === "admin";
}

export async function getVerifiedSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.emailVerified) {
		return null;
	}

	return session;
}

export async function redirectIfNotAdmin() {
	const asA = await isAdmin();

	if (!asA) {
		redirect("/");
	}
}

export async function requireVerifiedSession(redirectPath = "/signin") {
	const session = await getVerifiedSession();

	if (!session) {
		redirect(redirectPath);
	}

	return session;
}
