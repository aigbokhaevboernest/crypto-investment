import { useNavigation, useLocation } from "react-router-dom";
import Loader from "./Loader";

const AUTH_ROUTES = ["/login", "/signup"];

export default function AuthNavLoader() {
  const navigation = useNavigation(); // "idle" | "loading" | "submitting"
  const location = useLocation();

  const targetIsAuthRoute =
    navigation.location && AUTH_ROUTES.includes(navigation.location.pathname);
  const currentIsAuthRoute = AUTH_ROUTES.includes(location.pathname);

  const show =
    navigation.state !== "idle" && (targetIsAuthRoute || currentIsAuthRoute);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader />
    </div>
  );
}
