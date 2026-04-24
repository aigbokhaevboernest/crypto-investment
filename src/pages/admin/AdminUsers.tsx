import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const LEVELS = ["basic", "veteran", "ultimate", "master", "diamond"] as const;

type Profile = {
  id: string; email: string; username: string; full_name: string; country: string | null;
  balance: number | null; profit: number | null; total_deposit: number | null;
  total_withdraw: number | null; account_level: string | null; account_type: string | null;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Profile>>({});

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers((data ?? []) as Profile[]);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (u: Profile) => { setEditing(u.id); setDraft(u); };
  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from("profiles").update({
      balance: Number(draft.balance ?? 0),
      profit: Number(draft.profit ?? 0),
      total_deposit: Number(draft.total_deposit ?? 0),
      total_withdraw: Number(draft.total_withdraw ?? 0),
      account_level: draft.account_level as any,
    }).eq("id", editing);
    if (error) { toast.error(error.message); return; }
    toast.success("User updated");
    setEditing(null); load();
  };

  const filtered = users.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-black">Users ({users.length})</h1>
        <Input placeholder="Search email, username, name..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <div className="space-y-3">
        {filtered.map(u => (
          <Card key={u.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">{u.full_name} <span className="text-muted-foreground font-normal">@{u.username}</span></p>
                <p className="text-xs text-muted-foreground">{u.email} • {u.country || "—"} • {u.account_type}</p>
              </div>
              <span className="text-xs uppercase tracking-wider rounded-full bg-gold/10 text-gold border border-gold/30 px-2.5 py-1 font-bold">
                {u.account_level}
              </span>
            </div>
            {editing === u.id ? (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                {(["balance","profit","total_deposit","total_withdraw"] as const).map(k => (
                  <div key={k}>
                    <label className="text-[10px] uppercase text-muted-foreground">{k.replace("_"," ")}</label>
                    <Input type="number" step="0.01" value={(draft as any)[k] ?? 0}
                      onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground">level</label>
                  <select value={draft.account_level ?? "basic"} onChange={e => setDraft(d => ({ ...d, account_level: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-5 flex gap-2 mt-1">
                  <Button size="sm" variant="gold" onClick={save}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span>Bal: <strong>${Number(u.balance ?? 0).toLocaleString()}</strong></span>
                <span>Profit: <strong className="text-emerald-500">${Number(u.profit ?? 0).toLocaleString()}</strong></span>
                <span>Dep: ${Number(u.total_deposit ?? 0).toLocaleString()}</span>
                <span>Wd: ${Number(u.total_withdraw ?? 0).toLocaleString()}</span>
                <Button size="sm" variant="outline" className="ml-auto" onClick={() => startEdit(u)}>Edit</Button>
                <Link to={`/admin/users/${u.id}`}><Button size="sm" variant="gold">Manage</Button></Link>
              </div>
            )}
          </Card>
        ))}
        {!filtered.length && <p className="text-center text-muted-foreground py-12">No users found.</p>}
      </div>
    </div>
  );
};
export default AdminUsers;