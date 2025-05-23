"use client";

import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Customer } from "@/lib/types";
import { customerTableConfig } from "../_components/table/tables-config";
import BreadcrumbComponent from "../_components/Breadcrumb";
import createTable from "../_components/table/createTable";
import CustomersCreationDialog from "../_components/dialogs/CustomersCreationDialog";


type CustomerList = Customer[];

type ApiResponse = {
  data: CustomerList;
  total: number;
  pageCount: number;
};

function CustomersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const CustomerTable = createTable(customerTableConfig);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"true" | "false">("true");

  

  const params = useParams();

 
  

  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["customers", page, pageSize, filter],
    queryFn: () =>
      axios
        .get<ApiResponse>(
          `/api/customers?page=${page}&pageSize=${pageSize}&isActive=${filter}`
        )
        .then((res) => res.data),
  });

  queryClient.invalidateQueries({ queryKey: ["customers", page, pageSize] });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Customers",
      path: `/dashboard/organisation/${params.organisations}/customers`,
    },
  ];

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  

  return (
    <div>
      {" "}
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit  lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:p-8 flex">
       
          <div className="flex items-center justify-end gap-5 ">
            <CustomersCreationDialog />
            
          </div>
        

        
          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center ">
              Error fetching customers data. Please try again.
            </div>
          ) : response ? (
            <CustomerTable
              data={response?.data}
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
    </div>
  );
}

export default CustomersPage;
