import { productTypeEnum } from "@/db/schema";
import Decimal from "decimal.js";
import { z } from "zod";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const logInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  confirm: z.string(),
});
export type TSignupSchema = z.infer<typeof SignupSchema>;

export type TLogInSchema = z.infer<typeof logInSchema>;

//customers

export const customerSchemaTables = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
});

export type CustomerTableTypes = z.infer<typeof customerSchemaTables>;

//invoices

export const invoiceItemSchema = z
  .object({
    product_name: z.string().min(1, "Product name is required"),
    product_price: z.coerce.number().min(0, "Price must be a positive number"),
    product_quantity: z.coerce
      .number()
      .int()
      .min(1, "Quantity must be at least 1"),
    productId: z.number().optional(),
    productType: z.enum(productTypeEnum.enumValues).optional(),
    inventoryId: z.number().optional(),
    batchId: z.number().optional(),
  })
  .refine(
    (data) => {
      if (data.productType === "inventoryPart" && !data.inventoryId) {
        return false;
      }
      return true;
    },
    {
      message: "Inventory Site is required for inventory parts",
      path: ["inventoryId"],
    }
  );

export const invoiceFormSchema = z
  .object({
    customerId: z.number({
      required_error: "Customer is required",
      invalid_type_error: "Please select a valid customer",
    }),
    invoiceDate: z.coerce.date({
      required_error: "Invoice date is required",
      invalid_type_error: "Invalid date format",
    }),
    dueDate: z.coerce.date({
      required_error: "Due date is required",
      invalid_type_error: "Invalid date format",
    }),
    invoiceItems: z
      .array(invoiceItemSchema)
      .min(1, "At least one item is required")
      .max(20, "Maximum 20 items allowed")
      .refine(
        (items) => {
          const productIds = items
            .map((item) => item.productId)
            .filter((id) => id !== undefined);
          return new Set(productIds).size === productIds.length;
        },
        {
          message: "Cannot add the same product multiple times",
          path: ["invoiceItems"],
        }
      ),
    total: z.coerce
      .number({
        required_error: "Total amount is required",
        invalid_type_error: "Total must be a number",
      })
      .min(0, "Total must be a positive number"),
  })
  .refine(
    (data) => {
      const calculatedTotal = data.invoiceItems.reduce(
        (sum, item) => sum + item.product_price * item.product_quantity,
        0
      );
      return Math.abs(calculatedTotal - data.total) < 0.01;
    },
    {
      message: "Total amount must match the sum of all invoice items",
      path: ["total"],
    }
  );

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const invoiceSchemaTables = z.object({
  id: z.number().nullable().optional(),
  invoiceNumber: z.number().nullable().optional(),
  customerName: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: z.enum(["paid", "pending", "overdue"]).nullable(),
  invoiceId: z.string().nullable(),
  total: z.number(),
});

export type TinvoiceSchemaTables = z.infer<typeof invoiceSchemaTables>;

//receipts

export const receiptSchemaTables = z.object({
  id: z.number().nullable().optional(),
  customerName: z.string(),
  receiptNumber: z.string(),
  total: z.string(),
});

export type TreceiptSchemaTables = z.infer<typeof receiptSchemaTables>;

export const receiptFormSchema = z.object({
  customerId: z.number({
    required_error: "Customer is required",
    invalid_type_error: "Please select a valid customer",
  }),
  receiptDate: z.coerce.date({
    required_error: "Please specify a receipt date",
    invalid_type_error: "Invalid date format",
  }),
  total: z.coerce
    .number({
      required_error: "Total amount is required",
      invalid_type_error: "Total must be a valid number",
    })
    .min(0, "Total amount must be positive"),
  receiptItems: z
    .array(invoiceItemSchema)
    .min(1, "Please add at least one item to the receipt")
    .max(20, "Receipt cannot contain more than 20 items")
    .refine(
      (items) => {
        const productIds = items
          .map((item) => item.productId)
          .filter((id) => id !== undefined);
        return new Set(productIds).size === productIds.length;
      },
      {
        message: "Cannot add the same product multiple times",
        path: ["receiptItems"], // You might want to refine the path based on where you want the error to appear
      }
    ),
});

export type receiptFormData = z.infer<typeof receiptFormSchema>;

//vendors

export const VendorSchema = z.object({
  vendorName: z
    .string({
      required_error: "Vendor name is required",
    })
    .min(3, "Vendor name must be at least 3 characters."),
  vendorEmail: z
    .string({
      required_error: "Email is required",
    })
    .email("This input must be a valid email"),
  vendorCountry: z.string({
    required_error: "Vendor country is required",
  }),
  address: z
    .string({
      required_error: "Address is required",
    })
    .min(5, "Vendor address must be at least 5 characters."),
  // countryCode: z.string({
  //   required_error: "Country code is required",
  // }),
  phoneNumber: z.string({
    required_error: "Phone number is required",
  }),
});
// .refine(
//   (data) => {
//     try {
//       const phoneNumber = parsePhoneNumber(
//         data.phoneNumber,
//         data.countryCode as CountryCode
//       );
//       return phoneNumber.isValid();
//     } catch (error) {
//       return false;
//     }
//   },
//   {
//     message: "Invalid phone number for the selected country",
//     path: ["phoneNumber"],
//   }
// );

export type VendorFormData = z.infer<typeof VendorSchema>;

export const vendorPrepaymentsFormSchema = z.object({
  vendorId: z.number({
    required_error: "Please select a vendor",
  }),
  amount: z.number({
    required_error: "Amount is required",
  }),
  paymentDate: z.coerce.date({
    required_error: "Please enter the payment date",
  }),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"], {
    required_error: "Please select a payment method",
  }),
  paymentAccountId: z.number({
    required_error: "Please select a payment account",
  }),
  memo: z.string().optional(),
});

export type VendorPrepaymentsFormValues = z.infer<
  typeof vendorPrepaymentsFormSchema
>;

export interface VendorPrepaymentsApiResponse {
  data: {
    vendorPrepaymentNo: string;
    vendor: {
      name: string;
    };
    paymentDate: string;
    paymentMethod: string;
    paymentAccount: {
      name: string;
    };
    amount: number;
    remainingBalance: number;
    status: string;
    memo?: string;
  }[];
  total: number;
  pageCount: number;
}

//tables config type

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  productId: number;
  productName: string;
  sellingPrice: number;
  costPrice: number;
  status: string;
  unitOfMeasure: string;
  productType: string;
  inventoryId?: number;
  batchId?: number;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  country: string;
  phone: string;
  address: string;
}

export interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export interface ApiPurchaseOrder {
  id: number;
  PurchaseOrderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  totalAmount: string;
  currency: string;
  shippingAddress: string;
  vendors: {
    name: string;
    email: string;
  };
}

// fiscalyearschema
export const UpdateFiscalformSchema = z.object({
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

export const CreateFiscalformSchema = z.object({
  month: z.number().int().min(1).max(12),
});
//purchaseordertypes

export const PurchaseOrderformSchema = z.object({
  inventoryId: z.number(),
  id: z.number().optional(),
  vendorId: z.number({ required_error: "vendorId is required so where is " }),
  vendor_name: z
    .string()
    .min(2, { message: "vendor name must be at least 2 characters." })
    .nullable()
    .optional(),
  expectedDeliveryDate: z.coerce.date(),
  orderDate: z.coerce.date(),
  totalAmount: z.coerce.number().or(z.string()),
  currency: z.enum(["USD", "ETH", "SL"]),
  status: z.enum(["OPEN", "CLOSED"]),
  purchaseItems: z
    .array(
      z.object({
        id: z.number().optional(),
        purchaseOrderId: z.number().optional(),
        productId: z.number(),
        productName: z.string().min(3, { message: "product name is required" }),
        quantity: z.coerce
          .number()
          .positive({ message: "Product quantity must be greater than 0." })
          .int({ message: "Product quantity must be a whole number." }),
        unitPrice: z.coerce
          .number()
          .positive({ message: "Product price must be greater than 0." }),
      })
    )
    .nonempty({ message: "purchaseItems must have at least one item." }),
  shippingCountry: z
    .string()
    .min(2, { message: "shipping country is required" }),
  shippingCity: z
    .string()
    .min(2, { message: "shipping city must be at least 2 characters." }),
  shippingAddress: z
    .string()
    .min(2, { message: "shipping address is required" }),
  orgsId: z.string().optional(),
  userId: z.string().optional(),
});

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderformSchema>;

const ExpenseStatus = z.enum(["paid", "unpaid"]);

// Define the Zod schema for expenses
export const expenseSchema = z.object({
  id: z.number().optional(), // optional for new expenses
  vendorId: z.number(),
  purchaseOrderId: z.number(),
  date: z.string(), // or z.date() if you're using Date objects
  status: ExpenseStatus.default("unpaid"),
  amount: z.number().positive(),
});

// Infer the type from the schema
export type ExpenseFormData = z.infer<typeof expenseSchema>;

export const ProductSchema = z.discriminatedUnion("productType", [
  z.object({
    productType: z.literal("inventoryPart"),
    productName: z
      .string()
      .min(2, "Product name must be at least 2 characters."),
    sellingPrice: z.coerce
      .number()
      .min(0, "Selling price must be non-negative"),
    costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
    incomeAccountId: z.coerce.number(),
    inventoryAssetAccountId: z.coerce.number(),
    cogsAccountId: z.coerce.number(),
    inventoryId: z.coerce.number(),
    vendorId: z.coerce.number(),
    unitOfMeasure: z.enum([
      "kg",
      "g",
      "meter",
      "liter",
      "hour",
      "day",
      "box",
      "piece",
    ]),
  }),
  z.object({
    productType: z.enum(["nonInventory"]),
    productName: z
      .string()
      .min(2, "Product name must be at least 2 characters."),
    sellingPrice: z.coerce
      .number()
      .min(0, "Selling price must be non-negative"),
    costPrice: z.coerce.number().min(0, "Cost price must be non-negative"),
    incomeAccountId: z.coerce.number(),
    inventoryAssetAccountId: z.coerce.number().optional(),
    cogsAccountId: z.coerce.number().optional(),
    inventoryId: z.coerce.number().optional(),
    vendorId: z.coerce.number(),
    unitOfMeasure: z.enum([
      "kg",
      "g",
      "meter",
      "liter",
      "hour",
      "day",
      "box",
      "piece",
    ]),
  }),
  z.object({
    productType: z.literal("service"),
    productName: z
      .string()
      .min(2, "Product name must be at least 2 characters."),
    sellingPrice: z.coerce
      .number()
      .min(0, "Selling price must be non-negative"),
    costPrice: z.coerce
      .number()
      .min(0, "Cost price must be non-negative")
      .nullable(),
    incomeAccountId: z.coerce.number(),
    vendorId: z.coerce.number(),
    unitOfMeasure: z
      .enum(["kg", "g", "meter", "liter", "hour", "day", "box", "piece"])
      .optional(),
  }),
]);

export type ProductFormData = z.infer<typeof ProductSchema>;

// ... (rest of the file remains unchanged)

//invetory schema

export const inventorySchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  location: z
    .string()
    .min(2, { message: "Location  must be at least 2 characters." }),
  manager: z
    .string()
    .min(2, { message: "manager name must be at least 2 characters." }),
});

export const inventroyTransferformSchema = z
  .object({
    fromInventory: z.number(),
    toInventory: z.number(),
    date: z.coerce.date(),
    purchaseItems: z
      .array(
        z.object({
          productId: z.number(),
          quantity: z.coerce
            .number({
              required_error: "required",
              invalid_type_error: "selling price must be a number",
            })
            .nonnegative({ message: "number must be positive" }),
          // .gt(0, { message: "quantity must be a greater than 0" }),
          transferedQuantity: z.coerce
            .number({
              required_error: "required",
              invalid_type_error: "transfer quantity must be a number",
            })
            .nonnegative({ message: "number must be a positive number" })
            .gt(0, { message: "transfer quantity must be a greater than 0" }),

          productName: z
            .string()
            .min(3, { message: "product name is required" }),
        })
      )
      .nonempty({ message: "purchaseItems must have at least one item." }),
  })
  .refine(
    (items) => {
      return items.purchaseItems.every(
        (item) => item.quantity >= item.transferedQuantity
      );
    },
    {
      message: "Quantity must not be less than transfered quantity",
      path: ["purchaseItems"],
    }
  );

//recordpayment

