import { db } from "@/db";
import { organizationMembers, userRoles } from "@/db/schema";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const memberships = await db.query.organizationMembers.findMany({
      where: eq(organizationMembers.userId, userId),
      columns: {
        id: true,
        isOwner: true,
        isActive: true,
        orgId: true,
      },
      with: {
        organization: {
          columns: {
            id: true,
            name: true,
            imageUrl: true,
            slug: true,
          },
        },
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    const userOrgRoles = await db.query.userRoles.findMany({
      where: eq(userRoles.userId, userId),
      columns: {
        id: true,
        roleId: true,
        orgsId: true,
      },
      with: {
        role: {
          columns: {
            id: true,
            key: true,
            name: true,
          },
        },
      },
    });

    const formattedMembers = memberships.map((member) => {
      const orgRole = userOrgRoles.find((role) => role.orgsId === member.orgId);

      const roleName = orgRole?.role.name;

      return {
        id: member.id,
        organization: {
          id: member.organization.id,
          name: member.organization.name,
          imageUrl: member.organization.imageUrl,
          slug: member.organization.slug,
          role: roleName,
        },
        user: {
          id: member.user.id,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          imageUrl: member.user.imageUrl,
          email: member.user.email,
        },

        isActive: member.isActive,
        isOwner: member.isOwner,
      };
    });

    return NextResponse.json(formattedMembers, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}