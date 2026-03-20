import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export async function POST(request: Request) {
  try {
    const { name, email, password, blynkToken, blynkTemplateId } = await request.json();

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
      username: email,
      blynkToken,
      blynkTemplateId,
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("Registration Error", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
