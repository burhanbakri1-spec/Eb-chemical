import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import employeeRoutes from "./routes/employee.js";
import homeOfferRoutes from "./routes/homeOffers.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import reviewRoutes from "./routes/reviews.js";
import workSessionRoutes from "./routes/workSessions.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
const allowedOrigins = [
  frontendOrigin,
  "https://eb-chemical-full.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use((_req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "eb-chemical-backend" });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/home-offers", homeOfferRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/work-sessions", workSessionRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`EB Chemical API running on http://0.0.0.0:${port}`);
});
