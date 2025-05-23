import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  decimal,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", [
  "pending",
  "paid",
  "overdue",
  "partial",
  "voided",
]);

export const billEnum = pgEnum("bill_enum", ["PAID", "PARTIALLY", "UNPAID"]);
export const productTypeEnum = pgEnum("product_type", [
  "inventoryPart",
  "nonInventory",
  "service",
]);
export const auditEnum = pgEnum("audit", [
  "CREATED",
  "UPDATED",
  "DELETED",
  "VOIDED",
  "VIEWED",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
  "RESTORED",
  "EXPORTED",
  "IMPORTED",
  "CONFIGURED",
  "DISABLED",
  "ENABLED",
  "CLOSED",
  "APPLIED",
]);
export const entityTypeEnum = pgEnum("entity_type", [
  "INVOICE",
  "RECEIPT",
  "REPORT",
  "PRODUCT",
  "CUSTOMER",
  "CUSTOMER_PREPAYMENT",
  "VENDOR_PREPAYMENT",
  "VENDOR",
  "PURCHASE_ORDER",
  "EXPENSE",
  "PAYMENT_MADE",
  "INVENTORY_ADJUSTMENT",
  "PAYMENT_RECEIVED",
  "ACCOUNT",
  "JOURNAL_ENTRY",
  "TAX_RATE",
  "USER",
  "ROLE",
  "PERMISSION",
  "SETTING",
  "ORGANIZATION",
  "FISCAL_YEAR",
  "BANK_ACCOUNT",
  "CATEGORY",
  "SUBSCRIPTION",
  "DOCUMENT",
  "REFUND",
  "BILL",
  "BILL_FROM_PO",
  "UNBILLED_ITEM_RECEIPT",
  "CREDIT_MEMO",
  "VENDOR_CREDIT",
]);
export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "cogs",
  "expense",
]);
export const entryTypeEnum = pgEnum("entryType", ["DEBIT", "CREDIT"]);

export const inventoryTypeEnum = pgEnum("inventoryType", [
  "AVAILABLE",
  "OUT OF STOCK",
]);

export const creditMemoTypeEnum = pgEnum("credit_memo_type_enum", [
  "ITEM_BASED",
  "GENERAL",
]);

export const refundEntityType = pgEnum("refund_entity_type", [
  "INVOICE",
  "RECEIPT",
]);

export const currencyTypeEnum = pgEnum("currencyType", ["USD", "ETH", "SL"]);

export const unitOfMeasureEnum = pgEnum("unit_of_measure", [
  "kg",
  "g",
  "meter",
  "liter",
  "hour",
  "day",
  "box",
  "piece",
]);

export const expenseStatus = pgEnum("expense_status", ["paid", "unpaid"]);
export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "DRAFT",
  "PARTIALLY RECEIVED",
  "FULLY RECEIVED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "BANK_TRANSFER",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "canceled",
]);

export const costingMethodEnum = pgEnum("costing_method", [
  "FIFO",
  "LIFO",
  "AVERAGE COST",
]);
export const inventoryStatusEnum = pgEnum("inventory_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const subsEnum = pgEnum("subsEnum", ["Basic", "Professional"]);
export const subsBillingStatusEnum = pgEnum("subs_billing_status", [
  "paid",
  "pending",
  "failed",
  "refunded",
]);

export const organizationRoleEnum = pgEnum("organization_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
]);
export const prepaymentStatusEnum = pgEnum("prepayment_status", [
  "AVAILABLE",
  "PARTIALLY_APPLIED",
  "FULLY_APPLIED",
]);

export const creditMemoStatusEnum = pgEnum("credit_memo_status", [
  "OPEN",
  "CLOSED",
  "VOIDED",
]);
export const creditMemoEntityTypeEnum = pgEnum("credit_memo_entity_type", [
  "INVOICE",
  "RECEIPT",
]);

export const vendorsCreditEntityTypeEnum = pgEnum(
  "vendors_credit_entity_type",
  ["BILL"]
);

