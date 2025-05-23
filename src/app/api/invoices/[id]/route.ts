import { db } from "@/db";
import {
  invoices,
  
} from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import Decimal from "decimal.js";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { orgId, userId } = auth();
    if (!orgId || !userId) {
      throw new ApiError(401, "Unauthorized");
    }

    // Validate referenceId
    if (!params.id) {
      throw new ApiError(400, "Invalid invoice ID");
    }

    // 1. Fetch the main invoice record with related data
    const invoice = await db.query.invoices.findFirst({
      columns: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        dueBalance: true,
        status: true,
        customerId: true,
      },
      with: {
        payments: {
          columns: {
            id: true,
            paymentDate: true,
            amount: true,
            paymentMethod: true,
          },
        },
        customer: {
          columns: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
           with: { 
             product: {
               columns: {
                 unitOfMeasure: true,
              }
            }
          }
        },
       
      },
      where: and(
        eq(invoices.invoiceId, params.id),
        eq(invoices.orgsId, orgId)
      ),
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    

    
  


    // Format items from the fetched invoice data
    const formattedItems = invoice.items.map(item => ({
      itemId: item.item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name,
      productId: item.productId,
      unitOfMeasure: item.product?.unitOfMeasure, 
    }));

    

    // 3. Construct the final result object using data from the invoice object and appliedCreditMemos array
    const result = {
      phone: invoice.customer?.phone || null,
      email: invoice.customer?.email || null,
      customerName: invoice.customer?.name || null,
      status: invoice.status,
      invoiceId: invoice.invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      total: invoice.total,
      dueBalance: invoice.dueBalance, // Include dueBalance
      // Calculate paid amount from total and due balance
      paidAmount: new Decimal(invoice.total || 0).minus(new Decimal(invoice.dueBalance || 0)).toString(),
      items: formattedItems,
      payments: invoice.payments.map((payment) => ({
        id: payment.id,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      })),
      refunds: [],
      appliedCreditMemos: [],
    };

    // Add cache control headers for better performance
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { referenceId: string } }
) {
  try {
    const { orgId, userId } = auth();
    if (!orgId) {
      throw new ApiError(401, "Unauthorized");
    }

    const referenceId = params.referenceId;
    const deletedInvoice = await db
      .delete(invoices)
      .where(eq(invoices.invoiceNumber, referenceId))
      .returning();
    console.log(deletedInvoice);


    return NextResponse.json({ status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