export const recordPaymentFormSchema = z
  .object({
    paymentAccountId: z.number({
      required_error: "Payment Account is required",
      invalid_type_error: "Please select a valid Payment Account",
    }),
    referenceId: z.string(),
    id: z.number({
      required_error: "Bill ID is required",
      invalid_type_error: "Please provide a valid Bill ID",
    }),
    amount: z.coerce
      .number({
        required_error: "required",
        invalid_type_error: "amount must be a number",
      })
      .nonnegative({ message: "number must be a positive number" })
      .optional(),
    prepaymentAmount: z.coerce
      .number({
        invalid_type_error: "prepayment amount must be a number",
      })
      .nonnegative({ message: "prepayment amount must be a positive number" })
      .optional(),
    usePrepayment: z.boolean().default(false),
    prepaymentId: z.number().optional(),
    paymentDate: z.coerce.date({
      required_error: "Please enter the payment date",
    }),
    paymentMethod: z.string({
      required_error: "Please select a payment method",
    }),
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

export type TbillPaymentSchemaTables = z.infer<typeof recordPaymentFormSchema>;

export const receivePaymentFormSchema = z
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
    usePrepayment: z.boolean().default(false),
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

export type TpaymentSchemaTables = z.infer<typeof receivePaymentFormSchema>;

export const adjustmentItemSchema = z.object({
  productId: z.number().min(1, "Please select a product"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("number must be greater tha 0"),
  reason: z.string().min(1, "Reason is required"),
});

export const adjustmentSchema = z.object({
  inventoryId: z.number().min(1, "Please select an inventory"),
  accountId: z.number().min(1, "Please select an account"),
  items: z.array(adjustmentItemSchema).min(1, "At least one item is required"),
});

export const accountConfigurationSchema = z.object({
  accountReceivable: z.number().min(1, "Account Receivable is required"),
  productSales: z.number().min(1, "Product Sales is required"),
});

export enum AccountCategory {
  CurrentAssets = "Current Assets",
  FixedAssets = "Fixed Assets",
  OtherAssets = "Other Assets",
  CurrentLiabilities = "Current Liabilities",
  LongTermLiabilities = "Long Term Liabilities",
  Equity = "Equity",
  SalesRevenue = "Sales Revenue",
  OtherRevenue = "Other Revenue",
  CostOfGoodsSold = "Cost of Goods Sold",
  SellingExpenses = "Selling Expenses",
  OtherExpenses = "Other Expenses",
  AdministrativeExpenses = "Administrative Expenses",
}

export interface TrialBalanceEntry {
  account_code: string;
  name: string;
  category: AccountCategory;
  debit: number;
  credit: number;
}

export interface TrialBalanceResponse {
  entries: TrialBalanceEntry[];
  totalDebits: number;
  totalCredits: number;
}

export const expenseFormSchema = z
  .object({
    vendorId: z.number({ required_error: "Vendor is required" }),
    paymentAccountId: z.number({
      required_error: "Payment account is required",
    }),
    expenseDate: z.coerce.date({ required_error: "Expense date is required" }),
    description: z.string().min(3, { message: "Description is required" }),
    amount: z.coerce
      .number()
      .positive()
      .min(0, { message: "Amount must be a positive number" }),
    expenseLinesSchema: z
      .array(
        z.object({
          expenseAccountId: z.number({
            required_error: "Expense line account is required",
          }),
          expenseAmount: z.coerce
            .number({ invalid_type_error: "Expense amount must be a number" })
            .positive({ message: "Expense amount must be positive" })
            .finite({ message: "Expense amount must be finite" }),
        })
      )
      .min(1, { message: "At least one expense line is required" }),
  })
  .refine(
    (data) => {
      // Check for duplicate accountId values in expenseLines
      const accountIds = data.expenseLinesSchema
        .map((line) => line.expenseAccountId)
        .filter((id) => id !== undefined && id !== 0);
      const uniqueAccountIds = new Set(accountIds);
      return uniqueAccountIds.size === accountIds.length;
    },
    {
      message:
        "Duplicate expense accounts are not allowed. Please select unique accounts for each expense line.",
      path: ["expenseLinesSchema"],
    }
  )
  .refine(
    (data) => {
      const totalExpenseLines = data.expenseLinesSchema.reduce(
        (sum, line) => sum + (line.expenseAmount || 0),
        0
      );
      return Math.abs(totalExpenseLines - data.amount) < 0.01;
    },
    {
      message: "Total amount must match the sum of all expense lines",
      path: ["amount"],
    }
  );
// export const expenseLinesSchema = z.object({
//   expenseAccountId: z.number({
//     required_error: "expense Account is required",
//   }),
//   quantity: z.coerce
//     .number()
//     .positive()
//     .min(0, { message: "Quantity must be a positive number" }),
//   unitPrice: z.coerce
//     .number()
//     .positive()
//     .min(0, { message: "Unit price must be a positive number" }),
//   productName: z.string().min(3, { message: "Product name is required" }),
// });
export type ExpenseFormType = z.infer<typeof expenseFormSchema>;
export interface ExpenseLine {
  expenseAmount: number;
  account: {
    name: string;
  };
}

interface PaymentAccount {
  name: string;
}

export interface Expense {
  id: number;
  expenseNumber: string;
  expenseDate: string;
  description: string;
  total: string;
  vendor: Vendor;
  expenseLines: ExpenseLine[];
  paymentAccount: PaymentAccount;
}

export const normalBillSchema = z
  .object({
    vendorId: z.number({ required_error: "Vendor is required" }),
    billDate: z.coerce.date({ required_error: "Bill date is required" }),
    dueDate: z.coerce.date({ required_error: "Due date is required" }),
    amount: z.coerce
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive({ message: "Amount must be a positive number" })
      .finite({ message: "Amount must be a finite number" }),
    description: z
      .string()
      .min(3, { message: "Description is required (min 3 chars)" }),
    expenseLines: z
      .array(
        z.object({
          accountId: z.number({
            required_error: "Expense line account is required",
          }),
          expenseAmount: z.coerce
            .number({ invalid_type_error: "Expense amount must be a number" })
            .positive({ message: "Expense amount must be positive" })
            .finite({ message: "Expense amount must be finite" }),
        })
      )
      .min(1, { message: "At least one expense line is required" }),
  })
  .refine(
    (data) => {
      // Check for duplicate accountId values in expenseLines
      const accountIds = data.expenseLines
        .map((line) => line.accountId)
        .filter((id) => id !== undefined && id !== 0);

      const uniqueAccountIds = new Set(accountIds);

      // If the number of unique IDs is less than the total, we have duplicates
      return uniqueAccountIds.size === accountIds.length;
    },
    {
      message:
        "Duplicate expense accounts are not allowed. Please select unique accounts for each expense line.",
      path: ["expenseLines"], // This will show the error at the expenseLines level
    }
  );

export const itemReceiptSchema = z
  .object({
    vendorId: z.number({ required_error: "Vendor is required" }),
    poId: z.number({ required_error: "Purchase Order is required" }),
    poNumber: z.string().optional(), // Only for display purposes
    receiptDate: z.coerce.date({ required_error: "Receipt date is required" }),
    description: z
      .string()
      .min(3, { message: "Description is required (min 3 chars)" }),
    amount: z.coerce
      .number({
        required_error: "Amount is required",
        invalid_type_error: "Amount must be a number",
      })
      .positive({ message: "Amount must be a positive number" })
      .finite({ message: "Amount must be a finite number" }),
    purchaseItems: z
      .array(
        z.object({
          id: z.number().optional(),
          purchaseOrderId: z.number().optional(),
          productId: z.number(),
          productName: z
            .string()
            .min(3, { message: "Product name is required" }),
          quantity: z.coerce
            .number()
            .positive({ message: "Product quantity must be greater than 0." })
            .int({ message: "Product quantity must be a whole number." }),
          unitPrice: z.coerce
            .number()
            .positive({ message: "Product price must be greater than 0." }),
          receivedQuantity: z.coerce
            .number()
            .min(0, { message: "Received quantity cannot be negative" })
            .int({ message: "Received quantity must be a whole number" }),
        })
      )
      .min(1, { message: "At least one item is required" }),
    expenseLines: z
      .array(
        z.object({
          accountId: z.number({
            required_error: "Expense line account is required",
          }),
          expenseAmount: z.coerce
            .number({ invalid_type_error: "Expense amount must be a number" })
            .positive({ message: "Expense amount must be positive" })
            .finite({ message: "Expense amount must be finite" }),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      // Check for duplicate accountId values in expenseLines
      const accountIds = data.expenseLines
        .map((line) => line.accountId)
        .filter((id) => id !== undefined && id !== 0);

      const uniqueAccountIds = new Set(accountIds);

      // If the number of unique IDs is less than the total, we have duplicates
      return uniqueAccountIds.size === accountIds.length;
    },
    {
      message:
        "Duplicate expense accounts are not allowed. Please select unique accounts for each expense line.",
      path: ["expenseLines"], // This will show the error at the expenseLines level
    }
  );

export type ItemReceiptFormData = z.infer<typeof itemReceiptSchema>;

export type PoItemAPI = {
  id: number;
  productId: number;
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
};

export type PoAPI = {
  id: number;
  PurchaseOrderNumber: string;
  totalAmount: number;
  description?: string;
  orderDate: string;
  status: string;
  purchaseItems?: PoItemAPI[];
};

export const poBillSchema = z.object({
  vendorId: z.number({ required_error: "Vendor is required" }),
  poId: z.number({ required_error: "Purchase Order is required" }),
  poNumber: z.string().optional(), // Only for display purposes
  // inventoryAccountId: z.number({
  //   required_error: "Inventory account is required",
  // }),
  // liabilityAccountId: z.number({
  //   required_error: "Liability account (A/P) is required",
  // }),
  billDate: z.coerce.date({ required_error: "Bill date is required" }),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  description: z
    .string()
    .min(3, { message: "Description is required (min 3 chars)" }),
  purchaseItems: z
    .array(
      z.object({
        id: z.number().optional(),
        purchaseOrderId: z.number().optional(),
        productId: z.number({ required_error: "Product is required" }),
        productName: z.string().min(1, { message: "Product name is required" }),
        quantity: z.coerce
          .number({ invalid_type_error: "Quantity must be a number" })
          .positive({ message: "Quantity must be greater than 0" })
          .int({ message: "Quantity must be a whole number" }),
        unitPrice: z.coerce
          .number({ invalid_type_error: "Unit price must be a number" })
          .positive({ message: "Unit price must be greater than 0" })
          .finite({ message: "Unit price must be finite" }),
        receivedQuantity: z.coerce
          .number({ invalid_type_error: "Received quantity must be a number" })
          .int({ message: "Received quantity must be a whole number" }),
      })
    )
    .min(1, { message: "At least one purchase item is required" }),
  expenseLines: z
    .array(
      z.object({
        accountId: z.number({
          required_error: "Expense line account is required",
        }),
        expenseAmount: z.coerce
          .number({ invalid_type_error: "Expense amount must be a number" })
          .positive({ message: "Expense amount must be positive" })
          .finite({ message: "Expense amount must be finite" }),
      })
    )
    .optional()
    .default([]),
  amount: z.coerce
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive({ message: "Amount must be a positive number" })
    .finite({ message: "Amount must be a finite number" }),
});

// Add refinements to check for duplicate expense accounts and validate total amount
export const poBillSchemaWithRefinements = poBillSchema
  .refine(
    (data) => {
      // Only check for duplicates if there are expense lines
      if (!data.expenseLines || data.expenseLines.length === 0) {
        return true;
      }

      // Check for duplicate accountId values in expenseLines
      const accountIds = data.expenseLines
        .map((line) => line.accountId)
        .filter((id) => id !== undefined && id !== 0);

      const uniqueAccountIds = new Set(accountIds);

      // If the number of unique IDs is less than the total, we have duplicates
      return uniqueAccountIds.size === accountIds.length;
    },
    {
      message:
        "Duplicate expense accounts are not allowed. Please select unique accounts for each expense line.",
      path: ["expenseLines"], // This will show the error at the expenseLines level
    }
  )
  .refine(
    (data) => {
      // Calculate totals using Decimal for precision
      const expenseLinesTotal = (data.expenseLines || []).reduce(
        (sum, line) => sum.plus(new Decimal(line.expenseAmount || 0)),
        new Decimal(0)
      );

      const purchaseItemsTotal = data.purchaseItems.reduce(
        (sum, item) =>
          sum.plus(
            new Decimal(item.unitPrice || 0).times(
              new Decimal(item.quantity || 0)
            )
          ),
        new Decimal(0)
      );

      const totalLinesAmount = expenseLinesTotal.plus(purchaseItemsTotal);
      const billAmountDecimal = new Decimal(data.amount || 0);

      // Check if the bill amount matches the sum of all lines with a small tolerance
      const tolerance = new Decimal(0.01);
      return billAmountDecimal
        .minus(totalLinesAmount)
        .abs()
        .lessThanOrEqualTo(tolerance);
    },
    {
      message:
        "Bill amount must match the sum of all purchase items and expense lines",
      path: ["amount"],
    }
  );

export type NormalBillFormData = z.infer<typeof normalBillSchema>;
export type PoBillFormData = z.infer<typeof poBillSchema>;

// Union type for both bill types
export type BillFormData = NormalBillFormData | PoBillFormData;

export const ItemReceiptToBillFormSchema = z.object({
  billDate: z.coerce.date({ required_error: "Bill date is required" }),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  description: z
    .string()
    .min(3, { message: "Description is required (min 3 chars)" }),
});

export type ItemReceiptToBillFormData = z.infer<
  typeof ItemReceiptToBillFormSchema
>;

export const CustomersformSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  country: z
    .string()
    .min(1, { message: "Please select a country." })
    .optional(),
  phone: z
    .string()
    .min(5, { message: "Phone number must be at least 5 digits." })
    .optional(),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
});

export const customerPrepaymentsFormSchema = z.object({
  customerId: z.number({
    required_error: "Customer is required",
    invalid_type_error: "Please select a valid customer",
  }),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be positive"),
  paymentDate: z.coerce.date({
    required_error: "Please enter the payment date",
  }),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER"], {
    required_error: "Payment method is required",
  }),
  paymentAccountId: z.number({
    required_error: "Payment Account is required",
    invalid_type_error: "Please select a valid Payment Account",
  }),
  memo: z.string().optional(),
});

export type CustomerPrepaymentsFormValues = z.infer<
  typeof customerPrepaymentsFormSchema
>;

export type CustomerPrepaymentTable = {
  id: number;
  customerPrepaymentNo: string;
  paymentDate: string;
  status: string;
  paymentMethod: string;
  memo?: string;
  amount: string;
  remainingBalance: string;
  customer: {
    name: string;
  };
  paymentAccount: {
    name: string;
  };
};

export interface CustomerPrepaymentsApiResponse {
  data: CustomerPrepaymentTable[];
  total: number;
  pageCount: number;
}

export interface CustomerPrepaymentFormData {
  customerId: number;
  paymentAccountId: number;
  paymentDate: Date;
  paymentMethod: string;
  memo?: string;
  amount: string;
}

export enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

export const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

export const accountsformSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountCategory: z.string().min(2, {
    message: "Account type must be at least 2 characters.",
  }),
  categoryId: z.number(),
});