export const creditMemos = pgTable("credit_memos", {
  id: serial("id").primaryKey(),
  creditMemoNumber: varchar("credit_memo_number", { length: 255 }).notNull(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
  // creditMemoType: creditMemoTypeEnum("credit_memo_type").notNull(),
  creditMemoType: creditMemoTypeEnum("credit_memo_type_enum").notNull(),
  relatedEntityId: integer("related_entity_id"), // Nullable, only for ITEM_BASED linked to invoice/receipt
  entityTypeEnum: creditMemoEntityTypeEnum("credit_memo_entity_type"),
  generalCreditAccountId: integer("general_credit_account_id").references(
    () => accounts.id
  ), // Nullable, only for GENERAL type
  creditMemoDate: date("credit_memo_date").notNull(),
  status: creditMemoStatusEnum("status").default("OPEN").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", {
    precision: 15,
    scale: 2,
  }).notNull(),
  memo: text("memo"),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditMemoApplications = pgTable("credit_memo_applications", {
  id: serial("id").primaryKey(),
  creditMemoId: integer("credit_memo_id")
    .references(() => creditMemos.id, { onDelete: "cascade" })
    .notNull(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.invoiceId, { onDelete: "cascade" }),
  applicationDate: date("application_date").notNull(),
  amountApplied: decimal("amount_applied", {
    precision: 15,
    scale: 2,
  }).notNull(),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditMemoItems = pgTable("credit_memo_items", {
  id: serial("id").primaryKey(),
  creditMemoId: integer("credit_memo_id")
    .references(() => creditMemos.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.productId),
  accountId: integer("account_id").references(() => accounts.id),
  quantity: numeric("quantity"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditMemosRelations = relations(creditMemos, ({ one, many }) => ({
  customer: one(customers, {
    fields: [creditMemos.customerId],
    references: [customers.id],
  }),
  invoice: one(invoices, {
    fields: [creditMemos.relatedEntityId],
    references: [invoices.invoiceId],
  }),
  receipt: one(receipts, {
    fields: [creditMemos.relatedEntityId],
    references: [receipts.receiptId],
  }),
  account: one(accounts, {
    fields: [creditMemos.generalCreditAccountId],
    references: [accounts.id],
  }),
  items: many(creditMemoItems),
  refunds: many(customerRefunds),
  applications: many(creditMemoApplications),
}));
export const creditMemoApplicationsRelations = relations(
  creditMemoApplications,
  ({ one }) => ({
    creditMemo: one(creditMemos, {
      fields: [creditMemoApplications.creditMemoId],
      references: [creditMemos.id],
    }),
    invoice: one(invoices, {
      fields: [creditMemoApplications.invoiceId],
      references: [invoices.invoiceId],
    }),
  })
);

export const creditMemoItemsRelations = relations(
  creditMemoItems,
  ({ one }) => ({
    creditMemo: one(creditMemos, {
      fields: [creditMemoItems.creditMemoId],
      references: [creditMemos.id],
    }),
    product: one(products, {
      fields: [creditMemoItems.productId],
      references: [products.productId],
    }),
   
  })
);

export const vendorCredits = pgTable("vendor_credit", {
  id: serial("id").primaryKey(),
  vendorCreditNumber: varchar("vendor_credit_number", {
    length: 255,
  }).notNull(),
  vendorId: integer("vendor_id")
    .references(() => vendors.id)
    .notNull(),

  vendorCreditType: creditMemoTypeEnum("vendor_credit_type_enum").notNull(),
  relatedEntityId: integer("related_entity_id"), // Nullable, only for ITEM_BASED linked to invoice/receipt
  entityTypeEnum: vendorsCreditEntityTypeEnum("vendors_credit_entity_type"),
  generalCreditAccountId: integer("general_credit_account_id").references(
    () => accounts.id
  ), // Nullable, only for GENERAL type
  vendorCreditDate: date("vendor_credit_date").notNull(),
  status: creditMemoStatusEnum("status").default("OPEN").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", {
    precision: 15,
    scale: 2,
  }).notNull(),
  memo: text("memo"),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorCreditApplications = pgTable("vendor_credit_applications", {
  id: serial("id").primaryKey(),
  vendorCreditId: integer("vendor_credit_id")
    .references(() => vendorCredits.id, { onDelete: "cascade" })
    .notNull(),
  billId: integer("bill_id")
    .references(() => bills.id, { onDelete: "cascade" })
    .notNull(),
  applicationDate: date("application_date").notNull(),
  amountApplied: decimal("amount_applied", {
    precision: 15,
    scale: 2,
  }).notNull(),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorCreditItems = pgTable("vendor_credit_items", {
  id: serial("id").primaryKey(),
  VendorcreditId: integer("vendor_credit_id")
    .references(() => vendorCredits.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.productId),
  accountId: integer("account_id").references(() => accounts.id),
  quantity: numeric("quantity"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorCreditRelations = relations(
  vendorCredits,
  ({ one, many }) => ({
    vendor: one(vendors, {
      fields: [vendorCredits.vendorId],
      references: [vendors.id],
    }),
    bill: one(bills, {
      fields: [vendorCredits.relatedEntityId],
      references: [bills.id],
    }),
    account: one(accounts, {
      fields: [vendorCredits.generalCreditAccountId],
      references: [accounts.id],
    }),
    items: many(vendorCreditItems),

    applications: many(vendorCreditApplications),
  })
);
export const vendorCreditApplicationsRelations = relations(
  vendorCreditApplications,
  ({ one }) => ({
    vendorCredit: one(vendorCredits, {
      fields: [vendorCreditApplications.vendorCreditId],
      references: [vendorCredits.id],
    }),
    bills: one(bills, {
      fields: [vendorCreditApplications.billId],
      references: [bills.id],
    }),
  })
);

export const vendorCreditItemsRelations = relations(
  vendorCreditItems,
  ({ one }) => ({
    vendorCredit: one(vendorCredits, {
      fields: [vendorCreditItems.VendorcreditId],
      references: [vendorCredits.id],
    }),
    product: one(products, {
      fields: [vendorCreditItems.productId],
      references: [products.productId],
    }),
  })
);

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  key: varchar("key", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    isDefault: boolean("is_default").default(false),
    key: varchar("key", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    orgsId: varchar("org_id", { length: 255 }).references(
      () => organizations.id
    ),
  },
  (table) => {
    return {
      keyOrgUnique: uniqueIndex("key_org_unique").on(table.key, table.orgsId),
    };
  }
);

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  permissionId: integer("permission_id")
    .references(() => permissions.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  orgsId: varchar("org_id", { length: 255 }).references(() => organizations.id),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  roleId: integer("role_id")
    .references(() => roles.id, { onDelete: "cascade" })
    .notNull(),
  organizationMemberId: integer("organization_member_id").references(
    () => organizationMembers.id,
    { onDelete: "cascade" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  orgsId: varchar("org_id", { length: 255 }).references(() => organizations.id),
});
// export const paymentReferenceType = pgEnum("payment_reference_type", [
//   "invoice",
//   "bill",
//   "purchase_order",
//   "credit_note",
//   "debit_note",
// ]);

// export type paymentReferenceType =
//   (typeof paymentReferenceType.enumValues)[number];

export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];


export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified"),
  imageUrl: text("image_url"),
  externalId: varchar("external_id", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fiscalYearStatusEnum = pgEnum("fiscal_year_status", [
  "OPEN",
  "LOCKED"
]);


export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  costingMethod: costingMethodEnum("costing_method"),
  imageUrl: text("image_url"),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isInventoryActive: boolean("is_inventory_active").default(false).notNull(),
  inventoryActivatedAt: timestamp("inventory_activated_at"),
  address: text("address"),
  industry: varchar("industry", { length: 255 }),
  foundedYear: integer("founded_year"),
  description: text("description"),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }),
  timeZone: varchar("time_zone", { length: 50 }),
  accountingMethod: varchar("accounting_method", { length: 50 }),
  preferredCurrency: currencyTypeEnum("preferred_currency"),
  fiscalYearStartMonth: integer("fiscal_year_start_month"), // 1-12
  fiscalYearStartDay: integer("fiscal_year_start_day"), // 1-31
  closedThrough: date("closed_through"),
  fiscalYearStatus: fiscalYearStatusEnum("fiscal_year_status").default("OPEN"),
  fiscalYearClosedAt: timestamp("fiscal_year_closed_at"),
  fiscalYearClosedBy: varchar("fiscal_year_closed_by", { length: 255 }).references(() => users.id),
  fiscalYearPassword: varchar("fiscal_year_password", { length: 255 }),
});
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id, {
      onDelete: "cascade",
    }),

  invitedBy: varchar("invited_by", { length: 255 }).references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isOwner: boolean("is_owner").default(false).notNull(),
});

export type UserType = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => accountCategories.id),
  isActive: boolean("is_active").default(true),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  balance: integer("balance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  orgsId: text("orgId"),
  userId: text("userId"),
});

export const accountConfigurations = pgTable("account_configurations", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  configType: text("config_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  orgsId: text("orgId"),
});

export const accountCategories = pgTable("account_categories", {
  id: serial("id").primaryKey(),
  type: accountTypeEnum("type").notNull(),
  code: varchar("code", { length: 4 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
});

export type accountsTypes = typeof accountCategories.$inferInsert;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description"),
  documentType: text("document_type"), // e.g., 'invoice', 'expense', 'receipt'
  documentId: integer("document_id"),
  documentReference: text("document_reference"),
  userId: text("user_id"),
  orgsId: text("org_id"),
  date: date("date").notNull(),
  createdAt: date("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id)
    .notNull(),
  date: date("date").notNull(),
  type: entryTypeEnum("entryType").notNull(), // 'DEBIT', 'CREDIT'
  amount: decimal("amount", { precision: 15, scale: 2 })
    .default("0.00")
    .notNull(),
  userId: text("user_id"),
  orgsId: text("org_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const manualJournal = pgTable("manual_journal", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  userId: text("user_id"),
  orgsId: text("org_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  invoiceId: serial("invoice_id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  invoiceDate: date("invoice_date").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  isActive: boolean("is_active").default(true),
  dueDate: date("due_date"),
  status: statusEnum("status"),
  userId: text("user_id"),
  orgsId: text("org_id"),
  total: decimal("total", { precision: 15, scale: 2 }),
  dueBalance: decimal("due_balance", { precision: 15, scale: 2 }),
  inventoryId: integer("inventory_id").references(() => inventories.id, {
    onDelete: "cascade",
  }),
  isVoided: boolean("is_voided").default(false),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidedBy: text("voided_by"),
});

export const Payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentAccountId: integer("payment_account_id")
    .references(() => accounts.id)
    .notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  invoiceId: integer("invoice_id")
    .references(() => invoices.invoiceId, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  orgsId: text("org_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bills = pgTable(
  "bills",
  {
    id: serial("id").primaryKey().notNull(),
    vendorId: serial("vendor_id")
      .references(() => vendors.id, {
        onDelete: "cascade",
      })
      .notNull(),
    billNumber: varchar("bill_number", { length: 255 }).notNull(),
    purchaseOrderId: integer("purchase_order_id").references(
      () => purchaseOrders.id
    ),
    unBilledItemReceiptId: integer("un_billed_item_receipt_id").references(
      () => unbilledItemReceipts.id
    ),

    billDate: date("bill_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: billEnum("status"),
    description: text("description").notNull(),
    total: decimal("total", { precision: 15, scale: 2 }).notNull(),
    dueBalance: decimal("due_balance", { precision: 15, scale: 2 }),
    orgsId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      billSourceCheckNotBothPresent: check(
        "bill_source_not_both",
        sql`((${table.purchaseOrderId} IS NOT NULL)::int + (${table.unBilledItemReceiptId} IS NOT NULL)::int) <= 1`
      ),
    };
  }
);

export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey().notNull(),
  billId: integer("bill_id")
    .references(() => bills.id, {
      onDelete: "cascade",
    })
    .notNull(),
  productId: integer("product_id")
    .references(() => products.productId, {
      onDelete: "cascade",
    })
    .notNull(),
  batchId: integer("batch_id").references(() => inventoryBatches.id, {
    onDelete: "cascade",
  }),

  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billExpenseLines = pgTable("bill_expense_lines", {
  id: serial("id").primaryKey().notNull(),
  billId: integer("bill_id")
    .references(() => bills.id, {
      onDelete: "cascade",
    })
    .notNull(),
  accountId: integer("account_id")
    .references(() => accounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  expenseAmount: decimal("expense_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billExpenseLinesRelations = relations(
  billExpenseLines,
  ({ one }) => ({
    bill: one(bills, {
      fields: [billExpenseLines.billId],
      references: [bills.id],
    }),
    account: one(accounts, {
      fields: [billExpenseLines.accountId],
      references: [accounts.id],
    }),
  })
);

export const RecordPayments = pgTable("record_payments", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("paymentMethod").notNull(),
  paymentAccountId: integer("payment_account_id")
    .references(() => accounts.id)
    .notNull(),
  // referenceType: paymentReferenceType("reference_type"),
  billId: integer("bill_id")
    .references(() => bills.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(),
  orgsId: text("org_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecordPayment = typeof RecordPayments.$inferInsert;
// export type RecordPayment = InferModel<typeof RecordPayments>;
export const invoiceItem = pgTable("invoice_Item", {
  item_id: serial("item_id").primaryKey(),
  productId: integer("product_id").references(() => products.productId, {
    onDelete: "cascade",
  }),
  batchId: integer("batch_id").references(() => inventoryBatches.id, {
    onDelete: "cascade",
  }),
  product_name: text("product_name"),
  quantity: numeric("quantity"),
  unit_price: decimal("unit_price", { precision: 15, scale: 2 }),
  invoiceId: integer("invoice_id")
    .references(() => invoices.invoiceId, { onDelete: "cascade" })
    .notNull(),
});

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    customerNo: varchar("customer_no", { length: 255 }).notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    address: text("address").notNull(),
    orgsId: text("orgsId").notNull(),
    userId: text("userId").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      uniqueEmailPerOrg: uniqueIndex("unique_email_per_org_index").on(
        table.email,
        table.orgsId
      ),
    };
  }
);

export const customerPrepayments = pgTable("customer_prepayments", {
  id: serial("id").primaryKey(),
  customerPrepaymentNo: varchar("customer_prepayment_no", {
    length: 255,
  }).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", {
    precision: 15,
    scale: 2,
  }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  memo: text("memo"),
  paymentAccountId: integer("payment_account_id").references(() => accounts.id),
  status: prepaymentStatusEnum("status").default("AVAILABLE"),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerPrepaymentsRelations = relations(
  customerPrepayments,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerPrepayments.customerId],
      references: [customers.id],
    }),
    paymentAccount: one(accounts, {
      fields: [customerPrepayments.paymentAccountId],
      references: [accounts.id],
    }),
  })
);

export const customerPrepaymentApplications = pgTable(
  "customer_prepayment_applications",
  {
    id: serial("id").primaryKey(),
    prepaymentId: integer("prepayment_id").references(
      () => customerPrepayments.id
    ),
    invoiceId: integer("invoice_id").references(() => invoices.invoiceId),
    appliedAmount: decimal("applied_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    applicationDate: date("application_date").notNull(),
    orgsId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const receipts = pgTable("receipts", {
  receiptId: serial("receipt_id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  receiptDate: date("receipt_date").notNull(),
  status: statusEnum("status"),
  isActive: boolean("is_active").default(true),
  receiptNumber: text("receipt_number").notNull(),
  userId: text("user_id"),
  orgsId: text("org_id"),
  total: decimal("total", { precision: 15, scale: 2 }),
  inventoryId: integer("inventory_id").references(() => inventories.id),
  isVoided: boolean("is_voided").default(false),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidedBy: text("voided_by"),
});

export const receiptItem = pgTable("receipt_Item", {
  item_id: serial("item_id").primaryKey(),
  product_name: text("product_name"),
  productId: integer("product_id").references(() => products.productId, {
    onDelete: "cascade",
  }),
  quantity: numeric("quantity"),
  unit_price: decimal("unit_price", { precision: 15, scale: 2 }),
  receiptId: integer("receipt_id")
    .references(() => receipts.receiptId, { onDelete: "cascade" })
    .notNull(),
  batchId: integer("batch_id").references(() => inventoryBatches.id, {
    onDelete: "cascade",
  }),
});

export const unbilledItemReceipts = pgTable("unbilled_item_receipts", {
  id: serial("id").primaryKey(),
  unBilledNumber: text("unbilled_number").notNull(),
  vendorId: serial("vendor_id")
    .references(() => vendors.id, {
      onDelete: "cascade",
    })
    .notNull(),
  purchaseOrderId: integer("purchase_order_id")
    .references(() => purchaseOrders.id, {
      onDelete: "cascade",
    })
    .notNull(),
  status: text("status", { enum: ["unbilled", "billed"] })
    .default("unbilled")
    .notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  liabilityAccountId: serial("liablity_account_id")
    .references(() => accounts.id)
    .notNull(),
  inventoryAccountId: integer("inventory_account_id").references(
    () => accounts.id
  ),
  receivedDate: date("received_date").notNull(),
  notes: text("notes"),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const unbilledItemReceiptExpenseLines = pgTable(
  "unbilled_item_receipt_expense_lines",
  {
    id: serial("id").primaryKey().notNull(),
    unbilledItemReceiptId: integer("unbilled_item_receipt_id")
      .references(() => unbilledItemReceipts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    expenseAccountId: integer("expense_account_id")
      .references(() => accounts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    expenseAmount: decimal("expense_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const unbilledItemReceiptExpenseLinesRelations = relations(
  unbilledItemReceiptExpenseLines,
  ({ one }) => ({
    unbilledItemReceipt: one(unbilledItemReceipts, {
      fields: [unbilledItemReceiptExpenseLines.unbilledItemReceiptId],
      references: [unbilledItemReceipts.id],
    }),
    expenseAccount: one(accounts, {
      fields: [unbilledItemReceiptExpenseLines.expenseAccountId],
      references: [accounts.id],
    }),
  })
);

export const unbilledItemReceiptsRelations = relations(
  unbilledItemReceipts,
  ({ one, many }) => ({
    vendor: one(vendors, {
      fields: [unbilledItemReceipts.vendorId],
      references: [vendors.id],
    }),
    purchaseOrder: one(purchaseOrders, {
      fields: [unbilledItemReceipts.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    liabilityAccount: one(accounts, {
      fields: [unbilledItemReceipts.liabilityAccountId],
      references: [accounts.id],
    }),
    expenseLines: many(unbilledItemReceiptExpenseLines),
  })
);

export const products = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  productNumber: text("product_number").notNull(),
  isActive: boolean("is_active").default(true),
  productName: text("product_name").unique(),
  productType: productTypeEnum("product_type"),
  sellingPrice: decimal("selling_price", { precision: 15, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 15, scale: 2 }),
  vendorId: integer("vendor_id")
    .references(() => vendors.id)
    .notNull(),

  status: inventoryTypeEnum("status"),
  incomeAccountId: integer("income_account_id").references(() => accounts.id),

  inventoryAssetAccountId: integer("inventory_asset_account_id").references(
    () => accounts.id
  ),
  cogsAccountId: integer("cogs_account_id").references(() => accounts.id),
  // inventoryId: integer("inventory_id").references(() => inventories.id),
  orgsId: text("orgsId"),
  userId: text("userId"),
  unitOfMeasure: unitOfMeasureEnum("unit_of_measure"),
});

export const inventoryBatches = pgTable("inventoryBatches", {
  id: serial("id").primaryKey(),
  productId: integer("productId").references(() => products.productId),
  quantity: integer("quantity").notNull(),
  costPrice: decimal("costPrice", { precision: 15, scale: 2 }).notNull(),
  expiryDate: date("expiry_date"),
  purchaseOrderItemId: integer("purchase_order_item_id").references(
    () => purchaseOrderItems.id
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const waitingList = pgTable("waiting_list", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  phone: text("phone"),
  company: text("company").notNull(),
  companySize: text("company_size").notNull(),
  hearAboutUs: text("hear_about_us"),
  subscriptionType: subsEnum("subscription_type").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
//inevntoryBatchesrelations
export const inventoryBatchesRelations = relations(
  inventoryBatches,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryBatches.productId],
      references: [products.productId],
    }),
  })
);

export const invoiceData = pgTable("invoice_data", {
  data_id: serial("data_id").primaryKey(),
  user_name: text("product_name"),
  orgsId: text("orgsId"),
  userId: text("userId"),
  invoiceNumber: numeric("invoice_number"),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  orgsId: text("org_id").references(() => organizations.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  userName: text("user_name"),
  action: auditEnum("audit").notNull(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  imgUrl: text("img_url"),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  vendorNo: varchar("vendor_no", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  country: varchar("country", { length: 100 }).notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  orgsId: text("orgsId"),
  userId: text("userId"),
});

export const vendorPrepayments = pgTable("vendor_prepayments", {
  id: serial("id").primaryKey(),
  vendorPrepaymentNo: varchar("vendor_prepayment_no", {
    length: 255,
  }).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", {
    precision: 15,
    scale: 2,
  }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  memo: text("memo"),
  paymentAccountId: integer("payment_account_id").references(() => accounts.id),
  status: prepaymentStatusEnum("status").default("AVAILABLE"),
  orgsId: text("org_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendorPrepaymentApplications = pgTable(
  "vendor_prepayment_applications",
  {
    id: serial("id").primaryKey(),
    prepaymentId: integer("prepayment_id").references(
      () => vendorPrepayments.id
    ),
    billId: integer("bill_id").references(() => bills.id),
    appliedAmount: decimal("applied_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    applicationDate: date("application_date").notNull(),
    orgsId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  }
);

export const vendorPrepaymentsRelations = relations(
  vendorPrepayments,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [vendorPrepayments.vendorId],
      references: [vendors.id],
    }),
    paymentAccount: one(accounts, {
      fields: [vendorPrepayments.paymentAccountId],
      references: [accounts.id],
    }),
  })
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: serial("id").primaryKey(),
    vendorId: serial("vendor_id").references(() => vendors.id, {
      onDelete: "cascade",
    }),
    PurchaseOrderNumber: text("purchase_order_number").notNull(),
    orderDate: date("order_date").notNull(),
    expectedDeliveryDate: date("expected_delivery_date"),
    status: purchaseOrderStatus("purchase_order_status")
      .notNull()
      .default("DRAFT"),
    totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
    currency: currencyTypeEnum("currencyType").notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingCountry: varchar("shipping_country", { length: 100 }).notNull(),
    orgsId: text("orgsId").notNull(),
    userId: text("userId").notNull(),
    inventoryId: integer("inventory_id").references(() => inventories.id),
  },
  (table) => {
    return {
      uniquePoperOrg: unique("unique_po_per_org").on(
        table.PurchaseOrderNumber,
        table.orgsId
      ),
    };
  }
);

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: serial("purchase_order_id")
    .references(() => purchaseOrders.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => products.productId),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  receivedQuantity: integer("received_quantity").default(0).notNull(),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey().notNull(),
  expenseNumber: varchar("expense_number", { length: 255 }).notNull(),
  vendorId: serial("vendor_id")
    .references(() => vendors.id, {
      onDelete: "cascade",
    })
    .notNull(),
  paymentAccountId: serial("payment_account_id")
    .references(() => accounts.id)
    .notNull(),
  expenseDate: date("expense_date"),

  description: text("description").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  orgsId: text("orgsId"),
  userId: text("userId"),
  isVoided: boolean("is_voided").default(false),
  voidedAt: timestamp("voided_at"),
  voidedBy: text("voided_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenseLines = pgTable("expense_lines", {
  id: serial("id").primaryKey().notNull(),
  expenseId: integer("expense_id")
    .references(() => expenses.id, {
      onDelete: "cascade",
    })
    .notNull(),
  expenseAccountId: integer("expense_account_id")
    .references(() => accounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  expenseAmount: decimal("expense_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expenseLinesRelations = relations(expenseLines, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseLines.expenseId],
    references: [expenses.id],
  }),
  account: one(accounts, {
    fields: [expenseLines.expenseAccountId],
    references: [accounts.id],
  }),
}));

export const inventories = pgTable("inventories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  manager: varchar("manager", { length: 255 }),
  location: varchar("location", { length: 255 }),
  orgsId: text("orgsId").notNull(),
  userId: text("userId").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Inventory = typeof inventories.$inferSelect;
export type NewInventory = typeof inventories.$inferInsert;

export const inventoryQuantities = pgTable(
  "inventory_quantities",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.productId)
      .notNull(),
    inventoryId: integer("inventory_id")
      .references(() => inventories.id)
      .notNull(),
    quantity: integer("quantity").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    //   return {
    //     productInventoryUnique: unique().on(table.productId, table.inventoryId),
    //   };
    // }
    return {
      productInventoryUnique: uniqueIndex("product_inventory_unique_idx").on(
        table.productId,
        table.inventoryId
      ),
    };
  }
);

export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id")
    .notNull()
    .references(() => inventories.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.productId),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  userId: text("user_id").notNull(),
  orgsId: text("orgs_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: currencyTypeEnum("currency").notNull(),
  duration: integer("duration").notNull(), // Duration in days
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  orgId: varchar("org_id", { length: 255 })
    .references(() => organizations.id, {
      onDelete: "cascade",
    })
    .notNull(),
  planId: integer("plan_id")
    .references(() => subscriptionPlans.id)
    .notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: subscriptionStatusEnum("subscription_status").notNull(),
  subsBillingStatus: subsBillingStatusEnum("subs_billing_status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customerRefunds = pgTable("customer_refunds", {
  id: serial("id").primaryKey(),
  refundNumber: varchar("refund_number", { length: 255 }).notNull(),
  creditMemoId: integer("credit_memo_id")
    .references(() => creditMemos.id)
    .notNull(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),

  refundDate: date("refund_date").notNull(),
  refundAmount: decimal("refund_amount", { precision: 15, scale: 2 }).notNull(),
  paymentAccountId: integer("payment_account_id")
    .references(() => accounts.id)
    .notNull(),
  userId: text("user_id").notNull(),
  orgsId: text("org_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}
);

export const customerRefundsRelations = relations(customerRefunds, ({ one }) => ({
  creditMemo: one(creditMemos, {
    fields: [customerRefunds.creditMemoId],
    references: [creditMemos.id],
  }),
  customer: one(customers, {
    fields: [customerRefunds.customerId],
    references: [customers.id],
  }),
  paymentAccount: one(accounts, {
    fields: [customerRefunds.paymentAccountId],
    references: [accounts.id],
  }),
}));

//expense relations

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [expenses.vendorId],
    references: [vendors.id],
  }),
  paymentAccount: one(accounts, {
    fields: [expenses.paymentAccountId],
    references: [accounts.id],
    relationName: "paymentAccount",
  }),

  expenseLines: many(expenseLines),
}));

//relations
export const subscriptionPlansRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    subscriptions: many(subscriptions),
  })
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.orgId],
    references: [organizations.id],
  }),
  subscriptionPlan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  inventories: many(inventories),

  // products: many(products),
  customers: many(customers),
  vendors: many(vendors),
  purchaseOrders: many(purchaseOrders),
  expenses: many(expenses),
  bills: many(bills),
  invoices: many(invoices),
  receipts: many(receipts),
  subscriptions: many(subscriptions),
  members: many(organizationMembers),
}));
export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [organizationMembers.orgId],
      references: [organizations.id],
    }),
    inviter: one(users, {
      fields: [organizationMembers.invitedBy],
      references: [users.id],
    }),
    userRoles: many(userRoles, { relationName: "memberRoles" }),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  // organization: one(organizations, {
  //   fields: [users.orgsId],
  //   references: [organizations.id],
  // }),
  inventoryAdjustments: many(inventoryAdjustments),
  memberships: many(organizationMembers),
  userRoles: many(userRoles),
}));

