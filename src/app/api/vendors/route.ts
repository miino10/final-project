import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { and, eq, sql, TransactionRollbackError } from "drizzle-orm";
import { updateStatusSchema, VendorSchema } from "@/lib/types";
import { vendors } from "@/db/schema";
import { db } from "@/db";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { generateVendorNumber } from "@/lib/generateIdNumber";


export async function GET(request: Request) {
  const { orgId } = auth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const fetchAll = searchParams.get("fetchAll") === "true";
  const isActiveFilter = searchParams.get("isActive");

  const totalCountResult = await db
    .select({ count: sql`count(*)` })
    .from(vendors)
    .where(eq(vendors.orgsId, orgId!))
    .execute();

  const totalCount = totalCountResult[0].count;
  
  try {
    
      const vendorsData = await db.query.vendors.findMany({
        columns: {
          orgsId: false,
          userId: false,
          createdAt: false,
          updatedAt: false,
        },
        where: (vendors, { eq, and }) =>
          and(
            eq(vendors.orgsId, orgId!),
            isActiveFilter === "true"
              ? eq(vendors.isActive, true)
              : isActiveFilter === "false"
              ? eq(vendors.isActive, false)
              : undefined
          ),
        limit: fetchAll ? undefined : pageSize,
        offset: fetchAll ? undefined : (page - 1) * pageSize,
      });

    const pageCount = fetchAll
      ? 1
      : Math.ceil((totalCount as number) / pageSize);

    return NextResponse.json({
      data: vendorsData,
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
    const vendorsData = Array.isArray(body) ? body : [body];

    console.log(vendorsData);

    if (vendorsData.length > 100) {
      {
        return handleApiError(
          new ApiError(
            400,
            "The number of vendors exceeds the 100 limit per request. Please import 100 or fewer vendors at a time."
          )
        );
      }
    }

    for (const vendorData of vendorsData) {
      const validatedData = VendorSchema.safeParse(vendorData);

      if (!validatedData.success) {
        return NextResponse.json(
          {
            message: "Validation failed. Please check your input data.",
          },
          { status: 400 }
        );
      }

      const { vendorName, address, vendorCountry, vendorEmail, phoneNumber } =
        validatedData.data;
      const vendorNo = await generateVendorNumber(orgId);
      const trimmedVendorName = vendorName.trim();

      const existingVendor = await db.query.vendors.findFirst({
        where: (vendor) =>
          and(eq(vendor.name, trimmedVendorName), eq(vendor.orgsId, orgId)),
      });

      if (existingVendor) {
        return NextResponse.json(
          {
            message: `Vendor with name ${trimmedVendorName} already exists.`,
          },
          { status: 400 }
        );
      }
      await db.transaction(async (tx) => {
        const newVendor = await tx
          .insert(vendors)
          .values({
            vendorNo: vendorNo,
            name: vendorName,
            address: address,
            country: vendorCountry,
            email: vendorEmail,
            phone: phoneNumber,
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
      throw new ApiError(401, "Unauthorized - Missing organization ID");
    }

    const body = await req.json();
    const validatedBody = updateStatusSchema.parse(body);

    const vendor = await db.query.vendors.findFirst({
      where: and(eq(vendors.id, validatedBody.id), eq(vendors.orgsId, orgId)),
      with: {
        products: true,
      },
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor not found or unauthorized access");
    }

    // Only check for linked transactions when deactivating
    if (
      !validatedBody.bol &&
      vendor.products.length > 0
    ) {
      throw new ApiError(
        400,
        "Cannot deactivate vendor with linked transactions"
      );
    }

    // Update vendor status
    await db
      .update(vendors)
      .set({ isActive: validatedBody.bol })
      .where(and(eq(vendors.id, validatedBody.id), eq(vendors.orgsId, orgId)));

    

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
