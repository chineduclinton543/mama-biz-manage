import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Minus } from "lucide-react";
import { useRows, useTableMutations } from "@/lib/data";
import { naira } from "@/lib/format";
import { PageHeader, Empty, Field, Stat } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({ meta: [{ title: "Stock — MyBusiness Plug" }] }),
  component: StockPage,
});

function StockPage() {
  const { data: products = [] } = useRows("products");
  const { create, update, remove } = useTableMutations("products");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", price: "", cost: "", quantity: "", low: "5" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ name: f.name, price: +f.price, cost: +f.cost || 0, quantity: +f.quantity, low_stock_at: +f.low });
    setOpen(false); setF({ name: "", price: "", cost: "", quantity: "", low: "5" });
  };

  const value = products.reduce((a, p) => a + p.quantity * +p.cost, 0);
  const low = products.filter((p) => p.quantity <= p.low_stock_at).length;

  return (
    <>
      <PageHeader title="Stock" subtitle="What you have and what's running low." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Add product</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add product</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Selling price (₦)"><Input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} required /></Field>
                <Field label="Cost price (₦)"><Input type="number" min={0} value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></Field>
                <Field label="Quantity"><Input type="number" min={0} value={f.quantity} onChange={(e) => setF({ ...f, quantity: e.target.value })} required /></Field>
                <Field label="Warn when below"><Input type="number" min={0} value={f.low} onChange={(e) => setF({ ...f, low: e.target.value })} /></Field>
              </div>
              <Button type="submit" disabled={create.isPending}>Save product</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="mb-6 grid grid-cols-2 gap-4"><Stat label="Stock value (cost)" value={naira(value)} /><Stat label="Low stock items" value={String(low)} tone={low ? "warn" : "default"} /></div>
      {products.length === 0 ? <Empty>No products yet. Add what you sell to track stock.</Empty> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between">
                <div><h3 className="font-bold">{p.name}</h3><p className="text-sm text-muted-foreground">{naira(p.price)} each</p></div>
                {p.quantity <= p.low_stock_at && <Badge variant="destructive">Low</Badge>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => update.mutate({ id: p.id, quantity: Math.max(0, p.quantity - 1) })} aria-label="Decrease"><Minus className="h-4 w-4" /></Button>
                  <span className="w-12 text-center font-display text-xl font-bold">{p.quantity}</span>
                  <Button size="icon" variant="outline" onClick={() => update.mutate({ id: p.id, quantity: p.quantity + 1 })} aria-label="Increase"><Plus className="h-4 w-4" /></Button>
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(p.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