export const accountRelations = relations(accounts, ({ many }) => ({
  entries: many(entries),
  accountConfigurations: many(accountConfigurations),
  accountCategories: many(accountCategories),
}));

export const accountConfigurationsRelations = relations(
  accountConfigurations,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountConfigurations.accountId],
      references: [accounts.id],
    }),
    organization: one(organizations, {
      fields: [accountConfigurations.orgsId],
      references: [organizations.id],
    }),
  })
);

export const accountCategoryRelations = relations(
  accountCategories,
  ({ one }) => ({
    account: one(accounts, {
      fields: [accountCategories.id],
      references: [accounts.categoryId],
    }),
  })
);

export const transactionRelations = relations(transactions, ({ many }) => ({
  entries: many(entries),
}));

export const entryRelations = relations(entries, ({ one }) => ({
  account: one(accounts, {
    fields: [entries.accountId],
    references: [accounts.id],
  }),
  transaction: one(transactions, {
    fields: [entries.transactionId],
    references: [transactions.id],
  }),
  accountCategory: one(accountCategories, {
    fields: [entries.accountId],
    references: [accountCategories.id],
  }),
}));

//customer relations

export const customerRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
  receipts: many(receipts),
}));

//invoice relations

export const invoiceRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItem),
  inventoryLocation: one(inventories, {
    fields: [invoices.inventoryId],
    references: [inventories.id],
  }),
  payments: many(Payments),
}));

