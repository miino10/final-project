import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { MainHeader } from "./_components/Sidebar/main-header";
import { AppSidebar } from "./_components/Sidebar/app-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col w-full">
        <MainHeader />
        {children}
      </main>
    </SidebarProvider>
  );
}
