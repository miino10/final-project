"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import BreadcrumbComponent from "../_components/Breadcrumb";
import createTable from "../_components/table/createTable";
import { receiptTableConfig } from "../_components/table/tables-config";
import { TreceiptSchemaTables } from "@/lib/types";
import ReceiptCreationDialog from "../_components/dialogs/ReceiptCreationDialog";


type receiptList = TreceiptSchemaTables[];

export type ApiResponse = {
  data: receiptList;
  total: number;
  pageCount: number;
};

export default function ReceiptHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const ReceiptTable = createTable(receiptTableConfig);
  const params = useParams();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["receipts", page, pageSize],
    queryFn: () =>
      axios
        .get<ApiResponse>(`/api/receipts?page=${page}&pageSize=${pageSize}`)
        .then((res) => res.data),
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Receipts",
      path: `/dashboard/organisation/${params.organisations}/receipts`,
    },
  ];

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  return (
    <>
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit  lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:p-8 flex">

          <div className="flex items-center justify-end space-y-2">
            <ReceiptCreationDialog />
          </div>
       
       
         
          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center ">
              Error fetching receipt data. Please try again.
            </div>
          ) : response ? (
            <ReceiptTable
              data={response?.data}
              pagination={{
                pageIndex: page - 1,
                pageSize: pageSize,
                pageCount: response.pageCount,
                totalItems: response.total,
              }}
              onFilterChange={() => console.log("solve")}
              filter={"true"}
              onPaginationChange={handlePaginationChange}
            />
          ) : null}
       
      </div>
    </>
  );
}
