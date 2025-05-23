"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccounts } from "@/hooks/useAccounts";

const AccountSchema = z
  .object({
    description: z
      .string()
      .min(2, {
        message: "customer name must be at least 2 characters.",
      })
      .nullable(),
    date: z.coerce.date(),
    LineJournal: z.array(
      z
        .object({
          id: z.number(),
          account_name: z
            .string()
            .min(3, { message: "product name is required" }),
          type: z.enum(["DEBIT", "CREDIT"]),
          amount: z.coerce.number().positive({
            message: "product price must be at least greater than 0",
          }),
          accountCode: z.string().min(1, {
            message: "Product price must be greater than 0.",
          }),
        })
        .required()
    ),
  })
  .refine(
    (data) => {
      const totalDebit = data.LineJournal.reduce(
        (sum, item) => (item.type === "DEBIT" ? sum + item.amount : sum),
        0
      );
      const totalCredit = data.LineJournal.reduce(
        (sum, item) => (item.type === "CREDIT" ? sum + item.amount : sum),
        0
      );
      console.log("Total Debit:", totalDebit);
      console.log("Total Credit:", totalCredit);
      return totalDebit === totalCredit;
    },
    {
      message: "Please ensure that the Debits and Credits are equal",
      path: ["LineJournal"],
    }
  );

export type FormData = z.infer<typeof AccountSchema>;

export interface Accounts {
  id: number;
  name: string;
  accountCode: string;
}

