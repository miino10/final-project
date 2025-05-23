import React, { useState } from "react";
// import { CheckIcon, PlusCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, PlusCircle } from "lucide-react";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const [selectedValues, setSelectedValues] = useState(new Set<string>());
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    setSelectedValues(newSelectedValues);
    column?.setFilterValue(Array.from(newSelectedValues));
  };

  const handleClearFilters = () => {
    setSelectedValues(new Set());
    column?.setFilterValue(undefined);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 py-2 border-dashed bg-background hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-200">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-full px-2 font-normal text-xs">
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 shadow-lg" align="start">
        <Command className="rounded-lg border">
          <CommandInput placeholder={`Search ${title?.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <AnimatePresence>
                {options.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  return (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}>
                      <CommandItem
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center py-2 px-4 cursor-pointer hover:bg-accent">
                        <div
                          className={cn(
                            "mr-3 flex h-5 w-5 items-center justify-center rounded-md border",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted bg-transparent"
                          )}>
                          <CheckIcon
                            className={cn(
                              "h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="flex-grow">{option.label}</span>
                        {facets?.get(option.value) && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {facets.get(option.value)}
                          </span>
                        )}
                      </CommandItem>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleClearFilters}
                    className="justify-center text-center text-sm font-medium text-destructive hover:text-destructive-foreground">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
