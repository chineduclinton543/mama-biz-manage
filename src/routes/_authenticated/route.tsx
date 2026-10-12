import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Receipt, Package, Wallet, Users, ClipboardList, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/sales", label: "Sales", icon: Receipt },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/debts", label: "Debts", icon: Users },
  { to: "/orders", label: "Orders", icon: ClipboardList },
] as const;

function AppLayout() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const qc = useQueryClient();
  const navigate = useNavigate();
  const businessName = (user.user_metadata?.["business_name"] as string) || user.email;

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <span className="px-2 font-display text-xl font-extrabold">MyBusiness<span className="text-sidebar-primary">Plug</span></span>
        <p className="mt-1 truncate px-2 text-xs opacity-70">{businessName}</p>
        <nav className="mt-8 grid gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "bg-sidebar-accent !opacity-100 text-sidebar-primary" }}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-70 hover:bg-sidebar-accent hover:opacity-100">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <header className="flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
        <span className="font-display text-lg font-extrabold">MyBusiness<span className="text-sidebar-primary">Plug</span></span>
        <button onClick={signOut} aria-label="Sign out"><LogOut className="h-5 w-5" /></button>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t bg-card md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2 text-[10px] text-muted-foreground" activeProps={{ className: "!text-primary font-semibold" }}>
            <n.icon className="h-5 w-5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
