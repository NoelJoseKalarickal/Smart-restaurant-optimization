# Smart Restaurant Supply, Demand & Food Waste Optimization System

**Team:** Noel Jose (PES2UG24CS330), Pradhyumn Anand (PES2UG24CS358)

## 1. Problem statement
Restaurants can over-purchase ingredients, run out of frequently used stock, and lose money through expiry, spoilage and over-preparation. Disconnected records make it difficult to connect sales to ingredient consumption and purchasing decisions.

## 2. Objectives
- Maintain ingredient, supplier, purchase and batch-level stock records.
- Deduct recipe ingredients when a customer order is recorded.
- Record waste and its reason while reconciling available stock.
- Alert managers to low stock and upcoming expiry.
- Estimate ingredient demand from the previous 30 days of orders and recommend a 7-day replenishment quantity.
- Separate transactional relational data from flexible activity/audit documents.

## 3. Scope and roles
Admin/Manager can create ingredients, suppliers and purchase orders and review analytics. Staff can record customer orders and food waste. This implementation has role checks on management endpoints; all authenticated roles can read operational lists.

## 4. Functional requirements
1. Authenticate users with hashed passwords and role claims.
2. Create and view ingredients and suppliers.
3. Create purchase orders with line items.
4. Maintain stock in dated batches.
5. Define dishes and recipes mapping dishes to ingredient quantities.
6. Record orders and deduct recipe ingredients atomically.
7. Record food waste and deduct stock atomically.
8. Generate low-stock alerts and expiry-aware stock views.
9. Display operational dashboard and 30-day demand estimates.
10. Store audit/activity events in MongoDB.

## 5. Database selection
**MySQL** stores strongly structured, transactional records: users, suppliers, ingredients, stock batches, purchase orders, recipes, customer orders, waste and alerts. These records require referential integrity, constraints, joins and ACID transactions.

**MongoDB** stores append-only activity logs. Events have different detail fields (order-created, waste-recorded, ingredient-created, purchase-created), so a flexible document structure is suitable. MongoDB is not used as a duplicate source of truth for stock or orders.

## 6. ER diagram and relational schema
The supplied ER diagram and relational schema are retained as the baseline. The implemented SQL schema is in `sql/schema.sql`. Core relationships: Supplier 1:N Purchase_Order; Purchase_Order 1:N Purchase_Item; Ingredient 1:N Stock_Batch; Dish M:N Ingredient through Recipe; Customer_Order M:N Dish through Order_Item; Ingredient 1:N Food_Waste and Alert; User 1:N orders, purchase orders and waste records.

## 7. Data dictionary (summary)
- Users: identity, role, unique email and bcrypt password hash.
- Supplier: supplier contact and address.
- Ingredient: name, category, unit, unit cost and reorder threshold.
- Purchase_Order/Purchase_Item: supplier order header and ingredient line items.
- Stock_Batch: quantity, received date and expiry date per ingredient batch.
- Dish/Recipe: menu item and ingredient quantity required per serving.
- Customer_Order/Order_Item: sales transaction and purchased dishes.
- Food_Waste: ingredient quantity, reason, date and recording user.
- Alert: low-stock/overstock/near-expiry alert lifecycle.

## 8. Advanced database concepts
1. **ACID transactions:** Order creation and recipe stock deductions occur in one transaction. If any ingredient is insufficient, all changes roll back. Waste recording and stock deduction also run transactionally.
2. **Triggers:** `trg_stock_batch_alert` and its update counterpart create a low-stock alert when batch stock drops below the ingredient threshold.
3. **Views:** `v_ingredient_stock` consolidates batch quantities; `v_monthly_waste` summarizes waste by month and reason.
4. **Stored procedure:** `sp_low_stock()` returns ingredients below reorder level; `sp_generate_expiry_alerts()` creates alerts for batches expiring within three days when executed by a manager/scheduled job.
5. **Indexes:** indexes support ingredient name lookup, batch expiry and ingredient stock lookup, order date, waste date and alert status.
6. **MongoDB aggregation-ready collection:** activity logs are indexed by event/time for operational reporting.

## 9. Demand estimation
For each ingredient, the API calculates ingredient usage from recipe quantities multiplied by sold dish quantities during the last 30 days. Daily average = 30-day usage / 30. Suggested purchase quantity is the greater of the reorder-level shortfall and (7-day forecast minus current stock), never below zero. This is a simple baseline forecast, not a machine-learning model; it can be improved with weekday/seasonality and supplier lead-time data.

## 10. Security and integration
The Next.js server routes access MySQL and MongoDB; browser code never receives database credentials. Credentials are environment variables. Passwords are bcrypt hashes. API routes verify a signed JWT and apply role checks for management operations. Use HTTPS and a strong JWT secret in deployment.

## 11. Run instructions
See `README.md`. Import `sql/schema.sql`, configure `.env.local`, install packages, seed demo records, then run `npm run dev`. MongoDB is optional for core MySQL operations but required for activity audit events.

## 12. Test cases
- Valid manager login succeeds; invalid password is rejected.
- Ingredient with missing name/unit is rejected.
- Duplicate user email is rejected by UNIQUE constraint.
- Order with enough stock records order and deducts recipe stock.
- Order with insufficient stock is rejected and stock/order rows remain unchanged (rollback).
- Waste entry with positive available quantity deducts stock.
- Waste quantity greater than stock is rejected and rolled back.
- Stock below reorder level creates an active alert.
- Analytics endpoint returns usage-based forecasts and waste summary.
- Staff cannot create supplier/ingredient/purchase order.

## 13. Known limitations / future work
- Purchase order receipt creates stock batches and marks the purchase order Delivered. The receipt action currently applies one optional expiry date to all line items in that purchase order.
- Expiry alerts should be generated by a scheduled daily job.
- Forecasting currently uses a 30-day average and does not model weekdays, holidays or lead times.
- Add pagination, audit-log viewer, password reset, CSRF protection for cookie auth if adopted, rate limiting and production-grade session management before public deployment.
- Add edit/archive screens and multi-item order form for richer operations.

## 14. Team contribution plan
Both team members should make genuine, traceable commits across database and application work. Suggested split: Noel — SQL design, transaction APIs, MongoDB audit integration; Pradhyumn — UI pages, analytics/dashboard, validation and testing. Both review and test each other's modules. Adjust this section to reflect actual work completed.
