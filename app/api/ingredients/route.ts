import pool from "@/lib/db";
import { json, fail } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { activityLog } from "@/lib/mongo";

export async function GET(req: Request) {
  const auth = requireUser(req);
  if ("error" in auth) return json({ error: auth.error }, auth.status);

  try {
    const [rows]: any = await pool.query(
      `SELECT
         i.*,
         COALESCE(SUM(b.Quantity), 0) AS Available,
         MIN(CASE WHEN b.Quantity > 0 THEN b.Expiry_Date END) AS Next_Expiry
       FROM Ingredient i
       LEFT JOIN Stock_Batch b ON b.Ingredient_ID = i.Ingredient_ID
       GROUP BY i.Ingredient_ID
       ORDER BY i.Name`
    );
    return json(rows);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  const auth = requireUser(req, ["Admin", "Manager"]);
  if ("error" in auth) return json({ error: auth.error }, auth.status);

  const connection = await pool.getConnection();

  try {
    const data = await req.json();

    const name = String(data.name || "").trim();
    const unit = String(data.unit || "").trim();
    const category = String(data.category || "").trim() || null;
    const cost = Number(data.cost || 0);
    const initialQuantity = Number(data.initialQuantity ?? 0);
    const reorderLevel = Number(data.reorderLevel ?? 0);
    const expiryDate = data.expiryDate ? String(data.expiryDate) : null;

    if (!name || !unit) {
      return json({ error: "Ingredient name and unit are required" }, 400);
    }
    if (!Number.isFinite(cost) || cost < 0) {
      return json({ error: "Cost per unit must be zero or greater" }, 400);
    }
    if (!Number.isFinite(initialQuantity) || initialQuantity < 0) {
      return json({ error: "Available quantity must be zero or greater" }, 400);
    }
    if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
      return json({ error: "Reorder level must be zero or greater" }, 400);
    }
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      return json({ error: "Expiry date must be a valid date" }, 400);
    }

    await connection.beginTransaction();

    const [result]: any = await connection.execute(
      `INSERT INTO Ingredient
         (Name, Category, Unit, Cost_Per_Unit, Reorder_Level)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, unit, cost, reorderLevel]
    );

    const ingredientId = result.insertId;

    // Stock is stored separately in Stock_Batch. Create an opening batch
    // only when the user enters a positive initial quantity.
    if (initialQuantity > 0) {
      await connection.execute(
        `INSERT INTO Stock_Batch
           (Ingredient_ID, Quantity, Expiry_Date, Received_Date)
         VALUES (?, ?, ?, CURDATE())`,
        [ingredientId, initialQuantity, expiryDate]
      );
    }

    await connection.commit();

    await activityLog("INGREDIENT_CREATED", {
      user: auth.user.id,
      ingredientId,
      name,
      initialQuantity,
      expiryDate,
    });

    return json(
      { id: ingredientId, message: "Ingredient and opening stock saved" },
      201
    );
  } catch (error: any) {
    await connection.rollback();
    return json({ error: error.message || "Could not save ingredient" }, 400);
  } finally {
    connection.release();
  }
}

export async function PATCH(req: Request) {
 const auth=requireUser(req,["Admin","Manager"]); if("error" in auth)return json({error:auth.error},auth.status);
 try { const d=await req.json(); const id=Number(d.id), name=String(d.name||"").trim(), unit=String(d.unit||"").trim(), cost=Number(d.cost), reorder=Number(d.reorderLevel); if(!id||!name||!unit||!Number.isFinite(cost)||cost<0||!Number.isFinite(reorder)||reorder<0) return json({error:"Enter valid ingredient details"},400); await pool.execute("UPDATE Ingredient SET Name=?,Category=?,Unit=?,Cost_Per_Unit=?,Reorder_Level=? WHERE Ingredient_ID=?",[name,d.category||null,unit,cost,reorder,id]); return json({message:"Ingredient updated"}); } catch(e){return fail(e)}
}
