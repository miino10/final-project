"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VendorFormData, VendorSchema } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
 
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Import SheetHeader and SheetTitle
import { countryList } from "@/lib/country-list";

export default function VendorCreationDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const form = useForm<VendorFormData>({
    resolver: zodResolver(VendorSchema),
    defaultValues: {
      vendorName: "",
      vendorEmail: "",
      vendorCountry: "China",
      address: "",
      phoneNumber: "",
    },
  });

  const { mutate: addVendor, isLoading: isCreating } = useMutation({
    mutationFn: (vendors: VendorFormData) =>
      axios
        .post<VendorFormData>("/api/vendors", vendors)
        .then((res) => res.data),
    onSuccess: () => {
      form.reset();
      toast({
        variant: "success",
        title: "vendor created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      form.reset();
      setOpen(false);
    },
    onError: (error: unknown) => {
      let errorMessage = "An unexpected error occurred";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      console.error("Error details:", errorMessage);
    },
  });

  const VendorSubmit = (newVendor: VendorFormData) => {
    addVendor(newVendor);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          onClick={() => {
            setOpen(true);
          }}>
          New Vendor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4 border-b">
          {" "}
          {/* Updated Header Style */}
          <SheetTitle>Create New Vendor</SheetTitle>{" "}
          {/* Updated Title Component */}
        </SheetHeader>{" "}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(VendorSubmit)}
            className="space-y-6 pt-4">
            {" "}
            {/* Updated Form Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {/* Updated Grid Layout */}
              <FormField
                control={form.control}
                name="vendorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent" // Updated Input Style
                        id="vendorName"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vendorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Email</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent" // Updated Input Style
                        id="vendorEmail"
                        type="email" // Added email type
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {/* Updated Grid Layout */}
              <FormField
                control={form.control}
                name="vendorCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Country</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("vendorCountry", value);
                      }}
                      value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="w-full border-purple-500 focus-visible:ring-transparent">
                          {" "}
                          {/* Updated Select Style */}
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryList.map((option) => (
                          <SelectItem key={option.label} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Address</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent" // Updated Input Style
                        id="address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {/* Updated Grid Layout */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent" // Updated Input Style
                        id="phoneNumber"
                        type="tel" // Added tel type
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              {" "}
              {/* Updated Button Layout */}
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <Loader className="animate-spin mr-2" size={16} />
                ) : null}
                Create Vendor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
