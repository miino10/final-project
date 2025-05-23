"use client";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, Check, MoreHorizontal, PencilLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuth } from "@clerk/nextjs";
import { useAccountsStatusChange } from "@/hooks/useAccounts";
import { useCustomersDelete } from "@/hooks/useCustomers";
import { useProductStatusChange } from "@/hooks/useProducts";
import { PaymentData, useInvoicePayment } from "@/hooks/useInvoice";
import {
  useReceiptDelete,
  useReceiptStatusChange,
  useReceiptVoid,
} from "@/hooks/useReceipt";
import { useVendorDelete, useVendorStatusChange } from "@/hooks/useVendors";
import { useInvoiceVoid } from "@/hooks/useInvoiceVoid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AccountCreationDialog } from "../dialogs/AccountCreationDialog";
import PaymentsDialog from "../dialogs/PaymentDialog";
//expense actions



export const InvoiceActions = ({ row }: { row: any }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const router = useRouter();
  const { orgId } = useAuth();
  const invoiceVoid = useInvoiceVoid();
  const invoicePayment = useInvoicePayment();

  const handleVoidInvoice = useCallback(
    async (invoiceId: number) => {
      if (row.status === "paid" || row.status === "partial") {
        toast({
          variant: "destructive",
          title: "Cannot void invoice",
          description: "Paid or partially paid invoices cannot be voided",
        });
        return;
      }

      invoiceVoid.mutate(invoiceId);
    },
    [row.status, invoiceVoid]
  );

  const handlePayment = useCallback(
    (data: PaymentData) => {
      invoicePayment.mutate(data);
    },
    [invoicePayment]
  );

  const handleReceivePaymentClick = useCallback((e: Event) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setPaymentDialogOpen(true);
  }, []);

  const handleViewDetailsClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      setIsDropdownOpen(false);
      router.push(
        `/dashboard/organisations/${orgId}/invoices/${row.invoiceId}`
      );
    },
    [orgId, row.invoiceId, router]
  );

  const handleVoidInvoiceClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      setIsDropdownOpen(false);
      handleVoidInvoice(row.invoiceId);
    },
    [handleVoidInvoice, row.invoiceId]
  );

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {row.status !== "paid" && row.status !== "voided" && (
            <DropdownMenuItem onSelect={handleReceivePaymentClick}>
              Receive Payment
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={handleViewDetailsClick}>
            View Details
          </DropdownMenuItem>
          {row.status !== "paid" &&
            row.status !== "partial" &&
            row.status !== "voided" && (
              <DropdownMenuItem
                onSelect={handleVoidInvoiceClick}
                className="text-red-600">
                <Ban className="mr-2 h-4 w-4" />
                Void Invoice
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
        }}>
        <PaymentsDialog
          referenceId={row.invoiceNumber}
          customerId={row.customer.id}
          totalamount={row.total}
          invoiceId={row.invoiceId}
          dueDate={row.dueDate}
          dueBalance={row.dueBalance}
          onSubmit={(data) => {
            handlePayment(data);
            setPaymentDialogOpen(false);
          }}
          onOpenChange={setPaymentDialogOpen}
          open={paymentDialogOpen}
        />
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="lg:max-w-screen-lg overflow-y-scroll no-scrollbar max-h-screen">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            {/* Vendor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vendor Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Name</p>
                  <p>{row.vendors?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p>{row.vendors?.email}</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p>{row.vendors?.phone}</p>
                </div>
                <div>
                  <p className="font-medium">Country</p>
                  <p>{row.vendors?.country}</p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">PO Number</p>
                  <p>{row.PurchaseOrderNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p>{row.status}</p>
                </div>
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p>
                    {row.totalAmount} {row.currency}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Order Date</p>
                  <p>{row.orderDate}</p>
                </div>
                <div>
                  <p className="font-medium">Expected Delivery</p>
                  <p>{row.expectedDeliveryDate}</p>
                </div>
                <div>
                  <p className="font-medium">Shipping Address</p>
                  <p>{row.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Unit Price</th>
                      <th className="px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.purchaseItems?.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">
                          {item.product?.productName}
                        </td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{item.unitPrice}</td>
                        <td className="px-4 py-2">
                          {item.quantity * item.unitPrice}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};





export const ReceiptActions = ({ row }: { row: any }) => {
  const router = useRouter();
  const { orgId } = useAuth();

  const deleteReceipt = useReceiptDelete();
  const receiptVoid = useReceiptVoid();

  // const handleDelete = async (receiptId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   (await deleteReceipt).mutate({ receiptId: receiptId });
  // };

  const handleReview = async (receiptId: string, e: React.MouseEvent) => {
    // (await deleteReceipt).mutate({ receiptId: receiptId });
    router.push(`/dashboard/organisations/${orgId}/receipts/${receiptId}`);
  };

  const receiptStatusChange = useReceiptStatusChange();
  // const handleStatusChange = async (newStatus: boolean) => {
  //   receiptStatusChange.mutate({ id: row.receiptId, isActive: newStatus });
  // };

  const handleVoidReceipt = async (id: number) => {
    if (row.status === "voided") {
      toast({
        variant: "destructive",
        title: "Cannot void Receipt",
        description: "Paid or partially paid receipts cannot be voided",
      });
      return;
    }

    receiptVoid.mutate(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={(e) => handleReview(row?.receiptId ?? "", e)}>
          Review
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          onClick={(e) => handleDelete(row?.receiptId ?? "", e)}>
          Delete
        </DropdownMenuItem> */}
        {/* {row.isActive && (
          <DropdownMenuItem
            disabled={receiptStatusChange.isPending}
            onClick={() => handleStatusChange(false)}
            className="text-red-600">
            <X className="mr-2 h-4 w-4" />
            Void Receipt
          </DropdownMenuItem>
        )} */}
        {row.status !== "voided" && (
          <DropdownMenuItem
            onClick={() => handleVoidReceipt(row.receiptId)}
            className="text-red-600">
            <Ban className="mr-2 h-4 w-4" />
            Void Receipt
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};



export const VendorcreditActions = ({ row }: { row: any }) => {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleViewDetailsClick = useCallback((e: Event) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleRefundClick = useCallback((e: Event) => {
    e.preventDefault();
    setIsDropdownOpen(false);

  }, []);
  const handleApplyCredit = useCallback((e: Event) => {
    e.preventDefault();
    setIsDropdownOpen(false);

  }, []);

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleViewDetailsClick}>
            View Details
          </DropdownMenuItem>
          {row.remainingBalance > 0 && (
            <>
              <DropdownMenuItem onSelect={handleApplyCredit}>
                Apply Credit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleRefundClick}>
                Refund
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

     
    
    </>
  );
};

export const AccountActions = ({ row }: { row: any }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const accountsStatusChange = useAccountsStatusChange();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const isSystemAccount =
    row.accountConfigurations && row.accountConfigurations.length > 0;

  const handleStatusChange = useCallback(
    async (newStatus: boolean) => {
      if (isSystemAccount) {
        toast({
          variant: "destructive",
          title: "Cannot modify system account",
          description: "System accounts cannot be activated or deactivated",
        });
        return;
      }
      accountsStatusChange.mutate({ id: row.id, isActive: newStatus });
    },
    [accountsStatusChange, isSystemAccount, row.id]
  );

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(`/api/accounts/${id}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {!isSystemAccount && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setIsEditDialogOpen(true);
                  setIsDropdownOpen(false);
                }}>
                <PencilLine className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {row.isActive ? (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(false)}
                  className="text-red-600">
                  <X className="mr-2 h-4 w-4" />
                  Deactivate Account
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(true)}
                  className="text-green-600">
                  <Check className="mr-2 h-4 w-4" />
                  Activate Account
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => {
                  setIsDeleteDialogOpen(true), setIsDropdownOpen(false);
                }}
                className="text-red-600">
                <Ban className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountCreationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        account={row}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this account?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. The account will be permanently
              deleted.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(row.id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const CustomerActions = ({ row }: { row: any }) => {
  const router = useRouter();
  const { orgId } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const customerDelete = useCustomersDelete();

  const handleDelete = useCallback(
    async (id: number) => {
      customerDelete.mutate(id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    },
    [customerDelete]
  );
  const handleViewDetailsClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      setIsDropdownOpen(false);
      router.push(`/dashboard/organisations/${orgId}/customers/${row.id}`);
    },
    [orgId, row.id, router]
  );

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={handleViewDetailsClick}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600">
            <Ban className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this customer?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. The customer will be permanently
              deleted.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(row.id)}
              disabled={customerDelete.isLoading}>
              {customerDelete.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const ProductActions = ({ row }: { row: any }) => {
  const productStatusChange = useProductStatusChange();
  const handleStatusChange = async (newStatus: boolean) => {
    productStatusChange.mutate({ id: row.productId, isActive: newStatus });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {row.isActive ? (
          <DropdownMenuItem
            disabled={productStatusChange.isLoading}
            onClick={() => handleStatusChange(false)}
            className="text-red-600">
            <X className="mr-2 h-4 w-4" />
            Inactivate Customer
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={productStatusChange.isLoading}
            onClick={() => handleStatusChange(true)}
            className="text-green-600">
            <Check className="mr-2 h-4 w-4" />
            Activate Customer
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ManualJournalActions = ({ row }: { row: any }) => {
  const router = useRouter();
  const { orgId } = useAuth();

  // const deleteReceipt = useReceiptDelete();

  // const handleDelete = async (receiptId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   (await deleteReceipt).mutate({ receiptId: receiptId });
  // };

  const handleReview = async (manualJournalId: string, e: React.MouseEvent) => {
    // (await deleteReceipt).mutate({ receiptId: receiptId });
    router.push(
      `/dashboard/organisation/${orgId}/manual-journal/${manualJournalId}`
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={(e) => handleReview(row?.id ?? "", e)}>
          Review
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          onClick={(e) => handleDelete(row?.receiptId ?? "", e)}>
          Delete
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const VendorsActions = ({ row }: { row: any }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const vendorStatusChange = useVendorStatusChange();
  const vendorDelete = useVendorDelete();
  const router = useRouter();
  const { orgId } = useAuth();

  const handleStatusChange = async (newStatus: boolean) => {
    vendorStatusChange.mutate(
      { id: row.id, isActive: newStatus },
      {
        onSettled: () => {
          // Handle any cleanup if needed
        },
      }
    );
  };

  const handleVendorDelete = useCallback(
    async (id: number) => {
      vendorDelete.mutate(id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    },
    [vendorDelete]
  );

  const handleViewDetailsClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      setIsDropdownOpen(false);
      router.push(`/dashboard/organisations/${orgId}/vendors/${row.id}`);
    },
    [orgId, row.id, router]
  );

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleViewDetailsClick}>
            View Details
          </DropdownMenuItem>
          {row.isActive ? (
            <DropdownMenuItem
              disabled={vendorStatusChange.isLoading}
              onClick={() => handleStatusChange(false)}
              className="text-red-600">
              <X className="mr-2 h-4 w-4" />
              Inactivate Vendor
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={vendorStatusChange.isLoading}
              onClick={() => handleStatusChange(true)}
              className="text-green-600">
              <Check className="mr-2 h-4 w-4" />
              Activate Vendor
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setIsDeleteDialogOpen(true);
              setIsDropdownOpen(false);
            }}
            className="text-red-600">
            <Ban className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this vendor?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone. The vendor will be permanently
              deleted.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleVendorDelete(row.id)}
              disabled={vendorDelete.isLoading}>
              {vendorDelete.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