//payments relations
export const paymentsRelations = relations(Payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [Payments.invoiceId],
    references: [invoices.invoiceId],
  }),
}));

export const invoiceItemRelations = relations(invoiceItem, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItem.invoiceId],
    references: [invoices.invoiceId],
  }),
  product: one(products, {
    fields: [invoiceItem.productId],
    references: [products.productId],
  }),
}));

// export const recordPaymentsRelations = relations(RecordPayments, ({ one }) => ({
//   invoice: one(invoice, {
//     fields: [RecordPayments.referenceId],
//     references: [invoice.invoiceId],
//   }),
// }));

//purchaseorder relations

export const purchaseOrderRelations = relations(
  purchaseOrders,
  ({ many, one }) => ({
    purchaseItems: many(purchaseOrderItems),
    vendors: one(vendors, {
      fields: [purchaseOrders.vendorId],
      references: [vendors.id],
    }),
    inventoryLocation: one(inventories, {
      fields: [purchaseOrders.inventoryId],
      references: [inventories.id],
    }),
  })
);

export const vendorsRelations = relations(vendors, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
  products: many(products),
  bills: many(bills),
  // expenses: many(expenses),
}));

//bills relations

export const billsRelations = relations(bills, ({ many, one }) => ({
  vendor: one(vendors, {
    fields: [bills.vendorId],
    references: [vendors.id],
  }),

  purchaseOrder: one(purchaseOrders, {
    fields: [bills.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  unBilledReceiptItem: one(unbilledItemReceipts, {
    fields: [bills.unBilledItemReceiptId],
    references: [unbilledItemReceipts.id],
  }),
  items: many(billItems),
  expenseLines: many(billExpenseLines),
  RecordPayments: many(RecordPayments),
}));
export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  product: one(products, {
    fields: [billItems.productId],
    references: [products.productId],
  }),
}));

