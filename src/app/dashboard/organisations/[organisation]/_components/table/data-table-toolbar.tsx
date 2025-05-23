import React, { useState } from "react";
import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal, Search, View } from "lucide-react";
import { TableConfig } from "./tables-config";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  config: TableConfig<TData>;
  onFilterChange: (filter: "true" | "false") => void;
  filter: "true" | "false";
}

export default function DataTableToolbar<TData>({
  table,
  config,
  onFilterChange,
  filter,
}: DataTableToolbarProps<TData>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const activeFilters = table.getState().columnFilters;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left side - Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Button/Input */}
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 md:w-auto md:px-3">
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="flex items-center border-b p-2">
                <Search className="h-4 w-4 mr-2 text-gray-500" />
                <Input
                  placeholder={`Search ${String(
                    config.searchableColumns?.[0] || ""
                  )}...`}
                  value={
                    (table
                      .getColumn(String(config.searchableColumns?.[0]))
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(config.searchableColumns?.[0]))
                      ?.setFilterValue(event.target.value)
                  }
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Filter Dropdown */}
          <Select
            value={filter}
            onValueChange={(value: "true" | "false") => onFilterChange(value)}>
            <SelectTrigger className="h-9 w-fit gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Show Active</SelectItem>
              <SelectItem value="false">Show All</SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((filter) => {
              // Convert the filter value to a string for display
              const filterValue =
                typeof filter.value === "object"
                  ? JSON.stringify(filter.value)
                  : String(filter.value);

              return (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="h-7 rounded-full px-3 flex items-center gap-1">
                  {filter.id}: {filterValue}
                  <button
                    onClick={() => {
                      table.getColumn(filter.id)?.setFilterValue(undefined);
                    }}
                    className="ml-1 rounded-full hover:bg-gray-200 p-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.resetColumnFilters()}
                className="h-7 px-2 text-sm">
                Reset all
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <View className="h-4 w-4 mr-2" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
