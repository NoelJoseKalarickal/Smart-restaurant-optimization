# Smart Restaurant Supply, Demand & Food Waste Optimization System

A Next.js + MySQL + MongoDB DBMS Level 3 project.

## Requirements
- Node.js 18.17+ and npm
- MySQL 8.0+
- MongoDB 6+ (optional for core features; used for audit/activity logs)

## 1. Configure MySQL
Create/import the database by running `sql/schema.sql` in MySQL Workbench, or:

```bash
mysql -u root -p < sql/schema.sql
```

## 2. Configure MongoDB
Start MongoDB locally, then run `sql/mongodb-setup.js` in `mongosh`.

## 3. Configure environment
Copy `.env.example` to `.env.local` and enter your MySQL password and a strong JWT secret. Never commit `.env.local`.

## 4. Install and seed
```bash
npm install
npm run seed
```

The seed script creates demo manager `manager@restaurant.local` with password `Manager@123`, sample suppliers, ingredients, stock, dishes and recipes. Change the demo password before deployment.

## 5. Start
```bash
npm run dev
```
Open http://localhost:3000 and sign in.

## Features
- Role-based login (Admin, Manager, Staff)
- Dashboard with stock, order, waste and alert summaries
- Ingredient inventory and supplier records
- Purchase order creation
- Customer orders with ACID recipe-stock deduction
- Food waste recording with stock reconciliation
- Low-stock trigger alerts
- 30-day ingredient consumption and 7-day replenishment estimate
- MongoDB activity log documents

## Important implementation notes
- Stock is stored in `Stock_Batch` and aggregated per ingredient.
- Orders consume recipe quantities using FEFO batch order (earliest expiry first).
- Purchase orders are created as Pending; stock is added when received. The receiving workflow is a recommended next extension.
- Demo data is illustrative. Validate quantities/units and business rules with your instructor.

## API overview
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET/POST /api/ingredients`
- `GET/POST /api/suppliers`
- `GET/POST /api/purchase-orders`
- `GET/POST /api/orders`
- `GET/POST /api/waste`
- `GET/PATCH /api/alerts`
- `GET /api/dashboard`, `/api/analytics`, `/api/menu`

Authenticated endpoints accept `Authorization: Bearer <token>`.

## Updates in this version
- Public staff registration (new accounts default to Staff; manager/admin roles remain restricted).
- Recipe management at /recipes.
- Order type selection and completion status.
- Purchase order item details in the list.
- Ingredient and supplier edit API support.

Before running the updated app, execute `sql/migration_order_status.sql` once in MySQL Workbench. Do not rerun the original schema or seed script over your existing data.
