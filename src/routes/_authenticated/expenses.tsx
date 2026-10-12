import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRows, useTableMutations } from "@/lib/data";
import { naira, shortDate, isThisMonth } from "@/lib/format";
import { PageHeader, Empty, Field, Stat } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — MyBusiness Plug" }] }),
  component: ExpensesPage,
});

const categories = ["Stock purchase", "Transport", "Rent", "Fuel / Light", "Salary", "Data / Airtime", "Food", "Other"];

function ExpensesPage() {
  const { data: expenses = [] } = useRows("expenses");
  const { create, remove } = useTableMutations("expenses");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Other");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ category, amount: +amount, note: note || null });
    setOpen(false); setAmount(""); setNote("");
  };
  const month = expenses.filter((x) => isThisMonth(x.created_at)).reduce((a, x) => a + +x.amount, 0);

  return (
    <>
      <PageHeader title="Expenses" subtitle="Know where your money goes." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add expense</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="Category">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Amount (₦)"><Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} required /></Field>
              <Field label="Note"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></Field>
              <Button type="submit" disabled={create.isPending}>Save expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="mb-6 grid grid-cols-2 gap-4"><Stat label="This month" value={naira(month)} tone="bad" /><Stat label="Entries" value={String(expenses.length)} /></div>
      {expenses.length === 0 ? <Empty>No expenses recorded yet.</Empty> : (
        <Card className="divide-y">
          {expenses.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <Badge variant="secondary">{x.category}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{shortDate(x.created_at)}{x.note ? ` · ${x.note}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-destructive">−{naira(x.amount)}</span>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(x.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
