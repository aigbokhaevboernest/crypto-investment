import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import BrandLogo from "@/components/BrandLogo";

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkClass = "text-[#172640] hover:text-[#00B8E0] transition";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white"<Link to="/" className="flex items-center h-full">
  <BrandLogo className="h-10 w-auto object-contain" />
</Link>


        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#about" className={linkClass}>About</a>
          <a href="#services" className={linkClass}>Services</a>
          <a href="#plans" className={linkClass}>Plans</a>
          <a href="#traders" className={linkClass}>Copy Trading</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button size="sm" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-[#172640] hover:bg-slate-100" onClick={() => navigate("/login")}>Sign In</Button>
              <Button size="sm" className="hidden md:inline-flex" onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-[#172640] hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 px-4 py-3 flex flex-col gap-3 text-sm bg-white">
          <a href="#about" onClick={() => setOpen(false)} className={linkClass}>About</a>
          <a href="#services" onClick={() => setOpen(false)} className={linkClass}>Services</a>
          <a href="#plans" onClick={() => setOpen(false)} className={linkClass}>Plans</a>
          <a href="#traders" onClick={() => setOpen(false)} className={linkClass}>Copy Trading</a>
          {!user && (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={linkClass}>Sign In</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="font-semibold text-primary">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
