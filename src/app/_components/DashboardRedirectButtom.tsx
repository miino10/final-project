"use client";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

function DashboardRedirectButton() {
  const { orgId } = useAuth();

  return (
    <div className=" flex flex-col md:flex-row items-center justify-center gap-2 ">
      <Link
        className="bg-[rgb(80,216,168)] p-2 rounded-md flex gap-1 justify-center items-center"
        href={`/dashboard/organisations/${orgId}`}>
        <p className="text-xs md:text-sm">Dashboard</p>
      </Link>
      <UserButton />
    </div>
  );
}

export default DashboardRedirectButton;
