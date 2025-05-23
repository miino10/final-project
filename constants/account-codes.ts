export enum ConfigType {
    ACCOUNTS_RECEIVABLE = "Accounts Receivable",
    ACCOUNTS_PAYABLE = "Accounts Payable",
    CASH = "Cash",
    INVENTORY = "Inventory",
    COGS = "Cost of Goods Sold",
    PRODUCT_SALES = "Product Sales",
    SERVICE_REVENUE = "Service Revenue",
    OTHER_INCOME = "Other Income",
    EXPENSES = "Expenses",
    RETAINED_EARNINGS = "Retained Earnings",
    CUSTOMER_DEPOSITS = "Customer Deposits",
    VENDOR_DEPOSITS = "Vendor Deposits",
    INVENTORY_OFFSET = "Inventory Offset",
  }
  
  export enum AccountType {
    Asset = "asset",
    Liability = "liability",
    Equity = "equity",
    Revenue = "revenue",
    Expense = "expense",
    COGS = "cogs",
  }
  
  export interface Account {
    id?: number;
    name: string;
    category_id: number;
    code: string;
    description: string;
    balance: number;
  }
  
  export const defaultAccounts: Account[] = [
    {
      name: "Cash",
      category_id: 1,
      code: "1001",
      description: "Cash on hand and in bank accounts",
      balance: 0,
    },
    {
      name: "Vendor Deposits",
      category_id: 1,
      code: "1006",
      description: "Advance payments made to vendors",
      balance: 0,
    },
    {
      name: "Accounts Receivable",
      category_id: 1,
      code: "1002",
      description: "Money owed by customers",
      balance: 0,
    },
  
    {
      name: "Inventory",
      category_id: 1,
      code: "1003",
      description: "Goods available for sale",
      balance: 0,
    },
    {
      name: "Prepaid Expenses",
      category_id: 1,
      code: "1004",
      description: "Expenses paid in advance",
      balance: 0,
    },
    {
      name: "Short-Term Investments",
      category_id: 1,
      code: "1005",
      description:
        "Investments that are expected to be converted to cash within a year",
      balance: 0,
    },
    {
      name: "Office Equipment",
      category_id: 2,
      code: "14001",
      description: "Equipment used in the office",
      balance: 0,
    },
    {
      name: "Furniture and Fixtures",
      category_id: 2,
      code: "14002",
      description: "Office furniture and fixtures",
      balance: 0,
    },
  
    {
      name: "Leasehold Improvements",
      category_id: 2,
      code: "14004",
      description: "Improvements to leased property",
      balance: 0,
    },
    {
      name: "Long-Term Investments",
  
      category_id: 4,
      code: "1701",
      description: "Investments expected to be held for more than one year",
      balance: 10000,
    },
  
    {
      name: "Accounts Payable",
      category_id: 13,
      code: "7001",
      description: "Amounts owed to suppliers or creditors",
      balance: 0,
    },
    {
      name: "Salaries and Wages",
  
      category_id: 11,
      code: "6001",
      description: "Expenses related to employee salaries and wages",
      balance: 0,
    },
    {
      name: "Rent Expense",
  
      category_id: 11,
      code: "6002",
      description: "Expenses related to office rent",
      balance: 0,
    },
    {
      name: "Utilities Expense",
  
      category_id: 11,
      code: "6003",
      description: "Expenses for utilities like electricity and water",
      balance: 0,
    },
  
    {
      name: "Advertising Expense",
  
      category_id: 11,
      code: "6005",
      description: "Expenses related to advertising and marketing",
      balance: 0,
    },
  
    {
      name: "Cost of Goods Sold",
      category_id: 14,
      code: "5001",
      description: "Total cost of inventory purchased for resale",
      balance: 0,
    },
    {
      name: "Inventory Adjustments",
      category_id: 14,
      code: "5005",
      description: "Inventory Adjustments",
      balance: 0,
    },
  
    {
      name: "Shipping and Delivery Costs",
      category_id: 12,
      code: "6603",
      description: "Costs for shipping products to customers",
      balance: 0,
    },
    {
      name: "Sales Discounts",
      category_id: 12,
      code: "6604",
      description: "Discounts given to customers on sales",
      balance: 0,
    },
  
    {
      name: "Product Sales",
      category_id: 8,
      code: "4001",
      description: "Revenue from selling products",
      balance: 0,
    },
    {
      name: "Service Revenue",
      category_id: 8,
      code: "4002",
      description: "Revenue from providing services",
      balance: 0,
    },
    {
      name: "Owner’s Capital",
      category_id: 7,
      code: "3001",
      description: "Initial and additional investments made by the owner(s)",
      balance: 0,
    },
    {
      name: "Retained Earnings",
      category_id: 7,
      code: "3002",
      description: "Accumulated profits or losses retained in the business",
      balance: 0,
    },
    {
      name: "Owner’s Draw",
      category_id: 7,
      code: "3003",
      description: "Withdrawals made by the owner(s)",
      balance: 0,
    },
    {
      name: "Treasury Stock",
      category_id: 7,
      code: "5004",
      description: "Shares repurchased and held by the company",
      balance: 0,
    },
    {
      name: "Customer Deposits",
      category_id: 13,
      code: "7002",
      description: "Advance payments received from customers",
      balance: 0,
    },
    {
      name: "Inventory Offset",
      category_id: 13,
      code: "7003",
      description: "Offset account for inventory adjustments",
      balance: 0,
    },
  ];
  