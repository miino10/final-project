
import { db } from "@/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  customers,
  invoices,
  receipts,
  customerPrepayments,
} from "@/db/schema";
import Decimal from "decimal.js";
import { and, eq, desc, isNull, or } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";

const routeContextSchema = z.object({
  params: z.object({
    customerId: z.string().refine((val) => !isNaN(parseInt(val, 10)), {
      message: "Customer ID must be a valid number",
    }),
  }),
});

export async function GET(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const validationResult = routeContextSchema.safeParse(context);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.message },
        { status: 400 }
      );
    }
    const customerId = parseInt(validationResult.data.params.customerId, 10);

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.orgsId, orgId), eq(customers.id, customerId)),
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    const customerInvoices = await db.query.invoices.findMany({
      columns: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        dueBalance: true,
        total: true,
        status: true,
      },
      where: and(
        eq(invoices.orgsId, orgId),
        eq(invoices.customerId, customerId)
      ),
      orderBy: [desc(invoices.invoiceDate)],

      with: {
        items: true,
      },
    });

    const customerReceipts = await db.query.receipts.findMany({
      columns: {
        receiptId: true,
        receiptNumber: true,
        receiptDate: true,
        total: true,
        status: true,
      },
      where: and(
        eq(receipts.orgsId, orgId),
        eq(receipts.customerId, customerId)
      ),
      orderBy: [desc(receipts.receiptDate)],
    });

    // Fetch Customer Prepayments
    const customerPrepaymentData = await db.query.customerPrepayments.findMany({
      columns: {
        id: true,
        customerPrepaymentNo: true,
        paymentDate: true,
        remainingBalance: true,
        status: true,
        paymentMethod: true,
      },
      where: and(
        eq(customerPrepayments.orgsId, orgId),
        eq(customerPrepayments.customerId, customerId)
      ),
      orderBy: [desc(customerPrepayments.paymentDate)],
    });



    // Calculate Customer Balance: SUM(invoices.dueBalance) - SUM(unapplied customerPrepayments.remainingBalance) - SUM(unapplied creditMemos.remainingBalance)
    const unpaidInvoices = await db.query.invoices.findMany({
      columns: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        dueBalance: true,
        total: true,
        status: true,
      },
      where: and(
        eq(invoices.customerId, customerId),
        eq(invoices.orgsId, orgId),
        or(
          isNull(invoices.status),
          eq(invoices.status, "pending"),
          eq(invoices.status, "partial")
        )
      ),
    });

    let unpaidInvoiceBalance = new Decimal(0);
    unpaidInvoices.forEach((invoice) => {
      unpaidInvoiceBalance = unpaidInvoiceBalance.plus(invoice.dueBalance || 0);
    });

    // Calculate unapplied prepayments
    const unappliedPrepayments = await db.query.customerPrepayments.findMany({
      columns: {
        id: true,
        customerPrepaymentNo: true,
        paymentDate: true,
        remainingBalance: true,
        status: true,
        paymentMethod: true,
      },
      where: and(
        eq(customerPrepayments.customerId, customerId),
        eq(customerPrepayments.orgsId, orgId),
        or(
          eq(customerPrepayments.status, "AVAILABLE"),
          eq(customerPrepayments.status, "PARTIALLY_APPLIED")
        )
      ),
    });
    let totalUnappliedPrepayments = new Decimal(0);
    unappliedPrepayments.forEach((prepayment) => {
      totalUnappliedPrepayments = totalUnappliedPrepayments.plus(
        prepayment.remainingBalance || 0
      );
    });

 

    // Final Customer Balance
    const customerBalance = unpaidInvoiceBalance
      .minus(totalUnappliedPrepayments)
     

    const reportData = {
      customer,
      invoices: customerInvoices,
      receipts: customerReceipts,
      prepayments: customerPrepaymentData,
      creditMemos: [],
      customerBalance,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    return handleApiError(error);
  }
}
