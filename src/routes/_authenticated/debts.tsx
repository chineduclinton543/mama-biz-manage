import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import { useRows, useTableMutations, type Row } from "@/lib/data";
import { naira, shortDate } from "@/lib/format";
import { PageHeader, Empty, Field, Stat } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/debts")({
  head: () => ({ meta: [{ title: "Customer debts — MyBusiness Plug" }] }),
  component: DebtsPage,
});

function DebtsPage() {
  const { data: debts = [] } = useRows("debts");
  const { create, update, remove } = useTableMutations("debts");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", amount: "", note: "", due: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ customer_name: f.name, phone: f.phone || null, amount: +f.amount, note: f.note || null, due_date: f.due || null });
    setOpen(false); setF({ name: "", phone: "", amount: "", note: "", due: "" });
  };

  const outstanding = debts.reduce((a, d) => a + (+d.amount - +d.amount_paid), 0);
  const owing = debts.filter((d) => +d.amount_paid < +d.amount);

  return (
    <>
      <PageHeader title="Customer debts" subtitle="Who owes you — and who has paid." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add debt</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add customer debt</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="Customer name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
              <Field label="Phone"><Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="080..." /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount owed (₦)"><Input type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required /></Field>
                <Field label="Due date"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
              </div>
              <Field label="What for?"><Input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
              <Button type="submit" disabled={create.isPending}>Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="mb-6 grid grid-cols-2 gap-4"><Stat label="Total outstanding" value={naira(outstanding)} tone="warn" /><Stat label="Customers owing" value={String(owing.length)} /></div>
      {debts.length === 0 ? <Empty>No debts recorded. 🙌</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {debts.map((d) => <DebtCard key={d.id} d={d} onPay={(amt) => update.mutateAsync({ id: d.id, amount_paid: Math.min(+d.amount, +d.amount_paid + amt) }).then(() => toast.success("Payment recorded"))} onDelete={() => remove.mutate(d.id)} />)}
        </div>
      )}
    </>
  );
}

function DebtCard({ d, onPay, onDelete }: { d: Row<"debts">; onPay: (n: number) => Promise<unknown>; onDelete: () => void }) {
  const [pay, setPay] = useState("");
  const left = +d.amount - +d.amount_paid;
  const done = left <= 0;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold">{d.customer_name}</h3>
          {d.phone && <a href={`tel:${d.phone}`} className="flex items-center gap-1 text-sm text-primary"><Phone className="h-3 w-3" />{d.phone}</a>}
          {d.note && <p className="text-xs text-muted-foreground">{d.note}</p>}
        </div>
        {done ? <Badge className="bg-success text-primary-foreground">Paid</Badge> : <Badge variant="outline">Due {shortDate(d.due_date)}</Badge>}
      </div>
      <div className="mt-4 flex justify-between text-sm"><span>Paid {naira(d.amount_paid)} of {naira(d.amount)}</span><span className="font-bold">{done ? "" : `${naira(left)} left`}</span></div>
      <Progress className="mt-2" value={(+d.amount_paid / Math.max(+d.amount, 1)) * 100} />
      <div className="mt-4 flex gap-2">
        {!done && (
          <form className="flex flex-1 gap-2" onSubmit={async (e) => { e.preventDefault(); if (+pay > 0) { await onPay(+pay); setPay(""); } }}>
            <Input type="number" min={1} placeholder="Amount paid" value={pay} onChange={(e) => setPay(e.target.value)} />
            <Button type="submit" variant="secondary">Record</Button>
          </form>
        )}
        <Button size="icon" variant="ghost" onClick={onDelete} aria-label="Delete" className="ml-auto"><Trash2 className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
