import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/currencies";
import { StatusPill } from "./Dashboard";

type Tx = { id: string; amount: number; method: string; status: string; created_at: string; type: string };

const Transactions = () => {
  const { user } = useAuth();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [currency, setCurrency] = useState("USD");
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle()
      .then(({ data }) => data?.currency && setCurrency(data.currency));

    supabase
      .from("transactions")
      .select("id, amount, method, status, created_at, type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setTxs((data as Tx[] | null) ?? []));
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-black mb-6 text-white">Transaction History</h1>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div>Type</div><div>Method</div><div className="text-right">Amount</div><div className="hidden md:block">Date</div><div>Status</div>
        </div>
        {txs.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No transactions yet.</div>}
        {txs.map((t) => (
          <div key={t.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-center px-4 py-3 border-b border-border last:border-0 text-sm">
            <div className="font-medium capitalize">{t.type}</div>
            <div>{t.method || "—"}</div>
            <div className="text-right tabular-nums font-bold">{symbol}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="hidden md:block text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString()}</div>
            <StatusPill status={t.status} />
          </div>
        ))}
      </Card>
    </div>
  );
};
export default Transactions;