export const accountTypeCodeRanges = {
  "Current Assets": [1000, 1399],
  "Fixed Assets": [1400, 1499],
  "Accumulated Depreciation": [1500, 1699],
  "Other Assets": [1700, 1799],
  "Intangible Assets": [1800, 1999],
  "Owner’s Equity": [3000, 3999],
  "Sales Revenue": [4000, 4099],
  "Other Revenue": [4300, 4600],
  "Contra Revenue": [4500, 4999],
  "Cost of Goods Sold": [5000, 5999],
  "Administrative Expenses": [6000, 6499],
  "Other Expenses": [6500, 6599],
  "Selling Expenses": [6600, 6999],
  "Current Liabilities": [7000, 7999],
  "Long Term Liabilities": [8000, 8999],
};

export type EntryType = "DEBIT" | "CREDIT";

export interface EntryData {
  type: EntryType;
  accountId: number;
  amount: string;
  transactionId: number;
  orgsId: string;
  userId: string;
  date: string;
}

export const updateStatusSchema = z.object({
  id: z.number(),
  bol: z.boolean(),
});

export interface statusChangeParams {
  id: number;
  isActive: boolean;
}

export interface AgingData {
  period: string;
  amount: string;
  color: string;
}

export interface AgingTypes {
  totalOutstanding: number;
  aging: AgingData[];
}

