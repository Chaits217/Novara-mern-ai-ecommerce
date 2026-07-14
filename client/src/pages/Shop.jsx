import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

const CATEGORIES = ["Watches", "Fragrance", "Leather Goods", "Audio", "Eyewear", "Jewelry"];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = params.get("category") || "";
  const keyword = params.get("keyword") || "";
  const sort = params.get("sort") || "";

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (keyword) query.set("keyword", keyword);
    if (sort) query.set("sort", sort);
    query.set("limit", "24");

    api
      .get(`/products?${query.toString()}`)
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, keyword, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">The Edit</p>
        <h1 className="font-display text-4xl">
          {category || (keyword ? `Results for "${keyword}"` : "All products")}
        </h1>
      </div>

      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="lg:hidden flex items-center gap-2 text-sm border border-white/15 rounded-full px-4 py-2"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        <div className="hidden lg:flex flex-wrap gap-2">
          <button
            onClick={() => setParam("category", "")}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              !category ? "bg-gold text-ink border-gold" : "border-white/15 text-graphite hover:border-gold hover:text-gold"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setParam("category", c)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                category === c ? "bg-gold text-ink border-gold" : "border-white/15 text-graphite hover:border-gold hover:text-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="bg-ink-lighter border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus-ring"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="lg:hidden flex flex-wrap gap-2 mb-8 overflow-hidden"
        >
          {["", ...CATEGORIES].map((c) => (
            <button
              key={c || "all"}
              onClick={() => setParam("category", c)}
              className={`text-sm px-4 py-1.5 rounded-full border ${
                category === c ? "bg-gold text-ink border-gold" : "border-white/15 text-graphite"
              }`}
            >
              {c || "All"}
            </button>
          ))}
        </motion.div>
      )}

      {loading ? (
        <Loader full />
      ) : products.length === 0 ? (
        <p className="text-graphite py-20 text-center">No products match those filters yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
