import { type NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { cookies } from "next/headers";

// POST /api/user/profile — for signup
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { name, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const newUser = await User.create({ name, email, password });

    // Set session cookie manually
    const sessionId = newUser._id.toString();
    const response = NextResponse.json({ message: "User created" }, { status: 201 });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// GET /api/user/profile — to fetch logged-in user details
export async function GET(request: NextRequest) {
  await dbConnect();

  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.value;

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
