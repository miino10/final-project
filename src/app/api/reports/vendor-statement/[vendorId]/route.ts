
import { db } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { vendors, bills, vendorPrepayments, purchaseOrders } from "@/db/schema";
import Decimal from "decimal.js";
import { and, eq, desc } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";

// Define the expected shape of the route parameters with validation
const routeContextSchema = z.object({
  params: z.object({
    vendorId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Vendor ID must be a valid number",
    }),
  }),
});

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  // const { searchParams } = new URL(req.url);
  // const page = parseInt(searchParams.get("page") || "1");
  // const pageSize = parseInt(searchParams.get("pageSize") || "10");
  // const startDate = searchParams.get("startDate");
  // const endDate = searchParams.get("endDate");

  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    // Validate and parse the vendor ID from the route parameters
    const validationResult = routeContextSchema.safeParse(context);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.message },
        { status: 400 }
      );
    }
    const vendorId = parseInt(validationResult.data.params.vendorId, 10);

    // Fetch vendor details using Drizzle syntax
    const vendor = await db.query.vendors.findFirst({
      where: and(eq(vendors.orgsId, orgId), eq(vendors.id, vendorId)),
    });

    // Handle case where vendor is not found
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    // Fetch Bills for the vendor, including related items and payments
    const vendorBills = await db.query.bills.findMany({
      where: and(eq(bills.orgsId, orgId), eq(bills.vendorId, vendorId)),
      orderBy: [desc(bills.billDate)],
      with: {
        unBilledReceiptItem: {
          columns: {
            unBilledNumber: true,
          },
        },
        purchaseOrder: {
          columns: {
            PurchaseOrderNumber: true,
          },
        },
      },
    });

    // Fetch Vendor Prepayments
    const vendorPrepaymentData = await db.query.vendorPrepayments.findMany({
      where: and(
        eq(vendorPrepayments.orgsId, orgId),
        eq(vendorPrepayments.vendorId, vendorId)
      ),
      orderBy: [desc(vendorPrepayments.paymentDate)],
    });

    // Fetch Purchase Orders for the vendor
    const vendorPurchaseOrders = await db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.orgsId, orgId),
        eq(purchaseOrders.vendorId, vendorId)
      ),
      orderBy: [desc(purchaseOrders.orderDate)],
      with: {
        purchaseItems: true,
      },
    });

    // SUM(bills.dueBalance)
    const unpaidBills = await db.query.bills.findMany({
      where: and(eq(bills.vendorId, vendorId), eq(bills.orgsId, orgId)),
    });

    let unpaidDueBalance = new Decimal(0);

    unpaidBills.forEach((bill) => {
      unpaidDueBalance = unpaidDueBalance.plus(bill.dueBalance || 0);
    });

    //TDOD:unAppliedVendorCredits

    //TDOD:refundsFromVendor

    const vendorBalance = unpaidDueBalance;

    const reportData = {
      vendor,
      bills: vendorBills,
      prepayments: vendorPrepaymentData,
      purchaseOrders: vendorPurchaseOrders,
      vendorBalance,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    return handleApiError(error);
  }
}
