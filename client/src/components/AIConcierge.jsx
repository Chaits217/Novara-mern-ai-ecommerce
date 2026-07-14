import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { formatPrice } from "../utils/format.js";

export default function AIConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello — I'm the Novara AI concierge. Ask for a category, a budget, or an occasion and I'll curate a shortlist.",
      products: [],
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", text, products: [] }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/assistant", { message: text });
      setMessages((m) => [...m, { role: "assistant", text: data.reply, products: data.products || [] }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "The concierge is offline right now — try browsing the shop directly.", products: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = ["Gift under ₹10,000", "Best sellers", "Watches under ₹40,000"];

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-ink shadow-glow flex items-center justify-center"
        aria-label="Open AI concierge"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {open ? <X size={22} /> : <Sparkles size={22} />}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-sm h-[70vh] max-h-[560px] bg-ink-light border border-white/10 rounded-2xl shadow-card flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 bg-emerald/40">
              <Sparkles size={16} className="text-gold" />
              <p className="font-display text-lg">Novara Concierge</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gold text-ink rounded-br-sm"
                        : "bg-ink-lighter text-bone rounded-bl-sm"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.products?.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {m.products.map((p) => (
                          <Link
                            key={p._id}
                            to={`/product/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="bg-ink rounded-lg overflow-hidden border border-white/10 hover:border-gold transition-colors"
                          >
                            <img src={p.images[0]} alt={p.name} className="w-full h-16 object-cover" />
                            <p className="text-[10px] px-1.5 py-1 truncate">{p.name}</p>
                            <p className="text-[10px] px-1.5 pb-1.5 font-mono text-gold">{formatPrice(p.price)}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-ink-lighter rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-gold rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-[11px] border border-white/15 rounded-full px-3 py-1 text-graphite hover:text-gold hover:border-gold transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <form onSubmit={send} className="p-3 border-t border-white/10 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. anniversary gift under ₹20,000"
                className="flex-1 bg-ink-lighter border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus-ring"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-9 h-9 rounded-full bg-gold text-ink flex items-center justify-center shrink-0 disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
