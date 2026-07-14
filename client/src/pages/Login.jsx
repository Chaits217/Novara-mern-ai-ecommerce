import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(params.get("redirect") || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl mb-2">Welcome back</h1>
        <p className="text-graphite mb-8 text-sm">Sign in to continue to Novara.</p>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input" />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input" />
          <button disabled={loading} className="w-full bg-gold text-ink font-semibold py-3.5 rounded-full disabled:opacity-50">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="text-sm text-graphite mt-6 text-center">
          New to Novara? <Link to="/register" className="text-gold hover:underline">Create an account</Link>
        </p>
        <div className="mt-8 bg-ink-light border border-white/10 rounded-xl p-4 text-xs text-graphite">
          Demo logins — Admin: admin@novara.ai / admin12345 · Customer: demo@novara.ai / demo12345
        </div>
      </motion.div>
    </div>
  );
}
