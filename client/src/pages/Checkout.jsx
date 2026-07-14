import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

// Mirrors the India pricing rules applied server-side in orderController.js
const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 149;
const GST_RATE = 0.18;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * GST_RATE;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        orderItems: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: form,
        paymentMethod: "Card (mock)",
      });
      clearCart();
      toast.success("Order placed — thank you!");
      navigate(`/orders`);
      void data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <motion.form
          onSubmit={placeOrder}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-4"
        >
          <h2 className="font-display text-xl mb-2">Shipping address</h2>
          <input name="fullName" required placeholder="Full name" value={form.fullName} onChange={handleChange} className="input" />
          <input name="line1" required placeholder="Address line 1" value={form.line1} onChange={handleChange} className="input" />
          <input name="line2" placeholder="Address line 2 (optional)" value={form.line2} onChange={handleChange} className="input" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder="City" value={form.city} onChange={handleChange} className="input" />
            <input name="state" required placeholder="State" value={form.state} onChange={handleChange} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="postalCode" required placeholder="PIN code" value={form.postalCode} onChange={handleChange} className="input" />
            <input name="country" required placeholder="Country" value={form.country} onChange={handleChange} className="input" />
          </div>
          <input name="phone" required placeholder="Phone (+91)" value={form.phone} onChange={handleChange} className="input" />

          <div className="bg-ink-light border border-white/10 rounded-2xl p-5 mt-6">
            <p className="text-sm text-graphite">
              This is a demo checkout — payment is simulated and no real card is charged.
            </p>
          </div>

          <button
            disabled={placing}
            className="w-full bg-gold text-ink font-semibold py-3.5 rounded-full mt-4 disabled:opacity-50"
          >
            {placing ? "Placing order…" : `Place order — ${formatPrice(total)}`}
          </button>
        </motion.form>

        <div className="bg-ink-light border border-white/10 rounded-2xl p-6 h-fit">
          <h2 className="font-display text-xl mb-5">Order summary</h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
            {items.map((i) => (
              <div key={i.product} className="flex justify-between text-sm">
                <span className="text-graphite">{i.name} × {i.qty}</span>
                <span className="font-mono">{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-graphite"><span>Subtotal</span><span className="font-mono">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-graphite"><span>Shipping</span><span className="font-mono">{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between text-graphite"><span>GST (18%)</span><span className="font-mono">{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-medium text-base pt-2"><span>Total</span><span className="font-mono">{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
