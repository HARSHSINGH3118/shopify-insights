import { Router } from "express";
import prisma from "../prismaClient";   // ✅ use singleton
import { fetchShopifyData } from "../services/shopifyService";

const router = Router();

/**
 * Ingest Customers
 */
router.post("/:tenantId/customers", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const data = await fetchShopifyData(
      tenant.shopDomain,
      tenant.accessToken,
      "customers"
    );

    for (const c of data.customers) {
      await prisma.customer.upsert({
        where: {
          tenantId_shopifyCustomerId: {
            tenantId,
            shopifyCustomerId: BigInt(c.id),
          },
        },
        update: {
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          updatedAt: new Date(c.updated_at),
        },
        create: {
          tenantId,
          shopifyCustomerId: BigInt(c.id),
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
        },
      });
    }

    res.json({ message: "Customers ingested successfully ✅" });
  } catch (err) {
    console.error("❌ Customer ingestion failed:", err);
    res.status(500).json({ error: "Failed to ingest customers" });
  }
});

/**
 * Ingest Products
 */
router.post("/:tenantId/products", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const data = await fetchShopifyData(
      tenant.shopDomain,
      tenant.accessToken,
      "products"
    );

    for (const p of data.products) {
      await prisma.product.upsert({
        where: {
          tenantId_shopifyProductId: {
            tenantId,
            shopifyProductId: BigInt(p.id),
          },
        },
        update: {
          title: p.title,
          description: p.body_html || "",
          price: p.variants?.[0]?.price || "0",
        },
        create: {
          tenantId,
          shopifyProductId: BigInt(p.id),
          title: p.title,
          description: p.body_html || "",
          price: p.variants?.[0]?.price || "0",
        },
      });
    }

    res.json({ message: "Products ingested successfully ✅" });
  } catch (err) {
    console.error("❌ Product ingestion failed:", err);
    res.status(500).json({ error: "Failed to ingest products" });
  }
});

/**
 * Ingest Orders + Line Items (with Product linking)
 */
router.post("/:tenantId/orders", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const data = await fetchShopifyData(
      tenant.shopDomain,
      tenant.accessToken,
      "orders"
    );

    for (const o of data.orders) {
      let customerId: string | undefined = undefined;

      if (o.customer) {
        const existingCustomer = await prisma.customer.findUnique({
          where: {
            tenantId_shopifyCustomerId: {
              tenantId,
              shopifyCustomerId: BigInt(o.customer.id),
            },
          },
        });
        if (existingCustomer) {
          customerId = existingCustomer.id;
        }
      }

      const order = await prisma.order.upsert({
        where: {
          tenantId_shopifyOrderId: {
            tenantId,
            shopifyOrderId: BigInt(o.id),
          },
        },
        update: {
          totalPrice: o.total_price,
          currency: o.currency,
          shopifyCreatedAt: new Date(o.created_at),
          customerId,
        },
        create: {
          tenantId,
          shopifyOrderId: BigInt(o.id),
          totalPrice: o.total_price,
          currency: o.currency,
          shopifyCreatedAt: new Date(o.created_at),
          customerId,
        },
      });

      for (const li of o.line_items || []) {
        let productId: string | undefined = undefined;

        if (li.product_id) {
          const existingProduct = await prisma.product.findUnique({
            where: {
              tenantId_shopifyProductId: {
                tenantId,
                shopifyProductId: BigInt(li.product_id),
              },
            },
          });

          if (existingProduct) {
            productId = existingProduct.id;
          }
        }

        await prisma.orderLineItem.upsert({
          where: {
            tenantId_shopifyItemId: {
              tenantId,
              shopifyItemId: BigInt(li.id),
            },
          },
          update: {
            title: li.title,
            quantity: li.quantity,
            price: li.price,
            productId,
            orderId: order.id,
          },
          create: {
            tenantId,
            shopifyItemId: BigInt(li.id),
            title: li.title,
            quantity: li.quantity,
            price: li.price,
            orderId: order.id,
            productId,
          },
        });
      }
    }

    res.json({ message: "Orders + Line items (linked to products) ingested ✅" });
  } catch (err) {
    console.error("❌ Order ingestion failed:", err);
    res.status(500).json({ error: "Failed to ingest orders" });
  }
});

export default router;
