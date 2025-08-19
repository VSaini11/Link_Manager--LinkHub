import type { Metadata } from "next"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import DashboardClient from "./dashboardClient";

export const metadata: Metadata = {
  title: "Dashboard - Link Analytics & Management | LinkHub",
  description: "Manage your shortened URLs, view analytics, and track performance. Advanced dashboard with real-time click tracking, geographic data, and traffic insights.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return redirect("/login");

  await dbConnect();
  const user = await User.findById(session);

  if (!user) return redirect("/login");

  return <DashboardClient user={{ name: user.name, email: user.email }} />;
}
