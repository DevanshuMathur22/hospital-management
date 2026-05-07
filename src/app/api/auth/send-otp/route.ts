import { NextResponse } from "next/server";
import { resend } from "../../../../lib/resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const email = body.email;

    if (!email) {

      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        otp,
        otpExpiry,
      },
    });

    await resend.emails.send({

      from: "Hospital Management <onboarding@resend.dev>",

      to: email,

      subject: "Secure Login OTP - Hospital Management",

      html: `

        <div style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:auto;
          padding:30px;
          background:#f8fafc;
          border-radius:16px;
        ">

          <h1 style="
            color:#2563eb;
            text-align:center;
            margin-bottom:10px;
          ">
            Hospital Management
          </h1>

          <p style="
            text-align:center;
            color:#64748b;
            font-size:16px;
          ">
            Secure OTP Verification
          </p>

          <div style="
            background:white;
            padding:30px;
            border-radius:12px;
            margin-top:25px;
            text-align:center;
          ">

            <p style="
              font-size:16px;
              color:#475569;
            ">
              Your One Time Password
            </p>

            <div style="
              font-size:42px;
              font-weight:bold;
              letter-spacing:10px;
              color:#111827;
              margin:20px 0;
            ">
              ${otp}
            </div>

            <p style="
              color:#ef4444;
              font-size:14px;
            ">
              Valid for 5 minutes
            </p>

          </div>

          <p style="
            margin-top:20px;
            color:#64748b;
            font-size:14px;
            text-align:center;
          ">
            Do not share this OTP with anyone.
          </p>

        </div>

      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}