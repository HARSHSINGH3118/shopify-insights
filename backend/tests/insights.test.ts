// tests/insights.test.ts
import request from "supertest";
import express from "express";
import insightsRouter from "../src/routes/insights";

// Mock Prisma
jest.mock("../src/prismaClient", () => {
  return {
    __esModule: true, // important for default export
    default: {
      customer: { count: jest.fn(), findUnique: jest.fn() },
      order: { count: jest.fn(), findMany: jest.fn() },
      orderLineItem: { findMany: jest.fn() },
      product: { findUnique: jest.fn() },
    },
  };
});

import prisma from "../src/prismaClient"; // ✅ default import, now matches mock

const app = express();
app.use(express.json());
app.use("/insights", insightsRouter);

describe("Insights API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return summary", async () => {
    (prisma.customer.count as jest.Mock).mockResolvedValue(5);
    (prisma.order.count as jest.Mock).mockResolvedValue(2);
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      { totalPrice: "100.50" },
      { totalPrice: "200.75" },
    ]);

    const res = await request(app).get("/insights/test-tenant/summary");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalCustomers: 5,
      totalOrders: 2,
      totalRevenue: "301.25",
    });
  });

  it("should return orders grouped by date", async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      { shopifyCreatedAt: new Date("2025-09-01"), totalPrice: "100.00" },
      { shopifyCreatedAt: new Date("2025-09-01"), totalPrice: "50.00" },
      { shopifyCreatedAt: new Date("2025-09-02"), totalPrice: "200.00" },
    ]);

    const res = await request(app).get("/insights/test-tenant/orders-by-date");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      "2025-09-01": 150,
      "2025-09-02": 200,
    });
  });

  it("should return top customers", async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([
      { customerId: "c1", totalPrice: "300.00" },
      { customerId: "c2", totalPrice: "150.00" },
      { customerId: "c1", totalPrice: "100.00" },
    ]);
    (prisma.customer.findUnique as jest.Mock).mockImplementation(({ where }) => {
      if (where.id === "c1")
        return { id: "c1", firstName: "Alice", lastName: "Smith", email: "a@test.com" };
      if (where.id === "c2")
        return { id: "c2", firstName: "Bob", lastName: "Jones", email: "b@test.com" };
      return null;
    });

    const res = await request(app).get("/insights/test-tenant/top-customers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: "c1",
        name: "Alice Smith",
        email: "a@test.com",
        totalSpend: "400.00",
      },
      {
        id: "c2",
        name: "Bob Jones",
        email: "b@test.com",
        totalSpend: "150.00",
      },
    ]);
  });

  it("should return top products", async () => {
    (prisma.orderLineItem.findMany as jest.Mock).mockResolvedValue([
      { productId: "p1", price: "50.00", quantity: 2 },
      { productId: "p1", price: "50.00", quantity: 1 },
      { productId: "p2", price: "100.00", quantity: 1 },
    ]);
    (prisma.product.findUnique as jest.Mock).mockImplementation(({ where }) => {
      if (where.id === "p1") return { id: "p1", title: "Product 1", description: "Desc 1" };
      if (where.id === "p2") return { id: "p2", title: "Product 2", description: "Desc 2" };
      return null;
    });

    const res = await request(app).get("/insights/test-tenant/top-products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: "p1",
        title: "Product 1",
        description: "Desc 1",
        totalRevenue: "150.00",
        totalQuantity: 3,
      },
      {
        id: "p2",
        title: "Product 2",
        description: "Desc 2",
        totalRevenue: "100.00",
        totalQuantity: 1,
      },
    ]);
  });
});
