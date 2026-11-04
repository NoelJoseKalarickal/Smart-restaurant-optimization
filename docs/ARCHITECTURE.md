# System architecture

```mermaid
flowchart TD
  U[Manager / Staff browser] --> FE[Next.js UI]
  FE --> API[Next.js API routes]
  API --> AUTH[JWT role checks]
  API --> SQL[(MySQL: transactional records)]
  API --> NOSQL[(MongoDB: activity logs)]
  SQL --> TR[Triggers / views / stored procedures]
  API --> AN[Demand and waste analytics]
  AN --> FE
```

MySQL is the system of record for ingredients, batch stock, suppliers, orders, recipes, purchase orders, waste and alerts. MongoDB stores append-only operational events with flexible event-specific details.
