import { db} from "@/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  products,
 
  accounts,
  receiptItem,
  invoiceItem,
  
} from "@/db/schema";
import { ProductSchema, updateStatusSchema } from "@/lib/types";
import { handleApiError } from "@/lib/api-error-handler";
import { and, eq, inArray, sql } from "drizzle-orm";
import { generateProductNumber } from "@/lib/generateIdNumber";

export async function GET(request: Request) {
  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const isActiveFilter = searchParams.get("isActive");
  const fetchAll = searchParams.get("fetchAll") === "true";

  try {
    // Perform both queries concurrently
    const [totalCountResult, productsData] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(eq(products.orgsId, orgId!))
        .execute(),

      db.query.products.findMany({
        columns: {
          productId: true,
          productNumber: true,
          isActive: true,
          productName: true,
          sellingPrice: true,
          costPrice: true,
          status: true,
          productType: true,
          unitOfMeasure: true,
        },
        where: (products, { eq }) =>
          and(
            eq(products.orgsId, orgId!),
            isActiveFilter === "true" ? eq(products.isActive, true) : undefined
          ),
        limit: fetchAll ? undefined : pageSize,
        offset: fetchAll ? undefined : (page - 1) * pageSize,
      }),
    ]);
    console.log("productsData", productsData);
    console.log("totalCountResult", totalCountResult);

    const totalCount = totalCountResult[0].count;

  

    

    const pageCount = fetchAll
      ? 1
      : Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      data: productsData,
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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }


  try {
    const results = await db.transaction(async (tx) => {
      const body = await request.json();
      const productsData = Array.isArray(body) ? body : [body];

      if (productsData.length > 100) {
        return NextResponse.json(
          {
            meesage:
              "The number of products exceeds the 100 limit per request. Please import 100 or fewer products at a time.",
          },
          { status: 400 }
        );
      }

      // Get the current max product number with a lock
      const prodNumber = await generateProductNumber(orgId);
      const createdProducts = [];

      // Process each product sequentially
      for (let i = 0; i < productsData.length; i++) {
        const productData = productsData[i];
        const validatedData = ProductSchema.safeParse(productData);

        if (!validatedData.success) {
          console.log(validatedData.error.errors);
          return NextResponse.json(
            { message: "Validation failed" },
            { status: 400 }
          );
        }

        const {
          productName,
          productType,
          sellingPrice,
          costPrice,
          incomeAccountId,
          vendorId,
          unitOfMeasure,
        } = validatedData.data;
        console.log("unitOfMeasure", unitOfMeasure);

        // Validate account IDs
        const accountIds = [incomeAccountId];
       

        const validAccounts = await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(inArray(accounts.id, accountIds))
          .execute();

        if (validAccounts.length !== accountIds.length) {
          return NextResponse.json(
            { message: "One or more account IDs are invalid" },
            { status: 400 }
          );
        }

        // Insert the product
        const [createdProd] = await tx
          .insert(products)
          .values({
            productNumber: prodNumber,
            productName: productName,
            productType: productType,
            status: productData.status || "OUT OF STOCK",
            sellingPrice: sellingPrice.toString(),
            costPrice: costPrice?.toString(),
            orgsId: orgId,
            userId: userId,
            vendorId: vendorId,
            unitOfMeasure: unitOfMeasure,
            incomeAccountId: Number(incomeAccountId),
          })
          .returning();

        createdProducts.push(createdProd);

     

      }

      return createdProducts;
    });

    return NextResponse.json(
      {
        message: "Created new product(s)",
        products: results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orgId } = auth();

    if (!orgId) {
      return NextResponse.json(
        { message: "Unauthorized - Missing organization ID" },
        { status: 401 }
      );
    }
    

    const body = await req.json();
    const validatedBody = updateStatusSchema.parse(body);
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.productId, validatedBody.id),
        eq(products.orgsId, orgId)
      ),
    });

    if (validatedBody.bol) {
      await db
        .update(products)
        .set({ isActive: true })
        .where(
          and(
            eq(products.productId, validatedBody.id),
            eq(products.orgsId, orgId)
          )
        );

      return NextResponse.json(
        { message: "Product successfully activated" },
        { status: 200 }
      );
    }

    const receiptItems = await db.query.receiptItem.findMany({
      where: and(eq(receiptItem.productId, validatedBody.id)),
    });
    const invoiceItems = await db.query.invoiceItem.findMany({
      where: and(eq(invoiceItem.productId, validatedBody.id)),
    });
   

    if (!product) {
      return NextResponse.json(
        { message: "product not found or unauthorized access" },
        { status: 404 }
      );
    }

    if (
      (!validatedBody.bol && receiptItems.length > 0) ||
      invoiceItems.length > 0 
    ) {
      return NextResponse.json(
        { message: "Cannot deactivate product with linked transactions" },
        { status: 400 }
      );
    }

    // Update vendor status
    await db
      .update(products)
      .set({ isActive: validatedBody.bol })
      .where(
        and(
          eq(products.productId, validatedBody.id),
          eq(products.orgsId, orgId)
        )
      );

    return NextResponse.json({
      success: true,
      message: `Vendor successfully ${
        validatedBody.bol ? "activated" : "deactivated"
      }`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
