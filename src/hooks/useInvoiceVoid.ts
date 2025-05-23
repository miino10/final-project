import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useInvoiceVoid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await axios.post(`/api/invoices/void/${invoiceId}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Invoice voided successfully",
      });
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
        title: "Error voiding invoice",
        description: errorMessage,
      });
    },
  });
};
