"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { receivePaymentFormSchema } from "@/lib/types";
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
import { format } from "date-fns";
import { CalendarIcon, Loader, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Decimal from "decimal.js";
import { PaymentData } from "@/hooks/useInvoice";
import { useAccounts } from "@/hooks/useAccounts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

// Create a dialog-specific schema with usePrepayment as required boolean
const dialogPaymentFormSchema = z
  .object({
    paymentAccountId: z.number({
      required_error: "Payment Account is required",
      invalid_type_error: "Please select a valid Payment Account",
    }),
    referenceId: z.string(),
    amount: z.coerce
      .number({
        required_error: "required",
        invalid_type_error: "amount must be a number",
      })
      .nonnegative({ message: "number must be a positive number" })
      .gt(0, { message: "amount must be greater than 0" }),
    paymentDate: z.coerce.date({
      required_error: "Please enter the payment date",
    }),
    paymentMethod: z.string({
      required_error: "Please select a payment method",
    }),
    usePrepayment: z.boolean(), // Required boolean instead of optional with default
    prepaymentAmount: z.number().optional(),
    prepaymentId: z.number().optional(),
  })
  .refine(
    (data) => {
      const totalAmount = (data.amount || 0) + (data.prepaymentAmount || 0);
      return totalAmount > 0;
    },
    {
      message: "Total payment amount must be greater than 0",
      path: ["amount"],
    }
  );

type DialogPaymentFormValues = z.infer<typeof dialogPaymentFormSchema>;

interface PaymentDialogProps {
  invoiceId: number;
  customerId: number;
  referenceId: string;
  totalamount: number;
  dueDate: string;
  dueBalance: string;
  onSubmit: (data: PaymentData) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaymentsDialog = ({
  referenceId,
  customerId,
  totalamount = 0,
  invoiceId,
  dueBalance,
  onSubmit,
  onOpenChange,
  open,
}: PaymentDialogProps) => {
  const form = useForm<DialogPaymentFormValues>({
    resolver: zodResolver(dialogPaymentFormSchema),
    defaultValues: {
      paymentAccountId: undefined,
      amount: undefined,
      referenceId: undefined,
      paymentDate: undefined,
      paymentMethod: undefined,
      usePrepayment: false,
      prepaymentAmount: undefined,
      prepaymentId: undefined,
    },
  });

  const { data: prepayments, isLoading: isPrepaymentsLoading } = useQuery({
    queryKey: ["customerPrepayments", customerId],
    queryFn: async () => {
      if (!customerId) {
        throw new Error("Customer ID is required");
      }
      const response = await axios.get(
        `/api/customer-prepayments/${customerId}`
      );
      return response.data;
    },
    enabled: !!customerId && form.watch("usePrepayment"),
  });

  const [selectedPrepayment, setSelectedPrepayment] = useState<any>(null);

  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  useEffect(() => {
    form.setValue("referenceId", referenceId);
    return () => {
      if (!open) {
        form.reset();
        setSelectedPrepayment(null);
      }
    };
  }, [referenceId, form, open]);

  const watchedAmount = form.watch("amount");
  const watchedPrepaymentAmount = form.watch("prepaymentAmount");
  const amount =
    typeof watchedAmount === "number" && !isNaN(watchedAmount)
      ? watchedAmount
      : 0;
  const prepaymentAmount =
    typeof watchedPrepaymentAmount === "number" &&
    !isNaN(watchedPrepaymentAmount)
      ? watchedPrepaymentAmount
      : 0;
  const totalPaymentAmount = new Decimal(amount).plus(
    new Decimal(prepaymentAmount)
  );
  const remainingBalance = new Decimal(dueBalance).minus(totalPaymentAmount);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<PaymentData | undefined>(
    undefined
  );

  const handleSubmit = useCallback(
    (data: DialogPaymentFormValues) => {
      const prepaymentAmount = data.prepaymentAmount || 0;
      const cashAmount = data.amount || 0;
      const totalAmount = prepaymentAmount + cashAmount;
      const currentRemainingBalance = new Decimal(dueBalance).minus(
        new Decimal(totalAmount)
      );

      if (currentRemainingBalance.greaterThan(0)) {
        toast({
          variant: "default",
          title: "Partial Payment",
          description: `You are paying $${cashAmount} cash${
            prepaymentAmount > 0 ? ` + $${prepaymentAmount} prepayment` : ""
          } (Total: $${totalAmount}) out of the total invoice amount of $${totalamount}. The remaining balance will be $${currentRemainingBalance.toFixed(
            2
          )}`,
        });
      } else if (remainingBalance.lessThan(0)) {
        toast({
          variant: "destructive",
          title: "Overpayment",
          description: `The payment amount of $${data.amount} exceeds the invoice amount of $${totalamount}. Please adjust the payment amount.`,
        });
        return;
      }

      const formattedData: PaymentData = {
        ...data,
        id: invoiceId,
        amount: cashAmount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        referenceId: data.referenceId!,
        paymentMethod: data.paymentMethod!,
        paymentAccountId: data.paymentAccountId,
        prepayment:
          prepaymentAmount > 0 && selectedPrepayment
            ? {
                prepaymentId: selectedPrepayment.id,
                prepaymentAmount: prepaymentAmount,
              }
            : undefined,
      };

      setConfirmData(formattedData);
      setConfirmOpen(true);
    },
    [referenceId, totalamount, remainingBalance, invoiceId, selectedPrepayment]
  );

  const handleConfirmSubmit = useCallback(() => {
    if (confirmData) {
      console.log("Confirm Submit", confirmData);
      onSubmit(confirmData);
      setConfirmOpen(false);
      form.reset();
    }
  }, [confirmData, onSubmit, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-screen-md bg-white dark:bg-gray-950 shadow-lg border-0 max-h-[90vh] overflow-hidden flex flex-col">
        <SheetHeader className="text-center mb-4 flex-shrink-0">
          <SheetTitle>Receive New Payment</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6">
              {/* Bill Summary Section */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Bill Amount</p>
                  <p className="text-base font-medium">${totalamount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">To Pay</p>
                  <p className="text-base font-medium text-primary">
                    $
                    {(
                      parseFloat(amount.toString()) +
                      (form.watch("prepaymentAmount") || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p
                    className={`text-base font-medium ${
                      remainingBalance.lessThan(0)
                        ? "text-destructive"
                        : remainingBalance.equals(0)
                        ? "text-green-500"
                        : ""
                    }`}>
                    ${remainingBalance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Prepayment Toggle */}
              <FormField
                control={form.control}
                name="usePrepayment"
                render={({ field }) => (
                  <FormItem className="bg-muted/30 rounded-lg p-3 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="text-sm font-medium">
                          Use Prepayment
                        </FormLabel>
                        <FormDescription className="text-xs text-muted-foreground mt-0.5">
                          Apply available prepayments to this invoice
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              setSelectedPrepayment(null);
                              form.setValue("prepaymentAmount", undefined);
                            }
                          }}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {/* Prepayment Selection */}
              {form.watch("usePrepayment") && (
                <div className="space-y-4">
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                      {isPrepaymentsLoading ? (
                        <div className="flex justify-center items-center h-[100px]">
                          <Loader className="h-4 w-4 animate-spin" />
                        </div>
                      ) : prepayments?.length > 0 ? (
                        prepayments.map((prepayment: any) => (
                          <Card
                            key={prepayment.id}
                            className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                              selectedPrepayment?.id === prepayment.id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedPrepayment(prepayment);
                              form.setValue("prepaymentId", prepayment.id);
                            }}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  {prepayment.customerPrepaymentNo}
                                  {selectedPrepayment?.id === prepayment.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {format(
                                    new Date(prepayment.paymentDate),
                                    "PPP"
                                  )}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  ${prepayment.remainingBalance}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Available
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No prepayments available
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {selectedPrepayment && (
                    <FormField
                      control={form.control}
                      name="prepaymentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Prepayment Amount
                          </FormLabel>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            className="text-right h-9 text-sm"
                            placeholder="Enter amount"
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value > selectedPrepayment.remainingBalance) {
                                toast({
                                  variant: "destructive",
                                  title: "Invalid Amount",
                                  description: `Amount cannot exceed available balance of $${selectedPrepayment.remainingBalance}`,
                                });
                                return;
                              }
                              field.onChange(value);
                            }}
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="referenceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Id</FormLabel>
                        <Input
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          defaultValue={referenceId}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Amount</FormLabel>
                        <Input
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
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <Input value={`$${totalamount}`} disabled />
                  </FormItem>
                  <FormItem>
                    <FormLabel>Remaining Balance</FormLabel>
                    <Input value={`$${remainingBalance.toFixed(2)}`} disabled />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment date</FormLabel>
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="border-purple-500 focus-visible:ring-transparent w-full">
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a Date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                          <FormControl>
                            <SelectTrigger className="border-purple-500 focus-visible:ring-transparent">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
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
                            const selectedAccount = accounts?.data?.find(
                              (account: any) => account.id.toString() === value
                            );
                            if (selectedAccount) {
                              field.onChange(selectedAccount.id);
                            }
                          }}
                          defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="border-purple-500 focus-visible:ring-transparent p-2">
                              <SelectValue placeholder="Select income account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountsLoading ? (
                              <div className="p-2 flex justify-center items-center">
                                <Loader className="w-5 h-5 mr-2 animate-spin" />
                              </div>
                            ) : (
                              accounts?.data?.map((account: any) => (
                                <SelectItem
                                  key={account.id}
                                  value={account.id.toString()}>
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
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Are you sure you want to process this payment?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSubmit}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-950 shadow-lg border-0">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-base font-medium">
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Please review the payment details
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Payment Summary Card */}
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Total Payment</span>
                <span className="text-base font-medium text-primary">
                  {" "}
                  $
                  {(
                    parseFloat(amount.toString()) +
                    (form.watch("prepaymentAmount") || 0)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                {remainingBalance.equals(0) ? (
                  <span className="text-green-500">✓ Full payment</span>
                ) : remainingBalance.greaterThan(0) ? (
                  <span>
                    Partial payment (${remainingBalance.toFixed(2)} remaining)
                  </span>
                ) : null}
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-muted">
                <span className="text-xs text-muted-foreground">
                  Invoice Reference
                </span>
                <span className="text-xs">{confirmData?.referenceId}</span>
              </div>

              {confirmData?.prepayment && (
                <div className="flex justify-between items-center py-1 border-b border-muted">
                  <span className="text-xs text-muted-foreground">
                    Prepayment
                  </span>
                  <span className="text-xs">
                    ${confirmData.prepayment.prepaymentAmount}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-muted">
                <span className="text-xs text-muted-foreground">
                  Cash Amount
                </span>
                <span className="text-xs">${amount}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-muted">
                <span className="text-xs text-muted-foreground">
                  Payment Date
                </span>
                <span className="text-xs">
                  {confirmData?.paymentDate &&
                    format(confirmData.paymentDate, "MMM d, yyyy")}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-muted">
                <span className="text-xs text-muted-foreground">
                  Payment Method
                </span>
                <span className="text-xs">{confirmData?.paymentMethod}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 h-9 text-sm">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSubmit}
              className="flex-1 h-9 text-sm  ">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default PaymentsDialog;