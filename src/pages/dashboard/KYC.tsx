import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Upload, Loader2, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type DocType = "Passport" | "National ID" | "Driver License";

const SlimUpload = ({
  label, optional, value, onChange,
}: { label: string; optional?: boolean; value: File | null; onChange: (f: File | null) => void }) => (
  <div className="space-y-1.5">
    <Label>
      {label} {optional && <span className="text-white/40 text-[11px] font-normal">(if applicable)</span>}
    </Label>
    <label className="block cursor-pointer w-1/2 min-w-[160px] border-2 border-dashed border-border rounded-lg px-3 py-2.5 text-sm hover:border-primary/60 transition">
      {value ? (
        <span className="flex items-center gap-2 text-primary truncate">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{value.name}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2 text-muted-foreground">
          <Upload className="h-4 w-4 shrink-0" /> Click to upload
        </span>
      )}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0] ?? null;
          if (f && f.size > 5 * 1024 * 1024) { toast.error("File exceeds 5MB"); return; }
          onChange(f);
        }}
      />
    </label>
  </div>
);

const KYC = () => {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<{ status: string } | null>(null);
  const [checking, setChecking] = useState(true);

  const [docType, setDocType] = useState<DocType>("Passport");
  const [docNumber, setDocNumber] = useState("");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setChecking(true);
    supabase.from("kyc_submissions").select("status").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { setSubmission(data as { status: string } | null); setChecking(false); });
  }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!front) return toast.error("ID Front is required");
    if (!selfie) return toast.error("Selfie is required");
    setLoading(true);
    const { error } = await supabase.from("kyc_submissions").insert({
      user_id: user.id,
      document_type: docType,
      document_number: docNumber,
      status: "pending",
    } as never);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("KYC submitted for review");
    setSubmission({ status: "pending" });
  };

  if (checking) {
    return <div className="max-w-2xl"><div className="h-32 skeleton-shimmer" /></div>;
  }

  if (submission) {
    const approved = submission.status === "approved";
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-black text-white">AML / KYC Verification</h1>
        <Card
          className="p-6 flex items-start gap-4"
          style={{
            backgroundColor: approved ? "rgba(34,197,94,0.10)" : "rgba(255,230,0,0.10)",
            borderColor: approved ? "rgba(34,197,94,0.45)" : "rgba(255,230,0,0.55)",
          }}
        >
          {approved
            ? <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            : <Clock className="h-6 w-6 text-yellow-300 shrink-0 mt-0.5" />}
          <div>
            <p className="font-bold text-white">
              {approved ? "KYC Approved" : "KYC Pending Review"}
            </p>
            <p className="text-sm text-white/70 mt-1">
              {approved
                ? "Your identity has been verified. You now have access to higher limits."
                : "Your submission is being reviewed. We'll notify you when it's done."}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black mb-1 text-white">AML / KYC Verification</h1>
      <p className="text-sm text-white/70 mb-6">Verify your identity to unlock higher limits.</p>
      <Card className="p-6 space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex gap-3 items-start">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-white/80"><strong className="text-white">Status:</strong> Not verified. Submit a government-issued ID.</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Document Type</Label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as DocType)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-white"
            >
              <option>Passport</option>
              <option>National ID</option>
              <option>Driver License</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Document Number</Label>
            <Input value={docNumber} onChange={e => setDocNumber(e.target.value)} required />
          </div>
          <SlimUpload label="ID Front" value={front} onChange={setFront} />
          <SlimUpload label="ID Back" optional value={back} onChange={setBack} />
          <SlimUpload label="Selfie" value={selfie} onChange={setSelfie} />
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
export default KYC;
