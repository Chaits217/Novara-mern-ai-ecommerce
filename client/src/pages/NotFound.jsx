import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto text-center py-32 px-6">
      <p className="font-display text-7xl text-gold mb-4">404</p>
      <h1 className="font-display text-2xl mb-4">This piece isn't in the collection</h1>
      <Link to="/" className="bg-gold text-ink px-6 py-3 rounded-full font-semibold inline-block mt-2">
        Back home
      </Link>
    </div>
  );
}
