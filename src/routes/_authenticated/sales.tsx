import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRows, useTableMutations } from "@/lib/data";
import { naira, shortDate, isToday } from "@/lib/format";
import { PageHeader, Empty, Field, Stat } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "Sales — MyBusiness Plug" }] }),
  component: SalesPage,
});

function SalesPage() {
  const { data: sales = [] } = useRows("sales");
  const { data: products = [] } = useRows("products");
  const { create, remove } = useTableMutations("sales", ["products"]);
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState<string>("custom");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [method, setMethod] = useState("cash");

  const pickProduct = (id: string) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) { setName(p.name); setPrice(String(p.price)); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty), up = Number(price);
    await create.mutateAsync({
      product_id: productId === "custom" ? null : productId,
      item_name: name, quantity: q, unit_price: up, total: q * up, payment_method: method,
    });
    toast.success("Sale recorded");
    setOpen(false); setName(""); setQty("1"); setPrice(""); setProductId("custom");
  };

  const today = sales.filter((s) => isToday(s.created_at)).reduce((a, s) => a + +s.total, 0);

  return (
    <>
      <PageHeader title="Sales" subtitle="Every sale you make, in one place." action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Record sale</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record a sale</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <Field label="From stock">
                <Select value={productId} onValueChange={pickProduct}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Service / not in stock</SelectItem>
                    {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.quantity} left)</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Item / service"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Haircut, Jollof rice" required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity"><Input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} required /></Field>
                <Field label="Price each (₦)"><Input type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></Field>
              </div>
              <Field label="Paid by">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <p className="text-sm">Total: <span className="font-bold">{naira(Number(qty) * Number(price || 0))}</span></p>
              <Button type="submit" disabled={create.isPending}>Save sale</Button>
            </form>
          </DialogContent>
        </Dialog>
      } />
      <div className="mb-6 grid grid-cols-2 gap-4"><Stat label="Today" value={naira(today)} /><Stat label="All sales" value={String(sales.length)} /></div>
      {sales.length === 0 ? <Empty>No sales yet. Tap “Record sale” to add your first one.</Empty> : (
        <Card className="divide-y">
          {sales.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{s.item_name} <span className="font-normal text-muted-foreground">× {s.quantity}</span></p>
                <p className="text-xs text-muted-foreground">{shortDate(s.created_at)} · <Badge variant="secondary" className="uppercase">{s.payment_method}</Badge></p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold">{naira(s.total)}</span>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(s.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
