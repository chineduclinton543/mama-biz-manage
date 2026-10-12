import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRows, useTableMutations } from "@/lib/data";
import { naira, shortDate } from "@/lib/format";
import { PageHeader, Empty, Field } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — MyBusiness Plug" }] }),
  component: OrdersPage,
});

const statuses = [
  { v: "pending", l: "Pending" },
  { v: "in_progress", l: "In progress" },
  { v: "ready", l: "Ready" },
  { v: "delivered", l: "Delivered" },
];

function OrdersPage() {
  const { data: orders = [] } = useRows("orders");
  const { create, update, remove } = useTableMutations("orders");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("open");
  const [f, setF] = useState({ name: "", phone: "", desc: "", amount: "", deposit: "", due: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ customer_name: f.name, phone: f.phone || null, description: f.desc, amount: +f.amount, deposit: +f.deposit || 0, due_date: f.due || null });
    setOpen(false); setF({ name: "", phone: "", desc: "", amount: "", deposit: "", due: "" });
  };

  const shown = orders.filter((o) => filter === "all" || (filter === "open" ? o.status !== "delivered" : o.status === "delivered"));

  return (
    <>
      <PageHeader title="Orders" subtitle="Track jobs, deposits and delivery dates." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New order</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New order</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
                <Field label="Phone"><Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
              </div>
              <Field label="Order details"><Textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="e.g. 2 agbada, size L, blue lace" required /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price (₦)"><Input type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} required /></Field>
                <Field label="Deposit (₦)"><Input type="number" min={0} value={f.deposit} onChange={(e) => setF({ ...f, deposit: e.target.value })} /></Field>
                <Field label="Due"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
              </div>
              <Button type="submit" disabled={create.isPending}>Save order</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList><TabsTrigger value="open">Open</TabsTrigger><TabsTrigger value="done">Delivered</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList>
      </Tabs>
      {shown.length === 0 ? <Empty>No orders here.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{o.customer_name}</h3>
                  {o.phone && <a href={`tel:${o.phone}`} className="text-sm text-primary">{o.phone}</a>}
                </div>
                <Select value={o.status} onValueChange={(v) => update.mutate({ id: o.id, status: v })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <p className="mt-3 text-sm">{o.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>{naira(o.amount)} · <span className="text-muted-foreground">balance {naira(+o.amount - +o.deposit)}</span></span>
                <span className="flex items-center gap-2 text-muted-foreground">Due {shortDate(o.due_date)}
                  <Button size="icon" variant="ghost" onClick={() => remove.mutate(o.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
