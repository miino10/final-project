import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { accounts } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq, sql } from "drizzle-orm";
import {
  accountsformSchema,
  accountTypeCodeRanges,
  updateStatusSchema,
} from "@/lib/types";

import { format } from "date-fns";
import { handleApiError } from "@/lib/api-error-handler";
import { getNextAvailableAccountCode } from "@/lib/getNextAvailableAccountCode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const fetchAll = searchParams.get("fetchAll") === "true";
 
  const isActiveFilter = searchParams.get("isActive");

  const { orgId, userId } = auth();
  if (!orgId || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get total count
    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(accounts)
      .where(eq(accounts.orgsId, orgId!));

    const totalCount = totalCountResult[0].count;

    
  
  
      // Get all accounts if fetchAll is true
      const accountsData = await db.query.accounts.findMany({
        with: {
          accountConfigurations: true,
          accountCategories: true,
        },
        where: and(
          eq(accounts.orgsId, orgId!),
          isActiveFilter === "true" ? eq(accounts.isActive, true) : undefined
        ),
        limit: fetchAll ? undefined : pageSize,
        offset: fetchAll ? undefined : (page - 1) * pageSize,
      });
    

    // Calculate pageCount
    const pageCount = fetchAll ? 1 : Math.ceil((totalCount as number) / pageSize);

    return NextResponse.json({
      data: accountsData,
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

  
 
    const body = await request.json();
    const accountsData = Array.isArray(body) ? body : [body];
    console.log("accountsData", accountsData);

    if (accountsData.length > 100) {
      {
        return NextResponse.json(
          {
            message:
              "The number of accounts exceeds the 100 limit per request. Please import 100 or fewer accounts at a time.",
          },
          { status: 400 }
        );
      }
    }
    for (const accountData of accountsData) {
      const validatedData = accountsformSchema.safeParse(accountData);
      if (!validatedData.success) {
        console.error("Validation error:", validatedData.error);

        return NextResponse.json(
          {
            message: "Validation failed",
          },
          { status: 400 }
        );
      }
      const { name, accountCategory, categoryId } = validatedData.data;

      // Validate input
      if (!name || !accountCategory) {
        return NextResponse.json(
          {
            message: "Name and account type are required",
          },
          { status: 400 }
        );
      }

      const trimmedAccountName = name.trim();

      const existingAccount = await db.query.accounts.findFirst({
        where: (account) =>
          and(eq(account.name, trimmedAccountName), eq(account.orgsId, orgId)),
      });

      if (existingAccount) {
        return NextResponse.json(
          {
            message: `Account with name ${trimmedAccountName} already exists.`,
          },
          { status: 400 }
        );
      }

      const account_code = await getNextAvailableAccountCode(
        accountCategory as keyof typeof accountTypeCodeRanges,
        orgId
      );

      await db.insert(accounts).values({
        name: trimmedAccountName,
        code: account_code,
        categoryId: categoryId,
        orgsId: orgId,
      });

     
    }

    return NextResponse.json({ status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// export async function PUT(req: NextRequest) {
//   try {
//     const { orgId, userId } = auth();

//     if (!orgId || !userId) {
//       return NextResponse.json(
//         { message: "Unauthorized - Missing organization ID" },
//         { status: 401 }
//       );
//     }

//     // Check for active subscription
   
//     const body = await req.json();
//     const validatedBody = updateStatusSchema.parse(body);

//     const account = await db.query.accounts.findFirst({
//       where: and(eq(accounts.id, validatedBody.id), eq(accounts.orgsId, orgId)),
//       with: {
//         accountConfigurations: true,
//         entries: true,
//       },
//     });

//     if (!account) {
//       return NextResponse.json(
//         { message: "Account not found or unauthorized access" },
//         { status: 404 }
//       );
//     }

//     if (account.accountConfigurations.length > 0) {
//       return NextResponse.json(
//         {
//           message:
//             "Cannot deactivate this account because it is a system account with existing configurations.",
//         },
//         { status: 400 }
//       );
//     }

//     if (!validatedBody.bol && account.entries.length > 0) {
//       return NextResponse.json(
//         { message: "Cannot deactivate account with linked transactions" },
//         { status: 400 }
//       );
//     }

//     // Update account status
//     await db
//       .update(accounts)
//       .set({ isActive: validatedBody.bol })
//       .where(
//         and(eq(accounts.id, validatedBody.id), eq(accounts.orgsId, orgId))
//       );

    

//     return NextResponse.json({
//       success: true,
//       message: `Account successfully ${
//         validatedBody.bol ? "activated" : "deactivated"
//       }`,
//     });
//   } catch (error) {
//     return handleApiError(error);
//   }
// }
