import { db } from "@/db";
import {
  invoices,
  PaymentMethod,
  Payments,
  transactions,
  customerPrepayments,
  customerPrepaymentApplications,
} from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { getDefaultAccounts,createEntry } from "@/lib/queries";
import { receivePaymentFormSchema } from "@/lib/types";
import { auth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

export async function GET(request: Request) {
  const { orgId } = auth();
  if (!orgId) {
    throw new ApiError(401, "Unauthorized - Missing organization ID");
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const fetchAll = searchParams.get("fetchAll") === "true";

  const totalCountResult = await db
    .select({ count: sql`count(*)` })
    .from(Payments)
    .where(eq(Payments.orgsId, orgId))
    .execute();

  const totalCount = totalCountResult[0].count;
  const paymentData = await db.query.Payments.findMany({
    columns: {
      id: true,
      paymentDate: true,
      paymentMethod: true,
      referenceId: true,
      amount: true,
    },
    where: (payments, { eq }) => eq(payments.orgsId, orgId),
    limit: fetchAll ? undefined : pageSize,
    offset: fetchAll ? undefined : (page - 1) * pageSize,
  });

  

  // const totalSum = paymentData.reduce((sum, invoice) => {
  //   const paymentTotal = parseFloat(invoice.amount!);
  //   return sum + (isNaN(paymentTotal) ? 0 : paymentTotal);
  // }, 0);

  const pageCount = fetchAll ? 1 : Math.ceil((totalCount as number) / pageSize);

  return NextResponse.json({
    data: paymentData,
    total: totalCount,
    pageCount: pageCount,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      throw new ApiError(401, "Unauthorized - Missing organization or user ID");
    }
    // Check for active subscription
    

    const validatedData = receivePaymentFormSchema.safeParse(body);

    if (!validatedData.success) {
      const errorMessage = validatedData.error.issues
        .map((issue) => issue.message)
        .join(", ");
      throw new ApiError(400, `Invalid input data: ${errorMessage}`);
    }

    const {
      amount,
      paymentDate,
      paymentMethod,
      referenceId,
      paymentAccountId,
      prepaymentAmount,
      prepaymentId,
      usePrepayment,
    } = validatedData.data;
   
    const formatedDate=format(paymentDate, "yyyy-MM-dd");

    const decimalAmount = new Decimal(amount || 0).toDecimalPlaces(2);
    const decimalPrepaymentAmount =
      usePrepayment && prepaymentId && prepaymentAmount
        ? new Decimal(prepaymentAmount).toDecimalPlaces(2)
        : new Decimal(0);

    const totalPaymentAmount = decimalAmount.plus(decimalPrepaymentAmount);

    if (totalPaymentAmount.isNaN() || totalPaymentAmount.lte(0)) {
      throw new ApiError(400, "Total payment amount must be a positive number");
    }

    return await db.transaction(async (tx) => {
      // Fetch invoice with necessary fields
      const [currentInvoice] = await tx
        .select({
          invoiceId: invoices.invoiceId,
          status: invoices.status,
          total: invoices.total,
          dueBalance: invoices.dueBalance,
          invoiceNumber: invoices.invoiceNumber,
          customerId: invoices.customerId,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.invoiceNumber, referenceId),
            eq(invoices.orgsId, orgId)
          )
        );

      if (!currentInvoice) {
        throw new ApiError(404, `Invoice ${referenceId} not found`);
      }

      if (!currentInvoice.total || !currentInvoice.dueBalance) {
        throw new ApiError(400, "Invoice is missing financial information");
      }

      const currentDueBalance = new Decimal(
        currentInvoice.dueBalance
      ).toDecimalPlaces(2);

      if (currentInvoice.status === "paid") {
        throw new ApiError(400, "Invoice has already been paid in full");
      }

      if (totalPaymentAmount.gt(currentDueBalance)) {
        throw new ApiError(
          400,
          `Payment amount (${totalPaymentAmount}) exceeds due balance (${currentDueBalance})`
        );
      }

      // Accounting setup
      const { accountsReceivable, customerDeposits } = await getDefaultAccounts(
        orgId
      );
      if (!accountsReceivable?.accountId) {
        throw new ApiError(500, "Accounts receivable configuration missing");
      }

      if (usePrepayment && prepaymentId && !customerDeposits?.accountId) {
        throw new ApiError(
          500,
          "Customer deposits account configuration missing"
        );
      }

      // If using prepayment, verify it exists and has sufficient balance
      let prepayment;
      if (
        usePrepayment &&
        prepaymentId &&
        decimalPrepaymentAmount.greaterThan(0)
      ) {
        const prepayments = await tx
          .select()
          .from(customerPrepayments)
          .where(
            and(
              eq(customerPrepayments.id, prepaymentId),
              eq(customerPrepayments.orgsId, orgId),
              eq(
                customerPrepayments.customerId,
                currentInvoice.customerId as number
              )
            )
          )
          .execute();

        if (!prepayments.length) {
          throw new ApiError(400, "Invalid or inactive prepayment");
        }

        prepayment = prepayments[0];
        const remainingBalance = new Decimal(prepayment.remainingBalance);

        if (decimalPrepaymentAmount.greaterThan(remainingBalance)) {
          throw new ApiError(
            400,
            `Prepayment amount (${decimalPrepaymentAmount}) exceeds available prepayment balance: ${remainingBalance}`
          );
        }
      }

      // Create payment transaction
      const [paymentTransaction] = await tx
        .insert(transactions)
        .values({
          date: formatedDate,
          documentId: currentInvoice.invoiceId,
          documentReference: currentInvoice.invoiceNumber,
          documentType: "PAYMENT_RECEIVED",
          description: `Payment received for Invoice ${currentInvoice.invoiceNumber}`,
          userId,
          orgsId: orgId,
        })
        .returning();

      // Create accounting entries for cash payment
      if (decimalAmount.greaterThan(0)) {
        await Promise.all([
          createEntry(
            tx,
            orgId,
            paymentAccountId,
            decimalAmount.toString(),
            paymentTransaction.id,
            "DEBIT",
            userId,
            formatedDate
          ),
          createEntry(
            tx,
            orgId,
            accountsReceivable.accountId,
            decimalAmount.toString(),
            paymentTransaction.id,
            "CREDIT",
            userId,
            formatedDate
          ),
        ]);
      }

      // Create accounting entries and update prepayment if using prepayment
      if (
        usePrepayment &&
        prepaymentId &&
        prepayment &&
        decimalPrepaymentAmount.greaterThan(0)
      ) {
        // Create prepayment application record
        await tx.insert(customerPrepaymentApplications).values({
          prepaymentId: prepaymentId,
          invoiceId: currentInvoice.invoiceId,
          appliedAmount: decimalPrepaymentAmount.toFixed(2),
          applicationDate: formatedDate,
          orgsId: orgId,
          userId,
        });

        // Create accounting entries for prepayment application
        await Promise.all([
          createEntry(
            tx,
            orgId,
            accountsReceivable.accountId,
            decimalPrepaymentAmount.toFixed(2),
            paymentTransaction.id,
            "CREDIT",
            userId,
            formatedDate
          ),
          createEntry(
            tx,
            orgId,
            customerDeposits?.accountId as number,
            decimalPrepaymentAmount.toFixed(2),
            paymentTransaction.id,
            "DEBIT",
            userId,
            formatedDate
          ),
        ]);

        // Update prepayment remaining balance
        const newPrepaymentBalance = new Decimal(
          prepayment.remainingBalance
        ).minus(decimalPrepaymentAmount);
        const prepaymentStatus = newPrepaymentBalance.equals(0)
          ? "FULLY_APPLIED"
          : "PARTIALLY_APPLIED";

        await tx
          .update(customerPrepayments)
          .set({
            remainingBalance: newPrepaymentBalance.toFixed(2),
            status: prepaymentStatus,
          })
          .where(eq(customerPrepayments.id, prepaymentId));
      }

      // Update invoice status and balance
      const newDueBalance = currentDueBalance.minus(totalPaymentAmount);
      const newStatus = newDueBalance.equals(0) ? "paid" : "partial";

      await Promise.all([
        tx
          .update(invoices)
          .set({
            status: newStatus,
            dueBalance: newDueBalance.toFixed(2),
          })
          .where(eq(invoices.invoiceId, currentInvoice.invoiceId)),

        tx.insert(Payments).values({
          invoiceId: currentInvoice.invoiceId,
          paymentAccountId,
          referenceId: currentInvoice.invoiceNumber,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentDate: formatedDate,
          amount: totalPaymentAmount.toFixed(2),
          orgsId: orgId,
          userId,
        }),
      ]);


      return NextResponse.json({
        status: 200,
        message: "Payment received successfully",
        data: {
          invoiceId: currentInvoice.invoiceId,
          newBalance: newDueBalance.toFixed(2),
          status: newStatus,
          transactionId: paymentTransaction.id,
        },
      });
    });
  } catch (error) {
    return handleApiError(error);
  }
}