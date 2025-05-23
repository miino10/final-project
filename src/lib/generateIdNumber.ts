import { db } from "@/db";
import {
  customerPrepayments,
  customers,
  invoices,
  products,
  receipts,
  vendors,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ApiError } from "./api-error-handler";




export async function generateInvoiceNumber(orgId: string | undefined) {
  const prefix = "INV";
  const result = await db
    .select({
      maxInvoiceNumber: sql`MAX(invoice_number)`.as("maxInvoiceNumber"),
    })
    .from(invoices)
    .where(eq(invoices.orgsId, orgId!))
    .execute();
  if (!result) {
    throw new ApiError(400, "No result found on receipt number generation");
  }

  // Ensure maxInvoiceNumber is a string or default to the starting format
  const maxInvoiceNumber = result[0]?.maxInvoiceNumber ?? `${prefix}-00000000`;

  // Verify maxInvoiceNumber is a string before calling split
  if (typeof maxInvoiceNumber !== "string") {
    throw new Error("Unexpected type for maxInvoiceNumber");
  }

  const currentNumber = parseInt(maxInvoiceNumber.split("-")[1], 10);
  const nextNumber = currentNumber + 1;

  return `${prefix}-${nextNumber.toString().padStart(8, "0")}`;
}

export async function generateReceiptNumber(orgId: string | undefined) {
  const prefix = "SR";
  const result = await db
    .select({
      maxReceiptNumber: sql`MAX(receipt_number)`.as("maxReceiptNumber"),
    })
    .from(receipts)
    .where(eq(receipts.orgsId, orgId!))
    .execute();

  const maxReceiptNumber = result[0]?.maxReceiptNumber ?? `${prefix}-00000000`;

  // Verify maxReceiptNumber is a string before calling split
  if (typeof maxReceiptNumber !== "string") {
    throw new Error("Unexpected type for maxReceiptNumber");
  }

  const currentNumber = parseInt(maxReceiptNumber.split("-")[1], 10);
  const nextNumber = currentNumber + 1;

  return `${prefix}-${nextNumber.toString().padStart(8, "0")}`;
}

export async function generateProductNumber(orgId: string): Promise<string> {
  const PREFIX = "PROD";
  const PADDING_LENGTH = 8;
  const DEFAULT_PRODUCT_NUMBER = `${PREFIX}-${"0".repeat(PADDING_LENGTH)}`;

  if (!orgId) {
    throw new ApiError(
      400,
      "Organization ID is required but was not provided. Please provide a valid organization ID."
    );
  }

  try {
    const result = await db
      .select({
        maxProductNumber:
          sql<string>`COALESCE(MAX(product_number), ${DEFAULT_PRODUCT_NUMBER})`.as(
            "maxProductNumber"
          ),
      })
      .from(products)
      .where(eq(products.orgsId, orgId))
      .execute();

    const maxProductNumber = result[0]?.maxProductNumber;

    if (typeof maxProductNumber !== "string") {
      throw new ApiError(200, "Unexpected type for maxProductNumber");
    }

    const [prefix, numberPart] = maxProductNumber.split("-");

    if (prefix !== PREFIX) {
      throw new ApiError(400, `Unexpected prefix: ${prefix}`);
    }

    const currentNumber = parseInt(numberPart, 10);
    if (isNaN(currentNumber)) {
      throw new ApiError(400, `Invalid number part: ${numberPart}`);
    }

    const nextNumber = currentNumber + 1;
    if (nextNumber > Math.pow(10, PADDING_LENGTH) - 1) {
      throw new ApiError(400, "Product number limit reached");
    }

    return `${PREFIX}-${nextNumber.toString().padStart(PADDING_LENGTH, "0")}`;
  } catch (error) {
    throw error;
  }
}

