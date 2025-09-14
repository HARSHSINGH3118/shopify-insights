import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * POST /events/:tenantId → record a custom event
 */
router.post("/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { type, payload } = req.body;

    if (!type) {
      return res.status(400).json({ error: "Missing event type" });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const event = await prisma.event.create({
      data: {
        tenantId,
        type,
        occurredAt: new Date(),
        payload: payload || {},
      },
    });

    res.json({ message: "Event ingested", event });
  } catch (err) {
    console.error(" Event ingestion failed:", err);
    res.status(500).json({ error: "Failed to ingest event" });
  }
});

/**
 * GET /events/:tenantId → fetch last 20 events
 */
router.get("/:tenantId", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const events = await prisma.event.findMany({
      where: { tenantId },
      orderBy: { occurredAt: "desc" },
      take: 20,
    });

    res.json(events);
  } catch (err) {
    console.error("Fetch events failed:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
