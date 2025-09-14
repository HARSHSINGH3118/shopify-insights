import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { authMiddleware } from "./middleware/auth";
import tenantRoutes from "./routes/tenant";
import ingestRoutes from "./routes/ingest";
import insightsRoutes from "./routes/insights";
import eventsRoutes from "./routes/events";
import "./scheduler"; 

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Shopify Insights Backend is running");
});

app.use("/tenants", tenantRoutes);
app.use("/ingest", authMiddleware, ingestRoutes);
app.use("/insights", authMiddleware, insightsRoutes);
app.use("/events", authMiddleware, eventsRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "Something went wrong",
    details: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
