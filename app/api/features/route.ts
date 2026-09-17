import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || 'default';

  // Base features (FlowBank has everything)
  const baseFeatures = {
    "dashboard": true,
    "profile": true,
    "accountInformation": true,
    "myAccounts": true,
    "accountSummary": true,
    "timeDeposits": true,
    "statements": true,
    "statementCr": true,
    "statementDr": true,
    "statementFull": true,
    "transfers": true,
    "transferOtherBanks": true,
    "transferInternal": true,
    "transferHistory": true,
    "billPayments": true,
    "billAirtime": true,
    "billData": true,
    "customerRequests": true,
    "reqChequeBook": true,
    "reqStopPayment": true,
    "reqMiscellaneous": true,
    "standingInstructions": true,
    "manageFunds": true,
    "createHolds": true,
    "loans": true
  };

  if (tenantId === 'bank-a') {
    // Alpha Bank doesn't have Loans, Time Deposits, or Miscellaneous requests
    return NextResponse.json({
      ...baseFeatures,
      timeDeposits: false,
      reqMiscellaneous: false,
      manageFunds: false,
      createHolds: false,
      loans: false
    });
  }

  if (tenantId === 'bank-b') {
    // Beta Finance doesn't have Bill Payments, Customer Requests, or DR/CR statements
    return NextResponse.json({
      ...baseFeatures,
      statementCr: false,
      statementDr: false,
      billPayments: false,
      billAirtime: false,
      billData: false,
      customerRequests: false,
      reqChequeBook: false,
      reqStopPayment: false,
      reqMiscellaneous: false,
      standingInstructions: false
    });
  }

  // Default / FlowBank
  return NextResponse.json(baseFeatures);
}
