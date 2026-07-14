import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { formatPrice } from "../utils/format.js";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then(async ({ data }) => {
        setProduct(data);
        setActiveImage(0);
        const { data: rec } = await api.get(`/ai/recommendations/${data._id}`);
        setSimilar(rec);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success("Thanks for your review!");
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    }
  };

  if (loading) return <Loader full />;
  if (!product) return <p className="text-center py-24">Product not found.</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl overflow-hidden aspect-square bg-ink-lighter"
          >
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          <div className="flex gap-3 mt-4">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                  activeImage === i ? "border-gold" : "border-transparent opacity-60"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">{product.category}</p>
          <h1 className="font-display text-4xl mb-3">{product.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={16} className={n <= Math.round(product.rating) ? "fill-gold text-gold" : "text-graphite"} />
            ))}
            <span className="text-sm text-graphite">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-2xl mb-6">
            <span>{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-graphite line-through text-lg">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="text-graphite leading-relaxed mb-8">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mb-8">
              <p className="text-sm mb-2 text-graphite">Available in</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <span key={c} className="text-xs border border-white/15 rounded-full px-3 py-1.5">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-white/15 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3"><Minus size={14} /></button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3"><Plus size={14} /></button>
            </div>
            <button
              onClick={() => addItem(product, qty)}
              disabled={product.countInStock === 0}
              className="flex-1 bg-gold text-ink font-semibold py-3.5 rounded-full hover:bg-gold-light transition-colors disabled:opacity-40"
            >
              {product.countInStock === 0 ? "Out of stock" : "Add to bag"}
            </button>
          </div>

          <div className="flex flex-col gap-2 text-sm text-graphite">
            <div className="flex items-center gap-2"><Truck size={15} className="text-gold" /> Free shipping on orders over ₹15,000</div>
            <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-gold" /> Authenticity guaranteed</div>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-2xl mb-6">Customer reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="bg-ink-light border border-white/10 rounded-2xl p-6 mb-8">
            <p className="text-sm mb-3">Your rating</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>
                  <Star size={20} className={n <= reviewForm.rating ? "fill-gold text-gold" : "text-graphite"} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience…"
              required
              className="w-full bg-ink-lighter border border-white/10 rounded-xl p-3 text-sm outline-none focus-ring mb-3"
              rows={3}
            />
            <button className="bg-gold text-ink text-sm font-semibold px-6 py-2.5 rounded-full">
              Submit review
            </button>
          </form>
        )}

        <div className="space-y-6">
          <AnimatePresence>
            {product.reviews?.slice().reverse().map((r) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-white/10 pb-6"
              >
                <div className="flex items-center gap-2 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} className={n <= r.rating ? "fill-gold text-gold" : "text-graphite"} />
                  ))}
                  <span className="text-sm font-medium ml-1">{r.name}</span>
                </div>
                <p className="text-graphite text-sm">{r.comment}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {product.reviews?.length === 0 && (
            <p className="text-graphite text-sm">No reviews yet — be the first to share your thoughts.</p>
          )}
        </div>
      </section>

      {/* AI Similar products */}
      {similar.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center gap-2 mb-8">
            <h2 className="font-display text-2xl">You may also like</h2>
            <span className="text-xs text-gold border border-gold/30 rounded-full px-3 py-1">AI matched</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {similar.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
