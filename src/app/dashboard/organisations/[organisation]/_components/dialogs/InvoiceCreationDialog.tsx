"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Trash, PlusCircle, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { invoiceFormSchema, InvoiceFormValues } from "@/lib/types";
import useProduct from "@/hooks/useProducts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: number;
}

export interface Product {
  productId: number;
  productName: string;
  quantity: string;
  sellingPrice: number;
  unitOfMeasure: string;
}

export default function InvoiceDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: undefined,
      invoiceDate: new Date(),
      dueDate: new Date(),
      invoiceItems: [
        {
          product_name: "",
          product_price: 0,
          product_quantity: 0,
          productId: undefined,
          productType: undefined,
         
        },
      ],
      total: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "invoiceItems",
    control: form.control,
  });

  const watchedInvoiceItems = useWatch({
    control: form.control,
    name: "invoiceItems",
  });

  const totalPrice = useMemo(() => {
    return watchedInvoiceItems.reduce((total, item) => {
      return total + (item.product_price || 0) * (item.product_quantity || 0);
    }, 0);
  }, [watchedInvoiceItems]);

  useEffect(() => {
    form.setValue("total", totalPrice);
  }, [totalPrice, form]);

  const { mutate: addInvoice, isLoading: isCreating } = useMutation({
    mutationFn: (invoice: z.infer<typeof invoiceFormSchema>) =>
      axios.post<FormData>("/api/invoices", invoice).then((res) => res.data),
    onSuccess: () => {
      form.reset();
      toast({
        variant: "success",
        title: "Invoice created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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

  const { data: products, isLoading: isProductsLoading } = useProduct();
  console.log("prodc", products);

  const { data: customers, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => axios.get("/api/customers").then((res) => res.data),
  });

  const handleSubmit = useCallback(
    (newInvoice: z.infer<typeof invoiceFormSchema>) => {
      console.log(newInvoice);

      addInvoice(newInvoice);
    },
    [addInvoice]
  );

  const handleProductChange = useCallback(
    (index: number, productName: string) => {
      const selectedProduct = products?.data.find(
        (prod: Product) => prod.productName === productName
      );
      if (selectedProduct) {
        form.setValue(
          `invoiceItems.${index}.product_price`,
          selectedProduct.sellingPrice
        );
        form.setValue(
          `invoiceItems.${index}.productId`,
          selectedProduct.productId
        );
        form.setValue(
          `invoiceItems.${index}.productType`,
          selectedProduct.productType
        );
        

        setSelectedProducts((prev) => {
          const newSelected = [...prev];
          newSelected[index] = productName;
          return newSelected;
        });
      }
    },
    [products, form, setSelectedProducts]
  );

  const getAvailableProducts = useCallback(
    (currentIndex: number) => {
      if (!products) return [];
      return products.data.filter(
        (product: Product) =>
          !selectedProducts.includes(product.productName) ||
          selectedProducts[currentIndex] === product.productName
      );
    },
    [products, selectedProducts]
  );

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
          <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new invoice.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const id = parseInt(value, 10);
                          field.onChange(id);
                        }}
                        value={field.value?.toString() || ""}>
                        <SelectTrigger className="border-purple-500 focus-visible:ring-transparent w-full">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>

                        <SelectContent className="">
                          {isCustomersLoading ? (
                            <div className="p-2 flex justify-center items-center">
                              <Loader className="w-5 h-5 mr-2 animate-spin text-center" />
                            </div>
                          ) : (
                            <SelectGroup>
                              {customers.data.map((customer: Customer) => (
                                <SelectItem
                                  key={customer.id}
                                  value={customer.id.toString()}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-purple-500 focus-visible:ring-transparent">
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-purple-500 focus-visible:ring-transparent">
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Price</FormLabel>
                      <FormControl>
                        <Input
                          className="border-purple-500 focus-visible:ring-transparent w-full"
                          type="text"
                          readOnly
                          value={totalPrice.toFixed(2)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.product_name`}
                      render={({ field }) => (
                        <div className="flex-1 min-w-[200px]">
                          <FormItem className="space-y-2">
                            <FormLabel className="block">
                              Product Name
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleProductChange(index, value);
                              }}
                              value={field.value}>
                              <SelectTrigger className="border-purple-500 focus-visible:ring-transparent w-full">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {isProductsLoading ? (
                                  <div className="p-2 flex justify-center items-center">
                                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                                  </div>
                                ) : (
                                  <SelectGroup>
                                    {getAvailableProducts(index).map(
                                      (product: Product) => (
                                        <SelectItem
                                          key={product.productId}
                                          value={product.productName}>
                                          {product.unitOfMeasure} -{" "}
                                          {product.productName}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectGroup>
                                )}
                              </SelectContent>
                            </Select>
                            <div className="min-h-[20px]">
                              <FormMessage />
                            </div>
                          </FormItem>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.product_quantity`}
                      render={({ field }) => (
                        <div className="flex-1 min-w-[100px]">
                          <FormItem className="space-y-2">
                            <FormLabel className="block">Quantity</FormLabel>
                            <FormControl>
                              <Input
                                className="border-purple-500 focus-visible:ring-transparent w-full"
                                type="number"
                                {...field}
                                value={field.value?.toString() ?? "1"}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  field.onChange(
                                    isNaN(value) ? 1 : Math.max(1, value)
                                  );
                                }}
                              />
                            </FormControl>
                            <div className="min-h-[20px]">
                              <FormMessage />
                            </div>
                          </FormItem>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoiceItems.${index}.product_price`}
                      render={({ field }) => (
                        <div className="flex-1 min-w-[100px]">
                          <FormItem className="space-y-2">
                            <FormLabel className="block">Price</FormLabel>
                            <FormControl>
                              <Input
                                className="border-purple-500 focus-visible:ring-transparent w-full"
                                type="number"
                                {...field}
                                value={field.value?.toString() ?? "0"}
                              />
                            </FormControl>
                            <div className="min-h-[20px]">
                              <FormMessage />
                            </div>
                          </FormItem>
                        </div>
                      )}
                    />

                   

                    <div className="flex items-end mb-5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => remove(index)}>
                        <Trash size={20} />
                      </Button>
                    </div>
                  </div>
                ))}
                <FormMessage className="text-center">
                  {form.formState.errors?.invoiceItems?.root?.message}
                </FormMessage>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4">
                <Button
                  className="border-purple-500 w-full sm:w-32"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      product_name: "",
                      product_price: 0,
                      product_quantity: 0,
                      productId: 0,
                      productType: undefined,
                    })
                  }>
                  Add invoice
                </Button>
                {isCreating ? (
                  <Button
                    disabled={isCreating}
                    className="bg-gray-300 hover:bg-gray-300 w-full sm:w-32 flex gap-2"
                    type="submit">
                    <div className=" flex items-center gap-3">
                      <span>Creating</span>
                      <Loader className="w-5 h-5 mr-2 animate-spin " />
                    </div>
                  </Button>
                ) : (
                  <Button className="w-full sm:w-32" type="submit">
                    Submit
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
