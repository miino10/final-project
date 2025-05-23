"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  UserCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
} from "lucide-react";
import BreadcrumbComponent from "../../_components/Breadcrumb";

interface Vendor {
  id: number;
  vendorNo?: string;
  isActive?: boolean;
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
}

interface PurchaseItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: number;
  PurchaseOrderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  purchaseItems: PurchaseItem[];
}

interface Bill {
  id: number;
  billId: string;
  unBilledReceiptItem?: {
    unBilledNumber: string;
  };
  purchaseOrder?: {
    PurchaseOrderNumber: string;
  };

  billDate: string;
  dueDate: string;
  total: number;
  dueBalance: number;
  status: string;
}

interface Prepayment {
  id: number;
  paymentDate: string;
  amount: number;
  vendorPrepaymentNo: string;
  remainingBalance: number;
  paymentMethod: string;
  status: string;
}

interface ReportData {
  vendor: Vendor;
  bills: Bill[];
  prepayments: Prepayment[];
  purchaseOrders: PurchaseOrder[];
  vendorBalance: number;
}

export default function VendorStatementPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/reports/vendor-statement/${vendorId}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch report data: ${response.statusText}`
          );
        }
        const data: ReportData = await response.json();
        setReportData(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className=" flex justify-center items-center h-screen">
        <Loader className="w-6 h-6 mr-2 animate-spin " />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!reportData) {
    return <div className="p-4">No data found for this vendor.</div>;
  }

  const {
    vendor,
    bills = [],
    prepayments = [],
    purchaseOrders = [],
    vendorBalance = 0,
  } = reportData || {};

  if (!vendor) {
    return <div className="p-4">No vendor data found.</div>;
  }

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Vendors",
      path: `/dashboard/organisation/${params.organisations}/vendors`,
    },
    {
      label: `${vendor.name}`,
      path: `/dashboard/organisation/${params.organisations}/vendors`,
    },
  ];

  console.log("vendor", vendor);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Breadcrumbs */}
        <BreadcrumbComponent breadcrumbs={breadcrumbs} />

        {/* Vendor Details & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Vendor Balance Summary Card */}
          <Card className="md:col-span-1 lg:col-span-1 shadow-lg border-0 bg-gradient-to-tr from-green-400/90 to-green-200/80 dark:from-green-700/90 dark:to-green-400/30 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="border-b border-green-200/40 pb-4 sm:pb-6 flex flex-row items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-800/30 rounded-lg">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 dark:text-green-200" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">
                Vendor Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 flex flex-col items-start gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-green-800 dark:text-green-100">
                {formatCurrency(vendorBalance)}
              </span>
              <span className="text-sm sm:text-base text-green-700/80 dark:text-green-200/80">
                Current Balance
              </span>
            </CardContent>
          </Card>
          {/* Vendor Details Card */}
          <Card className="md:col-span-1 lg:col-span-2 shadow-md border-0 bg-white dark:bg-gray-950 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-muted/20 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                  <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Vendor Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6">
              {vendor.vendorNo && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Vendor No
                  </span>
                  <span className="font-medium text-base">
                    {vendor.vendorNo}
                  </span>
                </div>
              )}
              {typeof vendor.isActive === "boolean" && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      vendor.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                    {vendor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
              {vendor.email && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg flex-wrap">
                  <span className="text-base text-muted-foreground">Email</span>
                  <span className="font-medium text-base truncate max-w-[200px] sm:max-w-[300px] break-all">
                    {vendor.email}
                  </span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">Phone</span>
                  <span className="font-medium text-base">{vendor.phone}</span>
                </div>
              )}
              {vendor.country && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Country
                  </span>
                  <span className="font-medium text-base">
                    {vendor.country}
                  </span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Address
                  </span>
                  <span className="font-medium text-base text-right">
                    {vendor.address}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="rounded-xl bg-white dark:bg-gray-950 shadow-md border border-muted/20 overflow-hidden">
          <Tabs defaultValue="bills" className="w-full ">
            <TabsList className="flex flex-col md:flex-row w-full border-b border-muted/20 bg-muted/5 p-1 gap-2 overflow-x-auto flex-nowrap h-full">
              {/* <div className="bg-yellow-200 flex flex-col h-full"> */}
              <TabsTrigger
                value="bills"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Bills ({bills.length})
              </TabsTrigger>
              <TabsTrigger
                value="prepayments"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Prepayments ({prepayments.length})
              </TabsTrigger>
              <TabsTrigger
                value="purchaseOrders"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Purchase Orders ({purchaseOrders.length})
              </TabsTrigger>
              {/* </div> */}
            </TabsList>
            <TabsContent value="bills">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Bills</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Bill #</TableHead>
                        <TableHead>Linked To</TableHead>
                        <TableHead>Bill Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                          Due Balance
                        </TableHead>
                        {/* <TableHead className="text-right">Paid</TableHead> */}
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.length > 0 ? (
                        bills.map((bill, idx) => {
                          let statusIcon =
                            bill.status === "Paid" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle className="w-4 h-4" />{" "}
                                {bill.status}
                              </span>
                            ) : bill.status === "PARTIALLY" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                <Clock className="w-4 h-4" />
                                {bill.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                <XCircle className="w-4 h-4" /> {bill.status}
                              </span>
                            );
                          return (
                            <TableRow
                              key={bill.id}
                              className={
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                  : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                              }>
                              <TableCell className="font-medium text-base">
                                {bill.billId}
                              </TableCell>
                              <TableCell>
                                {bill.purchaseOrder?.PurchaseOrderNumber ||
                                  bill.unBilledReceiptItem?.unBilledNumber ||
                                  "N/A"}
                              </TableCell>
                              <TableCell>{bill.billDate}</TableCell>
                              <TableCell>{bill.dueDate}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(bill.total)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(bill.dueBalance)}
                              </TableCell>
                              {/* <TableCell className="text-right font-semibold">
                                {formatCurrency(paidAmount)}
                              </TableCell> */}
                              <TableCell>{statusIcon}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            No bills found for this vendor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="prepayments">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Prepayments
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Remaining Balance</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prepayments.length > 0 ? (
                        prepayments.map((prepay, idx) => (
                          <TableRow
                            key={prepay.id}
                            className={
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                            }>
                            <TableCell>{prepay.paymentDate}</TableCell>
                            <TableCell>{prepay.vendorPrepaymentNo}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(prepay.amount)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(prepay.remainingBalance)}
                            </TableCell>
                            <TableCell>{prepay.paymentMethod}</TableCell>
                            <TableCell>{prepay.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No prepayments found for this vendor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="purchaseOrders">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    Purchase Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>PO #</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead className="text-center ">
                          Total Amount
                        </TableHead>
                        <TableHead className="text-center ">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrders.length > 0 ? (
                        purchaseOrders.map((po, idx) => {
                          let statusIcon =
                            po.status === "FULLY RECEIVED" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle className="w-4 h-4" /> Fully
                                Received
                              </span>
                            ) : po.status === "PARTIALLY RECEIVED" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                <Clock className="w-4 h-4" /> Partially Received
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                <XCircle className="w-4 h-4" /> {po.status}
                              </span>
                            );
                          return (
                            <TableRow
                              key={po.id}
                              className={
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                  : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                              }>
                              <TableCell className="font-medium text-base">
                                {po.PurchaseOrderNumber}
                              </TableCell>
                              <TableCell>{po.orderDate}</TableCell>
                              <TableCell className="text-center ">
                                {formatCurrency(po.totalAmount)}
                              </TableCell>
                              <TableCell className="text-center ">
                                {statusIcon}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            No purchase orders found for this vendor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
