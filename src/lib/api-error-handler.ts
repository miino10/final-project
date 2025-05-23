import { NextResponse } from "next/server";
import { NeonDbError } from "@neondatabase/serverless";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorResponse {
  message: string;
  errors?: any;
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Validation error", errors: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof NeonDbError) {
    let message = "A database error occurred";
    let statusCode = 500;

    switch (error.code) {
      case "23505":
        message = "A duplicate entry was detected";
        statusCode = 409;
        break;
      case "23503":
        message = "The request contains invalid references";
        statusCode = 400;
        break;
      case "23502":
        message = "Required information is missing";
        statusCode = 400;
        break;
      // Add more cases as needed
      default:
        message = `Database error: ${error.message}`;
        break;
    }

    return NextResponse.json({ message }, { status: statusCode });
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "An unknown error occurred" },
    { status: 500 }
  );
}