export const BookDemoformSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  productInterest: z.enum([
    "Accounting Software",
    "Payroll Management",
    "Tax Filing",
    "Financial Reporting",
    "All Products",
  ]),
  companySize: z.enum([
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees",
  ]),
  hearAboutUs: z.enum([
    "Google Search",
    "Social Media",
    "Referral",
    "Advertisement",
    "Other",
  ]),
  subscriptionType: z.enum(["Basic", "Professional"]),
  message: z.string().optional(),
});

// Define RefundItemSchema with error messages
const RefundItemSchema = z.object({
  product_name: z.string().min(1, { message: "Product name is required." }),
  product_price: z
    .number()
    .positive({ message: "Product price must be a positive number." }),
  product_quantity: z
    .number()
    .int({ message: "Product quantity must be an integer." })
    .positive({ message: "Product quantity must be a positive number." }),
  productId: z.number().int().nullable(),
  productType: z.enum(productTypeEnum.enumValues).optional(),
  inventoryId: z.number().optional(),
});

// Update RefundFormSchema
export const RefundFormSchemaF = z
  .object({
    relatedEntityId: z.number().int({ message: "Reference ID is required" }),
    refundEntityType: z.enum(["INVOICE", "RECEIPT"], {
      required_error: "Entity type is required",
    }),
    refundAccountId: z.number({
      required_error: "Refund Account is required",
    }),
    paymentAccountId: z.number({
      required_error: "Payment Account is required",
    }),
    customerId: z
      .number()
      .int({ message: "Customer ID must be an integer." })
      .positive({ message: "Customer ID must be a positive number." }),
    refundDate: z.coerce.date({
      required_error:
        "Refund date must be a valid datetime string in ISO 8601 format.",
    }),
    items: z
      .array(RefundItemSchema)
      .min(1, { message: "At least one item is required for the refund." }),
    total: z
      .number()
      .positive({ message: "Total refund amount must be a positive number." }),
    reason: z
      .string()
      .min(1, { message: "Reason for refund is required." })
      .nullable(),
  })
  .refine(
    (data) => {
      const calculatedTotal = data.items.reduce(
        (acc, item) => acc + item.product_price * item.product_quantity,
        0
      );
      return data.total === calculatedTotal;
    },
    { message: "Total must match the sum of item amounts." }
  );

export interface InvoiceData {
  phone: string;
  email: string;
  name: string;
  status: string;
  invoiceNumber: string;

  invoiceDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  items: [
    {
      itemId: number;
      quantity: string;
      unit_price: string;
      product_name: string;
      unitOfMeasure: string;
    }
  ];

  payments: [
    { id: number; amount: string; paymentMethod: string; paymentDate: string }
  ];
  refunds: [
    {
      id: number;
      refundNumber: string;
      creditMemoNumber: string;
      refundDate: string;
      refundAmount: string;
      refundReason: string;
    }
  ];
  appliedCreditMemos?: {
    id: number;
    amountApplied: string;
    applicationDate: string;
    creditMemoNumber: string;
  }[];
}

export type SubscriptionPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
};

export type Subscription = {
  id: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "canceled";
  subsBillingStatus: "paid" | "unpaid" | "pending";
  subscriptionPlan: SubscriptionPlan;
};

