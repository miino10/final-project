import React from "react";
import { BaseTable } from "./baseTable";
import { TableConfig } from "./tables-config";

interface TableProps<T> {
  data: T[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    totalItems: number;
  };
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onFilterChange: (filter: "true" | "false") => void;
  filter: "true" | "false";
}

export default function createTable<T>(config: TableConfig<T>) {
  return function Table({
    data,
    pagination,
    onPaginationChange,
    onFilterChange,
    filter,
  }: TableProps<T>) {
    return (
      <BaseTable<T>
        config={config}
        data={data}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onFilterChange={onFilterChange}
        filter={filter}
      />
    );
  };
}
