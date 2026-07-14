# Novara — AI-Powered MERN E-Commerce Platform

A full-stack, production-shaped e-commerce storefront built with **MongoDB, Express, React, and Node.js**, featuring an AI recommendation engine, a rule-based shopping concierge, and a premium, animated UI (Tailwind CSS + Framer Motion).

Priced in **Indian Rupees (₹)** throughout, with a 24-item catalog across six categories, ₹149 flat shipping (free above ₹15,000), and 18% GST applied at checkout — matching typical Indian e-commerce conventions.

---

## ✨ What's inside

**Storefront**
- Product catalog with search, category filters, sorting, pagination
- Product detail pages with image gallery, reviews, and star ratings
- Cart (persisted to `localStorage`) and a full checkout flow
- JWT authentication (register/login/logout) with httpOnly cookie + bearer token fallback
- Order history for customers

**AI features (self-contained, no external API keys required)**
- **Content-based recommendation engine** — every product gets a numeric "embedding" (category + tag + price signals) and similar items are surfaced via cosine similarity (`GET /api/ai/recommendations/:productId`, shown as "You may also like — AI matched" on the product page)
- **Personalized "For You" feed** — tracks which categories a logged-in user buys from and re-ranks a rail around it (`GET /api/ai/for-you`)
- **AI shopping concierge** — a floating chat widget (bottom-right on every page) that does intent matching over free text ("gift under ₹10,000", "best sellers", "watches under ₹40,000") and returns a live product shortlist (`POST /api/ai/assistant`)
- **Review sentiment scoring** — a lightweight lexicon-based scorer tags each review with a sentiment value on submission

**Admin**
- Dashboard with revenue, order, product and customer counts
- Sales-by-category breakdown (animated bar chart, no charting library needed)
- Order status management (Processing → Shipped → Delivered → Cancelled)

**Design**
- Custom dark/champagne-gold "Novara" visual identity (Fraunces display serif + Inter body + IBM Plex Mono for prices/SKUs)
- Framer Motion throughout: hero entrance, scroll reveals, hover micro-interactions, animated route/tab transitions, floating AI concierge orb
- Fully responsive, keyboard-focus-visible, and respects `prefers-reduced-motion`

---

## 🗂 Project structure

```
novara/
├── server/                # Express + MongoDB API
│   ├── config/db.js
│   ├── models/            # User, Product, Order (Mongoose)
│   ├── middleware/        # JWT auth, admin guard, error handler
│   ├── controllers/       # auth, products, orders, AI
│   ├── routes/
│   ├── seed/               # demo catalog + seeding script
│   └── server.js
└── client/                 # React 18 + Vite + Tailwind
    ├── src/
    │   ├── api/axios.js
    │   ├── context/        # AuthContext, CartContext
    │   ├── components/     # Navbar, Footer, ProductCard, AIConcierge…
    │   └── pages/           # Home, Shop, ProductDetail, Cart, Checkout,
    │                        # Login, Register, Profile, Orders, Admin
    └── index.html
```

---

## 🚀 Getting started locally

You'll need **Node.js 18+** and a **MongoDB** instance (local or [Atlas](https://www.mongodb.com/atlas) free tier).

### 1. Backend

```bash
cd server
cp .env.example .env      
npm install
npm run seed               
npm run dev                 
```

Demo accounts created by the seed script:
| Role | Email | Password |
|---|---|---|
| Admin | admin@novara.ai | admin12345 |
| Customer | demo@novara.ai | demo12345 |

### 2. Frontend

```bash
cd client
cp .env.example .env       
npm install
npm run dev                
```

Open `http://localhost:5173` — browse the shop, try the AI concierge (bottom-right sparkle icon), add items to your bag, check out, then log in as the admin account and visit `/admin` for the dashboard.

---

## 🔌 API reference (high level)

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| GET/PUT | `/api/auth/profile` | Get/update current user |
| GET | `/api/products` | List products (search, filter, sort, paginate) |
| GET | `/api/products/:slug` | Product detail |
| POST | `/api/products/:id/reviews` | Submit a review (auth) |
| POST/PUT/DELETE | `/api/products/:id` | Admin product management |
| POST | `/api/orders` | Place an order (auth) |
| GET | `/api/orders/mine` | My orders (auth) |
| GET | `/api/orders/stats/summary` | Dashboard stats (admin) |
| GET | `/api/ai/recommendations/:productId` | Similar products |
| GET | `/api/ai/for-you` | Personalized feed (auth) |
| POST | `/api/ai/assistant` | Chat with the AI concierge |

---

