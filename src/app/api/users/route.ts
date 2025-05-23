import { db } from "@/db";
import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { NextResponse } from "next/server";

export async function GET(){
    console.log("[/api/users] Received GET request.");
    try {
        const DBOperationTimeout = 15000; // 15 seconds
        console.log("[/api/users] Attempting to fetch users...");

        const dbOperation = db.query.users.findMany();
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new ApiError(504, "Database operation timed out while fetching users")), DBOperationTimeout)
        );

        // @ts-ignore
        const users = await Promise.race([dbOperation, timeoutPromise]);

        console.log("[/api/users] Successfully fetched users:", users);
        return NextResponse.json(users);
    } catch (error) {
        console.error("[/api/users] Raw error during user fetch:", error);
        if (error && typeof error === 'object') {
            if ('message' in error) console.error("[/api/users] Error message:", (error as Error).message);
            if ('detail' in error) console.error("[/api/users] Error detail:", (error as { detail: string }).detail);
            if ('code' in error) console.error("[/api/users] Error code:", (error as { code: string }).code);
            if ('stack' in error) console.error("[/api/users] Error stack:", (error as Error).stack);
        }
        return handleApiError(error);
    }
}