export interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  balance: number;
  account_holder_name?: string;
  branch_code?: string;
  color?: string;
}