export const organizationFormSchema = z.object({
  // Step 1: Organization Basics
  name: z.string().min(2, "Organization name is required"),
  businessType: z.string().min(1, "Business type is required"),
  industry: z.string().min(2, { message: "Industry is required." }),
  companySize: z.string().min(1, "Company size is required"),
  foundedYear: z.coerce
    .number()
    .min(1800, { message: "Year must be after 1800" })
    .max(new Date().getFullYear(), { message: "Year cannot be in the future" })
    .int({ message: "Year must be a whole number" }),
  website: z.string().url({ message: "Please enter a valid URL." }),
  description: z.string().min(10, "Description must be at least 10 characters"),

  // Step 2: Contact Information
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(5, { message: "Phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),

  // Step 3: Financial Settings
  preferredCurrency: z.string().min(1, "Preferred currency is required"),
  fiscalYearStartMonth: z
    .number({
      required_error: "Fiscal year start month is required",
    })
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  fiscalYearStartDay: z
    .number({
      required_error: "Fiscal year start day is required",
    })
    .min(1, "Day must be between 1 and 31")
    .max(31, "Day must be between 1 and 31"),
  timeZone: z.string().min(1, "Time zone is required"),
  accountingMethod: z.string().min(1, "Accounting method is required"),
  planId: z.number().min(1, "Plan is required"),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export type EntityData = Record<string, any>;

// Types for the details field content
export type AuditLogDetailsCreate = {
  action: "CREATE";
  before: null;
  after: EntityData;
};

export type AuditLogDetailsUpdate = {
  action: "UPDATE";
  before: EntityData;
  after: EntityData;
  changedFields: string[];
};

export type AuditLogDetailsDelete = {
  action: "DELETE";
  before: EntityData;
  after: null;
  reason?: string;
};

export type AuditLogDetailsView = {
  action: "VIEW";
  entityData: EntityData;
};

export type AuditLogDetails =
  | AuditLogDetailsCreate
  | AuditLogDetailsUpdate
  | AuditLogDetailsDelete
  | AuditLogDetailsView;

export type AuditLogAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "VOIDED"
  | "VIEWED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED"
  | "RESTORED"
  | "EXPORTED"
  | "IMPORTED"
  | "CONFIGURED"
  | "DISABLED"
  | "ENABLED";

// Entity types
export type EntityType =
  | "INVOICE"
  | "RECEIPT"
  | "REPORT"
  | "PRODUCT"
  | "CUSTOMER"
  | "VENDOR"
  | "PURCHASE_ORDER"
  | "EXPENSE"
  | "PAYMENT_MADE"
  | "INVENTORY_ADJUSTMENT"
  | "PAYMENT_RECEIVED"
  | "ACCOUNT"
  | "JOURNAL_ENTRY"
  | "TAX_RATE"
  | "USER"
  | "ROLE"
  | "PERMISSION"
  | "SETTING"
  | "ORGANIZATION"
  | "FISCAL_YEAR"
  | "BANK_ACCOUNT"
  | "CATEGORY"
  | "SUBSCRIPTION"
  | "DOCUMENT"
  | "REFUND";

// Audit log entry type
export interface AuditLog {
  id: number | string;
  timestamp: Date | string;
  userId: string;
  userName: string;
  action: AuditLogAction;
  entityType: EntityType;
  entityId: string;
  details: string;
  metaData: AuditLogDetails;
  imgUrl: string;
  companyId: string;
}

export interface AuditLogFilter {
  action: AuditLogAction | "all";
  entityType: EntityType | "all";
  dateFrom: string | null;
  dateTo: string | null;
  user: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Props for the AuditLogReport component
export interface AuditLogReportProps {
  initialFilters?: Partial<AuditLogFilter>;
  onExport?: (filters: AuditLogFilter) => void;
  isAdmin?: boolean;
  companyId?: string;
}

// Props for the AuditLogTable component
export interface AuditLogTableProps {
  logs: AuditLog[];
  onViewDetails: (log: AuditLog) => void;
  isLoading?: boolean;
}

// Props for the AuditLogFilters component
export interface AuditLogFiltersProps {
  filters: AuditLogFilter;
  onFilterChange: (filters: AuditLogFilter) => void;
  availableEntityTypes?: EntityType[];
  availableActions?: AuditLogAction[];
}

// Props for the AuditLogDetails component
export interface AuditLogDetailsProps {
  log: AuditLog | null;
  onClose: () => void;
}

// Props for the AuditLogPagination component
export interface AuditLogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Database schema types for Drizzle ORM
export interface AuditLogInsert {
  userId: string;
  userName: string;
  action: AuditLogAction;
  entityType: EntityType;
  entityId: string;
  details: AuditLogDetails;
  ipAddress?: string | null;
  userAgent?: string | null;
  companyId: string;
}

export interface AuditLogSelect extends AuditLogInsert {
  id: number;
  timestamp: Date;
}

export const roleFormSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  key: z
    .string()
    .min(1, { message: "Role key is required" })
    .regex(/^[a-z][a-z0-9_-]*$/, {
      message:
        "Key must start with a lowercase letter and contain only lowercase letters, numbers, underscores (_), or hyphens (-). Uppercase letters and special characters are not allowed.",
    }),
  description: z.string().min(1, { message: "Description is required" }),
  permissions: z
    .array(z.number())
    .min(1, { message: "At least one permission is required" }),
});
export const roleEditFormSchema = roleFormSchema.omit({ key: true });

export const roleUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roleId: z.coerce.number({
    required_error: "Role ID is required",
    invalid_type_error: "Role ID must be a number",
  }),
  roleKey: z.string().min(1, "Role key is required"),
});

export type RoleUpdateSchemaType = z.infer<typeof roleUpdateSchema>;

export const creditMemoItemSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),

  product_price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative({ message: "Product price cannot be negative" })
    .refine((val) => new Decimal(val).decimalPlaces() <= 2, {
      message: "Price can only have up to 2 decimal places",
    }),
  product_quantity: z.coerce
    .number({ invalid_type_error: "Quantity must be a number" })
    .int({ message: "Quantity must be a whole number" })
    .positive({ message: "Quantity must be positive" }),
  productId: z
    .number({ invalid_type_error: "Product ID must be a number" })
    .int()
    .positive()
    .optional(),
  inventoryId: z.number().int().positive().optional(),
  productType: z.string().optional(),
  batchId: z.number().int().positive().optional(),
});

export const creditMemoTypeEnum = z.enum(["ITEM_BASED", "GENERAL"]);

export const creditMemoEntityTypeEnum = z.enum(["INVOICE", "RECEIPT"]);

