import { toast } from "@/hooks/use-toast";
import { AgingTypes, statusChangeParams } from "@/lib/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useInvoiceStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/invoices`, {
        id,
        bol: isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: `Invoiced voided successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
};

export interface PaymentData {
  id: number;
  referenceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  paymentAccountId: number;
  prepayment?: {
    prepaymentId: number;
    prepaymentAmount: number;
  };
}

export const useInvoicePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData: PaymentData) =>
      axios.post(`/api/receive-payments`, paymentData, {
        headers: {
          "Content-Type": "application/json",
        },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      toast({
        variant: "success",
        title: "Payment recorded successfully",
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
        title: "Failed to record payment",
        description: errorMessage,
      });
    },
  });
};

interface DeleteInvoiceParams {
  invoiceId: string;
}

export const useInvoiceDelete = async () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId }: DeleteInvoiceParams) => {
      console.log("invoiced id is ", invoiceId);
      const response = await axios.delete(`/api/invoices/${invoiceId}`);
      if (!response.data) {
        throw new Error("Failed to delete invoice from the backend.");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "invoice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["actionHistory"] });
    },
    onError: (error) => {
      console.error("Error deleting invoice:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete invoice",
      });
    },
  });
};

export function useAgingInvoices() {
  return useQuery<AgingTypes>({
    queryKey: ["agingInvoices"],
    queryFn: async () => {
      const { data } = await axios.get("/api/aging-invoices");
      return data;
    },
  });
}
