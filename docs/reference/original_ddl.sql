CREATE DATABASE restaurant_optimization;
USE restaurant_optimization;

CREATE TABLE Users (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Role ENUM('Admin','Manager','Staff') NOT NULL DEFAULT 'Staff',
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15)
);

CREATE TABLE Supplier (
    Supplier_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Contact_No VARCHAR(15),
    Email VARCHAR(100),
    Address VARCHAR(255)
);

CREATE TABLE Ingredient (
    Ingredient_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    Unit VARCHAR(20) NOT NULL,
    Cost_Per_Unit DECIMAL(10,2) CHECK (Cost_Per_Unit >= 0),
    Reorder_Level DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE Purchase_Order (
    PO_ID INT AUTO_INCREMENT PRIMARY KEY,
    Supplier_ID INT NOT NULL,
    Order_Date DATE NOT NULL,
    Status ENUM('Pending','Delivered','Cancelled') DEFAULT 'Pending',
    Total_Amount DECIMAL(12,2) DEFAULT 0,
    Created_By INT,
    FOREIGN KEY (Supplier_ID) REFERENCES Supplier(Supplier_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Created_By) REFERENCES Users(User_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Purchase_Item (
    PO_ID INT NOT NULL,
    Ingredient_ID INT NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL CHECK (Quantity > 0),
    Unit_Price DECIMAL(10,2) NOT NULL CHECK (Unit_Price >= 0),
    PRIMARY KEY (PO_ID, Ingredient_ID),
    FOREIGN KEY (PO_ID) REFERENCES Purchase_Order(PO_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Stock_Batch (
    Batch_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ingredient_ID INT NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL CHECK (Quantity >= 0),
    Expiry_Date DATE,
    Received_Date DATE NOT NULL,
    FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Dish (
    Dish_ID INT AUTO_INCREMENT PRIMARY KEY,
    Dish_Name VARCHAR(100) NOT NULL,
    Category VARCHAR(50),
    Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0)
);

CREATE TABLE Recipe (
    Dish_ID INT NOT NULL,
    Ingredient_ID INT NOT NULL,
    Qty_Required DECIMAL(10,3) NOT NULL CHECK (Qty_Required > 0),
    PRIMARY KEY (Dish_ID, Ingredient_ID),
    FOREIGN KEY (Dish_ID) REFERENCES Dish(Dish_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Customer_Order (
    Order_ID INT AUTO_INCREMENT PRIMARY KEY,
    Order_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Order_Type ENUM('Dine-In','Takeaway','Delivery') DEFAULT 'Dine-In',
    Total_Amount DECIMAL(12,2) DEFAULT 0,
    Handled_By INT,
    FOREIGN KEY (Handled_By) REFERENCES Users(User_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Order_Item (
    Order_ID INT NOT NULL,
    Dish_ID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    Item_Price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (Order_ID, Dish_ID),
    FOREIGN KEY (Order_ID) REFERENCES Customer_Order(Order_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Dish_ID) REFERENCES Dish(Dish_ID) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Food_Waste (
    Waste_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ingredient_ID INT NOT NULL,
    Quantity DECIMAL(10,2) NOT NULL CHECK (Quantity > 0),
    Reason ENUM('Expired','Spoiled','Over-Preparation','Plate Waste','Other') NOT NULL,
    Waste_Date DATE NOT NULL,
    Recorded_By INT,
    FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Recorded_By) REFERENCES Users(User_ID) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Alert (
    Alert_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ingredient_ID INT NOT NULL,
    Alert_Type ENUM('Low Stock','Overstock','Near Expiry') NOT NULL,
    Alert_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Active','Resolved') DEFAULT 'Active',
    FOREIGN KEY (Ingredient_ID) REFERENCES Ingredient(Ingredient_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_ingredient_name ON Ingredient(Name);
CREATE INDEX idx_batch_expiry ON Stock_Batch(Expiry_Date);
CREATE INDEX idx_order_date ON Customer_Order(Order_Date);
CREATE INDEX idx_waste_date ON Food_Waste(Waste_Date);
CREATE INDEX idx_alert_status ON Alert(Status);
