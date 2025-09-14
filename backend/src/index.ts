import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import tenantRoutes from "./routes/tenant";
import ingestRoutes from "./routes/ingest";
import insightsRoutes from "./routes/insights";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Shopify Insights Backend is running 🚀");
});

// Routes
app.use("/tenants", tenantRoutes);
app.use("/ingest", ingestRoutes);
app.use("/insights", insightsRoutes);

// Global error handler (optional but recommended)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong", details: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
