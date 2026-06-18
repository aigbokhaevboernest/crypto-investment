import { ReactNode } from "react";
import { useProfileStatus } from "@/hooks/use-profile-status";
import { SuspendedBanner } from "./SuspendedBanner";

/** Wrap inner-page content. If account is suspended, render only the banner. */
export const SuspendedGate = ({ children }: { children: ReactNode }) => {
  const { suspended } = useProfileStatus();
  if (suspended) return <div className="max-w-2xl"><SuspendedBanner full /></div>;
  return <>{children}</>;
};
