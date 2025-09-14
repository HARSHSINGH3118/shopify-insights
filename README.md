# Shopify Data Ingestion & Insights Application  

A full-stack system that ingests **Shopify store data** (customers, products, and orders) into a multi-tenant backend, and provides a professional **insights dashboard** with visualizations and analytics.  

**Live Links**  
- **Frontend (Vercel):** [https://shopify-insights-flax.vercel.app](https://shopify-insights-flax.vercel.app)  
- **Backend (Render):** [https://shopify-insights-oxv7.onrender.com](https://shopify-insights-oxv7.onrender.com)  

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

## Repository Structure  
### Backend (`/backend`)
```
backend/
├── prisma/ # Prisma schema & migrations
│ ├── schema.prisma # DB schema (models: Customer, Order, Product, etc.)
│ └── migrations/ # Auto-generated migration files
│
├── src/
│ ├── routes/ # Express route handlers
│ │ ├── auth.ts # Authentication routes
│ │ ├── events.ts # Event ingestion APIs
│ │ ├── ingest.ts # Shopify ingestion logic
│ │ ├── insights.ts # Summary, top-customers, top-products
│ │ └── tenant.ts # Tenant APIs (list/create tenants)
│ │
│ ├── middleware/ # Middleware utilities
│ │ └── auth.ts # API key validation middleware
│ │
│ ├── services/ # External service handlers
│ │ └── shopifyService.ts # Shopify API integration (customers, orders, products)
│ │
│ ├── prismaClient.ts # Prisma Client initialization
│ ├── scheduler.ts # Cron job for periodic ingestion
│ └── index.ts # Express server entrypoint
│
├── .env # Environment variables (local)
├── package.json # Dependencies & scripts
├── tsconfig.json # TypeScript config
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
│ ├── components/ # Shared UI components
│ │ ├── Sidebar.tsx # Sidebar navigation
│ │ ├── Navbar.tsx # Top navbar (optional)
│ │ ├── Chart.tsx # Recharts-based chart components
│ │ └── Card.tsx # Reusable summary/stat card
│ │
│ ├── context/ # Global contexts
│ │ └── TenantContext.tsx # Provides tenant session across app
│ │
│ ├── lib/ # Utility libraries
│ │ └── api.ts # Axios API wrapper
│ │
│ ├── styles/ # Global styles
│ │ └── globals.css # Tailwind CSS base
│ │
│ └── types/ # (Optional) TypeScript type definitions
│
├── .env.local # Environment variables for frontend
├── package.json # Dependencies & scripts
├── tailwind.config.js # Tailwind CSS config
├── tsconfig.json # TypeScript config
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
## Assumptions
- Each login email is matched against ingested customers to determine tenant access.
- Inventory is derived from order line items (Shopify dev store does not expose stock APIs directly).
- Cron scheduler interval is set to 1 minute for demo purposes.

## Future Improvements
- Integrate real inventory sync from Shopify APIs.

- Add role-based authentication (admin vs customer).

- Add pagination and filters in frontend tables.

- Add retry and error logging in ingestion scheduler.

- Dockerize for deployment flexibility.

##  Acknowledgements  

This project was developed as part of the **Xeno FDE Internship Assignment – 2025**.  
Special thanks to the mentors and team for their guidance and feedback.  

## Contact  

For queries or collaboration opportunities:  

**Harsh Singh**  
📩 harsh31102005@gmail.com 
🔗 [LinkedIn](https://linkedin.com/in/harshsingh3118)  
