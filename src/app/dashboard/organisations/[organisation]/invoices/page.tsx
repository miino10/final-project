"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { TinvoiceSchemaTables } from "@/lib/types";
import { invoiceTableConfig } from "../_components/table/tables-config";
import createTable from "../_components/table/createTable";
import BreadcrumbComponent from "../_components/Breadcrumb";
import InvoiceDialog from "../_components/dialogs/InvoiceCreationDialog";


type InvoiceList = TinvoiceSchemaTables[];

type ApiResponse = {
  data: InvoiceList;
  total: number;
  pageCount: number;
};
export default function Invoices() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const InvoiceTable = createTable(invoiceTableConfig);
  const params = useParams();
  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["invoices", page, pageSize],
    queryFn: () =>
      axios
        .get<ApiResponse>(`/api/invoices?page=${page}&pageSize=${pageSize}`)
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
      label: "Invoices",
      path: `/dashboard/organisation/${params.organisations}/invoices`,
    },
  ];

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  return (
    <>
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit  lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:py-8 flex ">
       
          <div className="flex items-center justify-end space-y-2">
            <InvoiceDialog />
          </div>
        
       
          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center ">
              Error fetching Invoice data. Please try again.
            </div>
          ) : response ? (
            <InvoiceTable
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
