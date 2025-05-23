import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { accountsformSchema, statusChangeParams } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

export const useAccounts = () => {
  return useQuery({
    queryKey: ["chart-of-accounts"],
    queryFn: async () => {
      const response = await axios.get("/api/chart-of-accounts", {
        params: {
          fetchAll: true,
          isActive: true,
        },
      });
      console.log("expense accounts", response.data);
      return response.data;
    },
  });
};

export const useAccountCreation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newAccount: z.infer<typeof accountsformSchema>) =>
      axios.post("/api/chart-of-accounts", newAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });

      toast({
        variant: "success",
        title: "Well done, you created new Account successfully ",
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
};

export const useAccountsStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/chart-of-accounts`, {
        id,
        bol: isActive,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionType = variables.isActive ? "activated" : "deactivated";
      toast({
        variant: "success",
        title: `Account ${actionType} successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
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

export const useAccountUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedAccount: z.infer<typeof accountsformSchema>) =>
      axios.put(`/api/chart-of-accounts/${updatedAccount.id}`, updatedAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chart-of-accounts"] });
      toast({
        variant: "success",
        title: "Account updated successfully",
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
};
