import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-ink-lighter aspect-[4/5]">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.isNewArrival && (
            <span className="absolute top-3 left-3 bg-bone text-ink text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.compareAtPrice > product.price && (
            <span className="absolute top-3 right-3 bg-gold text-ink text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product, 1);
            }}
            className="absolute bottom-3 inset-x-3 bg-ink/80 backdrop-blur text-bone text-sm py-2.5 rounded-full opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold hover:text-ink font-medium"
          >
            Add to bag
          </button>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-graphite mb-1">
            {product.category}
          </p>
          <Link to={`/product/${product.slug}`} className="font-display text-lg leading-snug hover:text-gold transition-colors">
            {product.name}
          </Link>
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-graphite shrink-0 mt-1">
            <Star size={12} className="fill-gold text-gold" />
            {product.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 font-mono text-sm">
        <span>{formatPrice(product.price)}</span>
        {product.compareAtPrice > product.price && (
          <span className="text-graphite line-through">{formatPrice(product.compareAtPrice)}</span>
        )}
      </div>
    </motion.div>
  );
}
