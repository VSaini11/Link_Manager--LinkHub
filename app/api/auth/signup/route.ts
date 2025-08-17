import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Set session cookie
    const response = NextResponse.json(
      { message: "User created successfully", user: { name: newUser.name, email: newUser.email } },
      { status: 201 }
    );

    response.cookies.set("session", newUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    // 👇 Catch MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
