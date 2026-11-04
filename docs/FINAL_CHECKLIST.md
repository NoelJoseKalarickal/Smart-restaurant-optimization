# Final submission checklist

- [ ] Import `sql/schema.sql` into MySQL 8+.
- [ ] Configure `.env.local` from `.env.example`.
- [ ] Start MongoDB and run `sql/mongodb-setup.js` in mongosh.
- [ ] Run `npm install` and `npm run seed`.
- [ ] Run `npm run dev`, log in and test each workflow.
- [ ] Test an order with sufficient stock and confirm stock is deducted.
- [ ] Test an order with insufficient stock and confirm rollback.
- [ ] Record waste and confirm stock is deducted.
- [ ] Create a purchase order and mark it received; confirm stock batch is created.
- [ ] Run `CALL sp_low_stock()` and `CALL sp_generate_expiry_alerts()` in MySQL.
- [ ] Verify activity events in MongoDB `restaurant_activity.activity_logs`.
- [ ] Capture screenshots of your actual running application for the report.
- [ ] Replace demo credentials and keep `.env.local` out of GitHub.
- [ ] Update the contribution section to accurately reflect each member's work.
- [ ] Commit and push the code using each team member's own Git identity.

**Important:** The project source is assembled, and TypeScript/TSX syntax was checked. A full install/build and live MySQL/MongoDB integration test could not be run in this environment, so complete the checklist on your computer before submitting.
