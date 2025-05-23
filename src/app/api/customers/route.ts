import { NextRequest, NextResponse } from "next/server";
import { db} from "@/db";
import { auth } from "@clerk/nextjs";
import { customers } from "@/db/schema";
import { and, eq, or, sql } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error-handler";
import { CustomersformSchema, updateStatusSchema } from "@/lib/types";
import { generateCustomerNumber } from "@/lib/generateIdNumber";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const isActiveFilter = searchParams.get("isActive");
  const fetchAll = searchParams.get("fetchAll") === "true";

  const { orgId } = auth();

  try {
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID is missing" },
        { status: 400 }
      );
    }

    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(customers)
      .where(eq(customers.orgsId, orgId!))
      .execute();

    const totalCount = totalCountResult[0].count;

    const allCustomers = await db.query.customers.findMany({
      where: (customer, { eq }) =>
        and(
          eq(customer.orgsId, orgId),
          isActiveFilter === "true" ? eq(customer.isActive, true) : undefined
        ),
      columns: {
        createdAt: false,
        updatedAt: false,
        userId: false,
        orgsId: false,
      },
      limit: fetchAll ? undefined : pageSize,
      offset: fetchAll ? undefined : (page - 1) * pageSize,
    });

    const pageCount = fetchAll ? 1 : Math.ceil((totalCount as number) / pageSize);
    return NextResponse.json({
      data: allCustomers,
      total: totalCount,
      pageCount: pageCount,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
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
    const customersData = Array.isArray(body) ? body : [body];

    if (customersData.length > 100) {
      {
        return NextResponse.json(
          {
            message:
              "The number of customers exceeds the 100 limit per request. Please import 100 or fewer customers at a time.",
          },
          { status: 400 }
        );
      }
    }

    for (const customerData of customersData) {
      const validatedData = CustomersformSchema.safeParse(customerData);
      if (!validatedData.success) {
        return NextResponse.json(
          {
            message: "Validation failed. Please check your input data.",
          },
          { status: 400 }
        );
      }
      const { name, email, phone, address } = validatedData.data;
      const trimmedCustomerName = name.trim();

      // Check for existing customer with same name or email
      const existingCustomer = await db.query.customers.findFirst({
        where: (customer) =>
          and(
            or(
              eq(customer.name, trimmedCustomerName),
              eq(customer.email, email)
            ),
            eq(customer.orgsId, orgId)
          ),
      });

      if (existingCustomer) {
        const duplicateField =
          existingCustomer.name === trimmedCustomerName ? "name" : "email";
        return NextResponse.json(
          {
            message: `A customer with this ${duplicateField} already exists. Please use a different ${duplicateField}.`,
          },
          { status: 400 }
        );
      }

      const customerNo = await generateCustomerNumber(orgId);
      await db.transaction(async (tx) => {
        const newCustomer = await tx
          .insert(customers)
          .values({
            name: name,
            customerNo: customerNo,
            email: email,
            address: address,
            phone: phone,
            orgsId: orgId,
            userId: userId,
          })
          .returning();

       
      });
    }

    return NextResponse.json({ status: 201 });
  } catch (error) {
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

    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, validatedBody.id),
        eq(customers.orgsId, orgId)
      ),
      with: {
        invoices: true,
        receipts: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found or unauthorized access" },
        { status: 404 }
      );
    }

    // Only check for linked transactions when deactivating
    if (
      !validatedBody.bol &&
      (customer.invoices.length > 0 || customer.invoices.length > 0)
      // ||customer.bills.length > 0
    ) {
      return NextResponse.json(
        {
          message:
            "Cannot deactivate Customer with linked transactions. Please remove the linked transactions first.",
        },
        { status: 400 }
      );
    }

    // Update vendor status
    await db
      .update(customers)
      .set({ isActive: validatedBody.bol })
      .where(
        and(eq(customers.id, validatedBody.id), eq(customers.orgsId, orgId))
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
