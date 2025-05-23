import { db } from "@/db";
import {
  customerPrepayments,
  customers,
  invoices,
  receipts,
  creditMemos,
} from "@/db/schema";
import { handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Decimal from "decimal.js";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { orgId, userId } = auth();

    if (!orgId || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const id = params.id;

    // Check for related invoices
    const relatedInvoices = await db.query.invoices.findFirst({
      where: and(eq(invoices.customerId, id), eq(invoices.orgsId, orgId)),
    });

    const prePayments = await db.query.customerPrepayments.findFirst({
      where: and(
        eq(customerPrepayments.customerId, id),
        eq(customerPrepayments.orgsId, orgId)
      ),
    });
    if (prePayments) {
      return NextResponse.json(
        {
          message: "Cannot delete customer with existing prepayments",
        },
        { status: 400 }
      );
    }

    if (relatedInvoices) {
      return NextResponse.json(
        {
          message: "Cannot delete customer with existing invoices",
        },
        { status: 400 }
      );
    }

    // Check for related receipts
    const relatedReceipts = await db.query.receipts.findFirst({
      where: and(eq(receipts.customerId, id), eq(receipts.orgsId, orgId)),
    });

    if (relatedReceipts) {
      return NextResponse.json(
        {
          message: "Cannot delete customer with existing receipts",
        },
        { status: 400 }
      );
    }

   

    

    return NextResponse.json({
      message: "Customer deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  const { orgId } = auth();
  if (!orgId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!params || !params.id) {
    return NextResponse.json(
      { message: "Invalid parameters" },
      { status: 400 }
    );
  }
  try {
    const customerData = await db.query.customers.findFirst({
      columns: {
        id: true,
        name: true,
      },
      with: {
        invoices: {
          columns: {
            invoiceId: true,
            invoiceNumber: true,
            invoiceDate: true,
            dueDate: true,
            total: true,
          },
          with: {
            items: {
              columns: {
                product_name: true,
                productId: true,
                item_id: true,
                quantity: true,
                unit_price: true,
                batchId: true,
              },
              with: {
                product: {
                  columns: {
                    productType: true,
                  },
                },
              },
            },
          },
        },
        receipts: {
          columns: {
            receiptId: true,
            receiptNumber: true,
            receiptDate: true,
            total: true,
            inventoryId: true,
          },
          with: {
            items: {
              columns: {
                product_name: true,
                productId: true,
                item_id: true,
                quantity: true,
                unit_price: true,
                batchId: true,
              },
              with: {
                product: {
                  columns: {
                    productType: true,
                  },
                },
              },
            },
          },
        },
      },
      where: and(eq(customers.id, params.id), eq(customers.orgsId, orgId)),
    });

    if (!customerData) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // --- Calculate Remaining Quantities for Invoices ---
    const processedInvoices = await Promise.all(
      customerData.invoices.map(async (invoice) => {
        // Fetch related credit memos for this invoice
        const relatedCreditMemos = await db.query.creditMemos.findMany({
          where: and(
            eq(creditMemos.relatedEntityId, invoice.invoiceId),
            eq(creditMemos.entityTypeEnum, "INVOICE"), // Ensure it's related to an INVOICE
            eq(creditMemos.orgsId, orgId),
            inArray(creditMemos.status, ["OPEN", "CLOSED"])
          ),
          with: {
            items: {
              columns: { productId: true, quantity: true },
            },
          },
        });

        const creditedQtyMap = new Map<number, Decimal>();
        for (const cm of relatedCreditMemos) {
          for (const cmItem of cm.items ?? []) {
            if (cmItem.productId) {
              const currentCredited =
                creditedQtyMap.get(cmItem.productId) || new Decimal(0);
              creditedQtyMap.set(
                cmItem.productId,
                currentCredited.plus(new Decimal(cmItem.quantity || 0))
              );
            }
          }
        }

        let hasReturnableItems = false;
        const itemsWithRemainingQty = invoice.items.map((item) => {
          const originalQty = new Decimal(item.quantity || 0);
          const creditedQty =
            creditedQtyMap.get(item.productId!) || new Decimal(0);
          const remainingQuantity = originalQty.minus(creditedQty);

          if (remainingQuantity.gt(0)) {
            hasReturnableItems = true;
          }

          return {
            ...item,
            remainingQuantity: remainingQuantity.toString(),
          };
        });

        return {
          ...invoice,
          items: itemsWithRemainingQty,
          hasReturnableItems,
        };
      })
    );

    // --- Calculate Remaining Quantities for Receipts ---
    const processedReceipts = await Promise.all(
      customerData.receipts.map(async (receipt) => {
        // Fetch related credit memos for this receipt
        const relatedCreditMemos = await db.query.creditMemos.findMany({
          where: and(
            eq(creditMemos.relatedEntityId, receipt.receiptId),
            eq(creditMemos.entityTypeEnum, "RECEIPT"),
            eq(creditMemos.orgsId, orgId),
            inArray(creditMemos.status, ["OPEN", "CLOSED"])
          ),
          with: {
            items: {
              columns: { productId: true, quantity: true },
            },
          },
        });

        // Calculate already credited quantities for this receipt
        const creditedQtyMap = new Map<number, Decimal>();
        for (const cm of relatedCreditMemos) {
          for (const cmItem of cm.items ?? []) {
            if (cmItem.productId) {
              const currentCredited =
                creditedQtyMap.get(cmItem.productId) || new Decimal(0);
              creditedQtyMap.set(
                cmItem.productId,
                currentCredited.plus(new Decimal(cmItem.quantity || 0))
              );
            }
          }
        }

        let hasReturnableItems = false;
        const itemsWithRemainingQty = receipt.items.map((item) => {
          const originalQty = new Decimal(item.quantity || 0);
          const creditedQty =
            creditedQtyMap.get(item.productId!) || new Decimal(0);
          const remainingQuantity = originalQty.minus(creditedQty);

          if (remainingQuantity.gt(0)) {
            hasReturnableItems = true;
          }

          return {
            ...item,
            remainingQuantity: remainingQuantity.toString(),
          };
        });

        return {
          ...receipt,
          items: itemsWithRemainingQty,
          hasReturnableItems, // Add flag
        };
      })
    );

    // Construct the final response object
    const responseData = {
      ...customerData,
      invoices: processedInvoices,
      receipts: processedReceipts,
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return handleApiError(error);
  }
}