import { db } from "@/db";
import {
  invoices,
  invoiceItem,
  products,
  transactions,
  entries,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import Decimal from "decimal.js";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { EntryData, invoiceFormSchema, updateStatusSchema } from "@/lib/types";
import { generateInvoiceNumber } from "@/lib/generateIdNumber";
import { format } from "date-fns";
import { aggregateEntries } from "@/lib/utils";
import { getDefaultAccounts } from "@/lib/queries";

export async function GET(request: Request) {
  const { orgId, userId } = auth();

  try {
    if (!orgId || !userId) {
      throw new ApiError(401, "Unauthorized");
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const customerIdParam = searchParams.get("customerId");
    const statusParam = searchParams.get("status");
    const fetchAll = searchParams.get("fetchAll") === "true";

    // Build the where clause dynamically
    const conditions = [eq(invoices.orgsId, orgId)];

    if (customerIdParam) {
      const customerId = parseInt(customerIdParam);
      if (!isNaN(customerId)) {
        conditions.push(eq(invoices.customerId, customerId));
      }
    }

    if (statusParam) {
      const statuses = statusParam.split(",").map((s) => s.trim()) as Array<
        (typeof invoices.status.enumValues)[number]
      >;
      if (statuses.length > 0) {
        conditions.push(inArray(invoices.status, statuses));
      }
    }

    const whereClause = and(...conditions);

    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(invoices)
      .where(whereClause) // Apply filters to count
      .execute();

    const totalCount = totalCountResult[0].count;
    const invoicesData = await db.query.invoices.findMany({
      columns: {
        invoiceId: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        status: true,
        total: true,
        dueBalance: true,
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
      where: whereClause, // Apply filters to data fetch
      limit: fetchAll ? undefined : pageSize,
      offset: fetchAll ? undefined : (page - 1) * pageSize,
    });

    const formattedInvoicesData = invoicesData.map(invoice => ({
      ...invoice,
      invoiceDate: invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "yyyy-MM-dd") : null,
      dueDate: invoice.dueDate ? format(new Date(invoice.dueDate), "yyyy-MM-dd") : null,
    }));

    // const totalSum = invoicesData.reduce((sum, invoice) => {
    //   const invoiceTotal = parseFloat(invoice.total!);
    //   return sum + (isNaN(invoiceTotal) ? 0 : invoiceTotal);
    // }, 0);
    const pageCount = fetchAll ? 1 : Math.ceil((totalCount as number) / pageSize);
    console.log("invoicesData", invoicesData);

    return NextResponse.json({
      data: formattedInvoicesData,
      total: totalCount,
      pageCount: pageCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
 
  const body = await request.json();
  const validationResult = invoiceFormSchema.safeParse(body);

  if (!validationResult.success) {
    throw new ApiError(400, "Invalid input data");
  }

  const { invoiceDate, invoiceItems, total, customerId, dueDate } =
    validationResult.data;
  const totalAmount = new Decimal(total).toFixed(2);

  const invoiceNumber = await generateInvoiceNumber(orgId);



  
   

    await db.transaction(async (tx: any) => {
      const productIds = invoiceItems.map((item) => item.productId!);
      const productDetails = await tx
        .select()
        .from(products)
        .where(
          and(
            inArray(products.productId, productIds),
            eq(products.orgsId, orgId)
          )
        );

      const productMap: Map<number, typeof products.$inferSelect> = new Map(
        productDetails.map((p: typeof products.$inferSelect) => [p.productId, p])
      );

      const { accountsReceivable } = await getDefaultAccounts(orgId);
      if (!accountsReceivable) {
        throw new ApiError(400, "AR is empty");
      }

      
      const nonInventoryItems = invoiceItems.filter(
        (item) => item.productType !== "inventoryPart"
      );

      const [inv] = await tx
        .insert(invoices)
        .values({
          invoiceNumber,
          customerId,
          dueDate: format(dueDate, "yyyy-MM-dd"),
          status: "pending",
          userId,
          orgsId: orgId,
          dueBalance: totalAmount.toString(),
          invoiceDate: format(invoiceDate, "yyyy-MM-dd"),
          total: totalAmount.toString(),
        })
        .returning();

      if (!inv) {
        throw new ApiError(500, "Failed to create invoice");
      }

      const [salesTransaction] = await tx
        .insert(transactions)
        .values({
          date: format(invoiceDate, "yyyy-MM-dd"),
          documentId: inv.invoiceId,
          documentReference: inv.invoiceNumber,
          documentType: "INVOICE",
          description: `INVOICE:${inv.invoiceNumber}`,
          userId,
          orgsId: orgId,
        })
        .returning();

      const rawEntriesData: EntryData[] = [];
      const invoiceItemsData = [];

    

      // Process non-inventory items
      for (const item of nonInventoryItems) {
        const product: typeof products.$inferSelect | undefined = productMap.get(item.productId!);
        if (!product) {
          throw new ApiError(404, `Product not found: ${item.product_name}`);
        }

        invoiceItemsData.push({
          invoiceId: inv.invoiceId,
          productId: item.productId,
          product_name: item.product_name,
          quantity: item.product_quantity.toString(),
          unit_price: product.sellingPrice.toString(),
          batchId: null,
        });

        const lineTotal = new Decimal(item.product_quantity).times(
          product.sellingPrice
        );

        // Add sales entries for non-inventory items
        rawEntriesData.push({
          accountId: Number(accountsReceivable.accountId),
          amount: lineTotal.toString(),
          transactionId: salesTransaction.id,
          type: "DEBIT",
          orgsId: orgId,
          userId,
          date: format(invoiceDate, "yyyy-MM-dd"),
        });

        rawEntriesData.push({
          accountId: Number(product.incomeAccountId),
          amount: lineTotal.toString(),
          transactionId: salesTransaction.id,
          type: "CREDIT",
          orgsId: orgId,
          userId,
          date: format(invoiceDate, "yyyy-MM-dd"),
        });
      }

      // Aggregate entries
      const finalEntriesData = aggregateEntries(rawEntriesData);

      // Batch insert aggregated entries and invoice items
      await tx.insert(entries).values(finalEntriesData);
      await tx.insert(invoiceItem).values(invoiceItemsData);

     
    });

    return NextResponse.json(
      { message: "Invoice created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orgId } = auth();

    if (!orgId) {
      throw new ApiError(401, "Unauthorized - Missing organization ID");
    }

    const body = await req.json();
    const validatedBody = updateStatusSchema.parse(body);

    // if (validatedBody.bol) {
    //   await db
    //     .update(invoice)
    //     .set({ isActive: true })
    //     .where(
    //       and(
    //         eq(invoice.invoiceId, validatedBody.id),
    //         eq(invoice.orgsId, orgId)
    //       )
    //     );

    //   throw new ApiError(200, "invoice successfully activated");
    // }

    // Update vendor status
    await db
      .update(invoices)
      .set({ isActive: validatedBody.bol })
      .where(
        and(
          eq(invoices.invoiceId, validatedBody.id),
          eq(invoices.orgsId, orgId)
        )
      );

    return NextResponse.json({
      success: true,
      message: `invoice successfully ${
        validatedBody.bol ? "activated" : "deactivated"
      }`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
