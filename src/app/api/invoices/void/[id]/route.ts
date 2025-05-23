import { invoices, transactions, entries } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { format } from "date-fns";
import { createEntry } from "@/lib/queries";
import { pol } from "@/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth();

    if (!orgId || !userId) {
      throw new ApiError(401, "Unauthorized");
    }
    
    return await pol.transaction(async (tx) => {
      const invoiceId = parseInt(params.id);
      if (isNaN(invoiceId)) {
        throw new ApiError(400, "Invalid invoice ID");
      }

      // Get current invoice and its entries
      const [currentInvoice] = await tx
        .select({
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          total: invoices.total,
          invoiceDate: invoices.invoiceDate,
        })
        .from(invoices)
        .where(
          and(eq(invoices.invoiceId, invoiceId), eq(invoices.orgsId, orgId))
        );

      if (!currentInvoice) {
        throw new ApiError(404, "Invoice not found");
      }

      // Check if invoice can be voided
      if (
        currentInvoice.status === "paid" ||
        currentInvoice.status === "partial"
      ) {
        throw new ApiError(400, "Cannot void a paid or partially paid invoice");
      }

      if (currentInvoice.status === "voided") {
        throw new ApiError(400, "Cannot void an already voided invoice");
      }

      const originalTransactions = await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.documentId, invoiceId),
            eq(transactions.documentType, "INVOICE"),
            eq(transactions.orgsId, orgId)
          )
        );

      if (!originalTransactions) {
        throw new ApiError(404, "Original transaction not found");
      }
      for (const originalTransaction of originalTransactions) {
        const originalEntries = await tx
          .select()
          .from(entries)
          .where(eq(entries.transactionId, originalTransaction.id));
        if (!originalEntries) {
          throw new ApiError(404, "Original Enteries not found");
        }

        const [reversalTransaction] = await tx
          .insert(transactions)
          .values({
            date: format(new Date(), "yyyy-MM-dd"),
            orgsId: orgId,
            userId: userId,
            description: `Invoice-reversal-${currentInvoice.invoiceNumber}`,
            documentId: invoiceId,
            documentReference: currentInvoice.invoiceNumber,
            documentType: "REVERSAL",
          })
          .returning();

        // Create reversal entries (opposite of original entries)
        for (const entry of originalEntries) {
          await createEntry(
            tx,
            orgId,
            entry.accountId,
            entry.amount,
            reversalTransaction.id,
            // Reverse the entry type
            entry.type === "DEBIT" ? "CREDIT" : "DEBIT",
            userId,
            format(new Date(), "yyyy-MM-dd")
          );
        }
      }

      // Update invoice status to voided
      await tx
        .update(invoices)
        .set({
          status: "voided",
          isActive: false,
          dueBalance: "0",
          isVoided: true,
          voidedAt: new Date(),
          voidedBy: userId,
        })
        .where(
          and(eq(invoices.invoiceId, invoiceId), eq(invoices.orgsId, orgId))
        );



      return NextResponse.json({
        message: "Invoice voided and journal entries reversed successfully",
      });
    });
  } catch (error) {
    return handleApiError(error);
  }
}
