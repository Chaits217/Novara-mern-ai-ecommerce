import express from "express";
import {
  getSimilarProducts,
  getPersonalizedFeed,
  shoppingAssistant,
} from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/recommendations/:productId", getSimilarProducts);
router.get("/for-you", protect, getPersonalizedFeed);
router.post("/assistant", shoppingAssistant);

export default router;
