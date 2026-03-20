import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    // Select fields to return, exclude password password
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error("Fetch Users Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, email, password, role, blynkToken, blynkTemplateId } = await request.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing data", { status: 400 });
    }

    await dbConnect();
    const exist = await User.findOne({ email });
    if (exist) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      username: email,
      blynkToken,
      blynkTemplateId,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Create User Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("ID required", { status: 400 });

    await dbConnect();
    
    // Prevent self-deletion
    if (id === session.user.id) {
       return new NextResponse("Cannot delete yourself", { status: 400 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete User Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
