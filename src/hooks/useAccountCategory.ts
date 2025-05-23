import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function useAccountCategory() {
  return useQuery({
    queryKey: ["accountCategories"],
    queryFn: async () => {
      const response = await axios.get("/api/account-categories");
      console.log("accounts category", response.data);
      return response.data;
    },
  });
}
