/**
 * Pass-through wrapper. We no longer force a synthetic loading shimmer on every
 * navigation — pages render instantly using their own cached data, and each page
 * shows shape-matching skeletons only while it is actually loading fresh data.
 */
export const RouteSkeleton = ({ children }: { children: React.ReactNode }) => <>{children}</>;
