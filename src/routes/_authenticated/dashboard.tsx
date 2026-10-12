import { createFileRoute, Link } from "@tanstack/react-router";
import { useRows } from "@/lib/data";
import { naira, isToday, isThisMonth, shortDate } from "@/lib/format";
import { PageHeader, Stat } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MyBusiness Plug" }] }),
  component: Dashboard,
});

function Dashboard() {
  const sales = useRows("sales").data ?? [];
  const expenses = useRows("expenses").data ?? [];
  const products = useRows("products").data ?? [];
  const debts = useRows("debts").data ?? [];
  const orders = useRows("orders").data ?? [];

  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const todaySales = sum(sales.filter((s) => isToday(s.created_at)).map((s) => +s.total));
  const monthSales = sum(sales.filter((s) => isThisMonth(s.created_at)).map((s) => +s.total));
  const monthExp = sum(expenses.filter((e) => isThisMonth(e.created_at)).map((e) => +e.amount));
  const owed = sum(debts.map((d) => +d.amount - +d.amount_paid));
  const lowStock = products.filter((p) => p.quantity <= p.low_stock_at);
  const openOrders = orders.filter((o) => o.status !== "delivered");
  const profit = monthSales - monthExp;

  return (
    <>
      <PageHeader title="Good day! 👋" subtitle="Here's how your business is doing." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sales today" value={naira(todaySales)} />
        <Stat label="Sales this month" value={naira(monthSales)} />
        <Stat label="Profit this month" value={naira(profit)} hint={`Expenses ${naira(monthExp)}`} tone={profit >= 0 ? "good" : "bad"} />
        <Stat label="Customers owe you" value={naira(owed)} tone={owed > 0 ? "warn" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Recent sales</h2><Link to="/sales" className="text-sm font-semibold text-primary">See all</Link></div>
          {sales.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet. Record your first sale!</p> : (
            <ul className="divide-y">
              {sales.slice(0, 6).map((s) => (
                <li key={s.id} className="flex justify-between py-2.5 text-sm">
                  <span>{s.item_name} <span className="text-muted-foreground">× {s.quantity}</span></span>
                  <span className="font-semibold">{naira(s.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="grid gap-6">
          <Card className="p-5">
            <div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Low stock</h2><Link to="/stock" className="text-sm font-semibold text-primary">Stock</Link></div>
            {lowStock.length === 0 ? <p className="text-sm text-muted-foreground">All good 👍</p> : lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between py-1.5 text-sm"><span>{p.name}</span><Badge variant="destructive">{p.quantity} left</Badge></div>
            ))}
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex justify-between"><h2 className="text-lg font-bold">Open orders</h2><Link to="/orders" className="text-sm font-semibold text-primary">Orders</Link></div>
            {openOrders.length === 0 ? <p className="text-sm text-muted-foreground">No open orders.</p> : openOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex justify-between py-1.5 text-sm"><span>{o.customer_name}</span><span className="text-muted-foreground">{shortDate(o.due_date)}</span></div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
