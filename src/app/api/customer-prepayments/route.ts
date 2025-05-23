import { db } from "@/db";
import { customerPrepayments, entries, transactions } from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { customerPrepaymentsFormSchema } from "@/lib/types";
import { generateCustomerPrepaymentNumber } from "@/lib/generateIdNumber";
import { auth } from "@clerk/nextjs";
import { eq, sql } from "drizzle-orm";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import Decimal from "decimal.js";
import { getDefaultAccounts, getCustomerName, getAccountName } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const totalCountResult = await db
    .select({ count: sql`count(*)` })
    .from(customerPrepayments)
    .where(eq(customerPrepayments.orgsId, orgId))
    .execute();
  const totalCount = totalCountResult[0].count;

  try {
    const customerPrepaymentsData = await db.query.customerPrepayments.findMany(
      {
        columns: {
          id: true,
          customerPrepaymentNo: true,
          paymentDate: true,
          status: true,
          paymentMethod: true,
          memo: true,
          amount: true,
          remainingBalance: true,
        },
        where: eq(customerPrepayments.orgsId, orgId),
        with: {
          customer: {
            columns: {
              name: true,
            },
          },
          paymentAccount: {
            columns: {
              name: true,
            },
          },
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }
    );
    const pageCount = Math.ceil((totalCount as number) / pageSize);
    return NextResponse.json({
      data: customerPrepaymentsData,
      total: totalCount,
      pageCount: pageCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
 
  const body = await req.json();
  const validatedData = customerPrepaymentsFormSchema.safeParse(body);
  if (!validatedData.success) {
    return NextResponse.json(
      {
        message: "Validation failed. Please check your input data.",
      },
      { status: 400 }
    );
  }

  const {
    customerId,
    paymentAccountId,
    paymentDate,
    paymentMethod,
    memo,
    amount,
  } = validatedData.data;
  if (
    !customerId ||
    !paymentAccountId ||
    !paymentDate ||
    !paymentMethod ||
    !amount
  ) {
    return NextResponse.json(
      {
        message:
          "Missing required fields. Please provide all the required data.",
      },
      { status: 400 }
    );
  }

  const formatedDate=format(paymentDate, "yyyy-MM-dd");
  const decimalAmount = new Decimal(amount).toDecimalPlaces(2);

  if (decimalAmount.isNaN() || decimalAmount.lte(0)) {
    return NextResponse.json(
      {
        message: "Payment amount must be a positive number",
      },
      { status: 400 }
    );
  }

  
    await db.transaction(async (tx) => {
      const customerPrepaymentNo = await generateCustomerPrepaymentNumber(
        orgId
      );
      const [custPrepayment] = await tx
        .insert(customerPrepayments)
        .values({
          customerId,
          amount: decimalAmount.toFixed(2),
          paymentAccountId,
          paymentDate: formatedDate,
          paymentMethod,
          memo,
          orgsId: orgId,
          userId,
          remainingBalance: decimalAmount.toFixed(2),
          customerPrepaymentNo,
        })
        .returning();

      const [transaction] = await tx
        .insert(transactions)
        .values({
          date: custPrepayment.paymentDate,
          documentId: custPrepayment.id,
          documentReference: customerPrepaymentNo,
          documentType: "CUSTOMER_PREPAYMENT",
          description: `Customer Prepayment: ${customerPrepaymentNo}`,
          userId,
          orgsId: orgId,
        })
        .returning();

      await tx.insert(entries).values({
        transactionId: transaction.id,
        accountId: paymentAccountId,
        amount: decimalAmount.toFixed(2),
        date: custPrepayment.paymentDate,
        userId,
        orgsId: orgId,
        type: "DEBIT",
      });

      const data = await getDefaultAccounts(orgId);
      const customerDepositAccountId = data.customerDeposits
        ?.accountId as number;

      await tx.insert(entries).values({
        transactionId: transaction.id,
        accountId: customerDepositAccountId,
        amount: decimalAmount.toFixed(2),
        date: custPrepayment.paymentDate,
        userId,
        orgsId: orgId,
        type: "CREDIT",
      });

      const customerName = await getCustomerName(
        custPrepayment.customerId as number,
        orgId
      );

      const paymentAccountName = await getAccountName(
        custPrepayment.paymentAccountId as number,
        orgId
      );

     
    });

    return NextResponse.json({
      message: "Customer Prepayment created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}