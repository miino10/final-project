import { db } from "@/db";
import { customers, receipts, receiptItem, products} from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { getCustomerData } from "@/lib/queries";

import { auth } from "@clerk/nextjs";
import { format } from "date-fns";
import Decimal from "decimal.js";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  { params }: { params: { receiptId: number } }
) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
   
    const rawData = await db
      .select({
        customerId: customers.id,
        phone: customers.phone,
        customerEmail: customers.email,

        status: receipts.status,
        receiptId: receipts.receiptId,
        receiptNumber: receipts.receiptNumber,
        receiptDate: receipts.receiptDate,
        total: receipts.total,
        itemId: receiptItem.item_id,
        quantity: receiptItem.quantity,
        unit_price: receiptItem.unit_price,
        product_name: receiptItem.product_name,
        productId: receiptItem.productId,
        unitOfMeasure: products.unitOfMeasure,
      })
      .from(receipts)
      .leftJoin(customers, eq(customers.id, receipts.customerId))
      .leftJoin(receiptItem, eq(receipts.receiptId, receiptItem.receiptId))
      .leftJoin(products, eq(receiptItem.productId, products.productId))
      .where(
        and(
          eq(receipts.receiptId, params.receiptId),
          eq(receipts.orgsId, orgId!)
        )
      )

      .execute();

    if (rawData.length === 0) {
      return NextResponse.json({ message: "No Data" }, { status: 404 });
    }

    // Aggregate items by productId
    const aggregatedItemsMap = new Map<number, any>();
    rawData.forEach((item) => {
      if (item.productId === null || item.productId === undefined) return;

      const existingItem = aggregatedItemsMap.get(item.productId);
      if (existingItem) {
        existingItem.quantity = new Decimal(existingItem.quantity)
          .plus(item.quantity || 0)
          .toString();
      } else {
        aggregatedItemsMap.set(item.productId, {
          productId: item.productId,
          itemId: item.itemId,
          quantity: new Decimal(item.quantity || 0).toString(),
          unit_price: item.unit_price,
          product_name: item.product_name,
          unitOfMeasure: item.unitOfMeasure,
        });
      }
    });
    const aggregatedItems = Array.from(aggregatedItemsMap.values());

    const customerData = await getCustomerData(orgId, rawData[0].customerId!);
   

    // const appliedCreditMemos = await db.query.creditMemoSApplications.findMany({
    //   where: eq(creditMemoSApplications.invoiceId, invoice.invoiceId),
    //   columns: { creditMemoId: true, amountApplied: true, applicationDate: true },
    //   with: {
    //     creditMemo: {
    //       columns: { creditMemoNumber: true },
    //     },
    //   },
    // });
    // const appliedCreditMemoIds = appliedCreditMemos.map((cm) => cm.creditMemoId);


    const result = {
      phone: rawData[0].phone,
      customerEmail: rawData[0].customerEmail,
      customerName: customerData[0].name,
      status: rawData[0].status,
      receiptId: rawData[0].receiptId,
      receiptNumber: rawData[0].receiptNumber,
      receiptDate: format(rawData[0].receiptDate, "yyyy-MM-dd"),
      total: rawData[0].total,
      items: aggregatedItems,
      refunds: [],
    };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { receiptId: number } }
) {
  try {
    const id = params.receiptId;

    const deletedRECEIPT = await db
      .delete(receipts)
      .where(eq(receipts.receiptId, id))
      .returning();
    console.log(deletedRECEIPT);
    // try {
    //   await createdAuditLog({
    //     entityId: id.toString(),
    //     action: "DELETED",
    //     entityType: "RECEIPT",
    //   });
    //   console.log("deleted and stored into autolog");
    // } catch (error) {
    //   return handleApiError(error);
    // }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return handleApiError(error);
  }
}