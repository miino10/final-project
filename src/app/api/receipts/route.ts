
import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import {
  entries,
  products,
  receipts,
  receiptItem,
  transactions,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import Decimal from "decimal.js";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { EntryData, receiptFormSchema, updateStatusSchema } from "@/lib/types";
import { aggregateEntries } from "@/lib/utils";
import { getDefaultAccounts } from "@/lib/queries";
import { generateReceiptNumber } from "@/lib/generateIdNumber";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) throw new ApiError(401, "Unauthorized");
  try {
   
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const fetchAll = searchParams.get("fetchAll") === "true";

    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(receipts)
      .where(eq(receipts.orgsId, orgId))
      .execute();

    const totalCount = totalCountResult[0].count;

    const receiptsData = await db.query.receipts.findMany({
      columns: {
        receiptId: true,
        receiptDate: true,
        status: true,
        total: true,
        receiptNumber: true,
        isActive: true,
      },
      with: {
        customer: {
          columns: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
      where: (receipts, { eq }) => eq(receipts.orgsId, orgId),
      limit: fetchAll ? undefined : pageSize,
      offset: fetchAll ? undefined : (page - 1) * pageSize,
    });
    const formattedReceiptsData = receiptsData.map(receipt => ({
      ...receipt,
      receiptDate: receipt.receiptDate ? format(new Date(receipt.receiptDate), "yyyy-MM-dd") : null,
    }));

    const pageCount = fetchAll ? 1 : Math.ceil((totalCount as number) / pageSize);

    return NextResponse.json({
      data: formattedReceiptsData,
      total: totalCount,
      pageCount: pageCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) throw new ApiError(401, "Unauthorized");
  try {
  
 

  const body = await request.json();

    const validationResult = receiptFormSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ApiError(400, "Invalid input data");
    }
    const { receiptDate, total, customerId, receiptItems } =
      validationResult.data;

    const totalAmount = new Decimal(total);
    const formatedDate=format(receiptDate, "yyyy-MM-dd");

 
    

    await db.transaction(async (tx) => {
      const receiptNumber = await generateReceiptNumber(orgId);
     

      const productIds = receiptItems.map((item) => item.productId!);
      const productDetails = await tx
        .select()
        .from(products)
        .where(
          and(
            inArray(products.productId, productIds),
            eq(products.orgsId, orgId)
          )
        );

      const productMap = new Map(productDetails.map((p) => [p.productId, p]));
      const { cashAccount } = await getDefaultAccounts(orgId);
      if (!cashAccount) throw new ApiError(500, "Default accounts not found");

      const inventoryItems = receiptItems.filter(
        (item) => item.productType === "inventoryPart"
      );
      const nonInventoryItems = receiptItems.filter(
        (item) => item.productType !== "inventoryPart"
      );

      const [rec] = await tx
        .insert(receipts)
        .values({
          receiptNumber,
          customerId,
          status: "paid",
          userId,
          orgsId: orgId,
          total: totalAmount.toString(),
          receiptDate: formatedDate,
        })
        .returning();

      if (!rec) throw new ApiError(500, "Failed to create receipt");

      const [salesTransaction] = await tx
        .insert(transactions)
        .values({
          date: formatedDate,
          userId,
          orgsId: orgId,
          documentId: rec.receiptId,
          documentType: "RECEIPT",
          documentReference: rec.receiptNumber,
          description: `RECEIPT:${rec.receiptNumber}`,
        })
        .returning();

      const entriesData: EntryData[] = [];
      const receiptItemsData = [];

     

         

      // Process non-inventory items
      for (const item of nonInventoryItems) {
        const product = productMap.get(item.productId!);
        if (!product)
          throw new ApiError(404, `Product not found: ${item.product_name}`);

        receiptItemsData.push({
          receiptId: rec.receiptId,
          productId: item.productId,
          product_name: item.product_name,
          quantity: item.product_quantity.toString(),
          unit_price: product.sellingPrice.toString(),
          productType: item.productType,
          batchId: null,
        });

        const lineTotal = new Decimal(item.product_quantity).times(
          product.sellingPrice
        );
        entriesData.push({
          accountId: Number(cashAccount.accountId),
          amount: lineTotal.toString(),
          transactionId: salesTransaction.id,
          type: "DEBIT",
          orgsId: orgId,
          userId,
          date: formatedDate,
        });

        entriesData.push({
          accountId: Number(product.incomeAccountId),
          amount: lineTotal.toString(),
          transactionId: salesTransaction.id,
          type: "CREDIT",
          orgsId: orgId,
          userId,
          date: formatedDate,
        });
      }

      const finalEntriesData = aggregateEntries(entriesData);
      await tx.insert(entries).values(finalEntriesData);
      await tx.insert(receiptItem).values(receiptItemsData);

    });

    return NextResponse.json(
      { message: "Receipt created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
