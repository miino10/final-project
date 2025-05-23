import { and, sql } from "drizzle-orm";
import { accounts } from "@/db/schema";
import { db } from "@/db";
import { accountTypeCodeRanges } from "./types";

// Map account category names to their corresponding code ranges (matches DB exactly)
const accountCategoryMap: Record<string, keyof typeof accountTypeCodeRanges> = {
  "Current Assets": "Current Assets",
  "Fixed Assets": "Fixed Assets",
  "Accumulated Depreciation": "Accumulated Depreciation",
  "Other Assets": "Other Assets",
  "Intangible Assets": "Intangible Assets",
  "Owner’s Equity": "Owner’s Equity",
  "Sales Revenue": "Sales Revenue",
  "Other Revenue": "Other Revenue",
  "Other Expenses": "Other Expenses",
  "Administrative Expenses": "Administrative Expenses",
  "Selling Expenses": "Selling Expenses",
  "Cost of Goods Sold": "Cost of Goods Sold",
  "Contra Revenue": "Contra Revenue",
  "current liability": "Current Liabilities",
  "long term liability": "Long Term Liabilities",
};

const getNextAvailableAccountCode = async (
  accountCategory: string,
  orgId: string
) => {
  // Use the category name as-is for mapping
  const mappedCategory = accountCategoryMap[accountCategory];
  if (!mappedCategory) {
    console.log("Received category:", accountCategory);
    console.log("Available categories:", Object.keys(accountCategoryMap));
    throw new Error(`Invalid account category: ${accountCategory}`);
  }

  const [minCode, maxCodeRange] = accountTypeCodeRanges[mappedCategory];

  const result = await db
    .select({
      max_code: sql<number>`max(cast(${accounts.code} as integer))`,
    })
    .from(accounts)
    .where(
      and(
        sql`cast(${accounts.code} as integer) between ${minCode} and ${maxCodeRange}`,
        sql`${accounts.orgsId} = ${orgId}`
      )
    );

  const maxCode = result[0].max_code || minCode - 1;

  if (maxCode + 1 > maxCodeRange) {
    throw new Error("No available account codes in the specified range");
  }

  // Find the next available code
  let nextCode = maxCode + 1;
  let codeAvailable = false;

  while (!codeAvailable && nextCode <= maxCodeRange) {
    const existingAccount = await db
      .select()
      .from(accounts)
      .where(
        and(
          sql`${accounts.code} = ${nextCode.toString()}`,
          sql`${accounts.orgsId} = ${orgId}`
        )
      )
      .limit(1);

    if (existingAccount.length === 0) {
      codeAvailable = true;
    } else {
      nextCode++;
    }
  }

  if (nextCode > maxCodeRange) {
    throw new Error("No available account codes in the specified range");
  }

  return nextCode.toString();
};

export { getNextAvailableAccountCode };
