"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { UserButton, useUser } from "@clerk/nextjs";

export function MainHeader() {
  const { isMobile, toggleSidebar } = useSidebar();
  const { user } = useUser();

  return (
    <header
      className={`sticky top-0 z-50 flex justify-between h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm transition-all duration-300 ${
        isMobile ? "pl-6" : "pl-20"
      }`}>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden hover:bg-accent hover:text-accent-foreground"
        onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-start md:flex-row md:items-center md:gap-3">
        <p className="text-sm font-medium md:text-base lg:text-lg">
          Welcome back,
        </p>
        {user?.id ? (
          <p className="text-sm md:text-base font-semibold text-primary">
            {user?.fullName}!
          </p>
        ) : (
          <p className="text-sm md:text-base text-muted-foreground">Guest!</p>
        )}
      </div>

      <div className="flex items-center justify-end space-x-4">
        {user?.id && (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 md:h-9 md:w-9",
              },
            }}
          />
        )}
      </div>
    </header>
  );
}
