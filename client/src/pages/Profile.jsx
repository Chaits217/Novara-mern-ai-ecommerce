import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      setUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl mb-8">Your profile</h1>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs text-graphite uppercase tracking-widest">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
          </div>
          <div>
            <label className="text-xs text-graphite uppercase tracking-widest">Email</label>
            <input value={user?.email || ""} disabled className="input mt-1 opacity-60" />
          </div>
          <div>
            <label className="text-xs text-graphite uppercase tracking-widest">Role</label>
            <input value={user?.role || ""} disabled className="input mt-1 opacity-60 capitalize" />
          </div>
          <button disabled={saving} className="bg-gold text-ink font-semibold px-6 py-3 rounded-full disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
