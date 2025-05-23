import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { accounts } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-error-handler";
import { accountsformSchema } from "@/lib/types";
import { format } from "date-fns";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { orgId, userId } = auth();

  if (!orgId || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }


  try {
    const accountId = parseInt(params.id);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { message: "Invalid account ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = accountsformSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validatedData.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, categoryId } = validatedData.data;

    // Check if account exists and belongs to the organization
    const existingAccount = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.orgsId, orgId)),
      with: {
        accountConfigurations: true,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    if (existingAccount.accountConfigurations.length > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot modify system account that is part of configurations",
        },
        { status: 403 }
      );
    }

    // Check for duplicate account name within the organization
    const duplicateAccount = await db.query.accounts.findFirst({
      where: and(
        eq(accounts.name, name),
        eq(accounts.orgsId, orgId),
        eq(accounts.id, accountId)
      ),
    });

    if (duplicateAccount) {
      return NextResponse.json(
        { message: `Account with name ${name} already exists` },
        { status: 400 }
      );
    }

    // Update the account
    await db
      .update(accounts)
      .set({
        name,
        categoryId,
      })
      .where(and(eq(accounts.id, accountId), eq(accounts.orgsId, orgId)));


    return NextResponse.json({ message: "Account updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { orgId } = auth();
    if (!orgId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

   

    const accountId = parseInt(params.id);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { message: "Invalid account ID" },
        { status: 400 }
      );
    }

    const account = await db.query.accounts.findFirst({
      where: and(eq(accounts.id, accountId), eq(accounts.orgsId, orgId)),
      with: {
        accountConfigurations: true,
        entries: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found or unauthorized access" },
        { status: 404 }
      );
    }

    if (account.accountConfigurations.length > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete a system account with existing configurations",
        },
        { status: 400 }
      );
    }

    if (account.entries.length > 0) {
      return NextResponse.json(
        { message: "Cannot delete an account with linked transactions" },
        { status: 400 }
      );
    }

    await db
      .delete(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.orgsId, orgId)));

   

    return NextResponse.json({
      success: true,
      message: "Account successfully deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
