import { Router } from "express";
import prisma from "../prismaClient";   // ✅ use the singleton client

const router = Router();

/**
 * Summary: total customers, total orders, total revenue
 */
router.get("/:tenantId/summary", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const totalCustomers = await prisma.customer.count({ where: { tenantId } });
    const totalOrders = await prisma.order.count({ where: { tenantId } });

    const orders = await prisma.order.findMany({
      where: { tenantId },
      select: { totalPrice: true },
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + parseFloat(o.totalPrice?.toString() || "0"),
      0
    );

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
    });
  } catch (err) {
    console.error("❌ Summary failed:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

/**
 * Orders by date (with optional date filters)
 */
router.get("/:tenantId/orders-by-date", async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { from, to } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        shopifyCreatedAt: {
          gte: from ? new Date(from as string) : undefined,
          lte: to ? new Date(to as string) : undefined,
        },
      },
      orderBy: { shopifyCreatedAt: "asc" },
    });

    const grouped: Record<string, number> = {};
    for (const o of orders) {
      const date = o.shopifyCreatedAt.toISOString().split("T")[0];
      grouped[date] =
        (grouped[date] || 0) + parseFloat(o.totalPrice?.toString() || "0");
    }

    res.json(grouped);
  } catch (err) {
    console.error("❌ Orders by date failed:", err);
    res.status(500).json({ error: "Failed to fetch orders by date" });
  }
});

/**
 * Top 5 customers by spend
 */
router.get("/:tenantId/top-customers", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const orders = await prisma.order.findMany({
      where: { tenantId, customerId: { not: null } },
      select: { customerId: true, totalPrice: true },
    });

    const spendMap: Record<string, number> = {};
    for (const o of orders) {
      const cid = o.customerId!;
      spendMap[cid] =
        (spendMap[cid] || 0) + parseFloat(o.totalPrice?.toString() || "0");
    }

    const top = Object.entries(spendMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const customers = await Promise.all(
      top.map(async ([cid, totalSpend]) => {
        const customer = await prisma.customer.findUnique({ where: { id: cid } });
        return {
          id: customer?.id,
          name: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
          email: customer?.email,
          totalSpend: totalSpend.toFixed(2),
        };
      })
    );

    res.json(customers);
  } catch (err) {
    console.error("❌ Top customers failed:", err);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
});

/**
 * Top 5 products by revenue
 */
router.get("/:tenantId/top-products", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const lineItems = await prisma.orderLineItem.findMany({
      where: { tenantId, productId: { not: null } },
      select: { productId: true, price: true, quantity: true },
    });

    const productMap: Record<string, { revenue: number; quantity: number }> = {};
    for (const li of lineItems) {
      const pid = li.productId!;
      if (!productMap[pid]) productMap[pid] = { revenue: 0, quantity: 0 };

      productMap[pid].revenue += parseFloat(li.price?.toString() || "0") * li.quantity;
      productMap[pid].quantity += li.quantity;
    }

    const top = Object.entries(productMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    const products = await Promise.all(
      top.map(async ([pid, stats]) => {
        const product = await prisma.product.findUnique({ where: { id: pid } });
        return {
          id: product?.id,
          title: product?.title,
          description: product?.description,
          totalRevenue: stats.revenue.toFixed(2),
          totalQuantity: stats.quantity,
        };
      })
    );

    res.json(products);
  } catch (err) {
    console.error("❌ Top products failed:", err);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

export default router;
