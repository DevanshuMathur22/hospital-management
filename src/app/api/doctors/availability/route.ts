import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const SECRET = process.env.JWT_SECRET!

/* ================= AUTH ================= */

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get("doctorId")

   if (!doctorId || doctorId === "undefined") {
  return NextResponse.json(
    { error: "Valid doctorId required" },
    { status: 400 }
  )
}

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { availability: true }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor.availability ?? {})

  } catch (error) {
    console.log("GET AVAILABILITY ERROR:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const user: any = await getUser()

    if (!user || user.role !== "doctor") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const doctorId = body?.doctorId
    const availability = body?.availability

    if (!doctorId || !availability) {
      return NextResponse.json(
        { error: "doctorId & availability required" },
        { status: 400 }
      )
    }

    let { start, end, days } = availability

    /* ================= TIME VALIDATION ================= */

    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end time required" },
        { status: 400 }
      )
    }

    // 🔥 normalize time (handle AM/PM also)
    const parseTime = (t: string) => {
      if (t.includes("AM") || t.includes("PM")) {
        const [time, modifier] = t.split(" ")
        let [hours, minutes] = time.split(":").map(Number)

        if (modifier === "PM" && hours !== 12) hours += 12
        if (modifier === "AM" && hours === 12) hours = 0

        return hours * 60 + minutes
      } else {
        const [h, m] = t.split(":").map(Number)
        return h * 60 + m
      }
    }

    const startMin = parseTime(start)
    const endMin = parseTime(end)

    if (endMin <= startMin) {
      return NextResponse.json(
        { error: "End time must be greater than start time" },
        { status: 400 }
      )
    }

    if (endMin - startMin < 120) {
      return NextResponse.json(
        { error: "Minimum 2 hours required" },
        { status: 400 }
      )
    }

    /* ================= DAY FIX ================= */

    const validDays = [
      "Monday","Tuesday","Wednesday",
      "Thursday","Friday","Saturday","Sunday"
    ]

    // 🔥 normalize short → full
    const normalizeDay = (d: string) => {
      const map: any = {
        Mon: "Monday",
        Tue: "Tuesday",
        Wed: "Wednesday",
        Thu: "Thursday",
        Fri: "Friday",
        Sat: "Saturday",
        Sun: "Sunday"
      }
      return map[d] || d
    }

    days = (days || []).map(normalizeDay)

    if (!Array.isArray(days) || days.some(d => !validDays.includes(d))) {
      return NextResponse.json(
        { error: "Invalid day format" },
        { status: 400 }
      )
    }

    /* ================= CHECK DOCTOR ================= */

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      )
    }

    /* ================= SAVE ================= */

    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        availability: {
          start,
          end,
          days
        } as any
      },
      select: { availability: true }
    })

    return NextResponse.json(updated.availability ?? {})

  } catch (error) {
    console.log("POST AVAILABILITY ERROR:", error)

    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )
  }
}