import { AlertOctagon } from "lucide-react";

const SUPPORT_EMAIL = "support@cryptovault.com";

export const SuspendedBanner = ({ full = false }: { full?: boolean }) => (
  <div
    className="rounded-xl border p-4 flex items-start gap-3"
    style={{
      backgroundColor: "rgba(239,68,68,0.12)",
      borderColor: "rgba(239,68,68,0.5)",
      color: "#fecaca",
    }}
    role="alert"
  >
    <AlertOctagon className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
    <div className="text-sm space-y-1">
      <p className="font-bold text-red-300">Account Suspended</p>
      <p>
        {full
          ? "Your account has been suspended. Withdrawals, deposits and other actions are unavailable. You can still view your balance on the dashboard overview."
          : "Your account has been suspended. Contact support."}
      </p>
      <p>
        Contact support:{" "}
        <a className="underline text-red-200" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </div>
  </div>
);
