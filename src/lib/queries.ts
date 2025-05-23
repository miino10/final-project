import { accountConfigurations, entries,permissions, roles, rolePermissions, userRoles,accounts, customers } from "@/db/schema";
import { ApiError,handleApiError } from "./api-error-handler";
import { db } from "@/db";
import { ConfigType,defaultAccounts } from "../../constants/account-codes";
import { and, eq } from "drizzle-orm";

export const createEntry = async (
  tx: any,
  orgsId: string,
  accountId: number,
  amount: string,
  transactionId: number,
  type: "DEBIT" | "CREDIT",
  userId: string,
  date: string
) => {
  const entry = await tx.insert(entries).values({
    accountId,
    amount,
    transactionId,
    type,
    orgsId,
    userId,
    date,
  });

  if (!entry) {
    throw new ApiError(500, "Failed to create entry");
  }

  return entry;
};

export const getDefaultAccounts = async (orgId: string) => {
    const defaultAccountsResult = await db
      .select({
        accountId: accountConfigurations.accountId,
        configType: accountConfigurations.configType,
      })
      .from(accountConfigurations)
      .where(eq(accountConfigurations.orgsId, orgId));
  
    const defaultAccountsMap = new Map(
      defaultAccountsResult.map((account) => [account.configType, account])
    );
  
    const requiredAccountTypes = [
      ConfigType.CASH,
      ConfigType.COGS,
      ConfigType.INVENTORY,
      ConfigType.INVENTORY_OFFSET,
      ConfigType.ACCOUNTS_PAYABLE,
      ConfigType.ACCOUNTS_RECEIVABLE,
      ConfigType.RETAINED_EARNINGS,
      ConfigType.CUSTOMER_DEPOSITS,
      ConfigType.VENDOR_DEPOSITS,
    ];
  
    const missingAccounts = requiredAccountTypes.filter(
      (type) => !defaultAccountsMap.has(type)
    );
  
    if (missingAccounts.length > 0) {
      throw new ApiError(
        500,
        `Required accounts not found: ${missingAccounts.join(", ")}`
      );
    }
  
    return {
      cashAccount: defaultAccountsMap.get(ConfigType.CASH),
      cogsAccount: defaultAccountsMap.get(ConfigType.COGS),
      inventoryAccount: defaultAccountsMap.get(ConfigType.INVENTORY),
      inventoryOffsetAccount: defaultAccountsMap.get(ConfigType.INVENTORY_OFFSET),
      accountsPayable: defaultAccountsMap.get(ConfigType.ACCOUNTS_PAYABLE),
      accountsReceivable: defaultAccountsMap.get(ConfigType.ACCOUNTS_RECEIVABLE),
      retainedEarnings: defaultAccountsMap.get(ConfigType.RETAINED_EARNINGS),
      customerDeposits: defaultAccountsMap.get(ConfigType.CUSTOMER_DEPOSITS),
      vendorDeposits: defaultAccountsMap.get(ConfigType.VENDOR_DEPOSITS),
    };
  };


export const DefaultRolesPermissions = async (
  orgId: string,
  organizationMemberId: number,
  userId: string,
  trx: any
) => {
  // Define member permission keys upfront
  const memberPermissionKeys = [
    "org:view:invoice",
    "org:create:invoice",
    "org:view:receipt",
    "org:create:receipt",
    "org:view:expense",
    "org:create:expense",
    "org:view:chart_of_accounts",
    "org:view:journal_entry",
    "org:view:vendor",
    "org:create:vendor",
    "org:view:customer",
    "org:create:customer",
    "org:view:organization",
    "org:view:reports",
    
  ];

  // Fetch all permissions for admin and member roles
  const allPermissions = await trx.select().from(permissions);

  const permissionMap = new Map(
    allPermissions.map((p: { key: string; id: number }) => [p.key, p.id])
  );

  // Create both roles in a single batch operation
  const [adminRole, memberRole] = await trx
    .insert(roles)
    .values([
      {
        name: "Admin",
        description: "Full access to all organization features",
        key: "org:admin",
        orgsId: orgId,
      },
      {
        name: "Member",
        description: "Basic access to organization features",
        key: "org:member",
        isDefault: true,
        orgsId: orgId,
      },
    ])
    .returning();

  // Prepare role permissions for both roles in a single batch
  const rolePermissionsValues = [
    // Admin permissions
    ...allPermissions.map((permission: { id: number }) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
      orgsId: orgId,
    })),
    // Member permissions
    ...memberPermissionKeys
      .map((key) => permissionMap.get(key))
      .filter((id): id is number => id !== undefined)
      .map((permissionId) => ({
        roleId: memberRole.id,
        permissionId,
        orgsId: orgId,
      })),
  ];

  // Insert all role permissions in a single batch operation
  await trx.insert(rolePermissions).values(rolePermissionsValues);

  // Assign Admin role to the organization creator
  await trx.insert(userRoles).values({
    userId,
    roleId: adminRole.id,
    orgsId: orgId,
    organizationMemberId,
  });
};



