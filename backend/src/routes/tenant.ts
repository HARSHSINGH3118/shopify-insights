import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

// Create or update a tenant (Shopify store)
router.post("/", async (req, res) => {
  try {
    const { name, shopDomain, apiKey, apiSecret, accessToken } = req.body;

    if (!name || !shopDomain || !accessToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tenant = await prisma.tenant.upsert({
      where: { shopDomain }, // shopDomain is unique
      update: {
        name,
        apiKey: apiKey || "",
        apiSecret: apiSecret || "",
        accessToken,
      },
      create: {
        name,
        shopDomain,
        apiKey: apiKey || "",
        apiSecret: apiSecret || "",
        accessToken,
      },
    });

    res.json(tenant);
  } catch (error: any) {
    console.error("Tenant creation failed:", error);
    res.status(500).json({ error: "Failed to create tenant", details: error.message });
  }
});

// List tenants (for testing)
router.get("/", async (_req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();
    res.json(tenants);
  } catch (error: any) {
    console.error("Failed to fetch tenants:", error);
    res.status(500).json({ error: "Failed to fetch tenants", details: error.message });
  }
});

export default router;