export const creditMemoFormSchema = z
  .object({
    customerId: z
      .number({
        required_error: "Customer is required.",
        invalid_type_error: "Invalid customer selected.",
      })
      .int()
      .positive(),
    memoDate: z.coerce.date({
      required_error: "Memo date is required.",
      invalid_type_error: "Invalid date format.",
    }),
    creditMemoType: creditMemoTypeEnum,
    memo: z.string().max(500, "Memo cannot exceed 500 characters.").optional(),
    total: z.coerce
      .number({
        required_error: "Total amount calculation failed or is missing.",
        invalid_type_error: "Total must be a valid number.",
      })
      .min(0.01, "Total credit amount must be greater than zero."),

    relatedEntityId: z.number().int().positive().optional(),
    creditMemoEntityType: creditMemoEntityTypeEnum.optional(),
    items: z.array(creditMemoItemSchema).optional(),

    creditAccountId: z.number().int().positive().optional(),
    generalCreditAmount: z.coerce
      .number({ invalid_type_error: "General credit amount must be a number." })
      .positive({ message: "General credit amount must be positive." })
      .refine((val) => new Decimal(val).decimalPlaces() <= 2, {
        message: "General credit amount can only have up to 2 decimal places.",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.creditMemoType === "ITEM_BASED") {
      if (
        !data.items ||
        data.items.filter(
          (item) => item.product_name && item.product_quantity > 0
        ).length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least one item with a name and quantity > 0 is required for item-based credit memos.",
          path: ["items"],
        });
      } else {
        data.items.forEach((item: any, index: number) => {
          if (
            item.product_name &&
            item.product_quantity > 0 &&
            !item.productId
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Product selection (ID) is missing for item "${item.product_name}".`,
              path: [`items.${index}.productId`],
            });
          }

          if (
            item.productType === "inventoryPart" &&
            (item.inventoryId === undefined || item.inventoryId === null)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Inventory location is required for inventory item "${item.product_name}".`,
              path: [`items.${index}.inventoryId`],
            });
          }
        });

        const calculatedItemTotal = data.items.reduce((sum, item) => {
          const price = new Decimal(item.product_price || 0);
          const quantity = new Decimal(item.product_quantity || 0);
          return sum.plus(price.times(quantity));
        }, new Decimal(0));

        if (
          !new Decimal(data.total)
            .toDecimalPlaces(2)
            .equals(calculatedItemTotal.toDecimalPlaces(2))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Form total (${data.total.toFixed(
              2
            )}) does not match the calculated sum of item totals (${calculatedItemTotal.toFixed(
              2
            )}). Please check item prices and quantities.`,
            path: ["total"], // Error related to the overall total calculation based on items
          });
        }
      }

      // 4. Ensure relatedEntity details are present if items were likely auto-filled
      if (data.relatedEntityId && !data.creditMemoEntityType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reference document type (Invoice/Receipt) is missing.",
          path: ["creditMemoEntityType"],
        });
      }

      // 5. Ensure GENERAL specific fields are NOT provided (redundant if form logic is correct, but safe)
      if (data.creditAccountId !== undefined && data.creditAccountId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Account should not be set for item-based credits.",
          path: ["creditAccountId"],
        });
      }
      if (
        data.generalCreditAmount !== undefined &&
        data.generalCreditAmount !== null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "General Credit Amount should not be set for item-based credits.",
          path: ["generalCreditAmount"],
        });
      }
    } else if (data.creditMemoType === "GENERAL") {
      if (data.creditAccountId === undefined || data.creditAccountId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Account is required for general credits.",
          path: ["creditAccountId"],
        });
      }

      if (
        data.generalCreditAmount === undefined ||
        data.generalCreditAmount === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Amount is required for general credits.",
          path: ["generalCreditAmount"],
        });
      }

      if (
        typeof data.generalCreditAmount === "number" &&
        typeof data.total === "number"
      ) {
        const formTotal = new Decimal(data.total);
        const generalAmount = new Decimal(data.generalCreditAmount);

        if (
          !formTotal.toDecimalPlaces(2).equals(generalAmount.toDecimalPlaces(2))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Total amount (${formTotal.toFixed(
              2
            )}) must match the General Credit Amount (${generalAmount.toFixed(
              2
            )}).`,
            path: ["total"],
          });
        }
      }

      if (data.items && data.items.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Items should not be present for general credits.",
          path: ["items"],
        });
      }
      if (data.relatedEntityId !== undefined && data.relatedEntityId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reference Document should not be set for general credits.",
          path: ["relatedEntityId"],
        });
      }
    }
  });

// Define the TypeScript type derived from the schema
export type CreditMemoFormValues = z.infer<typeof creditMemoFormSchema>;

const vendorCreditItemSchema = invoiceItemSchema;

