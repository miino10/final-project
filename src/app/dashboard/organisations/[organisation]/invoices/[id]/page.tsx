"use client";

import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, PenSquare, Snowflake, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser } from "@clerk/nextjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
import { SendEmailDropdown } from "../../_components/SendEmailDropdown";
import Decimal from "decimal.js";
import { InvoiceData } from "@/lib/types";
import { IconIonReceiptOutline } from "@/components/icons/IconIonReceiptOutline";
import InvoicePDF from "../../_components/InvoicePdf";
import { IconAntDesignFilePdfOutlined } from "@/components/icons/IconAntDesignFilePdfOutlined";
import InvoicePayments from "../../_components/InvoicePayments";


const SingleInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { orgSlug } = useAuth();

  const { isLoading, data: invoice } = useQuery<InvoiceData>({
    queryKey: ["invoice", id],
    queryFn: () =>
      axios.get(`/api/invoices/${id}`).then((res) => res.data.data),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { mutate: sendNewEmail, isLoading: isSendingEmail } = useMutation({
    mutationFn: () =>
      axios.post("/api/emails/send-invoice-email", {
        invoiceData: { ...invoice, orgSlug },
      }),
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Sent New Email successfully",
      });
    },
    onError: (error: unknown) => {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

      console.error("Error details:", errorMessage);
    },
  });

  const handleSendEmail = () => {
    return sendNewEmail();
  };

  return (
    <div className="flex itce flex-col gap-5 md:px-5 py-5">
      
        {isLoading ? (
          <div className="w-full min-h-screen flex items-center justify-center">
            <Loader className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <InvoiceHeader invoice={invoice!} />
            <ActionButtons invoice={invoice!} onSendEmail={handleSendEmail} />
            {/* {invoice?.refunds && invoice?.refunds?.length > 0 && (
              <RefundPayments invoice={invoice!} />
            )} */}
            {invoice?.payments && invoice?.payments?.length > 0 && (
              <InvoicePayments invoice={invoice!} />
            )}
            {/* {invoice?.appliedCreditMemos && invoice?.appliedCreditMemos?.length > 0 && (
              <InvoiceAppliedCreditMemos invoice={invoice!} />
            )} */}
            <UpdatedInvoiceSummary invoice={invoice} />{" "}
          </>
        )}
    </div>
  );
};

const InvoiceHeader: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2 text-bold md:text-lg">
      <IconIonReceiptOutline />
      <span>Invoice</span>
    </div>
    <div className="flex items-center gap-2">
      <h1 className="text-xl md:text-2xl">{invoice.invoiceNumber}</h1>
      <p className="text-sm">for ${invoice.total}</p>
      <StatusBadge status={invoice.status} />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles = {
    overdue: "text-red-500 bg-red-100",
    paid: "text-green-500 bg-green-100",
    pending: "text-gray-500 bg-gray-100",
  };

  return (
    <p
      className={`${
        statusStyles[status as keyof typeof statusStyles]
      } rounded-md px-6 py-1 text-sm`}>
      {status}
    </p>
  );
};

const ActionButtons: React.FC<{
  onSendEmail: () => void | Promise<void>;
  invoice: InvoiceData;
}> = ({ onSendEmail, invoice }) => {
  const { orgSlug } = useAuth();
  return (
    <div className="bg-gray-100 py-5 md:py-8 items-center justify-center w-full rounded-md flex flex-wrap gap-3 md:gap-5 lg:gap-10 px-4">
      <SendEmailDropdown
        name="Send Invoice"
        onSendEmail={async () => onSendEmail()}
      />
      
      <PDFDownloadLink
        document={<InvoicePDF orgslug={orgSlug!} invoice={invoice} />}
        fileName={`invoice-${invoice?.invoiceNumber}.pdf`}
        className="flex gap-1 justify-center items-center">
        <Button
          variant="outline"
          className="flex gap-1 justify-center items-center">
          <IconAntDesignFilePdfOutlined />
          <span className="hidden md:flex">Download</span>
        </Button>
      </PDFDownloadLink>
    
    </div>
  );
};


const UpdatedInvoiceSummary: React.FC<{ invoice: InvoiceData | undefined }> = ({
  invoice,
}) => {
  const { orgSlug } = useAuth();
  const { user } = useUser();
  if (!invoice) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-8 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const subtotal =
    invoice.items?.reduce(
      (sum, item) =>
        sum + parseFloat(item.unit_price) * parseFloat(item.quantity),
      0
    ) || 0;

  const duebalance = new Decimal(invoice.total)
    .minus(invoice.paidAmount)
    .toNumber()
    .toFixed(2);

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden ">
      <CardContent className="p-8 ">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className=" flex flex-col gap-1 ">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">From</h2>
            <p className="text-gray-600 text-sm md:text-base">{orgSlug}</p>
            <p className="text-gray-600 text-sm md:text-base">
              {user?.fullName}
            </p>
            <p className="text-gray-600 text-sm md:text-base ">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            {/* <p className="text-gray-600 text-sm md:text-base ">
              {invoice.phone}
            </p> */}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Bill To
            </h2>
            <p className="text-gray-600 text-sm md:text-base">{invoice.name}</p>
            <p className="text-gray-600 text-sm md:text-base">
              Due Date: {invoice.dueDate}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200 text-sm md:text-base">
                <th className="text-left py-3 px-2 text-gray-600">U/M</th>
                <th className="text-left py-3 px-2 text-gray-600">Item</th>
                <th className="text-right py-3 px-2 text-gray-600">Qty</th>
                <th className="text-right py-3 px-2 text-gray-600">Price</th>
                <th className="text-right py-3 px-2 text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm md:text-base">
              {invoice.items?.map((item) => (
                <tr key={item.itemId} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-gray-800">
                    {item.unitOfMeasure}
                  </td>
                  <td className="py-3 px-2 text-gray-800">
                    {item.product_name}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    ${item.unit_price}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-800">
                    $
                    {(
                      parseFloat(item.unit_price) * parseFloat(item.quantity)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-gray-600 text-sm md:text-lg">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {/* <div className="flex justify-between text-gray-800 font-semibold text-sm md:text-lg">
              <span>Total</span>
              <span>${invoice.total}</span>
            </div> */}
            {invoice.paidAmount > 0 && (
              <div className="flex justify-between text-gray-800 text-sm font-semibold  md:text-base">
                <span>Paid Amount</span>
                <span className="text-red-500">(-${invoice.paidAmount})</span>
              </div>
            )}

            <div className="flex justify-between text-gray-800 text-sm font-bold  md:text-lg">
              <span>Balance Due</span>
              <span>${duebalance}</span>
            </div>
          </div>
        </div>


        <div className="mt-8 text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>
            Thank you for your business. Please make payment by the due date.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleInvoicePage;