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
import { ProductFormData, ProductSchema } from "@/lib/types";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { Loader } from "lucide-react";
import { useVendors } from "@/hooks/useVendors";
import { useCreateProduct } from "@/hooks/useProducts";

function ProductsCreationDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: addProduct, isLoading: isCreating } = useCreateProduct();

  const forme = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      productType: "service",
      productName: "",
      sellingPrice: 0,
      costPrice: 0,
      incomeAccountId: undefined,
      unitOfMeasure: undefined,
    },
  });

  const productType = forme.watch("productType");

  const ProductSubmit = (newProduct: z.infer<typeof ProductSchema>) => {
    console.log(newProduct);

    addProduct(newProduct, {
      onSuccess: () => {
        setOpen(false);
        forme.reset();
      },
    });
  };

  
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: vendors, isLoading: VendorsLoading } = useVendors();

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
      }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          onClick={() => {
            setOpen(true);
          }}>
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4 border-b">
          <SheetTitle>Create New Product</SheetTitle>
        </SheetHeader>
        <Form {...forme}>
          <form
            onSubmit={forme.handleSubmit(ProductSubmit)}
            className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={forme.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forme.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select
                      onValueChange={(
                        value:  "service"
                      ) => {
                        field.onChange(value);
                        if (value !== "service") {
                          forme.resetField("inventoryAssetAccountId");
                          forme.resetField("inventoryId");
                          forme.resetField("cogsAccountId");
                        }
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-purple-500 focus-visible:ring-transparent  p-2">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>

                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={forme.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {productType !== "service" && (
                <FormField
                  control={forme.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="w-full border-purple-500 focus-visible:ring-transparent"
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? null : Number(value));
                          }}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={forme.control}
                name="incomeAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Account</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedAccount = accounts.data?.find(
                          (account: any) => account.name === value
                        );
                        console.log("selectedAccount", selectedAccount);
                        field.onChange(selectedAccount.id);
                      }}
                      defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-purple-500 focus-visible:ring-transparent  p-2">
                          <SelectValue placeholder="Select income account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountsLoading ? (
                          <div className="p-2 flex justify-center items-center">
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                          </div>
                        ) : (
                          accounts.data?.map((account: any) => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={forme.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedVendor = vendors.data?.find(
                          (vendor: any) => vendor.name === value
                        );
                        console.log("selectedAccount", selectedVendor);
                        field.onChange(selectedVendor.id);
                      }}
                      defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="border-purple-500 focus-visible:ring-transparent  p-2">
                          <SelectValue placeholder="Select income account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VendorsLoading ? (
                          <div className="p-2 flex justify-center items-center">
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                          </div>
                        ) : (
                          vendors.data?.map((vendor: any) => (
                            <SelectItem key={vendor.id} value={vendor.name}>
                              {vendor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={forme.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measure</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-purple-500 focus-visible:ring-transparent p-2">
                          <SelectValue placeholder="Select unit of measure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="g">Gram (g)</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="piece">Piece</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <div className=" flex items-center gap-3">
                    <span>Creating</span>
                    <Loader className="w-5 h-5 mr-2 animate-spin " />
                  </div>
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductsCreationDialog;
