USE restaurant_optimization;

-- 1. SELECT with JOIN: show stock position by ingredient.
SELECT i.Name,i.Unit,COALESCE(SUM(b.Quantity),0) AS Available,i.Reorder_Level
FROM Ingredient i LEFT JOIN Stock_Batch b ON b.Ingredient_ID=i.Ingredient_ID
GROUP BY i.Ingredient_ID,i.Name,i.Unit,i.Reorder_Level ORDER BY i.Name;

-- 2. GROUP BY + HAVING: ingredients below reorder level.
SELECT i.Name,SUM(b.Quantity) AS Available,i.Reorder_Level
FROM Ingredient i LEFT JOIN Stock_Batch b ON b.Ingredient_ID=i.Ingredient_ID
GROUP BY i.Ingredient_ID,i.Name,i.Reorder_Level
HAVING COALESCE(SUM(b.Quantity),0)<i.Reorder_Level;

-- 3. Aggregate: monthly waste by reason.
SELECT DATE_FORMAT(Waste_Date,'%Y-%m') AS Month,Reason,SUM(Quantity) AS Quantity_Wasted,COUNT(*) AS Entries
FROM Food_Waste GROUP BY Month,Reason ORDER BY Month DESC,Quantity_Wasted DESC;

-- 4. Subquery: dishes with sales above average dish sales.
SELECT d.Dish_Name,SUM(oi.Quantity) AS Units_Sold FROM Dish d
JOIN Order_Item oi ON oi.Dish_ID=d.Dish_ID GROUP BY d.Dish_ID,d.Dish_Name
HAVING SUM(oi.Quantity)>(SELECT AVG(dish_total) FROM (SELECT SUM(Quantity) dish_total FROM Order_Item GROUP BY Dish_ID) totals);

-- 5. JOIN across orders, dishes and staff.
SELECT o.Order_ID,o.Order_Date,u.Name AS Staff,d.Dish_Name,oi.Quantity,oi.Item_Price
FROM Customer_Order o JOIN Order_Item oi ON oi.Order_ID=o.Order_ID
JOIN Dish d ON d.Dish_ID=oi.Dish_ID LEFT JOIN Users u ON u.User_ID=o.Handled_By
ORDER BY o.Order_Date DESC;

-- 6. Expiry monitoring.
SELECT i.Name,b.Quantity,b.Expiry_Date,DATEDIFF(b.Expiry_Date,CURDATE()) AS Days_To_Expiry
FROM Stock_Batch b JOIN Ingredient i ON i.Ingredient_ID=b.Ingredient_ID
WHERE b.Quantity>0 AND b.Expiry_Date BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 7 DAY)
ORDER BY b.Expiry_Date;

-- 7. Views and stored procedure.
SELECT * FROM v_ingredient_stock;
SELECT * FROM v_monthly_waste;
CALL sp_low_stock();
CALL sp_generate_expiry_alerts();

-- 8. Demonstrate UPDATE and DELETE safely using a test supplier.
INSERT INTO Supplier(Name) VALUES('Temporary Test Supplier');
UPDATE Supplier SET Contact_No='9000000000' WHERE Name='Temporary Test Supplier';
DELETE FROM Supplier WHERE Name='Temporary Test Supplier';
