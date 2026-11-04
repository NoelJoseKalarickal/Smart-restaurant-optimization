"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

type IngredientRow = {
  Ingredient_ID: number;
  Name: string;
  Category: string | null;
  Unit: string;
  Available: number;
  Reorder_Level: number;
  Cost_Per_Unit: number;
  Next_Expiry: string | null;
};

const emptyForm = {
  name: "",
  category: "",
  unit: "kg",
  cost: "",
  initialQuantity: "0",
  expiryDate: "",
  reorderLevel: "10",
};

export default function Inventory() {
  const [rows, setRows] = useState<IngredientRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState("");
  const [editingId,setEditingId]=useState<number|null>(null);

  async function load() {
    const response = await fetch("/api/ingredients", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await response.json();
    if (response.ok) setRows(data);
    else setMsg(data.error || "Could not load ingredients");
  }

  useEffect(() => {
    load();
  }, []);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMsg("");

    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setMsg(data.error || "Ingredient added successfully");

    if (response.ok) {
      setForm(emptyForm);
      await load();
    }
  }

  async function saveEdit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();const response=await fetch("/api/ingredients",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+localStorage.getItem("token")},body:JSON.stringify({...form,id:editingId,cost:Number(form.cost),reorderLevel:Number(form.reorderLevel)})});const data=await response.json();setMsg(data.error||"Ingredient updated");if(response.ok){setEditingId(null);setForm(emptyForm);await load();}}

  return (
    <Layout>
      <h2>Inventory</h2>

      <div className="card">
        <b>Add ingredient</b>
        <form onSubmit={add} className="formgrid">
          <label>
            Ingredient name
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            Category
            <input
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>

          <label>
            Unit (kg, L, pcs)
            <input
              className="input"
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
          </label>

          <label>
            Cost per unit
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
          </label>

          <label>
            Initial available quantity
            <input
              className="input"
              type="number"
              min="0"
              step="0.001"
              required
              value={form.initialQuantity}
              onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
            />
          </label>

          <label>
            Expiry date (optional)
            <input
              className="input"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </label>

          <label>
            Reorder level
            <input
              className="input"
              type="number"
              min="0"
              step="0.001"
              value={form.reorderLevel}
              onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            />
          </label>

          <button className="btn">Save ingredient</button>
        </form>
        <p className="muted">{msg}</p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Ingredient stock</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Available</th>
              <th>Reorder at</th>
              <th>Next expiry</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.Ingredient_ID}>
                <td>{row.Name}</td>
                <td>{row.Category || "—"}</td>
                <td>{row.Unit}</td>
                <td>{row.Available}</td>
                <td>{row.Reorder_Level}</td>
                <td>
                  {row.Next_Expiry ? new Date(row.Next_Expiry).toLocaleDateString() : "—"}
                </td>
                <td><button className="btn secondary" onClick={()=>{setEditingId(row.Ingredient_ID);setForm({name:row.Name,category:row.Category||"",unit:row.Unit,cost:String(row.Cost_Per_Unit??0),initialQuantity:"0",expiryDate:"",reorderLevel:String(row.Reorder_Level)})}}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingId!==null&&<div className="card" style={{marginTop:18}}><h3>Edit ingredient details</h3><form className="formgrid" onSubmit={saveEdit}><label>Name<input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Category<input className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>Unit<input className="input" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}/></label><label>Cost per unit<input className="input" type="number" step="0.01" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})}/></label><label>Reorder level<input className="input" type="number" step="0.001" value={form.reorderLevel} onChange={e=>setForm({...form,reorderLevel:e.target.value})}/></label><button className="btn">Save changes</button><button type="button" className="btn secondary" onClick={()=>setEditingId(null)}>Cancel</button></form></div>}
    </Layout>
  );
}
