import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CreditCard, Trash2, Plus } from "lucide-react";

type CardRow = {
  id: string; card_holder: string; card_number: string;
  expiry: string; cvv: string; brand: string | null;
};

const Cards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ card_holder: "", card_number: "", expiry: "", cvv: "", brand: "visa" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("cards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setCards((data ?? []) as CardRow[]);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    if (!form.card_holder || !form.card_number || !form.expiry || !form.cvv) {
      toast.error("Fill in all fields"); return;
    }
    const { error } = await supabase.from("cards").insert({ ...form, user_id: user.id });
    if (error) return toast.error(error.message);
    toast.success("Card added");
    setForm({ card_holder: "", card_number: "", expiry: "", cvv: "", brand: "visa" });
    setShowForm(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Card removed"); load();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">My Cards</h1>
          <p className="text-sm text-muted-foreground">Manage payment cards on your account.</p>
        </div>
        <Button variant="gold" onClick={() => setShowForm(s => !s)}><Plus className="h-4 w-4 mr-2" />Add Card</Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Card Holder</Label><Input value={form.card_holder} onChange={e => setForm(f => ({ ...f, card_holder: e.target.value }))} /></div>
            <div><Label>Card Number</Label><Input value={form.card_number} onChange={e => setForm(f => ({ ...f, card_number: e.target.value }))} /></div>
            <div><Label>Expiry (MM/YY)</Label><Input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} /></div>
            <div><Label>CVV</Label><Input type="password" value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value }))} /></div>
          </div>
          <Button variant="gold" onClick={add}>Save Card</Button>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(c => (
          <Card key={c.id} className="p-5 bg-gradient-to-br from-primary/20 to-gold/10 border-gold/30">
            <div className="flex justify-between items-start mb-6">
              <CreditCard className="h-8 w-8 text-gold" />
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <p className="font-mono text-lg tracking-widest mb-3">•••• •••• •••• {c.card_number.slice(-4)}</p>
            <div className="flex justify-between text-xs uppercase text-muted-foreground">
              <span>{c.card_holder}</span><span>{c.expiry}</span>
            </div>
          </Card>
        ))}
        {!cards.length && <p className="text-muted-foreground col-span-2 text-center py-8">No cards yet.</p>}
      </div>
    </div>
  );
};
export default Cards;