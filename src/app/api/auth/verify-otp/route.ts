import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const email = body.email;
    const otp = body.otp;

    if (!email || !otp) {

      return NextResponse.json(
        { error: "Email and OTP required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {

      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (
      user.otp !== otp ||
      !user.otpExpiry ||
      new Date() > user.otpExpiry
    ) {

      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({
  success: true,
  message: "OTP verified successfully",
  token,
  role: user.role,
});

  } catch (error) {

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}