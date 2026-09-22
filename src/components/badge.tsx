const COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  matched: "bg-green-100 text-green-800",
  closed: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-stone-100 text-stone-600",
  verified: "bg-green-100 text-green-800",
  proposed: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-teal-100 text-teal-800",
  reviewed: "bg-stone-100 text-stone-600",
  dismissed: "bg-stone-100 text-stone-500",
};

export function Badge({ status }: { status: string }) {
  const color = COLORS[status] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${color}`}>
      {status.replace("_", " ")}
    </span>
  );
}
