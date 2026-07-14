import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <p className="font-display text-2xl mb-3">
            NOVARA<span className="text-gold">.</span>
          </p>
          <p className="text-graphite text-sm leading-relaxed">
            Curated watches, fragrance, leather goods, audio, eyewear and fine
            jewelry — recommended by an AI concierge that learns your taste.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-bone mb-4 tracking-wide">Shop</p>
          <ul className="space-y-2 text-sm text-graphite">
            <li><Link to="/shop?category=Watches" className="hover:text-gold">Watches</Link></li>
            <li><Link to="/shop?category=Fragrance" className="hover:text-gold">Fragrance</Link></li>
            <li><Link to="/shop?category=Leather Goods" className="hover:text-gold">Leather Goods</Link></li>
            <li><Link to="/shop?category=Audio" className="hover:text-gold">Audio</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-bone mb-4 tracking-wide">Account</p>
          <ul className="space-y-2 text-sm text-graphite">
            <li><Link to="/profile" className="hover:text-gold">Profile</Link></li>
            <li><Link to="/orders" className="hover:text-gold">Orders</Link></li>
            <li><Link to="/cart" className="hover:text-gold">Bag</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-bone mb-4 tracking-wide">Follow</p>
          <div className="flex gap-4 text-graphite">
            <Instagram size={18} className="hover:text-gold cursor-pointer" />
            <Twitter size={18} className="hover:text-gold cursor-pointer" />
            <Facebook size={18} className="hover:text-gold cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-graphite">
        © {new Date().getFullYear()} Novara. Built as a MERN + AI portfolio project.
      </div>
    </footer>
  );
}
