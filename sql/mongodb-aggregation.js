use('restaurant_activity');
// Count activity events by type.
db.activity_logs.aggregate([{$group:{_id:'$event',count:{$sum:1}}},{$sort:{count:-1}}]);
// Timeline of events per calendar day.
db.activity_logs.aggregate([{$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt'}},events:{$sum:1}}},{$sort:{_id:1}}]);
// Recent food waste event records.
db.activity_logs.find({event:'WASTE_RECORDED'}).sort({createdAt:-1}).limit(20);