export const vendorCreditFormSchema = z
  .object({
    vendorId: z
      .number({
        invalid_type_error: "Invalid vendor selected.",
      })
      .int()
      .positive()
      .optional(),
    VendorcreditDate: z.coerce.date({
      required_error: "Vendor Credit date is required.",
      invalid_type_error: "Invalid date format.",
    }),
    vendorCreditType: z.enum(["ITEM_BASED", "GENERAL"], {
      required_error: "Vendor credit type must be selected.",
    }),
    memo: z.string().max(500, "Memo cannot exceed 500 characters.").optional(),
    total: z.coerce
      .number({
        required_error: "Total amount calculation failed or is missing.",
        invalid_type_error: "Total must be a valid number.",
      })
      .min(0.01, "Total credit amount must be greater than zero.")
      .refine((val) => new Decimal(val).decimalPlaces() <= 2, {
        message: "Total amount can only have up to 2 decimal places.",
      }),

    // Fields specific to ITEM_BASED
    relatedEntityId: z.number().int().positive().optional(),
    vendorCreditEntityType: z.literal("BILL").optional(),
    items: z.array(vendorCreditItemSchema).optional(),

    // Fields specific to GENERAL
    creditAccountId: z.number().int().positive().optional(),
    generalCreditAmount: z.coerce
      .number({ invalid_type_error: "General credit amount must be a number." })
      .positive({ message: "General credit amount must be positive." })
      .refine((val) => new Decimal(val).decimalPlaces() <= 2, {
        message: "General credit amount can only have up to 2 decimal places.",
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // --- ITEM_BASED Validations ---
    if (data.vendorCreditType === "ITEM_BASED") {
      // 1. Items array must exist and have at least one valid item
      if (
        !data.items ||
        data.items.filter(
          (item) => item.product_name && item.product_quantity > 0
        ).length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least one item with a name and quantity > 0 is required for item-based vendor credits.",
          path: ["items"],
        });
      } else {
        // 2. Validate each item
        data.items.forEach((item: any, index: number) => {
          // Ensure product is selected if name/qty present
          if (
            item.product_name &&
            item.product_quantity > 0 &&
            !item.productId
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Product selection (ID) is missing for item "${item.product_name}".`,
              path: [`items.${index}.productId`],
            });
          }

          if (
            item.productType === "inventoryPart" &&
            (item.inventoryId === undefined || item.inventoryId === null)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Inventory location is required for inventory item "${item.product_name}".`,
              path: [`items.${index}.inventoryId`],
            });
          }
        });

        const calculatedItemTotal = data.items.reduce((sum, item) => {
          const price = new Decimal(item.product_price || 0);
          const quantity = new Decimal(item.product_quantity || 0);
          return sum.plus(price.times(quantity));
        }, new Decimal(0));

        if (
          !new Decimal(data.total)
            .toDecimalPlaces(2)
            .equals(calculatedItemTotal.toDecimalPlaces(2))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Form total (${new Decimal(data.total).toFixed(
              2
            )}) does not match the calculated sum of item totals (${calculatedItemTotal.toFixed(
              2
            )}). Please check item prices and quantities.`,
            path: ["total"],
          });
        }
      }

      // 4. Ensure relatedEntity type is 'BILL' if ID is present
      if (data.relatedEntityId && data.vendorCreditEntityType !== "BILL") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vendor credits can only be linked to Bills.",
          path: ["vendorCreditEntityType"],
        });
      }
      // Ensure relatedEntityId requires vendorCreditEntityType to be 'BILL'
      if (data.relatedEntityId && !data.vendorCreditEntityType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Entity type must be 'BILL' when linking to a Bill.",
          path: ["vendorCreditEntityType"],
        });
      }

      // 5. Ensure GENERAL specific fields are NOT provided
      if (data.creditAccountId !== undefined && data.creditAccountId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Account should not be set for item-based credits.",
          path: ["creditAccountId"],
        });
      }
      if (
        data.generalCreditAmount !== undefined &&
        data.generalCreditAmount !== null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "General Credit Amount should not be set for item-based credits.",
          path: ["generalCreditAmount"],
        });
      }
    }
    // --- GENERAL Validations ---
    else if (data.vendorCreditType === "GENERAL") {
      // 1. Require creditAccountId and generalCreditAmount
      if (data.creditAccountId === undefined || data.creditAccountId === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Account is required for general credits.",
          path: ["creditAccountId"],
        });
      }
      if (
        data.generalCreditAmount === undefined ||
        data.generalCreditAmount === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Credit Amount is required for general credits.",
          path: ["generalCreditAmount"],
        });
      }

      // 2. Validate total against generalCreditAmount
      if (
        typeof data.generalCreditAmount === "number" &&
        typeof data.total === "number"
      ) {
        const formTotal = new Decimal(data.total);
        const generalAmount = new Decimal(data.generalCreditAmount);
        if (
          !formTotal.toDecimalPlaces(2).equals(generalAmount.toDecimalPlaces(2))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Total amount (${formTotal.toFixed(
              2
            )}) must match the General Credit Amount (${generalAmount.toFixed(
              2
            )}).`,
            path: ["total"],
          });
        }
      }

      // 3. Ensure ITEM_BASED specific fields are NOT provided
      if (data.items && data.items.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Items should not be present for general credits.",
          path: ["items"],
        });
      }
      if (data.relatedEntityId !== undefined && data.relatedEntityId !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reference Document should not be set for general credits.",
          path: ["relatedEntityId"],
        });
      }
      if (
        data.vendorCreditEntityType !== undefined &&
        data.vendorCreditEntityType !== null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Reference Document Type should not be set for general credits.",
          path: ["vendorCreditEntityType"],
        });
      }
    }
  });

// Define the TypeScript type derived from the schema
export type VendorCreditFormValues = z.infer<typeof vendorCreditFormSchema>;

export const refundFormSchema = z.object({
  creditMemoId: z.number(),
  customerId: z.number(),
  refundAmount: z.coerce.number().min(0.01, "Amount must be positive"),
  refundDate: z.coerce.date({
    required_error: "Refund date is required",
    invalid_type_error: "Invalid date format",
  }),
  refundAccountId: z.number({
    required_error: "Refund Account is required",
  }),
  memo: z.string().max(200, "Memo must be 200 characters or fewer").optional(),
});

export type RefundFormValues = z.infer<typeof refundFormSchema>;

export const vendorRefundFormSchema = z.object({
  vendorCreditId: z.number(),
  vendorId: z.number(),
  refundAmount: z.coerce.number().min(0.01, "Amount must be positive"),
  refundDate: z.coerce.date({
    required_error: "Refund date is required",
    invalid_type_error: "Invalid date format",
  }),
  refundAccountId: z.number({
    required_error: "Refund Account is required",
  }),
  memo: z.string().max(200, "Memo must be 200 characters or fewer").optional(),
});

export type VendorRefundFormValues = z.infer<typeof vendorRefundFormSchema>;

export const applyCreditSchema = z.object({
  creditMemoId: z.number(),
  invoiceId: z.number(),
  amountToApply: z.coerce.number().min(0.01, "Amount must be positive"),
});

export const createApplyCreditSchema = (maxBalance: number, maxDue: number) =>
  z.object({
    amountToApply: z
      .number({
        required_error: "Amount is required.",
        invalid_type_error: "Amount must be a number.",
      })
      .positive({ message: "Amount must be positive." })
      .max(maxBalance, { message: "Amount cannot exceed credit memo balance." })
      .max(maxDue, { message: "Amount cannot exceed invoice due balance." }),
  });

export type ApplyCreditFormValues = z.infer<
  ReturnType<typeof createApplyCreditSchema>
>;


export const applyVendorCreditSchema = z.object({
  vendorCreditId: z.number(),
  billId: z.number(),
  amountToApply: z.coerce.number().min(0.01, "Amount must be positive"),
});

export const createApplyVendorCreditSchema = (maxBalance: number, maxDue: number) =>
  z.object({
    amountToApply: z
      .number({
        required_error: "Amount is required.",
        invalid_type_error: "Amount must be a number.",
      })
      .positive({ message: "Amount must be positive." })
      .max(maxBalance, { message: "Amount cannot exceed vendor credit balance." })
      .max(maxDue, { message: "Amount cannot exceed bill due balance." }),
  });

export type ApplyVendorCreditFormValues = z.infer<
  ReturnType<typeof createApplyVendorCreditSchema>
>;