import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/format.js";

const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 149;
const GST_RATE = 0.18;

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goCheckout = () => {
    if (!user) return navigate("/login?redirect=/checkout");
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-3xl mb-4">Your bag is empty</h1>
        <p className="text-graphite mb-8">Let the concierge or the shop find you something worth carrying.</p>
        <Link to="/shop" className="bg-gold text-ink px-7 py-3 rounded-full font-semibold">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14">
      <h1 className="font-display text-4xl mb-10">Your bag</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-5 border-b border-white/10 pb-6"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <Link to={`/product/${item.slug}`} className="font-display text-lg hover:text-gold">
                    {item.name}
                  </Link>
                  <p className="font-mono text-sm text-graphite mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-white/15 rounded-full">
                      <button onClick={() => updateQty(item.product, item.qty - 1)} className="p-2"><Minus size={12} /></button>
                      <span className="w-7 text-center text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.product, item.qty + 1)} className="p-2"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeItem(item.product)} className="text-graphite hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-mono text-sm">{formatPrice(item.price * item.qty)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-ink-light border border-white/10 rounded-2xl p-6 h-fit sticky top-28">
          <h2 className="font-display text-xl mb-5">Order summary</h2>
          <div className="flex justify-between text-sm text-graphite mb-2">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-graphite mb-2">
            <span>Shipping</span>
            <span className="font-mono">{subtotal > FREE_SHIPPING_THRESHOLD ? "Free" : formatPrice(SHIPPING_FEE)}</span>
          </div>
          <div className="flex justify-between text-sm text-graphite mb-4">
            <span>GST (18%)</span>
            <span className="font-mono">{formatPrice(subtotal * GST_RATE)}</span>
          </div>
          <div className="border-t border-white/10 pt-4 flex justify-between font-medium mb-6">
            <span>Estimated total</span>
            <span className="font-mono">
              {formatPrice(subtotal + (subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE) + subtotal * GST_RATE)}
            </span>
          </div>
          <button
            onClick={goCheckout}
            className="w-full bg-gold text-ink font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-gold-light transition-colors"
          >
            Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
