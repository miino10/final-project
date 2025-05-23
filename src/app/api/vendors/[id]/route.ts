import { db } from "@/db";
import {
  vendors,
} from "@/db/schema";
import { handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import { and, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { orgId, userId } = auth();
    console.log("params fuck", params);

    if (!orgId || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    



    
    await db
      .delete(vendors)
      .where(and(eq(vendors.id, id), eq(vendors.orgsId, orgId)))
      .returning();

    

    return NextResponse.json({
      message: "Vendor deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
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
    const vendorData = await db.query.vendors.findFirst({
      columns: {
        id: true,
        name: true,
      },
      where: and(eq(vendors.id, params.id), eq(vendors.orgsId, orgId)),
     
      
    });

    if (!vendorData) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: vendorData || [] });
  } catch (error) {
    console.error("Error fetching vendor data:", error);
    return handleApiError(error);
  }
}
