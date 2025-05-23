import { toast } from "@/hooks/use-toast";
import {  ProductSchema, statusChangeParams } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

const fetchProducts = async () => {
  const response = await axios.get("/api/products", {
    params: {
      fetchAll: true,
    },
  });
  return response.data;
};

const useProduct = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};

export default useProduct;

export const useProductStatusChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: statusChangeParams) => {
      const response = await axios.put(`/api/products`, {
        id,
        bol: isActive,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const actionType = variables.isActive ? "activated" : "deactivated";
      toast({
        variant: "success",
        title: `Product ${actionType} successfully`,
      });
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: z.infer<typeof ProductSchema>) => {
      const response = await axios.post("/api/products", values);
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Product created successfully", 
      });
      queryClient.invalidateQueries({ queryKey: ["products"] }); 
    },
    onError: (error: unknown) => {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        // Get error message from response data
        errorMessage =
          error.response?.data?.message ||
          "Request failed with status " + error.response?.status;

        console.error("Server error response:", error.response?.data);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

     
    },
  });
};
