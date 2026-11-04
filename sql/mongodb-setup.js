// Run in mongosh against restaurant_activity database
use('restaurant_activity');
db.createCollection('activity_logs');
db.activity_logs.createIndex({createdAt:-1});
db.activity_logs.createIndex({event:1,createdAt:-1});
// Flexible document example:
// { event: 'ORDER_CREATED', details: { orderId: 12, user: 1, total: 450 }, createdAt: ISODate() }
