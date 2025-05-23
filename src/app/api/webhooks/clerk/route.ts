import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import {
  NewUser,
  organizationMembers,
  organizations,
  roles,
  userRoles,
  users,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { db } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (error) {
    return handleApiError(error);
  }

  const eventType = evt.type;

  switch (eventType) {
    case "user.created":
    case "user.updated":
      console.log("user creation .....");
      console.log("evt.data", evt.data);
      await handleUserEvent(evt.data, eventType);
      break;
    case "organizationInvitation.accepted":
      const { organization_id, email_address } = evt.data;
      if (organization_id && email_address) {
        await handleAcceptedInvitationsUser(organization_id, email_address);
      } else {
        throw new ApiError(
          400,
          "Missing organization ID or email in invitation acceptance"
        );
      }
      break;
    default:
      throw new ApiError(400, `Unhandled event type: ${eventType}`);
  }
  console.log("eventType", eventType);

  return NextResponse.json({ eventType, success: true });
}

async function handleUserEvent(
  userData: WebhookEvent["data"],
  eventType: "user.created" | "user.updated"
) {
  if ("id" in userData && "email_addresses" in userData) {
    const user: NewUser = {
      id: userData.id,
      firstName: userData.first_name ?? null,
      lastName: userData.last_name ?? null,
      username: userData.username ?? null,
      email: userData.email_addresses[0]?.email_address ?? "",
      emailVerified: 
        userData.email_addresses[0]?.verification?.status === "verified"
          ? new Date()
          : null,
      imageUrl: userData.image_url ?? null,
      externalId: userData.external_id ?? null,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
    };
    console.log("Processing user event for user object:", JSON.stringify(user, null, 2));

    try {
      if (eventType === "user.created") {
        console.log("Attempting to insert user:", user.id);
        const result = await db.insert(users).values(user).returning({ insertedId: users.id });
        console.log(`User ${user.id} inserted successfully. Result:`, result);
      } else {
        console.log("Attempting to update user:", user.id);
        const result = await db.update(users).set(user).where(eq(users.id, user.id)).returning({ updatedId: users.id });
        console.log(`User ${user.id} updated successfully. Result:`, result);
      }
    } catch (error) {
      console.error(
        `Raw error during ${eventType} for user ${user.id}:`,
        error
      );
      // Log specific error properties if they exist
      if (error && typeof error === 'object') {
        if ('message' in error) console.error("Error message:", (error as Error).message);
        if ('detail' in error) console.error("Error detail:", (error as { detail: string }).detail); // Common for Postgres errors
        if ('code' in error) console.error("Error code:", (error as { code: string }).code); // DB error codes
        if ('stack' in error) console.error("Error stack:", (error as Error).stack);
      }
      return handleApiError(error);
    }
  } else {
    console.error("Received user data is not in the expected format");
    throw new ApiError(400, "Received user data is not in the expected format");
  }
}

async function handleUserDeleted(userData: WebhookEvent["data"]) {
  if ("id" in userData) {
    try {
      await db.delete(users).where(eq(users.id, userData.id!));
      console.log(`User ${userData.id} deleted successfully`);
    } catch (error) {
      return handleApiError(error);
    }
  } else {
    console.error(
      "Received user data for deletion is not in the expected format"
    );
    throw new ApiError(
      400,
      "Received user data for deletion is not in the expected format"
    );
  }
}

async function handleOrganizationDeleted(orgData: WebhookEvent["data"]) {
  if (orgData && "id" in orgData) {
    if (!orgData.id) {
      throw new ApiError(400, " organization id for deletion is missing");
    }
    try {
      await db.delete(organizations).where(eq(organizations.id, orgData.id));
      console.log(`Organization ${orgData.id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting organization ${orgData.id}:`, error);
      return handleApiError(error);
    }
  } else {
    console.log("orgData", orgData);
    throw new ApiError(
      400,
      "Received organization data for deletion is not in the expected format"
    );
  }
}

async function handleAcceptedInvitationsUser(orgId: string, email: string) {
  try {
    return await db.transaction(async (trx) => {
      const [user] = await trx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const insertedMember = await trx
        .insert(organizationMembers)
        .values({
          userId: user.id,
          orgId,
        })
        .onConflictDoNothing()
        .returning({ id: organizationMembers.id });

      // Check if member was actually inserted
      if (!insertedMember.length) {
        throw new ApiError(409, "User already exists in organization");
      }

      await trx
        .update(organizations)
        .set({
          memberCount: sql`${organizations.memberCount} + 1::integer`,
        })
        .where(eq(organizations.id, orgId));

      const [memberRole] = await trx
        .select({ id: roles.id })
        .from(roles)
        .where(and(eq(roles.key, "org:member"), eq(roles.orgsId, orgId)));

      if (!memberRole) {
        throw new ApiError(404, "Member role not found");
      }

      const [userRole] = await trx
        .insert(userRoles)
        .values({
          userId: user.id,
          roleId: memberRole.id,
          orgsId: orgId,
          organizationMemberId: insertedMember[0].id,
        })
        .onConflictDoNothing()
        .returning({ id: userRoles.id });

      return {
        success: true,
        userId: user.id,
        memberId: insertedMember[0].id,
        roleId: userRole?.id,
      };
    });
  } catch (error) {
    console.error("Error updating user organization:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to update user organization");
  }
}