export const recordPaymentsRelations = relations(RecordPayments, ({ one }) => ({
  bill: one(bills, {
    fields: [RecordPayments.billId],
    references: [bills.id],
  }),
  paymentAccount: one(accounts, {
    fields: [RecordPayments.paymentAccountId],
    references: [accounts.id],
  }),
}));

// purchaseOrderItems: many(purchaseOrderItems),

export const purchaseOrderItemRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    product: one(products, {
      fields: [purchaseOrderItems.productId],
      references: [products.productId],
    }),
  })
);

//receipt relations

export const receiptRelations = relations(receipts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [receipts.customerId],
    references: [customers.id],
  }),
  items: many(receiptItem),
  inventoryLocation: one(inventories, {
    fields: [receipts.inventoryId],
    references: [inventories.id],
  }),
}));

export const receiptItemRelations = relations(receiptItem, ({ one }) => ({
  receipt: one(receipts, {
    fields: [receiptItem.receiptId],
    references: [receipts.receiptId],
  }),
  product: one(products, {
    fields: [receiptItem.productId],
    references: [products.productId],
  }),
}));

export const inventoriesRelations = relations(products, ({ many }) => ({
  products: many(products),
  purchaseOrders: many(purchaseOrders),
  receipts: many(receipts),
  invoices: many(invoices),
  inventoryQuantities: many(inventoryQuantities),
  inventoryAdjustments: many(inventoryAdjustments),
}));
export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  incomeAccount: one(accounts, {
    fields: [products.incomeAccountId],
    references: [accounts.id],
  }),
  inventoryAssetAccount: one(accounts, {
    fields: [products.inventoryAssetAccountId],
    references: [accounts.id],
  }),
  cogsAccount: one(accounts, {
    fields: [products.cogsAccountId],
    references: [accounts.id],
  }),
  batches: many(inventoryBatches),
  invoiceItems: many(invoiceItem),
  receiptItems: many(receiptItem),
}));

