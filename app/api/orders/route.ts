import pool from "@/lib/db";
import { json, fail } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { activityLog } from "@/lib/mongo";

export async function GET(req: Request) {
  const auth = requireUser(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);

  try {
    // Include dish names and quantities from Order_Item + Dish.
    const [rows]: any = await pool.query(
      `SELECT
         o.*,
         u.Name AS Staff_Name,
         (
           SELECT GROUP_CONCAT(
             CONCAT(d.Dish_Name, ' x ', oi.Quantity)
             ORDER BY d.Dish_Name
             SEPARATOR ', '
           )
           FROM Order_Item oi
           INNER JOIN Dish d ON d.Dish_ID = oi.Dish_ID
           WHERE oi.Order_ID = o.Order_ID
         ) AS Items
       FROM Customer_Order o
       LEFT JOIN Users u ON u.User_ID = o.Handled_By
       ORDER BY o.Order_Date DESC
       LIMIT 100`
    );
    return json(rows);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  const auth = requireUser(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);

  const connection = await pool.getConnection();

  try {
    const { items, orderType = "Dine-In" } = await req.json();
    if (!Array.isArray(items) || !items.length) {
      throw new Error("Add at least one dish");
    }

    await connection.beginTransaction();

    let total = 0;
    const normalized: [number, number, number][] = [];

    for (const item of items) {
      const dishId = Number(item.dishId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(dishId) || dishId < 1) {
        throw new Error("Invalid dish");
      }
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid quantity");
      }

      const [[dish]]: any = await connection.query(
        "SELECT Dish_ID, Price FROM Dish WHERE Dish_ID = ?",
        [dishId]
      );
      if (!dish) throw new Error("Dish not found: " + dishId);

      const [recipe]: any = await connection.query(
        "SELECT Ingredient_ID, Qty_Required FROM Recipe WHERE Dish_ID = ?",
        [dishId]
      );

      for (const ingredient of recipe) {
        const needed = Number(ingredient.Qty_Required) * quantity;
        const [batches]: any = await connection.query(
          `SELECT Batch_ID, Quantity
           FROM Stock_Batch
           WHERE Ingredient_ID = ? AND Quantity > 0
           ORDER BY Expiry_Date IS NULL, Expiry_Date
           FOR UPDATE`,
          [ingredient.Ingredient_ID]
        );

        let remaining = needed;
        for (const batch of batches) {
          const take = Math.min(Number(batch.Quantity), remaining);
          if (take > 0) {
            await connection.execute(
              "UPDATE Stock_Batch SET Quantity = Quantity - ? WHERE Batch_ID = ?",
              [take, batch.Batch_ID]
            );
            remaining -= take;
          }
          if (remaining <= 0) break;
        }

        if (remaining > 0) {
          throw new Error(
            "Insufficient stock for ingredient ID " + ingredient.Ingredient_ID
          );
        }
      }

      const price = Number(dish.Price);
      total += price * quantity;
      normalized.push([dishId, quantity, price]);
    }

    const [orderResult]: any = await connection.execute(
      `INSERT INTO Customer_Order (Order_Type, Total_Amount, Handled_By)
       VALUES (?, ?, ?)`,
      [orderType, total, auth.user.id]
    );

    for (const item of normalized) {
      await connection.execute(
        `INSERT INTO Order_Item (Order_ID, Dish_ID, Quantity, Item_Price)
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, ...item]
      );
    }

    await connection.commit();

    await activityLog("ORDER_CREATED", {
      orderId: orderResult.insertId,
      user: auth.user.id,
      total,
      items: normalized,
    });

    return json(
      {
        orderId: orderResult.insertId,
        total,
        message: "Order recorded and recipe stock deducted",
      },
      201
    );
  } catch (error: any) {
    await connection.rollback();
    return json({ error: error.message }, 400);
  } finally {
    connection.release();
  }
}

export async function PATCH(req:Request){const auth=requireUser(req);if("error" in auth)return json({error:auth.error},auth.status);try{const {orderId,status}=await req.json();if(!Number.isInteger(Number(orderId))||status!=="Completed")return json({error:"Invalid order status update"},400);const [r]:any=await pool.execute("UPDATE Customer_Order SET Order_Status='Completed' WHERE Order_ID=? AND Order_Status='Pending'",[Number(orderId)]);if(!r.affectedRows)return json({error:"Order not found or already completed"},400);await activityLog("ORDER_COMPLETED",{orderId:Number(orderId),user:auth.user.id});return json({message:"Order marked as completed"})}catch(e){return fail(e)}}
