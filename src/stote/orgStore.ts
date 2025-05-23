import { create } from "zustand";
import { OrganizationMember } from "@/hooks/useOrganizationMembers";

interface OrgState {
  memberships: OrganizationMember[] | null;
  loading: boolean;
  setMemberships: (memberships: OrganizationMember[] | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  memberships: null,
  loading: true,
  setMemberships: (memberships) => set({ memberships }),
  setLoading: (loading) => set({ loading }),
}));