export async function generateVendorNumber(orgId: string): Promise<string> {
  const PREFIX = "VEND";
  const PADDING_LENGTH = 8;
  const DEFAULT_VENDOR_NUMBER = `${PREFIX}-${"0".repeat(PADDING_LENGTH)}`;

  if (!orgId) {
    throw new ApiError(
      400,
      "Organization ID is required but was not provided. Please provide a valid organization ID."
    );
  }

  try {
    const result = await db
      .select({
        maxProductNumber:
          sql<string>`COALESCE(MAX(vendor_no), ${DEFAULT_VENDOR_NUMBER})`.as(
            "maxProductNumber"
          ),
      })
      .from(vendors)
      .where(eq(vendors.orgsId, orgId))
      .execute();

    const maxVendorNumber = result[0]?.maxProductNumber;

    if (typeof maxVendorNumber !== "string") {
      throw new ApiError(200, "Unexpected type for maxProductNumber");
    }

    const [prefix, numberPart] = maxVendorNumber.split("-");

    if (prefix !== PREFIX) {
      throw new ApiError(400, `Unexpected prefix: ${prefix}`);
    }

    const currentNumber = parseInt(numberPart, 10);
    if (isNaN(currentNumber)) {
      throw new ApiError(400, `Invalid number part: ${numberPart}`);
    }

    const nextNumber = currentNumber + 1;
    if (nextNumber > Math.pow(10, PADDING_LENGTH) - 1) {
      throw new ApiError(400, "Vendor number limit reached");
    }

    return `${PREFIX}-${nextNumber.toString().padStart(PADDING_LENGTH, "0")}`;
  } catch (error) {
    throw error;
  }
}

export async function generateCustomerNumber(orgId: string): Promise<string> {
  const PREFIX = "CUST";
  const PADDING_LENGTH = 8;
  const DEFAULT_CSUTOMER_NUMBER = `${PREFIX}-${"0".repeat(PADDING_LENGTH)}`;

  if (!orgId) {
    throw new ApiError(
      400,
      "Organization ID is required but was not provided. Please provide a valid organization ID."
    );
  }

  try {
    const result = await db
      .select({
        maxCustomerNumber:
          sql<string>`COALESCE(MAX(customer_no), ${DEFAULT_CSUTOMER_NUMBER})`.as(
            "maxCustomerNumber"
          ),
      })
      .from(customers)
      .where(eq(customers.orgsId, orgId))
      .execute();

    const maxCustomerNumber = result[0]?.maxCustomerNumber;

    if (typeof maxCustomerNumber !== "string") {
      throw new ApiError(200, "Unexpected type for maxCustomerNumber");
    }

    const [prefix, numberPart] = maxCustomerNumber.split("-");

    if (prefix !== PREFIX) {
      throw new ApiError(400, `Unexpected prefix: ${prefix}`);
    }

    const currentNumber = parseInt(numberPart, 10);
    if (isNaN(currentNumber)) {
      throw new ApiError(400, `Invalid number part: ${numberPart}`);
    }

    const nextNumber = currentNumber + 1;
    if (nextNumber > Math.pow(10, PADDING_LENGTH) - 1) {
      throw new ApiError(400, "Customer number limit reached");
    }

    return `${PREFIX}-${nextNumber.toString().padStart(PADDING_LENGTH, "0")}`;
  } catch (error) {
    throw error;
  }
}


export async function generateCustomerPrepaymentNumber(
  orgId: string | undefined
): Promise<string> {
  if (!orgId) {
    throw new ApiError(400, "Organization ID is required");
  }
  const PADDING_LENGTH = 8;
  const PREFIX = "CPRE";
  const DEFAULT_CSUTOMER_NUMBER = `${PREFIX}-${"0".repeat(PADDING_LENGTH)}`;

  const result = await db
    .select({
      maxCustomerPrepaymentNumber:
        sql<string>`COALESCE(MAX(customer_prepayment_no), ${DEFAULT_CSUTOMER_NUMBER})`.as(
          "maxCustomerPrepaymentNumber"
        ),
    })
    .from(customerPrepayments)
    .where(eq(customerPrepayments.orgsId, orgId))
    .execute();

  const maxCustomerPrepaymentNumber =
    result[0]?.maxCustomerPrepaymentNumber ?? `${PREFIX}-00000000`;

  if (typeof maxCustomerPrepaymentNumber !== "string") {
    throw new Error("Unexpected type for maxCustomerPrepaymentNumber");
  }

  const currentNumber = parseInt(maxCustomerPrepaymentNumber.split("-")[1], 10);
  const nextNumber = currentNumber + 1;

  return `${PREFIX}-${nextNumber.toString().padStart(8, "0")}`;
}
