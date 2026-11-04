-- Run this once against restaurant_optimization before using the updated app.
USE restaurant_optimization;
ALTER TABLE Customer_Order ADD COLUMN Order_Status ENUM('Pending','Completed') NOT NULL DEFAULT 'Pending';
