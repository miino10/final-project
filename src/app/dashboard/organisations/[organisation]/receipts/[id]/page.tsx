"use client";

import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, useUser } from "@clerk/nextjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { File, Loader, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReceiptPDF from "../../_components/ReceiptPdf";
import { SendEmailDropdown } from "../../_components/SendEmailDropdown";

export interface ReceiptData {
  receiptId: string;
  customerName: string;
  customerEmail: string;
  receiptDate: string;
  receiptNumber: string;
  total: number;
  paymentMethod: string;
  refunds?: {
    id: number;
    refundNumber: string;
    refundDate: string;
    refundAmount: number;
  }[];
  items: [
    {
      itemId: number;
      quantity: string;
      unit_price: string;
      product_name: string;
      unitOfMeasure: string;
    }
  ];
}

const SingleReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    isLoading,
    error,
    data: receipt,
  } = useQuery<ReceiptData>({
    queryKey: ["receipt", id],
    queryFn: () =>
      axios.get(`/api/receipts/${id}`).then((res) => res.data.data),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { orgSlug } = useAuth();
  const { mutate: sendNewEmail, isLoading: isSendingEmail } = useMutation({
    mutationFn: () =>
      axios.post("/api/emails/send-receipt-email", {
        receiptData: { ...receipt, orgSlug },
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
    <div className="flex flex-col gap-5 md:px-5 py-5  min-h-screen">
     
        {isLoading ? (
          <div className="w-full min-h-screen flex items-center justify-center">
           <Loader className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <ReceiptHeader receipt={receipt!} />
            <ActionButtons
              onSendEmail={async () => handleSendEmail()}
              receipt={receipt!}
            />
            {/* {receipt?.refunds && receipt?.refunds?.length > 0 && (
              <RefundPayments receipt={receipt} />
            )} */}
            <ReceiptContent receipt={receipt!} />
          </>
        )}
      
    </div>
  );
};

// const ReceiptHeader: React.FC<{ receipt: ReceiptData }> = ({ receipt }) => (
//   <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm">
//     <h1 className="text-3xl font-bold text-gray-800">Receipt</h1>
//     <div className="flex items-center justify-between">
//       <p className="text-lg text-gray-600">#{receipt.receiptId}</p>
//       <p className="text-lg font-semibold text-green-600">${receipt.total}</p>
//     </div>
//   </div>
// );

const ReceiptHeader: React.FC<{ receipt: ReceiptData }> = ({ receipt }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-2 text-bold md:text-lg">
      <Receipt size={16} />
      <span>Receipt</span>
    </div>
    <div className="flex items-center gap-2">
      <h1 className="text-xl md:text-2xl">{receipt.receiptNumber}</h1>
      <p className="text-sm">for ${receipt.total}</p>
      {/* <StatusBadge status={receipt.status} /> */}
    </div>
  </div>
);

const ActionButtons: React.FC<{
  receipt: ReceiptData;
  onSendEmail: () => Promise<void>;
}> = ({ receipt, onSendEmail }) => {
  const { orgSlug } = useAuth();

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-sm flex justify-center items-center flex-wrap gap-4">
      <PDFDownloadLink
        document={<ReceiptPDF orgSlug={orgSlug!} receipt={receipt} />}
        fileName={`receipt-${receipt.receiptNumber}.pdf`}>
        <Button variant="outline" className="flex items-center gap-2">
          <File size={16} />
          <span className="hidden md:flex">Download</span>
        </Button>
      </PDFDownloadLink>
      {/* <Button variant="outline" className="flex items-center gap-2">
      <Mail size={18} />
      <span>Email Receipt</span>
    </Button> */}
      <SendEmailDropdown name="Send Receipt" onSendEmail={onSendEmail} />
    </div>
  );
};

const ReceiptContent: React.FC<{ receipt: ReceiptData }> = ({ receipt }) => {
  const { orgSlug } = useAuth();
  const { user } = useUser();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800">From</h2>
            <p className="text-gray-600">{orgSlug}</p>
            <p className="text-gray-600">{user?.fullName}</p>
            <p className="text-gray-600">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800">To</h2>
            <p className="text-gray-600">{receipt.customerName}</p>
            <p className="text-gray-600">{receipt.customerEmail}</p>
            <p className="text-gray-600">Receipt Date: {receipt.receiptDate}</p>
            <p className="text-gray-600">
              Payment Method: {receipt.paymentMethod}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-gray-600">Item</th>
                <th className="text-right py-3 px-2 text-gray-600">Qty</th>
                <th className="text-right py-3 px-2 text-gray-600">Price</th>
                <th className="text-right py-3 px-2 text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items?.map((item) => (
                <tr key={item.itemId} className="border-b border-gray-100">
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
                    ${parseFloat(item.unit_price) * parseFloat(item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-gray-800 font-semibold text-lg">
              <span>Total Paid</span>
              <span>${receipt.total}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>
            Thank you for your business. This receipt is your proof of purchase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SingleReceiptPage;
