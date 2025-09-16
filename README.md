# Shopify Data Ingestion & Insights Application  

A full-stack system that ingests **Shopify store data** (customers, products, and orders) into a multi-tenant backend, and provides a professional **insights dashboard** with visualizations and analytics.  

**Live Links**  
- **Frontend (Vercel):** [https://shopify-insights-flax.vercel.app](https://shopify-insights-flax.vercel.app)  
- **Backend (Render):** [https://shopify-insights-oxv7.onrender.com](https://shopify-insights-oxv7.onrender.com)
- Technical Document: https://drive.google.com/file/d/1pVrOJN82ybUeVUWnsOMZO-Uoe4uG3Qxk/view?usp=sharing
- Demo video Link: https://drive.google.com/file/d/10CmlJt65_EGps_j2_uXLW7k7XwCg283K/view?usp=sharing
- Testing Email - harsh31102005@gmail.com


---

## Features  

### Data Ingestion  
- Scheduled ingestion job (every 1 minute using `node-cron`).  
- Fetches and persists:  
  - Customers  
  - Products  
  - Orders (with line items).  
- Isolates all data by tenant for multi-store support.  

### Insights Dashboard  
- **Summary metrics**: customers, orders, revenue, products, inventory, new customers.  
- **Orders by Date**: line chart visualization.  
- **Top Customers**: ranked by lifetime spend.  
- **Top Products**: ranked by total revenue.  
- **Custom Events**: ability to log events such as cart updates or checkout initiation.  

### Authentication  
- Simple **email-based login**.  
- Validates users against ingested customers.  
- Stores tenant session in frontend context.  

---

## Tech Stack  

**Backend**  
- Node.js + Express  
- PostgreSQL with Prisma ORM  
- Axios for Shopify API integration  
- node-cron for scheduled ingestion  

**Frontend**  
- Next.js (App Router)  
- React with Hooks and Context  
- Tailwind CSS for styling  
- Recharts for charts and data visualization  

---
## Database Schema
```
model Tenant {
  id         String   @id @default(uuid())
  name       String
  shopDomain String   @unique
  apiKey     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  customers  Customer[]
  orders     Order[]
  products   Product[]
}

model Customer {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  lifetimeSpend Float
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
}

model Order {
  id        String   @id @default(uuid())
  shopifyId String   @unique
  amount    Float
  createdAt DateTime
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  items     OrderItem[]
}

model Product {
  id        String   @id @default(uuid())
  shopifyId String   @unique
  name      String
  price     Float
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
}
```
---
## Repository Structure  
### Backend (`/backend`)
```
backend/
├── prisma/  
│ ├── schema.prisma 
│ └── migrations/ 
│
├── src/
│ ├── routes/ 
│ │ ├── auth.ts  
│ │ ├── events.ts  
│ │ ├── ingest.ts  
│ │ ├── insights.ts  
│ │ └── tenant.ts  
│ │
│ ├── middleware/ 
│ │ └── auth.ts  
│ │
│ ├── services/  
│ │ └── shopifyService.ts  
│ │
│ ├── prismaClient.ts  
│ ├── scheduler.ts  
│ └── index.ts  
│
├── .env 
├── package.json  
├── tsconfig.json  
└── README.md
```
### Frontend (`/frontend`) 
```
frontend/
├── public/ # Static assets (favicon, icons, etc.)
│
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── login/ # Login page
│ │ │ └── page.tsx
│ │ ├── customers/ # Customers insights
│ │ │ └── page.tsx
│ │ ├── products/ # Products insights
│ │ │ └── page.tsx
│ │ ├── orders/ # Orders by date insights
│ │ │ └── page.tsx
│ │ ├── events/ # Events logging page
│ │ │ └── page.tsx
│ │ ├── page.tsx # Dashboard summary (default homepage)
│ │ └── layout.tsx # App-wide layout (sidebar, navbar, etc.)
│ │
│ ├── components/ 
│ │ ├── Sidebar.tsx 
│ │ ├── Navbar.tsx  
│ │ ├── Chart.tsx  
│ │ └── Card.tsx  
│ │
│ ├── context/ # Global contexts
│ │ └── TenantContext.tsx  
│ │
│ ├── lib/ # Utility libraries
│ │ └── api.ts  
│ │
│ ├── styles/  
│ │ └── globals.css  
│ │
│ └── types/  
│
├── .env.local  
├── package.json  
├── tailwind.config.js  
├── tsconfig.json  
└── README.md
```

---

## Setup Instructions  

### Backend  

1. Clone repository and move into backend:  
   ```bash
   git clone https://github.com/YOUR_USERNAME/shopify-insights.git
   cd shopify-insights/backend

2. Install dependencies:
```
npm install
```
3. Configure environment:
Create .env
```
DATABASE_URL=Enter Database URL
# Shopify store details
SHOPIFY_SHOP_DOMAIN
SHOPIFY_ADMIN_API_KEY
SHOPIFY_ADMIN_API_SECRET
SHOPIFY_ADMIN_ACCESS_TOKEN

API_KEY=supersecret123
PORT=4000
```
5. Generate Prisma client:
```

npx prisma generate
```
6. Start backend:
```
npm run dev
```
### Frontend
1. Move into frontend:
```
cd ../frontend
```
2. Install dependencies:
```
npm install
```
3. Configure .env.local:
```
NEXT_PUBLIC_API_URL=https://shopify-insights-oxv7.onrender.com
NEXT_PUBLIC_API_KEY=supersecret123
```
4. Start frontend:
```
npm run dev
```
---
## API Endpoints
### Insights

- GET /:tenantId/summary → totals (customers, orders, revenue, products, inventory, top product, new customers).

- GET /:tenantId/orders-by-date → revenue grouped by date.

- GET /:tenantId/top-customers → top 5 customers by spend.

- GET /:tenantId/top-products → top 5 products by revenue.
### Events
- POST /:tenantId/events → record custom event { type, payload }.
### Authentication
- POST /auth/login → login with email.
### Tenants
- GET /tenants → list tenants.
---

## Architecture
```
+-------------------+        +-----------------+        +-------------------+
|   Shopify Store   | -----> |  Ingestion API  | -----> |  PostgreSQL (DB)  |
+-------------------+        +-----------------+        +-------------------+
                                    |
                                    v
                           +------------------+
                           |  Insights APIs   |
                           +------------------+
                                    |
                                    v
                           +------------------+
                           |  Next.js Frontend|
                           +------------------+
```
---
## Assumptions

### User Authentication
Login emails are directly matched against ingested customer records to determine tenant access. Role-based access control (e.g., admin vs. customer) is not yet implemented.

### Inventory Calculation
Inventory values are derived from order line items, since the Shopify Dev Store does not provide real-time stock API access.

### Data Refresh Interval
A cron scheduler is configured to run every 1 minute for demonstration purposes. In production, webhook-based ingestion or longer intervals would be preferable.

### Multi-Tenancy
Each Shopify store (tenant) is isolated by a unique tenantId. All customers, orders, and products are scoped under the corresponding tenant.

### Data Consistency
It is assumed that Shopify APIs always return valid, consistent, and up-to-date data. No additional reconciliation layer is implemented.

### Error Handling
Failed ingestion jobs do not currently retry automatically. It is assumed that transient Shopify API failures are minimal in the demo environment.

### Security
Environment variables are used to store credentials, API keys, and database connection strings. OAuth-based Shopify authentication is assumed for future production work.

---
## Future Improvements
- Integrate real inventory sync from Shopify APIs.

- Add role-based authentication (admin vs customer).

- Add pagination and filters in frontend tables.

- Add retry and error logging in ingestion scheduler.

- Dockerize for deployment flexibility.

---
## Known Limitations & Assumptions

### Authentication is minimal:

- Email-based login only.
- No role-based access (admin vs customer).

### Inventory data is inferred:

- Shopify dev store does not expose real-time stock APIs.
- Inventory is approximated from order line items.

### Scheduler (CRON):

- Interval is set to 1 minute for demo purposes.
- In production, webhooks or distributed schedulers should be used.

### Error handling:

- Current ingestion lacks retries or exponential backoff.
- Failed jobs may silently drop.

### Scalability:

- Designed as MVP; no horizontal scaling or message queue yet.

### Multi-tenancy:

- Each tenant is separated by tenantId, but no per-tenant rate limiting is in place.

---

##  Acknowledgements  

This project was developed as part of the **Xeno FDE Internship Assignment – 2025**.  
Special thanks to the mentors and team for their guidance and feedback.  

## Contact  

For queries or collaboration opportunities:  

**Harsh Singh**  
📩 harsh31102005@gmail.com 
🔗 [LinkedIn](https://linkedin.com/in/harshsingh3118)  
