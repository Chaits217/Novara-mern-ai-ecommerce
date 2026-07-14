export default function Loader({ full = false }) {
  return (
    <div className={`flex items-center justify-center ${full ? "min-h-[60vh]" : "py-10"}`}>
      <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
}
