DO $$ BEGIN
 CREATE TYPE "public"."account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'cogs', 'expense');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit" AS ENUM('CREATED', 'UPDATED', 'DELETED', 'VOIDED', 'VIEWED', 'APPROVED', 'REJECTED', 'ARCHIVED', 'RESTORED', 'EXPORTED', 'IMPORTED', 'CONFIGURED', 'DISABLED', 'ENABLED', 'CLOSED', 'APPLIED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."bill_enum" AS ENUM('PAID', 'PARTIALLY', 'UNPAID');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."costing_method" AS ENUM('FIFO', 'LIFO', 'AVERAGE COST');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."credit_memo_entity_type" AS ENUM('INVOICE', 'RECEIPT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."credit_memo_status" AS ENUM('OPEN', 'CLOSED', 'VOIDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."credit_memo_type_enum" AS ENUM('ITEM_BASED', 'GENERAL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."currencyType" AS ENUM('USD', 'ETH', 'SL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."entity_type" AS ENUM('INVOICE', 'RECEIPT', 'REPORT', 'PRODUCT', 'CUSTOMER', 'CUSTOMER_PREPAYMENT', 'VENDOR_PREPAYMENT', 'VENDOR', 'PURCHASE_ORDER', 'EXPENSE', 'PAYMENT_MADE', 'INVENTORY_ADJUSTMENT', 'PAYMENT_RECEIVED', 'ACCOUNT', 'JOURNAL_ENTRY', 'TAX_RATE', 'USER', 'ROLE', 'PERMISSION', 'SETTING', 'ORGANIZATION', 'FISCAL_YEAR', 'BANK_ACCOUNT', 'CATEGORY', 'SUBSCRIPTION', 'DOCUMENT', 'REFUND', 'BILL', 'BILL_FROM_PO', 'UNBILLED_ITEM_RECEIPT', 'CREDIT_MEMO', 'VENDOR_CREDIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."entryType" AS ENUM('DEBIT', 'CREDIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."expense_status" AS ENUM('paid', 'unpaid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."fiscal_year_status" AS ENUM('OPEN', 'LOCKED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."inventory_status" AS ENUM('ACTIVE', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."inventoryType" AS ENUM('AVAILABLE', 'OUT OF STOCK');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."organization_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'BANK_TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."prepayment_status" AS ENUM('AVAILABLE', 'PARTIALLY_APPLIED', 'FULLY_APPLIED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."product_type" AS ENUM('inventoryPart', 'nonInventory', 'service');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."purchase_order_status" AS ENUM('DRAFT', 'PARTIALLY RECEIVED', 'FULLY RECEIVED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."refund_entity_type" AS ENUM('INVOICE', 'RECEIPT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('pending', 'paid', 'overdue', 'partial', 'voided');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subs_billing_status" AS ENUM('paid', 'pending', 'failed', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subsEnum" AS ENUM('Basic', 'Professional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."unit_of_measure" AS ENUM('kg', 'g', 'meter', 'liter', 'hour', 'day', 'box', 'piece');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."vendors_credit_entity_type" AS ENUM('BILL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_id" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"payment_account_id" integer NOT NULL,
	"paymentMethod" "payment_method" NOT NULL,
	"invoice_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "record_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_id" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"paymentMethod" "payment_method" NOT NULL,
	"payment_account_id" integer NOT NULL,
	"bill_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "account_type" NOT NULL,
	"code" varchar(4) NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "account_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer,
	"config_type" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"orgId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"is_active" boolean DEFAULT true,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"balance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"orgId" text,
	"userId" text,
	CONSTRAINT "accounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" text,
	"user_id" text,
	"user_name" text,
	"audit" "audit" NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"details" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"img_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bill_expense_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"expense_amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"batch_id" integer,
	"quantity" integer NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" serial NOT NULL,
	"bill_number" varchar(255) NOT NULL,
	"purchase_order_id" integer,
	"un_billed_item_receipt_id" integer,
	"bill_date" date NOT NULL,
	"due_date" date NOT NULL,
	"status" "bill_enum",
	"description" text NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"due_balance" numeric(15, 2),
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_memo_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_memo_id" integer NOT NULL,
	"invoice_id" integer,
	"application_date" date NOT NULL,
	"amount_applied" numeric(15, 2) NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_memo_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_memo_id" integer NOT NULL,
	"product_id" integer,
	"account_id" integer,
	"quantity" numeric,
	"unit_price" numeric(15, 2),
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_memos" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_memo_number" varchar(255) NOT NULL,
	"customer_id" integer NOT NULL,
	"credit_memo_type_enum" "credit_memo_type_enum" NOT NULL,
	"related_entity_id" integer,
	"credit_memo_entity_type" "credit_memo_entity_type",
	"general_credit_account_id" integer,
	"credit_memo_date" date NOT NULL,
	"status" "credit_memo_status" DEFAULT 'OPEN' NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"remaining_balance" numeric(15, 2) NOT NULL,
	"memo" text,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_prepayment_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"prepayment_id" integer,
	"invoice_id" integer,
	"applied_amount" numeric(15, 2) NOT NULL,
	"application_date" date NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_prepayments" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_prepayment_no" varchar(255) NOT NULL,
	"customer_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"remaining_balance" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"memo" text,
	"payment_account_id" integer,
	"status" "prepayment_status" DEFAULT 'AVAILABLE',
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"refund_number" varchar(255) NOT NULL,
	"credit_memo_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"refund_date" date NOT NULL,
	"refund_amount" numeric(15, 2) NOT NULL,
	"payment_account_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_no" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text NOT NULL,
	"orgsId" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"date" date NOT NULL,
	"entryType" "entryType" NOT NULL,
	"amount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_id" integer NOT NULL,
	"expense_account_id" integer NOT NULL,
	"expense_amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_number" varchar(255) NOT NULL,
	"vendor_id" serial NOT NULL,
	"payment_account_id" serial NOT NULL,
	"expense_date" date,
	"description" text NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"orgsId" text,
	"userId" text,
	"is_voided" boolean DEFAULT false,
	"voided_at" timestamp,
	"voided_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"manager" varchar(255),
	"location" varchar(255),
	"orgsId" text NOT NULL,
	"userId" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_adjustments" (
	"id" serial PRIMARY KEY NOT NULL,
	"inventory_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text NOT NULL,
	"user_id" text NOT NULL,
	"orgs_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventoryBatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"quantity" integer NOT NULL,
	"costPrice" numeric(15, 2) NOT NULL,
	"expiry_date" date,
	"purchase_order_item_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_quantities" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"inventory_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_data" (
	"data_id" serial PRIMARY KEY NOT NULL,
	"product_name" text,
	"orgsId" text,
	"userId" text,
	"invoice_number" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_Item" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"batch_id" integer,
	"product_name" text,
	"quantity" numeric,
	"unit_price" numeric(15, 2),
	"invoice_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"invoice_id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"invoice_date" date NOT NULL,
	"invoice_number" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"due_date" date,
	"status" "status",
	"user_id" text,
	"org_id" text,
	"total" numeric(15, 2),
	"due_balance" numeric(15, 2),
	"inventory_id" integer,
	"is_voided" boolean DEFAULT false,
	"voided_at" timestamp with time zone,
	"voided_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manual_journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"date" date NOT NULL,
	"description" text NOT NULL,
	"user_id" text,
	"org_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"org_id" text NOT NULL,
	"invited_by" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"costing_method" "costing_method",
	"image_url" text,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_inventory_active" boolean DEFAULT false NOT NULL,
	"inventory_activated_at" timestamp,
	"address" text,
	"industry" varchar(255),
	"founded_year" integer,
	"description" text,
	"email" varchar(255),
	"phone" varchar(50),
	"website" varchar(255),
	"business_type" varchar(100),
	"company_size" varchar(50),
	"time_zone" varchar(50),
	"accounting_method" varchar(50),
	"preferred_currency" "currencyType",
	"fiscal_year_start_month" integer,
	"fiscal_year_start_day" integer,
	"closed_through" date,
	"fiscal_year_status" "fiscal_year_status" DEFAULT 'OPEN',
	"fiscal_year_closed_at" timestamp,
	"fiscal_year_closed_by" varchar(255),
	"fiscal_year_password" varchar(255),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"key" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"product_id" serial PRIMARY KEY NOT NULL,
	"product_number" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"product_name" text,
	"product_type" "product_type",
	"selling_price" numeric(15, 2) NOT NULL,
	"cost_price" numeric(15, 2),
	"vendor_id" integer NOT NULL,
	"status" "inventoryType",
	"income_account_id" integer,
	"inventory_asset_account_id" integer,
	"cogs_account_id" integer,
	"orgsId" text,
	"userId" text,
	"unit_of_measure" "unit_of_measure",
	CONSTRAINT "products_product_name_unique" UNIQUE("product_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_order_id" serial NOT NULL,
	"product_id" integer,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"received_quantity" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" serial NOT NULL,
	"purchase_order_number" text NOT NULL,
	"order_date" date NOT NULL,
	"expected_delivery_date" date,
	"purchase_order_status" "purchase_order_status" DEFAULT 'DRAFT' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"currencyType" "currencyType" NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_city" varchar(100) NOT NULL,
	"shipping_country" varchar(100) NOT NULL,
	"orgsId" text NOT NULL,
	"userId" text NOT NULL,
	"inventory_id" integer,
	CONSTRAINT "unique_po_per_org" UNIQUE("purchase_order_number","orgsId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipt_Item" (
	"item_id" serial PRIMARY KEY NOT NULL,
	"product_name" text,
	"product_id" integer,
	"quantity" numeric,
	"unit_price" numeric(15, 2),
	"receipt_id" integer NOT NULL,
	"batch_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipts" (
	"receipt_id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"receipt_date" date NOT NULL,
	"status" "status",
	"is_active" boolean DEFAULT true,
	"receipt_number" text NOT NULL,
	"user_id" text,
	"org_id" text,
	"total" numeric(15, 2),
	"inventory_id" integer,
	"is_voided" boolean DEFAULT false,
	"voided_at" timestamp with time zone,
	"voided_by" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"org_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"key" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"org_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"currency" "currencyType" NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"plan_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"subscription_status" "subscription_status" NOT NULL,
	"subs_billing_status" "subs_billing_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"document_type" text,
	"document_id" integer,
	"document_reference" text,
	"user_id" text,
	"org_id" text,
	"date" date NOT NULL,
	"created_at" date DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unbilled_item_receipt_expense_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"unbilled_item_receipt_id" integer NOT NULL,
	"expense_account_id" integer NOT NULL,
	"expense_amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unbilled_item_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"unbilled_number" text NOT NULL,
	"vendor_id" serial NOT NULL,
	"purchase_order_id" integer NOT NULL,
	"status" text DEFAULT 'unbilled' NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"liablity_account_id" serial NOT NULL,
	"inventory_account_id" integer,
	"received_date" date NOT NULL,
	"notes" text,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role_id" integer NOT NULL,
	"organization_member_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"org_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"username" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"image_url" text,
	"external_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_credit_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_credit_id" integer NOT NULL,
	"bill_id" integer NOT NULL,
	"application_date" date NOT NULL,
	"amount_applied" numeric(15, 2) NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_credit_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_credit_id" integer NOT NULL,
	"product_id" integer,
	"account_id" integer,
	"quantity" numeric,
	"unit_price" numeric(15, 2),
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_credit" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_credit_number" varchar(255) NOT NULL,
	"vendor_id" integer NOT NULL,
	"vendor_credit_type_enum" "credit_memo_type_enum" NOT NULL,
	"related_entity_id" integer,
	"vendors_credit_entity_type" "vendors_credit_entity_type",
	"general_credit_account_id" integer,
	"vendor_credit_date" date NOT NULL,
	"status" "credit_memo_status" DEFAULT 'OPEN' NOT NULL,
	"total" numeric(15, 2) NOT NULL,
	"remaining_balance" numeric(15, 2) NOT NULL,
	"memo" text,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_prepayment_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"prepayment_id" integer,
	"bill_id" integer,
	"applied_amount" numeric(15, 2) NOT NULL,
	"application_date" date NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendor_prepayments" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_prepayment_no" varchar(255) NOT NULL,
	"vendor_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"remaining_balance" numeric(15, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"memo" text,
	"payment_account_id" integer,
	"status" "prepayment_status" DEFAULT 'AVAILABLE',
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_no" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"country" varchar(100) NOT NULL,
	"address" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"orgsId" text,
	"userId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waiting_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"phone" text,
	"company" text NOT NULL,
	"company_size" text NOT NULL,
	"hear_about_us" text,
	"subscription_type" "subsEnum" NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "record_payments" ADD CONSTRAINT "record_payments_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "record_payments" ADD CONSTRAINT "record_payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_configurations" ADD CONSTRAINT "account_configurations_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_category_id_account_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."account_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bill_expense_lines" ADD CONSTRAINT "bill_expense_lines_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bill_expense_lines" ADD CONSTRAINT "bill_expense_lines_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_batch_id_inventoryBatches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventoryBatches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bills" ADD CONSTRAINT "bills_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bills" ADD CONSTRAINT "bills_un_billed_item_receipt_id_unbilled_item_receipts_id_fk" FOREIGN KEY ("un_billed_item_receipt_id") REFERENCES "public"."unbilled_item_receipts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memo_applications" ADD CONSTRAINT "credit_memo_applications_credit_memo_id_credit_memos_id_fk" FOREIGN KEY ("credit_memo_id") REFERENCES "public"."credit_memos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memo_applications" ADD CONSTRAINT "credit_memo_applications_invoice_id_invoices_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memo_items" ADD CONSTRAINT "credit_memo_items_credit_memo_id_credit_memos_id_fk" FOREIGN KEY ("credit_memo_id") REFERENCES "public"."credit_memos"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memo_items" ADD CONSTRAINT "credit_memo_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memo_items" ADD CONSTRAINT "credit_memo_items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memos" ADD CONSTRAINT "credit_memos_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "credit_memos" ADD CONSTRAINT "credit_memos_general_credit_account_id_accounts_id_fk" FOREIGN KEY ("general_credit_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_prepayment_applications" ADD CONSTRAINT "customer_prepayment_applications_prepayment_id_customer_prepayments_id_fk" FOREIGN KEY ("prepayment_id") REFERENCES "public"."customer_prepayments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_prepayment_applications" ADD CONSTRAINT "customer_prepayment_applications_invoice_id_invoices_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_prepayments" ADD CONSTRAINT "customer_prepayments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_prepayments" ADD CONSTRAINT "customer_prepayments_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_refunds" ADD CONSTRAINT "customer_refunds_credit_memo_id_credit_memos_id_fk" FOREIGN KEY ("credit_memo_id") REFERENCES "public"."credit_memos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_refunds" ADD CONSTRAINT "customer_refunds_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_refunds" ADD CONSTRAINT "customer_refunds_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entries" ADD CONSTRAINT "entries_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entries" ADD CONSTRAINT "entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_lines" ADD CONSTRAINT "expense_lines_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expense_lines" ADD CONSTRAINT "expense_lines_expense_account_id_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventoryBatches" ADD CONSTRAINT "inventoryBatches_productId_products_product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventoryBatches" ADD CONSTRAINT "inventoryBatches_purchase_order_item_id_purchase_order_items_id_fk" FOREIGN KEY ("purchase_order_item_id") REFERENCES "public"."purchase_order_items"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_quantities" ADD CONSTRAINT "inventory_quantities_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_quantities" ADD CONSTRAINT "inventory_quantities_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_Item" ADD CONSTRAINT "invoice_Item_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_Item" ADD CONSTRAINT "invoice_Item_batch_id_inventoryBatches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventoryBatches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_Item" ADD CONSTRAINT "invoice_Item_invoice_id_invoices_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("invoice_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "manual_journal" ADD CONSTRAINT "manual_journal_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organizations" ADD CONSTRAINT "organizations_fiscal_year_closed_by_users_id_fk" FOREIGN KEY ("fiscal_year_closed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_income_account_id_accounts_id_fk" FOREIGN KEY ("income_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_inventory_asset_account_id_accounts_id_fk" FOREIGN KEY ("inventory_asset_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_cogs_account_id_accounts_id_fk" FOREIGN KEY ("cogs_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipt_Item" ADD CONSTRAINT "receipt_Item_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipt_Item" ADD CONSTRAINT "receipt_Item_receipt_id_receipts_receipt_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("receipt_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipt_Item" ADD CONSTRAINT "receipt_Item_batch_id_inventoryBatches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventoryBatches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_inventory_id_inventories_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roles" ADD CONSTRAINT "roles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipt_expense_lines" ADD CONSTRAINT "unbilled_item_receipt_expense_lines_unbilled_item_receipt_id_unbilled_item_receipts_id_fk" FOREIGN KEY ("unbilled_item_receipt_id") REFERENCES "public"."unbilled_item_receipts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipt_expense_lines" ADD CONSTRAINT "unbilled_item_receipt_expense_lines_expense_account_id_accounts_id_fk" FOREIGN KEY ("expense_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipts" ADD CONSTRAINT "unbilled_item_receipts_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipts" ADD CONSTRAINT "unbilled_item_receipts_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipts" ADD CONSTRAINT "unbilled_item_receipts_liablity_account_id_accounts_id_fk" FOREIGN KEY ("liablity_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "unbilled_item_receipts" ADD CONSTRAINT "unbilled_item_receipts_inventory_account_id_accounts_id_fk" FOREIGN KEY ("inventory_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_member_id_organization_members_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit_applications" ADD CONSTRAINT "vendor_credit_applications_vendor_credit_id_vendor_credit_id_fk" FOREIGN KEY ("vendor_credit_id") REFERENCES "public"."vendor_credit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit_applications" ADD CONSTRAINT "vendor_credit_applications_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit_items" ADD CONSTRAINT "vendor_credit_items_vendor_credit_id_vendor_credit_id_fk" FOREIGN KEY ("vendor_credit_id") REFERENCES "public"."vendor_credit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit_items" ADD CONSTRAINT "vendor_credit_items_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit_items" ADD CONSTRAINT "vendor_credit_items_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit" ADD CONSTRAINT "vendor_credit_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_credit" ADD CONSTRAINT "vendor_credit_general_credit_account_id_accounts_id_fk" FOREIGN KEY ("general_credit_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_prepayment_applications" ADD CONSTRAINT "vendor_prepayment_applications_prepayment_id_vendor_prepayments_id_fk" FOREIGN KEY ("prepayment_id") REFERENCES "public"."vendor_prepayments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_prepayment_applications" ADD CONSTRAINT "vendor_prepayment_applications_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_prepayments" ADD CONSTRAINT "vendor_prepayments_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vendor_prepayments" ADD CONSTRAINT "vendor_prepayments_payment_account_id_accounts_id_fk" FOREIGN KEY ("payment_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email_per_org_index" ON "customers" ("email","orgsId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_inventory_unique_idx" ON "inventory_quantities" ("product_id","inventory_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "key_org_unique" ON "roles" ("key","org_id");