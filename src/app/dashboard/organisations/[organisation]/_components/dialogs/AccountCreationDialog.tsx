import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useAccountCategory from "@/hooks/useAccountCategory";
import { useAccountCreation, useAccountUpdate } from "@/hooks/useAccounts";

import { accountsformSchema } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface AccountCreationDialogProps {
  mode?: "create" | "edit";
  account?: {
    id: number;
    name: string;
    accountCategory: string;
    categoryId: number;
  };
  editData?: {
    id: number;
    name: string;
    accountCategory: string;
    categoryId: number;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccountCreationDialog({
  mode = "create",
  account,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AccountCreationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const onOpenChangeHandler = isControlled
    ? controlledOnOpenChange
    : setInternalOpen;

  const form = useForm<z.infer<typeof accountsformSchema>>({
    resolver: zodResolver(accountsformSchema),
    defaultValues: {
      name: "",
      accountCategory: "",
      categoryId: 0,
    },
  });

  const { data: accountCategories } = useAccountCategory();
  const { mutate: createAccount, isLoading: isCreating } = useAccountCreation();
  const { mutate: updateAccount, isLoading: isUpdating } = useAccountUpdate();

  useEffect(() => {
    if (mode === "edit" && account) {
      form.reset({
        name: account.name,
        accountCategory: account.accountCategory,
        categoryId: account.categoryId,
      });
    }
  }, [account, form, mode]);

  function onSubmit(values: z.infer<typeof accountsformSchema>) {
    setIsSubmitting(true);
    if (mode === "edit" && account) {
      updateAccount(
        { ...values, id: account.id },
        {
          onSuccess: () => {
            onOpenChangeHandler?.(false);
            form.reset();
            setIsSubmitting(false);
            toast({
              variant: "success",
              title: "Success",
              description: "Account updated successfully",
            });
          },
          onError: () => {
            setIsSubmitting(false);
          }
        }
      );
    } else {
      createAccount(values, {
        onSuccess: () => {
          onOpenChangeHandler?.(false);
          form.reset();
          setIsSubmitting(false);
          toast({
            variant: "success",
            title: "Success",
            description: "Account created successfully",
          });
        },
        onError: () => {
          setIsSubmitting(false);
        }
      });
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpen) => {
        onOpenChangeHandler?.(newOpen);
      }}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              onOpenChangeHandler?.(true);
            }}
            variant="default">
            New Account
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        style={{
          width: "fit-content",
          maxWidth: "none",
        }}
        className="w-full  my-10 h-fit rounded-lg  p-10 ">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Account" : "Create New Account"}
          </DialogTitle>
          <DialogDescription>
            Add a new account to your chart of accounts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const selectedCategory = accountCategories.find(
                        (category: any) => category.name === value
                      );
                      if (selectedCategory) {
                        form.setValue("categoryId", selectedCategory.id);
                      }
                    }}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    {accountCategories && (
                      <SelectContent>
                        {accountCategories.map((category: any) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                mode === "edit" ? "Update" : "Create"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