export const createDefaultAccountsAndConfigurations = async (
  trx: any,
  orgId: string,
  userId: string
) => {
  const accountIdMap: Record<string, number> = {};
  if (!orgId || !userId) {
    console.log("Org ID or User ID not found");
    throw new ApiError(400, "Org ID or User ID not found");
  }

  try {
    // Check if default accounts already exist for this org
    const existingAccounts = await trx
      .select()
      .from(accounts)
      .where(eq(accounts.orgsId, orgId));

    if (existingAccounts.length > 0) {
      console.log("Default accounts already exist for this organization");
      return;
    }

    // Insert all default accounts in a single transaction
    console.log("Starting transaction to insert default accounts");

    const insertedAccounts = await trx
      .insert(accounts)
      .values(
        defaultAccounts.map((account) => ({
          name: account.name,
          code: account.code,
          categoryId: account.category_id,
          description: account.description,
          balance: 0,
          orgsId: orgId,
          userId: userId,
        }))
      )
      .returning();

    console.log("Default accounts inserted:", insertedAccounts);

    insertedAccounts.forEach((account: any, index: number) => {
      accountIdMap[defaultAccounts[index].name] = account.id;
    });

    console.log("Account ID map:", accountIdMap);

    // Create default account configurations
    const defaultConfigurations = [
      {
        accountId: accountIdMap["Cost of Goods Sold"],
        configType: ConfigType.COGS,
      },
      {
        accountId: accountIdMap["Accounts Payable"],
        configType: ConfigType.ACCOUNTS_PAYABLE,
      },
      {
        accountId: accountIdMap["Accounts Receivable"],
        configType: ConfigType.ACCOUNTS_RECEIVABLE,
      },
      {
        accountId: accountIdMap["Cash"],
        configType: ConfigType.CASH,
      },
      {
        accountId: accountIdMap["Inventory"],
        configType: ConfigType.INVENTORY,
      },
      {
        accountId: accountIdMap["Inventory Offset"],
        configType: ConfigType.INVENTORY_OFFSET,
      },
      {
        accountId: accountIdMap["Retained Earnings"],
        configType: ConfigType.RETAINED_EARNINGS,
      },
      {
        accountId: accountIdMap["Customer Deposits"],
        configType: ConfigType.CUSTOMER_DEPOSITS,
      },
      {
        accountId: accountIdMap["Vendor Deposits"],
        configType: ConfigType.VENDOR_DEPOSITS,
      },
    ];

    console.log("Default configurations:", defaultConfigurations);

    // Check if default configurations already exist for this org
    const existingConfigurations = await trx
      .select()
      .from(accountConfigurations)
      .where(eq(accountConfigurations.orgsId, orgId));

    if (existingConfigurations.length > 0) {
      console.log("Default configurations already exist for this organization");
      return;
    }

    await trx.insert(accountConfigurations).values(
      defaultConfigurations.map((config) => ({
        accountId: config.accountId,
        configType: config.configType,
        orgsId: orgId,
      }))
    );

    console.log("Default accounts and configurations created");
  } catch (error) {
    console.error("Error creating default accounts and configurations:", error);
    return handleApiError(error);
  }
};

export async function getCustomerData(orgId: string, customerId: number) {
  const customerData = await db
    .select({ name: customers.name })
    .from(customers)
    .where(and(eq(customers.orgsId, orgId), eq(customers.id, customerId)));
  return customerData;
}

export async function getAccountName(
  accountId: number,
  orgId: string
): Promise<string> {
  try {
    const account = await db.query.accounts.findFirst({
      columns: { name: true },
      where: (accounts, { eq, and }) =>
        and(eq(accounts.id, accountId), eq(accounts.orgsId, orgId)),
    });

    return account?.name || "Unknown Account";
  } catch (error) {
    console.error("Error fetching account name:", error);
    return "Unknown Account";
  }
}

export async function getVendorName(
  vendorId: number,
  orgId: string
): Promise<string> {
  try {
    const vendor = await db.query.vendors.findFirst({
      columns: { name: true },
      where: (vendors, { eq, and }) =>
        and(eq(vendors.id, vendorId), eq(vendors.orgsId, orgId)),
    });
    if (!vendor?.name) {
      throw new ApiError(404, "vendor not found");
    }

    return vendor?.name || "Unknown Vendor";
  } catch (error) {
    console.error("Error fetching vendor name:", error);
    return "Unknown Vendor";
  }
}

export async function getCustomerName(
  customerId: number,
  orgId: string
): Promise<string> {
  try {
    const customer = await db.query.customers.findFirst({
      columns: { name: true },
      where: (customers, { eq, and }) =>
        and(eq(customers.id, customerId), eq(customers.orgsId, orgId)),
    });
    if (!customer?.name) {
      throw new ApiError(404, "Customer not found");
    }

    return customer.name;
  } catch (error) {
    console.error("Error fetching vendor name:", error);
    return "Unknown Vendor";
  }
}
