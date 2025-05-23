"use client";

import * as React from "react";
import {
  FileChartPie,
  Cog,
  TrendingUp,
  Warehouse,
  House,
  ShoppingBag,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { useAuth } from "@clerk/nextjs";
import { MyLogo } from "@/app/_components/NotifyGradientLine";
import { OrganizationSwitcher } from "./organization-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { orgId } = useAuth();
  console.log("orgId", orgId);

  const navItems = [
    {
      title: "Dashboard",
      url: `/dashboard/organisations/${orgId}`,
      icon: House,
    },
    {
      title: "Sales",
      url: "#",
      icon: TrendingUp,
      isActive: true,
      items: [
        {
          title: "Invoices",
          url: `/dashboard/organisations/${orgId}/invoices`,
        },

        {
          title: "Receipts",
          url: `/dashboard/organisations/${orgId}/receipts`,
        },
        {
          title: "Customers",
          url: `/dashboard/organisations/${orgId}/customers`,
        },
        {
          title: "Customer Prepayments",
          url: `/dashboard/organisations/${orgId}/customer-prepayments`,
        },
        {
          title: "Credit Memo",
          url: `/dashboard/organisations/${orgId}/credit-memos`,
        },
      ],
    },
    {
      title: "Purchases",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "Vendors",
          url: `/dashboard/organisations/${orgId}/vendors`,
        },
        {
          title: "Expenses",
          url: `/dashboard/organisations/${orgId}/expenses`,
        },
        {
          title: "Bills",
          url: `/dashboard/organisations/${orgId}/bills`,
        },

        {
          title: "Vendor Prepayments",
          url: `/dashboard/organisations/${orgId}/vendor-prepayments`,
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      icon: Warehouse,
      items: [
        {
          title: "Products",
          url: `/dashboard/organisations/${orgId}/products`,
        },
      ],
    },
    {
      title: "Accounting",
      url: "#",
      icon: FileChartPie,
      items: [
        {
          title: "Journals",
          url: `/dashboard/organisations/${orgId}/general-journal`,
        },
        {
          title: "Chart of Accounts",
          url: `/dashboard/organisations/${orgId}/chart-of-accounts`,
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: ChartNoAxesCombined,
      items: [
        {
          title: "Balance-sheet",
          url: `/dashboard/organisations/${orgId}/balance-sheet`,
        },
        {
          title: "Profit-loss",
          url: `/dashboard/organisations/${orgId}/profit-loss`,
        },
        {
          title: "Trial-balance",
          url: `/dashboard/organisations/${orgId}/trial-balance`,
        },
        {
          title: "General-ledger",
          url: `/dashboard/organisations/${orgId}/general-ledger`,
        },
        {
          title: "Audit-logs",
          url: `/dashboard/organisations/${orgId}/audit-logs`,
        },
        {
          title: "Transactions",
          url: `/dashboard/organisations/${orgId}/transactions`,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex justify-end"></div>

      <SidebarHeader className="flex items-center justify-between p-4">
        <MyLogo />
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
