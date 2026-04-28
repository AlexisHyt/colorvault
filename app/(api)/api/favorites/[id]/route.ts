import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userFavorite } from "@/db/schema";
import { getVerifiedSession } from "@/lib/auth-utils";

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await getVerifiedSession();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = session.user.id;

		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Missing favorite ID" },
				{ status: 400 },
			);
		}

		const parsedId = Number(id);
		if (Number.isNaN(parsedId)) {
			return NextResponse.json(
				{ error: "Invalid favorite ID" },
				{ status: 400 },
			);
		}

		const [favorite] = await db
			.select()
			.from(userFavorite)
			.where(
				and(eq(userFavorite.id, parsedId), eq(userFavorite.userId, userId)),
			);

		if (!favorite) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		await db
			.delete(userFavorite)
			.where(
				and(eq(userFavorite.id, parsedId), eq(userFavorite.userId, userId)),
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting favorite:", error);
		return NextResponse.json(
			{ error: "Failed to delete favorite" },
			{ status: 500 },
		);
	}
}
