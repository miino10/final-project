import { db } from "@/db";
import {
  organizationMembers,
  organizations,
  subscriptions,
} from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { createDefaultAccountsAndConfigurations, DefaultRolesPermissions } from "@/lib/queries";
import { organizationFormSchema } from "@/lib/types";
import { generateFiscalYearFromMonth, generateSlug } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs";
import { Organization } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { orgId } = auth();
  if (!orgId) {
    throw new ApiError(400, "not foudn org");
  }

  try {
    const data = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId!),
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = auth();
    const token = await getToken();

    if (!userId || !token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = organizationFormSchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Validation error:", validatedData.error.format());
      return NextResponse.json(
        {
          message: "Validation failed",
        },
        { status: 400 }
      );
    }

    const {
      email,
      name,
      businessType,
      accountingMethod,
      address,
      foundedYear,
      industry,
      companySize,
      description,
      phone,
      website,
      fiscalYearStartMonth,
      fiscalYearStartDay,
      timeZone,
      planId,
    } = validatedData.data;

    let clerkOrg: Organization = {} as Organization;

    try {
      // Generate slug outside the transaction for better performance
      const slug = await generateUniqueSlug(name);

      // Create Clerk organization first
      clerkOrg = await clerkClient.organizations.createOrganization({
        name,
        slug,
        createdBy: userId,
      });

      if (!clerkOrg) {
        return NextResponse.json(
          {
            message: "Failed to create organization in Clerk",
          },
          { status: 500 }
        );
      }

      // Process database operations in a transaction
       await db.transaction(async (trx) => {
        // Insert organization record
        await trx.insert(organizations).values({
          id: clerkOrg.id,
          name: clerkOrg.name,
          slug: clerkOrg.slug,
          imageUrl: clerkOrg.imageUrl,
          businessType,
          accountingMethod,
          address,
          foundedYear,
          industry,
          companySize,
          description,
          timeZone,
          phone,
          website,
          email,
          memberCount: (clerkOrg.members_count ?? 0) + 1,
          fiscalYearStartMonth,
          fiscalYearStartDay,
        });

        // Create organization member
        const [currentOrgMember] = await trx
          .insert(organizationMembers)
          .values({
            userId,
            orgId: clerkOrg.id,
            isOwner: true,
          })
          .returning();

        // Setup roles and permissions
        // await DefaultRolesPermissions(
        //   clerkOrg.id,
        //   currentOrgMember.id,
        //   userId,
        //   trx
        // );

        // Validate fiscal year data
        if (!fiscalYearStartMonth) {
          throw new ApiError(400, "Fiscal year start month is required");
        }

        // Generate fiscal year dates
        const { startDate, endDate, year } =
          generateFiscalYearFromMonth(fiscalYearStartMonth);

        if (!startDate || !endDate || !year) {
          throw new ApiError(500, "Failed to generate fiscal year dates");
        }

       
       

        // Setup default accounts and configurations
        await createDefaultAccountsAndConfigurations(trx, clerkOrg.id, userId);

        return {
         
          orgMember: currentOrgMember,
        };
      });

     

    
      // Create subscription with trial period
      const trialDurationDays = 14;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + trialDurationDays);

      await db.insert(subscriptions).values({
        orgId: clerkOrg.id,
        planId: planId,
        status: "active",
        subsBillingStatus: "pending",
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      return NextResponse.json(
        {
          message: "Organization created successfully",
          org: clerkOrg,
        },
        { status: 201 }
      );
    } catch (error) {
      // Better error logging
      console.error("Failed to create organization:", error);

      // Rollback Clerk organization if database transaction failed
      if (clerkOrg) {
        try {
          await clerkClient.organizations.deleteOrganization(clerkOrg.id);
          console.log(`Rolled back Clerk organization: ${clerkOrg.id}`);
        } catch (rollbackError) {
          console.error(
            `Failed to rollback Clerk organization ${clerkOrg.id}:`,
            rollbackError
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Organization creation error:", error);
    return handleApiError(error);
  }
}

// Improved slug generation function with better error handling
async function generateUniqueSlug(
  name: string,
  maxAttempts = 10
): Promise<string> {
  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Invalid organization name");
  }

  const baseSlug = generateSlug(name);
  if (!baseSlug) throw new ApiError(400, "Could not generate slug from name");

  let attempt = 1;
  let modifiedSlug = baseSlug;

  while (attempt <= maxAttempts) {
    try {
      const existingOrg = await db.query.organizations.findFirst({
        where: eq(organizations.slug, modifiedSlug),
      });

      if (!existingOrg) {
        return modifiedSlug;
      }

      // More readable random suffix
      const timestamp = Date.now().toString(36);
      const randomSuffix = Math.random().toString(36).slice(2, 5);
      modifiedSlug = `${baseSlug}-${timestamp}${randomSuffix}`;

      attempt++;
    } catch (error) {
      console.error(
        `Error checking slug uniqueness (attempt ${attempt}):`,
        error
      );
      throw new ApiError(500, "Database error while generating slug");
    }
  }

  throw new ApiError(
    400,
    "Could not generate unique slug after multiple attempts"
  );
}
