import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogTitle, DialogHeader,
} from "@/components/ui/dialog";
import { StatusPill } from "@/pages/dashboard/Dashboard";

type Row = { id: string; amount: number; method: string | null; status: string; created_at: string };

interface Props {
  symbol: string;
  refreshKey: number;
  onResume: (txId: string) => void;
}

export default function WithdrawalHistory({ symbol, refreshKey, onResume }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [hasUnverifiedCodes, setHasUnverifiedCodes] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("transactions")
      .select("id, amount, method, status, created_at")
      .eq("user_id", user.id)
      .eq("type", "withdrawal")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Row[] | null) ?? []));

    // If any active code remains unverified, status badges should display "Awaiting code"
    supabase
      .from("account_withdrawal_codes")
      .select("auth_code, cot_code, cot_required, tax_code, tax_required, verified, is_used")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return setHasUnverifiedCodes(false);
        const d = data as Record<string, unknown>;
        const active: boolean[] = [];
        if (d.auth_code) active.push(false); // there's always an unverified placeholder for fresh codes
        if (d.cot_required && d.cot_code) active.push(false);
        if (d.tax_required && d.tax_code) active.push(false);
        // verified flag is global on this row; if more than 1 active code exists and verified=false → multiple pending
        const verified = Boolean(d.verified);
        const remaining = active.length - (verified ? 1 : 0);
        setHasUnverifiedCodes(active.length >= 2 && remaining >= 1);
      });
  }, [user?.id, refreshKey]);

  const displayStatus = (s: string) => {
    if (hasUnverifiedCodes && (s === "pending" || s === "pending_review")) return "awaiting_code";
    return s;
  };

  return (
    <Card className="border-white/10 p-0 overflow-hidden" style={{ backgroundColor: "#0F1629" }}>
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="text-white font-bold text-sm">Withdrawal History</h3>
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-center text-white/50 text-sm">No withdrawals yet.</div>
      ) : (
        <div className="divide-y divide-white/10">
          {rows.map((r) => {
            const eff = displayStatus(r.status);
            const showComplete = eff === "awaiting_code";
            return (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold tabular-nums">
                    {symbol}{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-white/50 truncate">
                    {r.method || "—"} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <StatusPill status={eff} />
                {showComplete ? (
                  <Button size="sm" variant="gold" onClick={() => onResume(r.id)}>
                    Complete
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-white/10" onClick={() => setDetail(r)}>
                    View
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="bg-white text-slate-900 rounded-2xl border-0 max-w-sm">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <DetailRow k="Amount" v={`${symbol}${Number(detail.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
              <DetailRow k="Method" v={detail.method || "—"} />
              <DetailRow k="Status" v={displayStatus(detail.status)} />
              <DetailRow k="Date" v={new Date(detail.created_at).toLocaleString()} />
              <DetailRow k="Reference" v={detail.id.slice(0, 8).toUpperCase()} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

const DetailRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between border-b border-slate-100 py-1.5">
    <span className="text-slate-500">{k}</span>
    <span className="font-semibold capitalize">{v}</span>
  </div>
);
