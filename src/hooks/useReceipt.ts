import { toast } from "@/hooks/use-toast";
import { statusChangeParams } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
interface DeleteReceiptParams {
  receiptId: string;
}

export const useReceiptDelete = async () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiptId }: DeleteReceiptParams) => {
      const response = await axios.delete(`/api/receipts/${receiptId}`);
      if (!response.data) {
        throw new Error("Failed to delete receipt from the backend.");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "receipt deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["actionHistory"] });
    },
    onError: (error) => {
      console.error("Error deleting receipt:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete receipt",
      });
    },
  });
};

export const useReceiptStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/receipts`, {
        id,
        bol: isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: `Receipt voided successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
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

export const useReceiptVoid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.post(`/api/receipts/void/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Receipt voided successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
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
        title: "Error voiding receipt",
        description: errorMessage,
      });
    },
  });
};
