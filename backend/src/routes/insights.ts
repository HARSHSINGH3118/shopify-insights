import { Router } from "express";
import prisma from "../prismaClient";

const router = Router();

 
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

     
    const totalProducts = await prisma.product.count({ where: { tenantId } });

     
    const lineItems = await prisma.orderLineItem.findMany({
      where: { tenantId },
      select: { quantity: true },
    });
    const totalInventory = lineItems.reduce((sum, li) => sum + li.quantity, 0);

    
    const productStats = await prisma.orderLineItem.groupBy({
      by: ["productId"],
      where: { tenantId, productId: { not: null } },
      _sum: { price: true, quantity: true },
    });

    let topProduct: any = null;
    if (productStats.length > 0) {
      const top = productStats.sort(
        (a, b) =>
          (parseFloat(b._sum.price?.toString() || "0") * (b._sum.quantity || 0)) -
          (parseFloat(a._sum.price?.toString() || "0") * (a._sum.quantity || 0))
      )[0];

      const product = await prisma.product.findUnique({
        where: { id: top.productId! },
      });

      if (product) {
        topProduct = {
          id: product.id,
          title: product.title,
          revenue:
            (parseFloat(top._sum.price?.toString() || "0") *
              (top._sum.quantity || 0)).toFixed(2),
        };
      }
    }

   
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newCustomersThisWeek = await prisma.customer.count({
      where: { tenantId, createdAt: { gte: oneWeekAgo } },
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      totalProducts,
      totalInventory,
      topProduct,
      newCustomersThisWeek,
    });
  } catch (err) {
    console.error("Summary failed:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

 
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
    console.error("Orders by date failed:", err);
    res.status(500).json({ error: "Failed to fetch orders by date" });
  }
});
 
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
    console.error("Top customers failed:", err);
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
});

 
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
    console.error("Top products failed:", err);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

export default router;
