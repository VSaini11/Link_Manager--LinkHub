import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb"; // ✅ Adjust path if needed
import User from "@/lib/models/User"; // ✅ You need this schema

export async function POST(request: NextRequest) {
  try {
    await dbConnect(); // ✅ Ensure DB is connected
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json(
      { message: "Login successful", user: { name: user.name, email: user.email } },
      { status: 200 }
    );

    // ✅ Set session cookie
    response.cookies.set("session", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
