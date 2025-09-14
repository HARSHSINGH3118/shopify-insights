import cron from "node-cron";
import prisma from "./prismaClient";
import { fetchShopifyData } from "./services/shopifyService";

/**
 * Run every 1 minute: sync customers, products, and orders (with line items) for all tenants
 */
cron.schedule("* * * * *", async () => {
  console.log("⏳ Running scheduled Shopify sync...");

  const tenants = await prisma.tenant.findMany();

  for (const tenant of tenants) {
    try {
      console.log(`Syncing tenant: ${tenant.name} (${tenant.shopDomain})`);

      // Fetch all 3 in parallel
      const [custData, prodData, orderData] = await Promise.all([
        fetchShopifyData(tenant.shopDomain, tenant.accessToken, "customers"),
        fetchShopifyData(tenant.shopDomain, tenant.accessToken, "products"),
        fetchShopifyData(tenant.shopDomain, tenant.accessToken, "orders"),
      ]);

      // --- Customers ---
      if (custData?.customers?.length) {
        await Promise.all(
          custData.customers.map((c: any) =>
            prisma.customer.upsert({
              where: {
                tenantId_shopifyCustomerId: {
                  tenantId: tenant.id,
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
                tenantId: tenant.id,
                shopifyCustomerId: BigInt(c.id),
                email: c.email,
                firstName: c.first_name,
                lastName: c.last_name,
              },
            })
          )
        );
      }

      // --- Products ---
      if (prodData?.products?.length) {
        await Promise.all(
          prodData.products.map((p: any) =>
            prisma.product.upsert({
              where: {
                tenantId_shopifyProductId: {
                  tenantId: tenant.id,
                  shopifyProductId: BigInt(p.id),
                },
              },
              update: {
                title: p.title,
                description: p.body_html || "",
                price: p.variants?.[0]?.price || "0",
              },
              create: {
                tenantId: tenant.id,
                shopifyProductId: BigInt(p.id),
                title: p.title,
                description: p.body_html || "",
                price: p.variants?.[0]?.price || "0",
              },
            })
          )
        );
      }

      // --- Orders + Line Items ---
      if (orderData?.orders?.length) {
        for (const o of orderData.orders) {
          //  find customerId (if exists in DB)
          let customerId: string | null = null;
          if (o.customer) {
            const existingCustomer = await prisma.customer.findUnique({
              where: {
                tenantId_shopifyCustomerId: {
                  tenantId: tenant.id,
                  shopifyCustomerId: BigInt(o.customer.id),
                },
              },
            });
            if (existingCustomer) customerId = existingCustomer.id;
          }

          const order = await prisma.order.upsert({
            where: {
              tenantId_shopifyOrderId: {
                tenantId: tenant.id,
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
              tenantId: tenant.id,
              shopifyOrderId: BigInt(o.id),
              totalPrice: o.total_price,
              currency: o.currency,
              shopifyCreatedAt: new Date(o.created_at),
              customerId,
            },
          });

          // --- Line Items ---
          if (o.line_items?.length) {
            await Promise.all(
              o.line_items.map(async (item: any) => {
                // Resolve productId from Product table
                let productId: string | null = null;
                if (item.product_id) {
                  const existingProduct = await prisma.product.findUnique({
                    where: {
                      tenantId_shopifyProductId: {
                        tenantId: tenant.id,
                        shopifyProductId: BigInt(item.product_id),
                      },
                    },
                  });
                  if (existingProduct) productId = existingProduct.id;
                }

                await prisma.orderLineItem.upsert({
                  where: {
                    tenantId_shopifyItemId: {
                      tenantId: tenant.id,
                      shopifyItemId: BigInt(item.id),
                    },
                  },
                  update: {
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                    productId,
                    orderId: order.id,
                  },
                  create: {
                    tenantId: tenant.id,
                    shopifyItemId: BigInt(item.id),
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                    productId,
                    orderId: order.id,
                  },
                });
              })
            );
          }
        }
      }

      console.log(`Sync completed for tenant ${tenant.name}`);
    } catch (err) {
      console.error(`Sync failed for tenant ${tenant.id}`, err);
    }
  }
});
