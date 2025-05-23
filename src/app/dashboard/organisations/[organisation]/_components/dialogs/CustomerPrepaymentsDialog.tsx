"use client";
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Loader } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useAccounts } from "@/hooks/useAccounts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Customer,
  customerPrepaymentsFormSchema,
  CustomerPrepaymentsFormValues,
} from "@/lib/types";
import { useCustomersFetch } from "@/hooks/useCustomers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

interface CustomerPrepaymentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerPrepaymentsDialog = ({
  open,
  onOpenChange,
}: CustomerPrepaymentsDialogProps) => {
  const form = useForm<CustomerPrepaymentsFormValues>({
    resolver: zodResolver(customerPrepaymentsFormSchema),
    defaultValues: {
      customerId: undefined,
      amount: undefined,
      paymentDate: undefined,
      paymentMethod: undefined,
      paymentAccountId: undefined,
      memo: "",
    },
  });
  const queryClient = useQueryClient();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] =
    useState<CustomerPrepaymentsFormValues | null>(null);
  const { data: customers, isLoading: isCustomersLoading } =
    useCustomersFetch();

  const handleSubmit = useCallback((data: CustomerPrepaymentsFormValues) => {
    const formattedAmount = parseFloat(data.amount.toFixed(2));
    const formattedData = {
      ...data,
      amount: formattedAmount,
    };

    setConfirmData(formattedData);
    setConfirmOpen(true);
  }, []);

  const { mutate: createPrepayment, isLoading: isPending } = useMutation({
    mutationFn: (data: CustomerPrepaymentsFormValues) =>
      axios.post(`/api/customer-prepayments`, data).then((res) => res.data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Prepayment recorded successfully",
      });
      setConfirmOpen(false);
      onOpenChange(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["customer-prepayments"] });
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
    },
  });

  const handleConfirmSubmit = useCallback(() => {
    if (confirmData) {
      createPrepayment(confirmData);
    }
  }, [confirmData, createPrepayment]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-screen-md">
        <DialogHeader className="text-center mb-4">
          <DialogTitle>Record Customer Prepayment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="">Payment Amount</FormLabel>
                    <Input
                      className="border-purple-500 focus-visible:ring-transparent  p-2"
                      {...field}
                      type="number"
                      step="0.01"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment date</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="border-purple-500 focus-visible:ring-transparent w-full">
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a Date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <SelectTrigger className="border-purple-500 focus-visible:ring-transparent  p-2">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Account</FormLabel>
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
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Memo</FormLabel>
                    <Input
                      className="border-purple-500 focus-visible:ring-transparent  p-2"
                      {...field}
                      placeholder="Add Memo (optional)"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Record Prepayment</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>Confirm Prepayment</DialogHeader>
          <DialogDescription>
            Please confirm the following payment details:
            <ul className="mt-4 space-y-2">
              <li>
                Amount:{" "}
                <span className="font-medium">${confirmData?.amount}</span>
              </li>
              <li>
                Payment Date:{" "}
                <span className="font-medium">
                  {confirmData?.paymentDate &&
                    format(confirmData.paymentDate, "PPP")}
                </span>
              </li>
              <li>
                Payment Method:{" "}
                <span className="font-medium">
                  {confirmData?.paymentMethod}
                </span>
              </li>
            </ul>
          </DialogDescription>
          <DialogFooter>
            <Button
              disabled={isPending}
              variant="secondary"
              onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="submit"
              onClick={handleConfirmSubmit}
              disabled={isPending}>
              {isPending ? (
                <div className=" flex items-center gap-3">
                  <span>Creating</span>
                  <Loader className="w-5 h-5 mr-2 animate-spin " />
                </div>
              ) : (
                "Confirm and Submit"
              )}
            </Button>
            {/* <Button
              variant="destructive"
              onClick={handleConfirmSubmit}></Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default CustomerPrepaymentsDialog;