import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * Ingest custom events (cart, checkout, order cancel)
 */
router.post("/:tenantId/events", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { type, payload } = req.body;

    if (!type || !payload) {
      return res.status(400).json({ error: "Missing type or payload" });
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const event = await prisma.event.create({
      data: {
        tenantId,
        type,
        occurredAt: new Date(),
        payload,
      },
    });

    res.json({ message: "Event ingested", event });
  } catch (err) {
    console.error("Event ingestion failed:", err);
    res.status(500).json({ error: "Failed to ingest event" });
  }
});

export default router;
