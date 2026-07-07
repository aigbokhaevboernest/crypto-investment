import logo from "@/assets/logo.png";

export const BrandLogo = ({ className = "" }: { className?: string }) => (
  <img
    src={logo}
    alt="Arvithex Mining Pool"
    className={className}
  />
);

export default BrandLogo;
