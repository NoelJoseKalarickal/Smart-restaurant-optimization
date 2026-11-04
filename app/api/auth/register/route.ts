import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password) return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    if (String(password).length < 8) return NextResponse.json({ error: "Password must contain at least 8 characters" }, { status: 400 });
    const hash = await bcrypt.hash(String(password), 12);
    await pool.execute("INSERT INTO Users(Name, Role, Email, Password_Hash) VALUES (?, 'Staff', ?, ?)", [cleanName, cleanEmail, hash]);
    return NextResponse.json({ message: "Account created. You can now sign in." }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.code === "ER_DUP_ENTRY" ? "An account with this email already exists" : "Could not create account" }, { status: 400 });
  }
}
