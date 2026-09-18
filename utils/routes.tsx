import {
  ArrowLeftRight,
  Clock,
  FileText,
  Home,
  MessageSquare,
  PiggyBank,
  UserCircle,
  Wallet,
  Banknote,
  Shuffle,
  Ban,
  Bolt,
  Pause,
  History,
  Smartphone,
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
  },
  {
    label: "Account Information",
    pathname: "/account-information/my-accounts",
    icon: <Wallet className="h-4 w-4" />,
    featureKey: "accountInformation",
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
        label: "Beneficiaries",
        pathname: "/transfers/beneficiaries",
        icon: <UserCircle className="h-4 w-4" />,
        featureKey: "transferBeneficiaries",
      },
    ],
  },
  {
    label: "Airtime & Data",
    pathname: "/airtime-data",
    icon: <Smartphone className="h-4 w-4" />,
    featureKey: "airtimeData",
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
  {
    label: "Loans",
    pathname: "/loans",
    icon: <Banknote className="h-4 w-4" />,
    featureKey: "loans",
  },
  {
    label: "Time Deposits",
    pathname: "/time-deposits",
    icon: <Clock className="h-4 w-4" />,
    featureKey: "timeDeposits",
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
    label: "User Profile",
    pathname: "/profile",
    icon: <UserCircle className="h-4 w-4" />,
    featureKey: "profile",
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
