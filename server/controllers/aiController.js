import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

const CATEGORIES = ["Watches", "Fragrance", "Leather Goods", "Audio", "Eyewear", "Jewelry"];

/**
 * Builds a numeric "embedding" for a product from cheap, explainable
 * signals: a one-hot category vector, a normalised price band, and a
 * hashed bag-of-tags vector. This is a transparent stand-in for a real
 * embedding model — good enough to power meaningful cosine-similarity
 * recommendations without any external API dependency.
 */
export function buildEmbedding(product) {
  const vector = new Array(CATEGORIES.length + 8 + 1).fill(0);

  const catIndex = CATEGORIES.indexOf(product.category);
  if (catIndex >= 0) vector[catIndex] = 1;

  (product.tags || []).forEach((tag) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) % 8;
    vector[CATEGORIES.length + hash] += 1;
  });

  vector[vector.length - 1] = Math.min(product.price / 1000, 1);

  return vector;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// @desc    Content-based "You may also like" recommendations for a product
// @route   GET /api/ai/recommendations/:productId
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const target = await Product.findById(req.params.productId);
  if (!target) {
    res.status(404);
    throw new Error("Product not found");
  }

  const targetVector = target.embedding?.length ? target.embedding : buildEmbedding(target);
  const candidates = await Product.find({ _id: { $ne: target._id } });

  const scored = candidates
    .map((p) => ({
      product: p,
      score: cosineSimilarity(targetVector, p.embedding?.length ? p.embedding : buildEmbedding(p)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.product);

  res.json(scored);
});

// @desc    Personalised "For You" rail based on the user's preference profile
// @route   GET /api/ai/for-you
export const getPersonalizedFeed = asyncHandler(async (req, res) => {
  const profile = req.user.preferenceProfile;

  if (!profile || profile.size === 0) {
    const fallback = await Product.find({ featured: true }).limit(8);
    return res.json({ basis: "trending", products: fallback });
  }

  const topCategories = [...profile.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([cat]) => cat);

  const products = await Product.find({ category: { $in: topCategories } })
    .sort({ rating: -1 })
    .limit(8);

  res.json({ basis: `Because you shop ${topCategories.join(" & ")}`, products });
});

// @desc    Rule-based shopping assistant — intent matching over the catalog
// @route   POST /api/ai/assistant
export const shoppingAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  const text = message.toLowerCase();
  let reply = "";
  let products = [];

  const greeting = /(hi|hello|hey)\b/.test(text);
  const budgetMatch = text.match(
    /(under|below|less than)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:rupees|rs\.?|inr)?/
  );
  if (budgetMatch) budgetMatch[2] = budgetMatch[2].replace(/,/g, "");
  const categoryHit = CATEGORIES.find((c) => text.includes(c.toLowerCase().split(" ")[0]));
  const giftIntent = /(gift|present|surprise)/.test(text);
  const bestSellerIntent = /(best seller|popular|top rated|trending)/.test(text);

  const filter = {};
  if (categoryHit) filter.category = categoryHit;
  if (budgetMatch) filter.price = { $lte: Number(budgetMatch[2]) };

  if (bestSellerIntent) {
    products = await Product.find(filter).sort({ rating: -1, numReviews: -1 }).limit(4);
    reply = "Here's what other customers are loving right now.";
  } else if (categoryHit || budgetMatch) {
    products = await Product.find(filter).sort({ rating: -1 }).limit(4);
    reply = categoryHit
      ? `Here are some standout pieces from ${categoryHit}${budgetMatch ? ` under ₹${Number(budgetMatch[2]).toLocaleString("en-IN")}` : ""}.`
      : `Here's a curated edit under ₹${Number(budgetMatch[2]).toLocaleString("en-IN")}.`;
  } else if (giftIntent) {
    products = await Product.find({ featured: true }).limit(4);
    reply = "For a gift, our most-gifted, featured pieces are a safe, elevated choice.";
  } else if (greeting) {
    reply = "Hello! I'm the Novara AI concierge. Tell me an occasion, budget, or category and I'll curate a shortlist for you.";
  } else {
    products = await Product.find({ $text: { $search: message } }).limit(4);
    reply = products.length
      ? "Here's what I found that matches what you're looking for."
      : "I couldn't find an exact match — try naming a category (Watches, Fragrance, Leather Goods, Audio, Eyewear, Jewelry) or a budget, like 'gift under ₹5,000'.";
  }

  res.json({ reply, products });
});
