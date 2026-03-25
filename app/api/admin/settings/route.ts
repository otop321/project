import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select("-password");
    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Failed to fetch settings", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pm25_limit, temp_limit, humidity_limit, gas_limit, notification_enabled } = await request.json();

    await dbConnect();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { pm25_limit, temp_limit, humidity_limit, gas_limit, notification_enabled },
      { new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    return new NextResponse("Failed to update settings", { status: 500 });
  }
}
