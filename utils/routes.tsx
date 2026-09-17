import {
  ArrowLeftRight,
  Clock,
  FileText,
  Home,
  MessageSquare,
  PiggyBank,
  Settings,
  UserCircle,
  Wallet,
  Info,
  CreditCard,
  Banknote,
  Shuffle,
  Ban,
  Bolt,
  Pause,
  Nfc,
  ArrowDownUp,
  History,
} from "lucide-react";

export interface Route {
  label: string;
  pathname: string;
  icon?: React.ReactNode;
  children?: Route[];
  featureKey?: string; // Optional feature flag to hide/show this route
}

export const sidebarRoutes: Route[] = [
  {
    label: "Home",
    pathname: "/dashboard",
    icon: <Home className="h-4 w-4" />,
    featureKey: "dashboard",
  },
  {
    label: "Profile",
    pathname: "/profile",
    icon: <UserCircle className="h-4 w-4" />,
    featureKey: "profile",
  },
  {
    label: "Account Information",
    pathname: "/account-information",
    icon: <Wallet className="h-4 w-4" />,
    featureKey: "accountInformation",
    children: [
      {
        label: "My Accounts",
        pathname: "/account-information/my-accounts",
        icon: <CreditCard className="h-4 w-4" />,
        featureKey: "myAccounts",
      },
      {
        label: "Summary",
        pathname: "/account-information/summary",
        icon: <FileText className="h-4 w-4" />,
        featureKey: "accountSummary",
      },
    ],
  },
  {
    label: "Statements",
    pathname: "/statements",
    icon: <FileText className="h-4 w-4" />,
    featureKey: "statements",
    children: [
      {
        label: "CR Listing",
        pathname: "/statements/cr-listing",
        icon: <FileText className="h-4 w-4" />,
        featureKey: "statementCr",
      },
      {
        label: "DR Listing",
        pathname: "/statements/dr-listing",
        icon: <FileText className="h-4 w-4" />,
        featureKey: "statementDr",
      },
      {
        label: "Full Statement",
        pathname: "/statements/full",
        icon: <FileText className="h-4 w-4" />,
        featureKey: "statementFull",
      },
    ],
  },
  {
    label: "Transfers",
    pathname: "/transfers",
    icon: <ArrowLeftRight className="h-4 w-4" />,
    featureKey: "transfers",
    children: [
      {
        label: "Other Banks Transfers",
        pathname: "/transfers/other-banks-transfers",
        icon: <ArrowLeftRight className="h-4 w-4" />,
        featureKey: "transferOtherBanks",
      },
      {
        label: "Internal Transfers",
        pathname: "/transfers/internal-transfers",
        icon: <ArrowLeftRight className="h-4 w-4" />,
        featureKey: "transferInternal",
      },
      {
        label: "History",
        pathname: "/transfers/history",
        icon: <History className="h-4 w-4" />,
        featureKey: "transferHistory",
      },
    ],
  },
  {
    label: "Loans",
    pathname: "/loans",
    icon: <Banknote className="h-4 w-4" />,
    featureKey: "loans",
  },
  {
    label: "Bill Payments",
    pathname: "/payments",
    icon: <Wallet className="h-4 w-4" />,
    featureKey: "billPayments",
    children: [
      {
        label: "Airtime",
        pathname: "/payments/airtime",
        icon: <Nfc className="h-4 w-4" />,
        featureKey: "billAirtime",
      },
      {
        label: "Data",
        pathname: "/payments/data",
        icon: <ArrowDownUp className="h-4 w-4" />,
        featureKey: "billData",
      },
    ],
  },
  {
    label: "Time Deposits",
    pathname: "/time-deposits",
    icon: <Clock className="h-4 w-4" />,
    featureKey: "timeDeposits",
  },
  {
    label: "Customers Requests",
    pathname: "/customers-requests",
    icon: <MessageSquare className="h-4 w-4" />,
    featureKey: "customerRequests",
    children: [
      {
        label: "Cheque Book",
        pathname: "/customers-requests/cheque-book",
        icon: <Banknote className="h-4 w-4" />,
        featureKey: "reqChequeBook",
      },
      {
        label: "Stop Payment",
        pathname: "/customers-requests/stop-payment",
        icon: <Ban className="h-4 w-4" />,
        featureKey: "reqStopPayment",
      },
      {
        label: "Miscellaneous",
        pathname: "/customers-requests/miscellaneous",
        icon: <Shuffle className="h-4 w-4" />,
        featureKey: "reqMiscellaneous",
      },
      {
        label: "Standing Instruction",
        pathname: "/customers-requests/standing-instruction",
        icon: <Bolt className="h-4 w-4" />,
        featureKey: "standingInstructions",
      },
    ],
  },
  {
    label: "Manage Funds",
    pathname: "/manage-funds",
    icon: <PiggyBank className="h-4 w-4" />,
    featureKey: "manageFunds",
    children: [
      {
        label: "Create Holds",
        pathname: "/manage-funds/create-holds",
        icon: <Pause className="h-4 w-4" />,
        featureKey: "createHolds",
      },
    ],
  },
];

export const navbarRoutes: Route[] = [
  {
    label: "",
    pathname: "/dashboard",
    icon: <Home className="h-6 w-6" />,
  },
  {
    label: "Manage Team",
    pathname: "/team",
  },
  {
    label: "Contacts",
    pathname: "/contacts",
  },
  {
    label: "Invoices",
    pathname: "/invoices",
  },
];
