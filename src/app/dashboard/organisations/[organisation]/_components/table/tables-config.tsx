import {
   
    Customer,
    CustomerPrepaymentTable,
    Product,
    TinvoiceSchemaTables,
    TreceiptSchemaTables,
    Vendor,
  } from "@/lib/types";
  import { selectColumn } from "./selectColumn";
  import { ColumnDef } from "@tanstack/react-table";
  import {
    AccountActions,
   
    CustomerActions,
    
    InvoiceActions,
    ManualJournalActions,
    
    ProductActions,
    ReceiptActions,
    VendorsActions,
  } from "./actions-table";
import { Accounts } from "../../chart-of-accounts/page";
  
  export interface TableConfig<T> {
    columns: ColumnDef<T>[];
    defaultSorting: { id: string; desc: boolean }[];
    filterableColumns: (keyof T)[];
    searchableColumns: (keyof T)[];
  }
  
  export const productTableConfig: TableConfig<Product> = {
    columns: [
      selectColumn as ColumnDef<Product>,
      { accessorKey: "productNumber", header: "Product No" },
      { accessorKey: "productName", header: "Product Name" },
      { accessorKey: "unitOfMeasure", header: "U/M" },
      { accessorKey: "sellingPrice", header: "Selling Price" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "productType", header: "Type" },
      { accessorKey: "isActive", header: "Active" },
  
      {
        id: "actions",
  
        cell: ({ row }) => <ProductActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "productNumber", desc: false }],
    filterableColumns: ["status"],
    searchableColumns: ["productName", "status"],
  };
  
  export const vendorTableConfig: TableConfig<Vendor> = {
    columns: [
      selectColumn as ColumnDef<Vendor>, // Add the checkbox column as the first column
      { accessorKey: "vendorNo", header: "Vendor No", enableSorting: true },
      { accessorKey: "name", header: "Name", enableSorting: true },
      { accessorKey: "email", header: "Email", enableSorting: true },
      { accessorKey: "country", header: "Country" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "isActive", header: "Active" },
      {
        id: "actions",
  
        cell: ({ row }) => <VendorsActions row={row.original} />,
      },
    ],
  
    defaultSorting: [{ id: "name", desc: false }],
    filterableColumns: ["country"],
    searchableColumns: ["name", "country"],
  };
  
  
  
  
  export const invoiceTableConfig: TableConfig<TinvoiceSchemaTables> = {
    columns: [
      selectColumn as ColumnDef<TinvoiceSchemaTables>,
  
      { accessorKey: "invoiceNumber", header: "Invoice No" },
      // { accessorKey: "invoiceId", header: "Invoice Id" },
      { accessorKey: "invoiceDate", header: "Invoice Date" },
      { accessorKey: "dueDate", header: "Due Date", enableSorting: true },
  
      {
        accessorKey: "customer.name",
        header: "Customer Name",
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
      },
  
      { accessorKey: "total", header: "Total" },
      { accessorKey: "dueBalance", header: "Due Balance" },
      { accessorKey: "isActive", header: "Active" },
  
      {
        id: "actions",
  
        cell: ({ row }) => <InvoiceActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "invoiceNumber", desc: false }],
    filterableColumns: ["invoiceNumber"],
    searchableColumns: ["invoiceNumber", "invoiceNumber"],
  };
  
  
  
  export const receiptTableConfig: TableConfig<TreceiptSchemaTables> = {
    columns: [
      selectColumn as ColumnDef<TreceiptSchemaTables>,
  
      { accessorKey: "receiptNumber", header: "Receipt No" },
      // { accessorKey: "receiptId", header: "Receipt Id" },
      { accessorKey: "receiptDate", header: "Receipt Date" },
  
      {
        accessorKey: "customer.name",
        header: "Customer Name",
        enableSorting: true,
      },
      { accessorKey: "total", header: "Total" },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
      },
      { accessorKey: "isActive", header: "Active" },
  
      {
        id: "actions",
  
        cell: ({ row }) => <ReceiptActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "receiptNumber", desc: false }],
    filterableColumns: ["receiptNumber"],
    searchableColumns: ["receiptNumber"],
  };
  
  export const customerTableConfig: TableConfig<Customer> = {
    columns: [
      selectColumn as ColumnDef<Customer>,
      { accessorKey: "customerNo", header: "Customer No" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "isActive", header: "Active" },
      {
        id: "actions",
  
        cell: ({ row }) => <CustomerActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "name", desc: false }],
    filterableColumns: ["name"],
    searchableColumns: ["name", "email", "phone"],
  };
  
  export const accountsTableConfig: TableConfig<Accounts> = {
    columns: [
      selectColumn as ColumnDef<Accounts>,
      { accessorKey: "code", header: "Account code" },
      { accessorKey: "name", header: "Name" },
      {
        id: "accountCategory",
        header: "Account Category",
        cell: ({ row }) => {
          const accountCategories = row.original.accountCategories;
  
          return accountCategories && accountCategories.length > 0
            ? accountCategories[0].name
            : "N/A";
        },
      },
  
      {
        id: "accountType",
        header: "Account type",
        cell: ({ row }) => {
          const accountCategories = row.original.accountCategories;
          return accountCategories && accountCategories.length > 0
            ? accountCategories[0].type
            : "N/A";
        },
      },
      { accessorKey: "isActive", header: "Active" },
  
      {
        id: "actions",
        cell: ({ row }) => <AccountActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "name", desc: false }],
    filterableColumns: ["name"],
    searchableColumns: ["name"],
  };
  
  type manualJournal = {
    id: number;
    date: string;
    createdBy: string;
    total: string;
    description: string;
  };
  
  export const manualJournalTableConfig: TableConfig<manualJournal> = {
    columns: [
      selectColumn as ColumnDef<manualJournal>,
      { accessorKey: "date", header: "Date" },
      { accessorKey: "id", header: "Journal No" },
      {
        accessorKey: "total",
        header: "Total",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "createdBy",
        header: "Created by",
      },
  
      {
        id: "actions",
  
        cell: ({ row }) => <ManualJournalActions row={row.original} />,
      },
    ],
    defaultSorting: [{ id: "id", desc: false }],
    filterableColumns: ["id"],
    searchableColumns: ["id", "createdBy"],
  };


  export const customerPrepaymentsTableConfig: TableConfig<CustomerPrepaymentTable> =
  {
    columns: [
      selectColumn as ColumnDef<CustomerPrepaymentTable>,
      { accessorKey: "customerPrepaymentNo", header: "Prepayment No" },
      {
        accessorKey: "customer.name",
        header: "Customer Name",
        enableSorting: true,
      },
      { accessorKey: "paymentDate", header: "Payment Date" },
      { accessorKey: "paymentMethod", header: "Payment Method" },
      { accessorKey: "paymentAccount.name", header: "Payment Account" },
      { accessorKey: "amount", header: "Amount" },
      { accessorKey: "remainingBalance", header: "Remaining Balance" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "memo", header: "Memo" },
    ],
    defaultSorting: [{ id: "customerPrepaymentNo", desc: false }],
    filterableColumns: ["status", "paymentMethod"],
    searchableColumns: ["customerPrepaymentNo", "status"],
  };