function JournalEntryDialog() {
  const [selectedAccount, setSelectedAccount] = useState<Accounts | null>(null);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const form = useForm<z.infer<typeof AccountSchema>>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      description: "",
      LineJournal: [
        { id: 0, account_name: "", amount: 0, type: "CREDIT", accountCode: "" },
        { id: 0, account_name: "", amount: 0, type: "DEBIT", accountCode: "" },
      ],
    },
  });

  const { mutate: addJournal, isLoading: isCreating } = useMutation({
    mutationFn: (journal: z.infer<typeof AccountSchema>) =>
      axios
        .post<FormData>("/api/manual-journals", journal, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => res.data),
    onSuccess: (SavedData, Newdata) => {
      form.reset();
      toast({
        variant: "success",
        title: "Well done, you created journal successfully ",
      });
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["manual-journals"],
      });
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

  const { fields, append, remove } = useFieldArray({
    name: "LineJournal",
    control: form.control,
  });

  // const {
  //   data: accounts,
  //   error,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ["accounts"],
  //   queryFn: async () => {
  //     return await axios.get("/api/accounts", {}).then((res) => res.data);
  //   },
  // });
  // queryClient.invalidateQueries({
  //   queryKey: ["accounts"],
  // });

  const { data: accounts } = useAccounts();

  // if (error) {
  //   console.log(error.message);
  // }

  if (!accounts) {
    console.log("no accounts");
  }

  // const totalDebit = form
  //   .watch("LineJournal")
  //   .reduce(
  //     (sum, item) =>
  //       item.type === "DEBIT" ? sum + (Number(item.amount) || 0) : sum,
  //     0
  //   );
  // const totalCredit = form
  //   .watch("LineJournal")
  //   .reduce(
  //     (sum, item) =>
  //       item.type === "CREDIT" ? sum + (Number(item.amount) || 0) : sum,
  //     0
  //   );

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
          New Journal
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-screen-sm xl:max-w-screen-md overflow-y-scroll no-scrollbar max-h-screen md:max-h-[90vh]">
        <DialogHeader className="flex justify-center  p-2 items-center">
          <DialogTitle>Create New Journal Entry</DialogTitle>
        </DialogHeader>
        <div className="w-full flex justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((newJournal) => {
                console.log("new journal is ", newJournal);
                addJournal(newJournal);
              })}
              className="space-y-8 my-5 w-fit p-4  rounded-md ">
              <div className="flex flex-col md:flex-row  md:justify-center gap-5 md:p-4 ">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: any) => (
                    <FormItem className="flex flex-col  ">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          id="customer_name"
                          className="border-purple-500 focus:border-red-700 focus-visible:ring-transparent w-[60vw] md:w-[15rem]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }: any) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover modal>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="border-purple-500 focus-visible:ring-transparent w-[60vw] md:w-[15rem]">
                              {field.value ? (
                                format(field.value, "PPP")
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
                            selected={field.value}
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
              </div>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  // className="lg:flex gap-4 justify-center md:items-end p-2"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2     gap-12 place-items-center items-center  ">
                  <FormField
                    control={form.control}
                    name={`LineJournal.${index}.account_name`}
                    render={({ field }: any) => (
                      <div className="grid row-span-2 lg:h-[4.5rem]">
                        <FormItem>
                          <FormLabel>Account name</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedAccount = accounts.data?.find(
                                (prod: any) => prod.name === value
                              );
                              setSelectedAccount(selectedAccount || null);
                              if (selectedAccount) {
                                form.setValue(
                                  `LineJournal.${index}.id`,
                                  selectedAccount.id
                                );
                                form.setValue(
                                  `LineJournal.${index}.accountCode`,
                                  selectedAccount.code
                                );
                              }
                            }}
                            defaultValue={field.value}>
                            <SelectTrigger className="border-purple-500 focus-visible:ring-transparent w-[60vw] md:w-[15rem]">
                              <SelectValue placeholder="Select account name" />
                            </SelectTrigger>
                            <SelectContent
                              
                              className="overflow-y-auto max-h-[14rem]">
                              <SelectGroup>
                                {accounts.data?.map((account: Accounts) => (
                                  <SelectItem
                                    key={account.id}
                                    value={account.name}>
                                    {account.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              {/* <div className="w-full flex justify-center items-center py-2">
                                <Link
                                  href={`/dashboard/organisation/${params.organisations}/products/new`}>
                                  <Button
                                    className="border-purple-500 border-[1px] p-2 rounded-md"
                                    variant="outline">
                                    Add new product
                                  </Button>
                                </Link>
                              </div> */}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`LineJournal.${index}.accountCode`}
                    render={({ field }: any) => (
                      <div className="grid row-span-2 lg:h-[4.5rem]">
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input
                              className="border-purple-500 focus-visible:ring-transparent w-[60vw] md:w-[15rem]"
                              type="text"
                              id="code"
                              value={selectedAccount?.accountCode || ""}
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`LineJournal.${index}.amount`}
                    render={({ field }: any) => (
                      <div className="grid row-span-2 lg:h-[4.5rem]">
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              className="border-purple-500 focus-visible:ring-transparent w-[60vw] md:w-[15rem]"
                              id="amount"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`LineJournal.${index}.type`}
                    render={({ field }: any) => (
                      <div className="grid row-span-2 lg:h-[4.5rem]">
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              className="w-[60vw] border-purple-500 focus-visible:ring-transparent md:w-[15rem]"
                              id="type"
                              {...field}>
                              <SelectTrigger className="border-purple-500 focus-visible:ring-transparent w-[60vw] md:w-[15rem]">
                                <SelectValue placeholder="Select a Type" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[14rem]">
                                <SelectGroup>
                                  <SelectItem value={"DEBIT"}>DEBIT</SelectItem>
                                  <SelectItem value={"CREDIT"}>
                                    CREDIT
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      </div>
                    )}
                  />
                  <button
                    disabled={fields.length <= 2}
                    className="w-[95%] flex justify-center md:w-fit p-2 rounded-md"
                    onClick={() => remove(index)}>
                    <Trash />
                  </button>
                </div>
              ))}
              <div className="flex justify-center bg-yellow-300 items-center mt-4"></div>
              <div className="flex items-center justify-center ">
                {form.formState.errors.LineJournal?.root && (
                  <div className="bg-red-200 rounded-lg w-fit p-4  ">
                    <p className="text-black-500 text-sm mt-2">
                      {form.formState.errors.LineJournal.root.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <Button
                  className="border-purple-500 w-32"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      id: 0,
                      account_name: "",
                      amount: 0,
                      type: "CREDIT",
                      accountCode: "",
                    })
                  }>
                  Add Line
                </Button>
                {isCreating ? (
                  <Button
                    disabled={isCreating}
                    className="bg-gray-300 hover:bg-gray-300 w-32"
                    type="submit">
                    <Loader className="w-5 h-5 mr-2 animate-spin " />
                  </Button>
                ) : (
                  <Button className=" w-32" type="submit">
                    {" "}
                    submit
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default JournalEntryDialog;
