"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useOrganizationList } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { useOrgStore } from "@/stote/orgStore";

export function OrganizationSwitcher() {
  const { orgId } = useAuth();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { memberships, loading, setMemberships, setLoading } = useOrgStore();

  // Use custom hook for membership data
  const { data: userMemberships, isLoading } = useOrganizationMembers();

  // Keep Clerk's useOrganizationList for the setActive function
  const { setActive } = useOrganizationList();

  // Track whether we're in the middle of a manual org switch
  const isSwitchingRef = React.useRef(false);

  // Track initial mount for URL-based activation
  const initialMountRef = React.useRef(true);

  React.useEffect(() => {
    if (userMemberships) {
      setMemberships(userMemberships);
    }
    setLoading(isLoading);
  }, [userMemberships, isLoading, setMemberships, setLoading]);

  const activeOrganization = React.useMemo(() => {
    if (!memberships?.length) return null;
    return (
      memberships.find((mem) => mem.organization.id === orgId)?.organization ||
      memberships[0].organization
    );
  }, [memberships, orgId]);

  // Modified effect to only activate from URL on initial mount
  // or when not manually switching
  React.useEffect(() => {
    const activateOrgFromUrl = async () => {
      if (!setActive || !pathname || !memberships?.length) return;

      // Skip if we're in the middle of a manual org switch
      if (isSwitchingRef.current) return;

      // Extract organization ID from URL
      const urlOrgIdMatch = pathname.match(
        /\/dashboard\/organisation\/([^\/]+)/
      );
      if (!urlOrgIdMatch) return;

      const urlOrgId = urlOrgIdMatch[1];

      // Only proceed if URL org doesn't match current active org
      if (urlOrgId && urlOrgId !== orgId) {
        try {
          console.log("Activating organization from URL:", urlOrgId);
          await setActive({ organization: urlOrgId });
          await queryClient.resetQueries();
        } catch (error) {
          console.error("Failed to activate organization from URL:", error);
        }
      }

      // After initial mount, only URL changes should trigger this
      initialMountRef.current = false;
    };

    // Only run on initial mount or when pathname changes (not on every re-render)
    if (initialMountRef.current || !isSwitchingRef.current) {
      activateOrgFromUrl();
    }
  }, [pathname, orgId, setActive, memberships, queryClient]);

  const handleOrganizationSwitch = React.useCallback(
    async (orgId: string) => {
      try {
        if (!setActive) return;

        // Set flag to prevent URL-based activation during manual switch
        isSwitchingRef.current = true;

        await setActive({ organization: orgId });
        await queryClient.resetQueries();

        const baseOrgPath = "/dashboard/organisation/";
        const subRoute = pathname
          .replace(baseOrgPath, "")
          .split("/")
          .slice(1)
          .join("/");

        const newPath = `${baseOrgPath}${orgId}${
          subRoute ? `/${subRoute}` : ""
        }`;

        router.push(newPath);
        router.refresh();

        // Clear the flag after a short delay to ensure all effects have run
        setTimeout(() => {
          isSwitchingRef.current = false;
        }, 300);
      } catch (error) {
        isSwitchingRef.current = false;
        console.error("Failed to switch organization:", error);
      }
    },
    [setActive, router, pathname, queryClient]
  );

  if (loading && !memberships) {
    return (
      <SidebarMenu className="px-2">
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="h-8 w-8 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeOrganization) return null;

  return (
    <SidebarMenu className="px-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                <Image
                  src={activeOrganization.imageUrl}
                  alt={activeOrganization.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeOrganization.name}
                </span>
                <span className="truncate text-xs capitalize">
                  {memberships?.find(
                    (mem) => mem.organization.id === activeOrganization.id
                  )?.organization.role || "Member"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {memberships?.map((membership) => (
              <DropdownMenuItem
                key={membership.organization.id}
                onClick={() =>
                  handleOrganizationSwitch(membership.organization.id)
                }
                className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                  <Image
                    src={membership.organization.imageUrl}
                    alt={membership.organization.name}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <span className="flex-1">{membership.organization.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {membership.organization.role}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/create-organization")}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Create Organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
