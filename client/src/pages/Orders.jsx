import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { formatPrice } from "../utils/format.js";

const statusColor = {
  Processing: "text-gold",
  Shipped: "text-blue-400",
  Delivered: "text-green-400",
  Cancelled: "text-red-400",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Your orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-graphite mb-6">You haven't placed any orders yet.</p>
          <Link to="/shop" className="bg-gold text-ink px-6 py-3 rounded-full font-semibold">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o, i) => (
            <motion.div
              key={o._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-ink-light border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-sm text-graphite">#{o._id.slice(-8).toUpperCase()}</p>
                <span className={`text-sm font-medium ${statusColor[o.status]}`}>{o.status}</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                {o.orderItems.map((it) => (
                  <img key={it.name} src={it.image} alt={it.name} className="w-14 h-14 rounded-lg object-cover" />
                ))}
              </div>
              <div className="flex justify-between text-sm text-graphite">
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span className="font-mono text-bone">{formatPrice(o.totalPrice)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
