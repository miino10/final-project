import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface OrganizationMember {
  id: number;
  organization: {
    id: string;
    name: string;
    imageUrl: string;
    slug: string;
    role: string;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    email: string;
  };

  isActive: boolean;
  isOwner: boolean;
}

export function useOrganizationMembers() {
  const { userId } = useAuth();
  return useQuery<OrganizationMember[]>({
    queryKey: ["organization-members", userId],
    queryFn: async () => {
      const response = await axios.get<OrganizationMember[]>(
        "/api/organisations/members"
      );
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes before refetching
  });
}