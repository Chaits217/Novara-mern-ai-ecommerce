import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Users, ShoppingCart, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { formatPrice } from "../utils/format.js";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: o }] = await Promise.all([
        api.get("/orders/stats/summary"),
        api.get("/orders"),
      ]);
      setStats(s);
      setOrders(o);
    } catch {
      toast.error("Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success("Order updated");
    } catch {
      toast.error("Could not update order");
    }
  };

  if (loading) return <Loader full />;

  const cards = [
    { label: "Revenue", value: formatPrice(stats.revenue), icon: DollarSign },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingCart },
    { label: "Products", value: stats.totalProducts, icon: Package },
    { label: "Customers", value: stats.totalUsers, icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
      <h1 className="font-display text-4xl mb-10">Admin dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-ink-light border border-white/10 rounded-2xl p-5"
          >
            <c.icon size={18} className="text-gold mb-3" />
            <p className="text-2xl font-display">{c.value}</p>
            <p className="text-xs text-graphite uppercase tracking-widest mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {stats.salesByCategory?.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-xl mb-4">Sales by category</h2>
          <div className="bg-ink-light border border-white/10 rounded-2xl p-6 space-y-4">
            {stats.salesByCategory.map((c) => {
              const max = Math.max(...stats.salesByCategory.map((x) => x.revenue));
              return (
                <div key={c._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c._id}</span>
                    <span className="font-mono text-graphite">{formatPrice(c.revenue)}</span>
                  </div>
                  <div className="h-2 bg-ink-lighter rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.revenue / max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-gold rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-xl mb-4">Recent orders</h2>
        <div className="bg-ink-light border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-graphite border-b border-white/10">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3">{o.user?.name}</td>
                  <td className="px-5 py-3 font-mono">{formatPrice(o.totalPrice)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="bg-ink-lighter border border-white/10 rounded-full px-3 py-1 text-xs outline-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
