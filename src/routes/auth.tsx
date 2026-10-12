import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui-kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MyBusiness Plug" },
      { name: "description", content: "Sign in or create your MyBusiness Plug account." },
      { property: "og:title", content: "Sign in — MyBusiness Plug" },
      { property: "og:description", content: "Access your business book." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (s && e === "SIGNED_IN") navigate({ to: "/dashboard", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/dashboard", data: { business_name: business } },
      });
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <Card className="w-full max-w-sm p-7 shadow-soft">
        <Link to="/" className="font-display text-xl font-extrabold text-primary">MyBusiness<span className="text-accent">Plug</span></Link>
        <h1 className="mt-4 text-2xl font-bold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <form onSubmit={submit} className="mt-5 grid gap-4">
          {mode === "up" && (
            <Field label="Business name"><Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="e.g. Mama Ngozi Provisions" required /></Field>
          )}
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label="Password"><Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          <Button type="submit" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
        </form>
        <div className="my-4 text-center text-xs text-muted-foreground">or</div>
        <Button variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "in" ? "New here?" : "Already have an account?"}{" "}
          <button className="font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "Create account" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}
