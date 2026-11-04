"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

type DishOption = {
  Dish_ID: number;
  Dish_Name: string;
  Price: number;
};

type OrderRow = {
  Order_ID: number;
  Order_Date: string;
  Order_Type: string;
  Total_Amount: number;
  Staff_Name: string | null;
  Items: string | null;
};

export default function Orders() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [dishes, setDishes] = useState<DishOption[]>([]);
  const [dish, setDish] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [orderType, setOrderType] = useState("Dine-In");
  const [message, setMessage] = useState("");

  const headers = {
    Authorization:
      "Bearer " + (typeof window !== "undefined" ? localStorage.getItem("token") : ""),
  };

  async function load() {
    const [ordersResponse, menuResponse] = await Promise.all([
      fetch("/api/orders", { headers }),
      fetch("/api/menu", { headers }),
    ]);

    const orderData = await ordersResponse.json();
    const menuData = await menuResponse.json();

    if (ordersResponse.ok) setRows(orderData);
    if (menuResponse.ok) setDishes(menuData);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ dishId: Number(dish), quantity: Number(quantity) }],
        orderType,
      }),
    });

    const data = await response.json();
    setMessage(
      data.error || `Order #${data.orderId} placed. Total: ₹${data.total}`
    );

    if (response.ok) await load();
  }

  async function complete(orderId:number) { const response=await fetch("/api/orders",{method:"PATCH",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({orderId,status:"Completed"})}); const data=await response.json();setMessage(data.error||data.message);if(response.ok)await load(); }

  return (
    <Layout>
      <h2>Restaurant orders</h2>

      <div className="card">
        <b>Record a customer order</b>
        <div className="formgrid">
          <label>
            Dish
            <select
              className="input"
              value={dish}
              onChange={(event) => setDish(event.target.value)}
            >
              <option value="">Select dish</option>
              {dishes.map((item) => (
                <option key={item.Dish_ID} value={item.Dish_ID}>
                  {item.Dish_Name} — ₹{item.Price}
                </option>
              ))}
            </select>
          </label>

          <label>
            Order type
            <select className="input" value={orderType} onChange={(event)=>setOrderType(event.target.value)}>
              <option value="Dine-In">Dine-In</option><option value="Takeaway">Takeaway</option><option value="Delivery">Delivery</option>
            </select>
          </label>
          <label>
            Quantity
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
        </div>

        <button className="btn" onClick={submit} disabled={!dish}>
          Place order &amp; deduct recipe stock
        </button>
        <p className="muted">{message}</p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Recent orders</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Type</th>
              <th>Dish(es)</th>
              <th>Total</th>
              <th>Handled by</th>
              <th>Status / Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.Order_ID}>
                <td>#{row.Order_ID}</td>
                <td>{new Date(row.Order_Date).toLocaleString()}</td>
                <td>{row.Order_Type}</td>
                <td>{row.Items || "No dish details"}</td>
                <td>₹{row.Total_Amount}</td>
                <td>{row.Staff_Name || "—"}</td>
                <td>{(row as any).Order_Status === "Completed" ? "Completed" : <button className="btn secondary" onClick={()=>complete(row.Order_ID)}>Mark done</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
