import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const heroImage =
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=80";

const categories = [
  { name: "Watches", img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80" },
  { name: "Fragrance", img: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80" },
  { name: "Leather Goods", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80" },
  { name: "Audio", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products?featured=true&limit=8")
      .then(({ data }) => setFeatured(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-center pt-14 pb-24 lg:pt-20 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold border border-gold/30 rounded-full px-4 py-1.5 mb-6">
              <Sparkles size={12} /> AI-curated, not algorithm-spammed
            </p>
            <h1 className="font-display text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-6">
              Objects worth <span className="text-shimmer italic">owning</span>,
              <br /> chosen for you.
            </h1>
            <p className="text-graphite text-lg max-w-md mb-8 leading-relaxed">
              Novara pairs a small, considered catalog with an AI concierge that
              learns your taste — so recommendations feel like a good friend's,
              not a spreadsheet's.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-gold text-ink font-semibold px-7 py-3.5 rounded-full hover:bg-gold-light transition-colors"
              >
                Explore the edit
              </Link>
              <Link
                to="/shop?category=Watches"
                className="border border-white/20 px-7 py-3.5 rounded-full hover:border-gold hover:text-gold transition-colors"
              >
                Shop watches
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gold/10 blur-3xl rounded-full" />
            <img
              src={heroImage}
              alt="Featured Novara timepiece"
              className="relative rounded-3xl w-full aspect-[4/5] object-cover shadow-card animate-float"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/10 bg-ink-light/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-graphite">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <Truck size={18} className="text-gold" /> Free shipping over ₹15,000
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <RotateCcw size={18} className="text-gold" /> 30-day returns
          </div>
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <ShieldCheck size={18} className="text-gold" /> Authenticity guaranteed
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">Shop by category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/shop?category=${encodeURIComponent(c.name)}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 font-display text-lg">{c.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 pb-28">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl">Featured pieces</h2>
          <Link to="/shop" className="text-sm text-gold hover:underline">View all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
