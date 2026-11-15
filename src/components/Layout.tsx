import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Scissors } from "lucide-react";
import { SHOP } from "../lib/config";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-accent" : "text-neutral-300 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white whitespace-nowrap">
            <span className="w-9 h-9 rounded-lg bg-accent text-ink flex items-center justify-center">
              <Scissors size={18} />
            </span>
            <span className="font-display text-lg sm:text-xl tracking-wide uppercase">
              {SHOP.name}
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <NavLink to="/" end className={(s) => `hidden sm:inline ${linkClass(s)}`}>
              Home
            </NavLink>
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
            <Link
              to="/book"
              className="px-4 sm:px-5 py-2 rounded-lg bg-accent text-ink text-sm font-semibold whitespace-nowrap hover:bg-amber-300 transition-colors"
            >
              Book now
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line py-8 text-sm text-neutral-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-3 justify-between">
          <p>
            {SHOP.name} is a demo shop. Built with BarberBook, a booking system by{" "}
            <a
              href="https://github.com/aiman279"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Aiman Asmu'i
            </a>
            .
          </p>
          <p>Demo data is saved in your browser only.</p>
        </div>
      </footer>
    </div>
  );
}
