import { toast } from "@/hooks/use-toast";
import { statusChangeParams, Vendor } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const fetchVendors = async () => {
  const response = await axios.get("/api/vendors", {
    params: {
      getAll: true,
    },
  });
  console.log(response.data);
  return response.data;
};

export const useVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: fetchVendors,
  });
};

export const useVendorStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/vendors`, {
        id,
        bol: isActive,
        fetchAll: true,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionType = variables.isActive ? "activated" : "deactivated";
      toast({
        variant: "success",
        title: `Vendor ${actionType} successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
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

export const useCreateVendor = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Vendor) => {
      await axios.post(`/api/vendors`, values);
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

export const useVendorDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/vendors/${id}`);

      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Vendor deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
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