export const productRelations = relations(inventories, ({ many }) => ({
  // inventory: one(inventories, {
  //   fields: [products.inventoryId],
  //   references: [inventories.id],
  // }),

  inventoryQuantities: many(inventoryQuantities),
  purchaseOrderItems: many(purchaseOrderItems),
  inventoryAdjustments: many(inventoryAdjustments),
}));

export const inventoryQuantitiesRelations = relations(
  inventoryQuantities,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryQuantities.productId],
      references: [products.productId],
    }),
    inventory: one(inventories, {
      fields: [inventoryQuantities.inventoryId],
      references: [inventories.id],
    }),
  })
);

export const inventoryAdjustmentsRelations = relations(
  inventoryAdjustments,
  ({ one }) => ({
    inventory: one(inventories, {
      fields: [inventoryAdjustments.inventoryId],
      references: [inventories.id],
    }),
    product: one(products, {
      fields: [inventoryAdjustments.productId],
      references: [products.productId],
    }),
    user: one(users, {
      fields: [inventoryAdjustments.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [inventoryAdjustments.orgsId],
      references: [organizations.id],
    }),
  })
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLog.orgsId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// Role relations
export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.orgsId],
    references: [organizations.id],
  }),
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

// Permission relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  // organization: one(organizations, {
  //   fields: [permissions.orgsId],
  //   references: [organizations.id],
  // }),
  rolePermissions: many(rolePermissions),
}));

// Role-Permission relations
export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
    organization: one(organizations, {
      fields: [rolePermissions.orgsId],
      references: [organizations.id],
    }),
  })
);

// User-Role relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.orgsId],
    references: [organizations.id],
  }),
  organizationMember: one(organizationMembers, {
    fields: [userRoles.organizationMemberId],
    references: [organizationMembers.id],
  }),
}));