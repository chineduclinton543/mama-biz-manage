import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type TableName = "products" | "sales" | "expenses" | "debts" | "orders";
export type Row<N extends TableName> = T[N]["Row"];
export type Insert<N extends TableName> = T[N]["Insert"];
export type Update<N extends TableName> = T[N]["Update"];

export function useRows<N extends TableName>(table: N) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row<N>[];
    },
  });
}

export function useTableMutations<N extends TableName>(table: N, invalidate: TableName[] = []) {
  const qc = useQueryClient();
  const done = () => [table, ...invalidate].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  const onError = (e: Error) => toast.error(e.message);
  const create = useMutation({
    mutationFn: async (v: Insert<N>) => {
      const { error } = await supabase.from(table).insert(v as never);
      if (error) throw error;
    },
    onSuccess: done,
    onError,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...v }: Update<N> & { id: string }) => {
      const { error } = await supabase.from(table).update(v as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: done,
    onError,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: done,
    onError,
  });
  return { create, update, remove };
}
