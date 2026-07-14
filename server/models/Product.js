import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    // Simple lexicon-based sentiment score computed at write time (-1..1),
    // used to surface an aggregate "customer sentiment" signal per product.
    sentimentScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    brand: { type: String, default: "Novara" },
    category: {
      type: String,
      required: true,
      enum: ["Watches", "Fragrance", "Leather Goods", "Audio", "Eyewear", "Jewelry"],
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    images: [{ type: String, required: true }],
    colors: [{ type: String }],
    countInStock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true },
    featured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    // Dense-ish numeric fingerprint used for content-based similarity
    // (cosine similarity) in the recommendation engine — derived from
    // category/tags/price band rather than hand-authored.
    embedding: [{ type: Number }],
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;
  }
  if (!this.sku) {
    this.sku = `NV-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

productSchema.index({ name: "text", description: "text", tags: "text", brand: "text" });

export default mongoose.model("Product", productSchema);
