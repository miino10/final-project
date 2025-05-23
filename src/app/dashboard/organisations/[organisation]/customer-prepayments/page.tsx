"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { CustomerPrepaymentsApiResponse } from "@/lib/types";
import createTable from "../_components/table/createTable";
import BreadcrumbComponent from "../_components/Breadcrumb";
import { customerPrepaymentsTableConfig } from "../_components/table/tables-config";
import CustomerPrepaymentsDialog from "../_components/dialogs/CustomerPrepaymentsDialog";

function CustomerPrepayments() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const params = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const CustomerPrepaymentsTable = createTable(customerPrepaymentsTableConfig);
  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["customer-prepayments", page, pageSize],
    queryFn: () =>
      axios
        .get<CustomerPrepaymentsApiResponse>(
          `/api/customer-prepayments?page=${page}&pageSize=${pageSize}`
        )
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
      label: "Customer Prepayments",
      path: `/dashboard/organisation/${params.organisations}/customer-prepayments`,
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
            <CustomerPrepaymentsDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="ml-4">
              Add Customer Prepayment
            </Button>
          </div>
       

        {/* TODO: Add customer prepayments table */}

       
          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center ">
              Error fetching Invoice data. Please try again.
            </div>
          ) : response ? (
            <CustomerPrepaymentsTable
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

export default CustomerPrepayments;