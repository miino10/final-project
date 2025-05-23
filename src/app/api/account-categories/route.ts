import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await db.query.accountCategories.findMany({
    orderBy: (accountCategory, { desc }) => [desc(accountCategory.name)],
  });

  return NextResponse.json(categories);
}