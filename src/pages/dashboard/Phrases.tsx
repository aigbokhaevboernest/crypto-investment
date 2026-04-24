import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { KeyRound, Trash2, Plus, Eye, EyeOff } from "lucide-react";

type Row = { id: string; wallet_name: string; phrase: string };

const Phrases = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ wallet_name: "", phrase: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("phrases").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    if (!form.wallet_name || !form.phrase) return toast.error("Fill in all fields");
    const { error } = await supabase.from("phrases").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Phrase saved");
    setForm({ wallet_name: "", phrase: "" });
    setShowForm(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("phrases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Wallet Phrases</h1>
          <p className="text-sm text-muted-foreground">Securely store recovery phrases for verification.</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(s => !s)}><Plus className="h-4 w-4 mr-2" />Add Phrase</Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-5 space-y-3">
          <div><Label>Wallet Name</Label><Input value={form.wallet_name} onChange={e => setForm(f => ({ ...f, wallet_name: e.target.value }))} placeholder="e.g. MetaMask" /></div>
          <div><Label>Recovery Phrase</Label><Textarea rows={3} value={form.phrase} onChange={e => setForm(f => ({ ...f, phrase: e.target.value }))} placeholder="12 or 24 words separated by spaces" /></div>
          <Button variant="gold" onClick={add}>Save Phrase</Button>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-gold" /><p className="font-bold">{r.wallet_name}</p></div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setShown(s => ({ ...s, [r.id]: !s[r.id] }))}>
                  {shown[r.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-sm font-mono break-words text-muted-foreground">
              {shown[r.id] ? r.phrase : "•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••"}
            </p>
          </Card>
        ))}
        {!rows.length && <p className="text-muted-foreground text-center py-8">No phrases yet.</p>}
      </div>
    </div>
  );
};
export default Phrases;