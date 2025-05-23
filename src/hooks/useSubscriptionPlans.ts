import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type SubscriptionPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
};

export const useSubscriptionPlans = () => {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await axios.get("/api/subscription-plans");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 3,
    retryDelay: 1000,
  });
};
