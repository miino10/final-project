"use client";
import { accountsTypes } from "@/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useAccountCategory from "@/hooks/useAccountCategory";
import { useAccountCreation } from "@/hooks/useAccounts";
import createTable from "../_components/table/createTable";
import { accountsTableConfig } from "../_components/table/tables-config";
import BreadcrumbComponent from "../_components/Breadcrumb";
import { AccountCreationDialog } from "../_components/dialogs/AccountCreationDialog";

type accountCategories = {
  id: number;
  name: string;
  description: string;
  orgId: number | null;
  type: string;
};
export type Accounts = {
  id: number;
  name: string;
  code: string;
  type: string;
  orgId: number | null;
  accountTypes: accountsTypes[];
  accountCategories: accountCategories[];
};

type AccountList = Accounts[];

type ApiResponse = {
  data: AccountList;
  total: number;
  pageCount: number;
};

export default function ChartOfAccountsPage() {
 
  const params = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const AccountsTable = createTable(accountsTableConfig);
  const { data: accountCategories } = useAccountCategory();
  const { mutate } = useAccountCreation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"true" | "false">("true");

 
  
    
  const {
    isLoading,
    error,
    data: response,
  } = useQuery<ApiResponse>({
    queryKey: ["accounts", page, pageSize, filter],
    queryFn: () =>
      axios
        .get<ApiResponse>(
          `/api/accounts?page=${page}&pageSize=${pageSize}&isActive=${filter}`
        )
        .then((res) => res.data),
  });

  console.log(response);

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "chart-of-accounts",
      path: `/dashboard/organisation/${params.organisations}/chart-of-accounts`,
    },
  ];

  queryClient.invalidateQueries({ queryKey: ["accounts", page, pageSize] });

 

  return (
    <>
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit w-[80vw] lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:py-8 flex">
       
        
          <div className="flex items-center justify-end gap-5">
            <AccountCreationDialog />
            
          </div>
       

          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center">
              Error fetching Accounts data. Please try again.
            </div>
          ) : response ? (
            <AccountsTable
              data={response.data}
              pagination={{
                pageIndex: page - 1,
                pageSize: pageSize,
                pageCount: response.pageCount,
                totalItems: response.total,
              }}
              onFilterChange={(newFilter) => setFilter(newFilter)}
              filter={filter}
              onPaginationChange={handlePaginationChange}
            />
          ) : null}
        
      </div>
    </>
  );
}
