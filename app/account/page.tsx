import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountClient } from "@/components/account-client";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user) {
		redirect("/signin");
	}

	return (
		<main className="container mx-auto px-4 py-8 max-w-2xl">
			<div className="mb-8">
				<h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
				<p className="text-slate-400">
					Manage your username, password and account
				</p>
			</div>
			<AccountClient
				user={{ name: session.user.name, email: session.user.email }}
			/>
		</main>
	);
}
