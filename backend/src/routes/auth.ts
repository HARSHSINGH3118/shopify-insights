import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

/**
 * Simple email login → fetch tenant by email
 */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    const customer = await prisma.customer.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",  
        },
      },
      include: { tenant: true },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ tenant: customer.tenant });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
