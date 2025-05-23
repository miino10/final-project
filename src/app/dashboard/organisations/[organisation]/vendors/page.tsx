"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Vendor } from "@/lib/types";
import createTable from "../_components/table/createTable";
import { vendorTableConfig } from "../_components/table/tables-config";
import BreadcrumbComponent from "../_components/Breadcrumb";
import VendorCreationDialog from "../_components/dialogs/VendorCreationDialog";


type vendorsList = Vendor[];

type ApiResponse = {
  data: vendorsList;
  total: number;
  pageCount: number;
};

const VendorTable = createTable<Vendor>(vendorTableConfig);

function VendorsPage() {

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<"true" | "false">("true");
  const queryClient = useQueryClient();
   
  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["vendors", page, pageSize, filter],
    queryFn: () =>
      axios
        .get<ApiResponse>(
          `/api/vendors?page=${page}&pageSize=${pageSize}&isActive=${filter}`
        )
        .then((res) => res.data),
  });

  const params = useParams();

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Vendors",
      path: `/dashboard/organisation/${params.organisations}/vendors`,
    },
  ];

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  queryClient.invalidateQueries({
    queryKey: ["vendors", page, pageSize, filter],
  });

 
  
  return (
    <>
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit  lg:flex-1 flex-col gap-4  py-2 md:space-y-8  md:py-4 md:px-2 lg:p-8 flex">
        
          <div className="flex items-center justify-end gap-5 ">
            <VendorCreationDialog />
           
          </div>
       
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error loading vendors.</p>
          ) : response ? (
            <VendorTable
              data={response.data || []}
              pagination={{
                pageIndex: page - 1,
                pageSize: pageSize,
                pageCount: response.pageCount,
                totalItems: response.total,
              }}
              onPaginationChange={handlePaginationChange}
              onFilterChange={(newFilter) => setFilter(newFilter)}
              filter={filter}
            />
          ) : null}
       
      </div>
    </>
  );
}

export default VendorsPage;
