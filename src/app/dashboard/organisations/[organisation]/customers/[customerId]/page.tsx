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
  FileText,
  Receipt,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import BreadcrumbComponent from "../../_components/Breadcrumb";

// Define interfaces based on the API response structure
interface Customer {
  id: number;
  customerNo?: string;
  isActive?: boolean;
  name: string;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  address?: string | null;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  dueBalance: number;
  status: string;
  items: InvoiceItem[];
}

interface Receipt {
  id: number;
  receiptNumber: string;
  receiptDate: string;
  total: number;

  status: string;
}

interface Prepayment {
  id: number;
  customerPrepaymentNo: string;
  paymentDate: string;
  amount: number;
  remainingBalance: number;
  paymentMethod: string;
  status: string;
}

interface CreditMemo {
  id: number;
  creditMemoNumber: string;
  creditMemoDate: string;
  totalAmount: number;
  remainingBalance: number;
  status: string;
}

interface ReportData {
  customer: Customer;
  invoices: Invoice[];
  receipts: Receipt[];
  prepayments: Prepayment[];
  creditMemos: CreditMemo[];
  customerBalance: number;
}

export default function CustomerStatementPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/reports/customer-statement/${customerId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
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
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-6 h-6 mr-2 animate-spin" />
        <span>Loading customer data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!reportData) {
    return <div className="p-4">No data found for this customer.</div>;
  }

  const {
    customer,
    invoices = [],
    receipts = [],
    prepayments = [],
    creditMemos = [],
    customerBalance = 0,
  } = reportData || {};

  if (!customer) {
    return <div className="p-4">No customer data found.</div>;
  }

  const breadcrumbs = [
    { label: "Home", path: "/" },
    {
      label: "Dashboard",
      path: `/dashboard/organisation/${params.organisations}`,
    },
    {
      label: "Customers",
      path: `/dashboard/organisation/${params.organisations}/customers`,
    },
    {
      label: `${customer.name}`,
      path: `/dashboard/organisation/${params.organisations}/customers/${customerId}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Breadcrumbs */}
        <BreadcrumbComponent breadcrumbs={breadcrumbs} />

        {/* Customer Details & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Customer Balance Summary Card */}
          <Card className="md:col-span-1 lg:col-span-1 shadow-lg border-0 bg-gradient-to-tr from-blue-400/90 to-blue-200/80 dark:from-blue-700/90 dark:to-blue-400/30 overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="border-b border-blue-200/40 pb-4 sm:pb-6 flex flex-row items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700 dark:text-blue-200" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                Customer Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 flex flex-col items-start gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 dark:text-blue-100">
                {formatCurrency(customerBalance)}
              </span>
              <span className="text-sm sm:text-base text-blue-700/80 dark:text-blue-200/80">
                Current Balance Due
              </span>
            </CardContent>
          </Card>
          {/* Customer Details Card */}
          <Card className="md:col-span-1 lg:col-span-2 shadow-md border-0 bg-white dark:bg-gray-950 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="border-b border-muted/20 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                  <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Customer Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6">
              {customer.customerNo && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Customer No
                  </span>
                  <span className="font-medium text-base">
                    {customer.customerNo}
                  </span>
                </div>
              )}
              {typeof customer.isActive === "boolean" && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      customer.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg flex-wrap">
                  <span className="text-base text-muted-foreground">Email</span>
                  <span className="font-medium text-base truncate max-w-[200px] sm:max-w-[300px] break-all">
                    {customer.email}
                  </span>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">Phone</span>
                  <span className="font-medium text-base">
                    {customer.phone}
                  </span>
                </div>
              )}
              {customer.country && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Country
                  </span>
                  <span className="font-medium text-base">
                    {customer.country}
                  </span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center justify-between p-4 bg-muted/5 rounded-lg">
                  <span className="text-base text-muted-foreground">
                    Address
                  </span>
                  <span className="font-medium text-base text-right">
                    {customer.address}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="rounded-xl bg-white dark:bg-gray-950 shadow-md border border-muted/20 overflow-hidden">
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="flex flex-col md:flex-row w-full border-b border-muted/20 bg-muted/5 p-1 gap-2 overflow-x-auto flex-nowrap h-full">
              <TabsTrigger
                value="invoices"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Invoices ({invoices.length})
              </TabsTrigger>
              <TabsTrigger
                value="receipts"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Receipts ({receipts.length})
              </TabsTrigger>
              <TabsTrigger
                value="prepayments"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Prepayments ({prepayments.length})
              </TabsTrigger>
              <TabsTrigger
                value="creditMemos"
                className="flex-1 py-2 sm:py-2.5 text-sm sm:text-base whitespace-nowrap min-w-[120px]">
                Credit Memos ({creditMemos.length})
              </TabsTrigger>
            </TabsList>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                          Due Balance
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length > 0 ? (
                        invoices.map((invoice, idx) => {
                          let statusIcon;
                          switch (invoice.status?.toLowerCase()) {
                            case "paid":
                              statusIcon = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                                  <CheckCircle className="w-4 h-4" /> Paid
                                </span>
                              );
                              break;
                            case "partial":
                              statusIcon = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                  <Clock className="w-4 h-4" /> Partial
                                </span>
                              );
                              break;
                            case "pending":
                            case "open":
                            default:
                              statusIcon = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">
                                  <XCircle className="w-4 h-4" /> Open
                                </span>
                              );
                          }
                          return (
                            <TableRow
                              key={invoice.id}
                              className={
                                idx % 2 === 0
                                  ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                  : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                              }>
                              <TableCell className="font-medium text-base">
                                {invoice.invoiceNumber}
                              </TableCell>
                              <TableCell>{invoice.invoiceDate}</TableCell>
                              <TableCell>{invoice.dueDate}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(invoice.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(invoice.dueBalance)}
                              </TableCell>
                              <TableCell>{statusIcon}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No invoices found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receipts Tab */}
            <TabsContent value="receipts">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Receipt className="w-5 h-5" /> Receipts
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>

                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipts.length > 0 ? (
                        receipts.map((receipt, idx) => (
                          <TableRow
                            key={receipt.id}
                            className={
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                            }>
                            <TableCell className="font-medium text-base">
                              {receipt.receiptNumber}
                            </TableCell>
                            <TableCell>{receipt.receiptDate}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(receipt.total)}
                            </TableCell>

                            <TableCell>{receipt.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            No receipts found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prepayments Tab */}
            <TabsContent value="prepayments">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Prepayments
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Prepayment #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                          Remaining Balance
                        </TableHead>
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
                            <TableCell className="font-medium text-base">
                              {prepay.customerPrepaymentNo}
                            </TableCell>
                            <TableCell>{prepay.paymentDate}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(prepay.amount)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(prepay.remainingBalance)}
                            </TableCell>
                            <TableCell>{prepay.paymentMethod}</TableCell>
                            <TableCell>{prepay.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No prepayments found for this customer.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Credit Memos Tab */}
            <TabsContent value="creditMemos">
              <Card className="shadow-sm border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" /> Credit Memos
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <Table className="min-w-full divide-y divide-muted">
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead>Credit Memo #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">
                          Remaining Balance
                        </TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditMemos.length > 0 ? (
                        creditMemos.map((credit, idx) => (
                          <TableRow
                            key={credit.id}
                            className={
                              idx % 2 === 0
                                ? "bg-white dark:bg-gray-950 hover:bg-muted/60 transition"
                                : "bg-muted/40 dark:bg-gray-900 hover:bg-muted/70 transition"
                            }>
                            <TableCell className="font-medium text-base">
                              {credit.creditMemoNumber}
                            </TableCell>
                            <TableCell>{credit.creditMemoDate}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(credit.totalAmount)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(credit.remainingBalance)}
                            </TableCell>
                            <TableCell>{credit.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            No credit memos found for this customer.
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
