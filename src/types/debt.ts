export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null; // ISO date (YYYY-MM-DD)
  settled_at: string | null; // ISO timestamp, null = belum lunas
  created_at: string;
  updated_at: string;
}

export type StatusFilter = "all" | "unpaid" | "settled";
export type TypeFilter = "all" | DebtType;
export type SortKey = "created_at" | "amount" | "due_date";
export type SortDir = "asc" | "desc";

export interface DebtInput {
  type: DebtType;
  counterpart_name: string;
  amount: number;
  due_date: string | null;
  note: string | null;
}
