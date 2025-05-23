"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import createTable from "../_components/table/createTable";
import { manualJournalTableConfig } from "../_components/table/tables-config";
import BreadcrumbComponent from "../_components/Breadcrumb";
import JournalEntryDialog from "../_components/dialogs/JournalCreattionDialog";


export default function GeneralJournalPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const ManualJournalTable = createTable(manualJournalTableConfig);
  const params = useParams();
  const queryClient = useQueryClient();
  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["manual-journals"],
    queryFn: () =>
      axios
        .get(`/api/manual-journals?page=${page}&pageSize=${pageSize}`)
        .then((res) => res.data),
  });

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "manual-journals",
      path: `/dashboard/organisation/${params.organisations}/manual-journal`,
    },
  ];

  queryClient.invalidateQueries({
    queryKey: ["manual-journals", page, pageSize],
  });

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  return (
    <>
     <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      <div className="h-fit  lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:py-8 flex ">
       
       
          <div className="flex items-center justify-end space-y-2">
            <JournalEntryDialog />
          </div> 

          {isLoading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : error ? (
            <div className="text-red-500 flex justify-center items-center ">
              Error fetching manual journals data. Please try again.
            </div>
          ) : response ? (
            <ManualJournalTable
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
