import cron from "node-cron";
import prisma from "./prismaClient";
import { fetchShopifyData } from "./services/shopifyService";

/**
 * Run every hour: sync customers/products/orders for all tenants
 */
cron.schedule("0 * * * *", async () => {
  console.log("Running hourly Shopify sync...");
  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    try {
      // Customers
      const custData = await fetchShopifyData(tenant.shopDomain, tenant.accessToken, "customers");
      for (const c of custData.customers) {
        await prisma.customer.upsert({
          where: { tenantId_shopifyCustomerId: { tenantId: tenant.id, shopifyCustomerId: BigInt(c.id) } },
          update: { email: c.email, firstName: c.first_name, lastName: c.last_name, updatedAt: new Date(c.updated_at) },
          create: { tenantId: tenant.id, shopifyCustomerId: BigInt(c.id), email: c.email, firstName: c.first_name, lastName: c.last_name },
        });
      }

      // Products
      const prodData = await fetchShopifyData(tenant.shopDomain, tenant.accessToken, "products");
      for (const p of prodData.products) {
        await prisma.product.upsert({
          where: { tenantId_shopifyProductId: { tenantId: tenant.id, shopifyProductId: BigInt(p.id) } },
          update: { title: p.title, description: p.body_html || "", price: p.variants?.[0]?.price || "0" },
          create: { tenantId: tenant.id, shopifyProductId: BigInt(p.id), title: p.title, description: p.body_html || "", price: p.variants?.[0]?.price || "0" },
        });
      }

      // Orders
      const orderData = await fetchShopifyData(tenant.shopDomain, tenant.accessToken, "orders");
      for (const o of orderData.orders) {
        await prisma.order.upsert({
          where: { tenantId_shopifyOrderId: { tenantId: tenant.id, shopifyOrderId: BigInt(o.id) } },
          update: { totalPrice: o.total_price, currency: o.currency, shopifyCreatedAt: new Date(o.created_at) },
          create: { tenantId: tenant.id, shopifyOrderId: BigInt(o.id), totalPrice: o.total_price, currency: o.currency, shopifyCreatedAt: new Date(o.created_at) },
        });
      }
    } catch (err) {
      console.error(`Sync failed for tenant ${tenant.id}`, err);
    }
  }
});
