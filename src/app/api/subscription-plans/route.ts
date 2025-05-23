
import { db } from "@/db";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId, orgId } = auth();
  console.log("orgId", orgId);

  if (!userId) {
    throw new ApiError(403, "Unauthorized");
  }

//   if (!orgId) {
//     throw new ApiError(403, "Unauthorized");
//   }

  try {
    const plans = await db.query.subscriptionPlans.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        duration: true,
      },
    });
    console.log("palns", plans);
    return NextResponse.json(plans);
  } catch (error) {
    return handleApiError(error);
  }
}
