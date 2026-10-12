import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";
import { Receipt, Package, Wallet, Users, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyBusiness Plug — Track sales, stock & debts for Nigerian SMEs" },
      { name: "description", content: "The simple business book for vendors, barbers, tailors, food sellers and online shops. Track sales, stock, expenses, debts and orders in Naira." },
      { property: "og:title", content: "MyBusiness Plug — Your business book in your pocket" },
      { property: "og:description", content: "Track sales, stock, expenses, customer debts and orders — built for Nigerian SMEs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Receipt, t: "Sales", d: "Record every sale in seconds. Stock reduces automatically." },
  { icon: Package, t: "Stock", d: "Know what's left and get low-stock warnings." },
  { icon: Wallet, t: "Expenses", d: "See where money goes and your real profit." },
  { icon: Users, t: "Debts", d: "Who owes you, how much, and when they paid." },
  { icon: ClipboardList, t: "Orders", d: "Track deposits, due dates and deliveries." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-xl font-extrabold text-primary">MyBusiness<span className="text-accent">Plug</span></span>
        <Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">Built for Nigerian SMEs 🇳🇬</p>
          <h1 className="text-5xl font-extrabold leading-[1.05] md:text-6xl">Your business book, <span className="text-primary">in your pocket.</span></h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            For vendors, barbers, tailors, food sellers and online shops. Stop guessing — know your sales, stock, expenses and who owes you.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><Link to="/auth">Start free</Link></Button>
          </div>
        </div>
        <img src={hero} alt="Nigerian shop owner using her phone" width={1024} height={1200} className="aspect-[5/6] w-full rounded-3xl object-cover shadow-soft" />
      </section>
      <section className="bg-hero py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => (
            <div key={f.t} className="rounded-2xl bg-sidebar-accent p-5 text-sidebar-foreground">
              <f.icon className="h-6 w-6 text-sidebar-primary" />
              <h3 className="mt-3 text-lg font-bold">{f.t}</h3>
              <p className="mt-1 text-sm opacity-80">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="py-8 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} MyBusiness Plug</footer>
    </div>
  );
}
