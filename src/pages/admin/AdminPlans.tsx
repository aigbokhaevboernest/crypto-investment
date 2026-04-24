import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Plan = {
  id: string; name: string; price: number; daily_return: number; duration_days: number;
  min_amount: number; max_amount: number; description: string | null; is_active: boolean | null;
};

const empty: Partial<Plan> = { name: "", price: 0, daily_return: 0, duration_days: 30, min_amount: 0, max_amount: 0, description: "", is_active: true };

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Partial<Plan>>(empty);

  const load = async () => {
    const { data } = await supabase.from("plans").select("*").order("price");
    setPlans((data ?? []) as Plan[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      name: draft.name!, price: Number(draft.price ?? 0), daily_return: Number(draft.daily_return ?? 0),
      duration_days: Number(draft.duration_days ?? 30), min_amount: Number(draft.min_amount ?? 0),
      max_amount: Number(draft.max_amount ?? 0), description: draft.description ?? "", is_active: draft.is_active ?? true,
    };
    if (editing === "new") {
      const { error } = await supabase.from("plans").insert(payload);
      if (error) return toast.error(error.message);
    } else if (editing) {
      const { error } = await supabase.from("plans").update(payload).eq("id", editing);
      if (error) return toast.error(error.message);
    }
    toast.success("Plan saved"); setEditing(null); setDraft(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black">Plan List ({plans.length})</h1>
        <Button variant="gold" onClick={() => { setEditing("new"); setDraft(empty); }}>
          <Plus className="h-4 w-4 mr-2" />New Plan
        </Button>
      </div>

      {editing && (
        <Card className="p-5 mb-5 space-y-3">
          <h2 className="font-bold">{editing === "new" ? "Create Plan" : "Edit Plan"}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={draft.name ?? ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></div>
            <div><Label>Price</Label><Input type="number" value={draft.price ?? 0} onChange={e => setDraft(d => ({ ...d, price: Number(e.target.value) }))} /></div>
            <div><Label>Daily Return %</Label><Input type="number" step="0.1" value={draft.daily_return ?? 0} onChange={e => setDraft(d => ({ ...d, daily_return: Number(e.target.value) }))} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={draft.duration_days ?? 30} onChange={e => setDraft(d => ({ ...d, duration_days: Number(e.target.value) }))} /></div>
            <div><Label>Min Amount</Label><Input type="number" value={draft.min_amount ?? 0} onChange={e => setDraft(d => ({ ...d, min_amount: Number(e.target.value) }))} /></div>
            <div><Label>Max Amount</Label><Input type="number" value={draft.max_amount ?? 0} onChange={e => setDraft(d => ({ ...d, max_amount: Number(e.target.value) }))} /></div>
            <div className="sm:col-span-2"><Label>Description</Label><Input value={draft.description ?? ""} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!draft.is_active} onCheckedChange={v => setDraft(d => ({ ...d, is_active: v }))} /><span className="text-sm">Active</span></div>
          </div>
          <div className="flex gap-2">
            <Button variant="gold" onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setDraft(empty); }}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-xs text-muted-foreground">${p.min_amount} - ${p.max_amount}</p>
              </div>
              <span className={`text-xs uppercase font-bold rounded-full px-2 py-1 border ${p.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"}`}>{p.is_active ? "Active" : "Off"}</span>
            </div>
            <p className="text-2xl font-black text-gold mt-2">{p.daily_return}% <span className="text-xs text-muted-foreground font-normal">/day</span></p>
            <p className="text-xs text-muted-foreground mt-1">{p.duration_days} days</p>
            {p.description && <p className="text-sm mt-2">{p.description}</p>}
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => { setEditing(p.id); setDraft(p); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default AdminPlans;