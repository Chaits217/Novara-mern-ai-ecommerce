import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import products from "./products.js";
import { buildEmbedding } from "../controllers/aiController.js";

dotenv.config();
await connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      name: "Novara Admin",
      email: "admin@novara.ai",
      password: "admin12345",
      role: "admin",
    });

    const demoCustomer = await User.create({
      name: "Demo Customer",
      email: "demo@novara.ai",
      password: "demo12345",
      role: "customer",
    });

    const withEmbeddings = products.map((p) => {
      const doc = { ...p };
      doc.embedding = buildEmbedding(doc);
      return doc;
    });

    await Product.insertMany(withEmbeddings);

    console.log("✅ Data imported successfully");
    console.log(`   Admin login:    admin@novara.ai / admin12345`);
    console.log(`   Customer login: demo@novara.ai / demo12345`);
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log("Data destroyed");
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
