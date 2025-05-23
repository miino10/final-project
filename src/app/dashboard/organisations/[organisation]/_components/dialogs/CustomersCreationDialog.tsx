"use client";

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
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryOptions } from "@/lib/countryOptions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CustomersformSchema } from "@/lib/types";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
type FormData = z.infer<typeof CustomersformSchema>;

export default function CustomersCreationDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const form = useForm<FormData>({
    resolver: zodResolver(CustomersformSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "US",
      phone: "",
      address: "",
    },
  });

  const { mutate: addCustomer, isLoading } = useMutation({
    mutationFn: (customer: FormData) =>
      axios.post<FormData>("/api/customers", customer).then((res) => res.data),

    onSuccess: (savedData) => {
      toast({
        variant: "success",
        title: "Customer created successfully",
      });
      form.reset();

      setOpen(false);

      console.log("savaed data is", savedData);

      queryClient.invalidateQueries({ queryKey: ["customers"] });
    
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

  const formatPhoneNumber = (phone: string, country: CountryCode) => {
    const phoneNumber = parsePhoneNumberFromString(phone, country);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
    return phone;
  };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const country = form.getValues("country") as CountryCode;
    const formattedNumber = formatPhoneNumber(value, country);
    setPhoneNumber(formattedNumber);
    form.setValue("phone", formattedNumber);
  };

  useEffect(() => {
    const country = form.getValues("country") as CountryCode;
    const phone = form.getValues("phone");
    if (phone) {
      const formattedNumber = formatPhoneNumber(phone, country);
      setPhoneNumber(formattedNumber);
      form.setValue("phone", formattedNumber);
    }
  }, [form.getValues("country")]);
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
          New Customer
        </Button>
      </DialogTrigger>{" "}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4 border-b">
          <SheetTitle>Create New Customer</SheetTitle>
        </SheetHeader>{" "}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => addCustomer(data))}
            className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full border-purple-500 focus-visible:ring-transparent">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                        {...field}
                        value={phoneNumber}
                        onChange={onPhoneChange}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full border-purple-500 focus-visible:ring-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader className="animate-spin mr-2" size={16} />
                ) : null}
                Create Customer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
