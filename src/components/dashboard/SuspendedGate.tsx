import { ReactNode } from "react";
import { useProfileStatus } from "@/hooks/use-profile-status";
import { SuspendedBanner } from "./SuspendedBanner";

export const SuspendedGate = ({ children }: { children: ReactNode }) => {
  const { suspended, loading } = useProfileStatus();
  // Hold render until status is confirmed — prevents the flicker of page content
  if (loading) return null;
  if (suspended) return <div className="max-w-2xl"><SuspendedBanner full /></div>;
  return <>{children}</>;
};
