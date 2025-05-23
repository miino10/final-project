"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import BreadcrumbComponent from "../_components/Breadcrumb";
import {Product} from "@/lib/types";
import createTable from "../_components/table/createTable";
import { ChevronDown } from "lucide-react";
import { productTableConfig } from "../_components/table/tables-config";
import ProductsCreationDialog from "../_components/dialogs/ProductCreationDialog";

type productsList = Product[];

type ApiResponse = {
  data: productsList;
  total: number;
  pageCount: number;
};



export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const ProductTable = createTable(productTableConfig);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"true" | "false">("true");



  
  const params = useParams();
  const {
    isLoading,
    error,
    data: response,
  } = useQuery({
    queryKey: ["products", filter],
    queryFn: () =>
      axios
        .get<ApiResponse>(
          `/api/products?page=${page}&pageSize=${pageSize}&isActive=${filter}`
        )
        .then((res) => res.data),
  });


  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Products",
      path: `/dashboard/organisation/${params.organisations}/products`,
    },
  ];

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage + 1);
    setPageSize(newPageSize);
  };

  

  queryClient.invalidateQueries({ queryKey: ["products"] });

  return (
    <>
      <BreadcrumbComponent breadcrumbs={breadcrumbs} />
      

        
          <div className="h-fit  lg:flex-1 flex-col space-y-8 md:py-4 md:px-2 lg:py-8 flex">
            <div className="flex items-center justify-between space-y-2"></div>
            <div className="flex justify-end p-2 gap-4 text-xs md:text-base">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="border-[rgb(188,242,252)] flex justify-center items-center text-purple-600 border-[2px] hover:bg-[rgb(240,253,255)] p-1 md:p-2 rounded-sm">
                    Export
                    <span>
                      <ChevronDown />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-1 md:p-3">
                  <DropdownMenuItem>
                    <Link
                      className="text-xs md:text-base"
                      href={"/api/export?format=xlsx"}>
                      Export To Excel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      className="text-xs md:text-base"
                      href={`/api/export?format=csv&isActive=${filter}`}>
                      Export To CSV
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div>
              <ProductsCreationDialog />
              </div>
             
             
            </div>
            <>
              {response ? (
                <ProductTable
                  data={response?.data ?? []}
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
            </>
          </div>
        
     
    </>
  );
}
