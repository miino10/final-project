import { db } from "@/db";
import { accounts, customerPrepayments } from "@/db/schema";
import { handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    console.log("id", id);
    const customerPrepayment = await db.query.customerPrepayments.findMany({
      columns: {
        id: true,
        customerPrepaymentNo: true,
        paymentDate: true,
        amount: true,
        customerId: true,
        paymentMethod: true,
        status: true,
        remainingBalance: true,
      },
      where: and(
        eq(customerPrepayments.customerId, id),
        eq(customerPrepayments.orgsId, orgId)
      ),
    });
    console.log("customerPrepayment", customerPrepayment);
    return NextResponse.json(customerPrepayment);
  } catch (error) {
    return handleApiError(error);
  }
}
