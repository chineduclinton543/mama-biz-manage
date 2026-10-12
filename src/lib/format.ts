export const naira = (n: number | string | null | undefined) =>
  "₦" + Number(n ?? 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });

export const shortDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
export const isThisMonth = (d: string) => {
  const x = new Date(d), n = new Date();
  return x.getMonth() === n.getMonth() && x.getFullYear() === n.getFullYear();
};
