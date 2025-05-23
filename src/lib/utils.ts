import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Decimal from "decimal.js";
import { EntryData } from "@/lib/types";
import { startOfMonth, endOfMonth } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === null || amount === undefined) {
    return "$0.00"; // Or return an empty string or placeholder
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Adjust currency code as needed
    minimumFractionDigits: 2,
  }).format(amount);
};

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}




/**
 * Aggregates an array of accounting entries by account ID, type, and date.
 *
 * @param rawEntriesData - An array of EntryData objects.
 * @returns An array of aggregated EntryData objects.
 */
export function aggregateEntries(rawEntriesData: EntryData[]): EntryData[] {
  const aggregatedEntries: { [key: string]: EntryData } = {};

  for (const entry of rawEntriesData) {
    // Ensure amount is a valid Decimal
    const entryAmount = new Decimal(entry.amount);
    if (entryAmount.isNaN()) {
      console.warn(
        `Skipping entry with invalid amount: ${entry.amount}`,
        entry
      );
      continue; // Skip this entry if the amount is not a valid number
    }

    const key = `${entry.accountId}-${entry.type}-${entry.date}`;

    if (aggregatedEntries[key]) {
      // Ensure the existing amount is also a valid Decimal before adding
      const existingAmount = new Decimal(aggregatedEntries[key].amount);
      if (!existingAmount.isNaN()) {
        aggregatedEntries[key].amount = existingAmount
          .plus(entryAmount)
          .toString();
      } else {
        // If existing amount was somehow invalid, overwrite with the current valid amount
        console.warn(`Overwriting invalid aggregated amount for key ${key}`);
        aggregatedEntries[key].amount = entryAmount.toString();
      }
    } else {
      // Initialize with the current entry (copy to avoid modifying the original)
      aggregatedEntries[key] = { ...entry, amount: entryAmount.toString() };
    }
  }

  return Object.values(aggregatedEntries);
}



export function generateFiscalYearFromMonth(month: number) {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Determine the fiscal year based on the current date and chosen month
  let fiscalYear = currentYear;

  // If current month is before the fiscal start month, fiscal year started in previous calendar year
  if (currentMonth < month) {
    fiscalYear = currentYear - 1;
  }

  // Create fiscal year start date (first day of the selected month)
  const fiscalStartDate = startOfMonth(new Date(fiscalYear, month - 1, 1));

  // Calculate fiscal year end date (last day of the month before start month in next year)
  const endMonth = month === 1 ? 12 : month - 1;
  const endYear = month === 1 ? fiscalYear + 1 : fiscalYear + 1;
  const fiscalEndDate = endOfMonth(new Date(endYear, endMonth - 1, 1));

  return {
    startDate: fiscalStartDate,
    endDate: fiscalEndDate,
    year: fiscalYear,
  };
}


