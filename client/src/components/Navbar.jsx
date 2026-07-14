import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, User, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=Watches", label: "Watches" },
  { to: "/shop?category=Fragrance", label: "Fragrance" },
  { to: "/shop?category=Leather Goods", label: "Leather" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-ink/90 backdrop-blur-md shadow-card" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-20">
        <Link to="/" className="font-display text-2xl tracking-wide">
          NOVARA<span className="text-gold">.</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 font-body text-sm tracking-wide text-bone/80">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="hover:text-gold transition-colors focus-ring"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <form onSubmit={submitSearch} className="hidden md:flex items-center relative">
            <Search size={16} className="absolute left-3 text-graphite" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the edit…"
              className="bg-ink-lighter/60 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm w-48 focus:w-64 transition-all focus-ring outline-none"
            />
          </form>

          <Link to={user ? "/profile" : "/login"} className="focus-ring" aria-label="Account">
            <User size={20} />
          </Link>

          <Link to="/cart" className="relative focus-ring" aria-label="Bag">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="lg:hidden focus-ring"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-ink border-t border-white/10"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {links.map((l) => (
                <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="text-bone/80">
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
