import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { statusChangeParams, Vendor } from "@/lib/types";
import axios from "axios";

//TODO:solve the issue of when i expected error toast but it was not showing up
export const useCustomersFetch = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await axios.get("/api/customers", {
        params: {
          fetchAll: true,
          isActive: true,
        },
      });
      console.log("customers", response.data);
      return response.data;
    },
  });
};

export const useCustomersDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/customers/${id}`);

      return response.data;
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
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Customer deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useCustomerCreation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Vendor) => {
      await axios.post(`/api/customers`, values);
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Vendor created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      if (onSuccessCallback) {
        onSuccessCallback();
      }
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

export const useCustomerStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/customers`, {
        id,
        bol: isActive,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionType = variables.isActive ? "activated" : "deactivated";
      toast({
        variant: "success",
        title: `Customer ${actionType} successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
