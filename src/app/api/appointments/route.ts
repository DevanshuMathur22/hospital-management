import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

/* ================= AUTH ================= */

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch {
    return null
  }
}

/* ================= COMMON SELECT ================= */

const patientSelect = {
  id: true,
  name: true,
  phone: true,
  gender: true,
  dob: true
}

const doctorSelect = {
  id: true,
  name: true,
  specialization: true,
  experience: true
}

/* ================= GET ================= */

export async function GET(req: Request) {
  try {
    const user: any = await getUser()
    if (!user) return NextResponse.json([], { status: 401 })

    const url = new URL(req.url)
    const doctorId = url.searchParams.get("doctorId")
    const date = url.searchParams.get("date")

    /* 🔥 SLOT FETCH */
    if (doctorId && date && user.role === "patient") {

      const selectedDate = new Date(date)

      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(selectedDate)
      end.setHours(23, 59, 59, 999)

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: { gte: start, lt: end },
          status: { not: "cancelled" }
        },
        include: {
          patient: { select: patientSelect }
        },
        orderBy: { token: "asc" }
      })

      return NextResponse.json(appointments)
    }

    let appointments: any[] = []

    /* ===== PATIENT ===== */
    if (user.role === "patient") {

      const patient = await prisma.patient.findFirst({
        where: { userId: user.id }
      })

      if (!patient) return NextResponse.json([])

      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: { select: doctorSelect }
        },
        orderBy: { createdAt: "desc" }
      })
    }

    /* ===== DOCTOR ===== */
    else if (user.role === "doctor") {

      const doctor = await prisma.doctor.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { id: user.id }
          ]
        }
      })

      if (!doctor) {
        return NextResponse.json(
          { error: "Doctor not linked with user" },
          { status: 400 }
        )
      }

      const data = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: { select: patientSelect }
        },
        orderBy: { token: "asc" }
      })

      return NextResponse.json(data)
    }

    /* ===== NURSE ===== */
    else if (user.role === "nurse") {

      const nurse = await prisma.nurse.findFirst({
        where: { userId: user.id }
      })

      if (!nurse || !nurse.doctorId) return NextResponse.json([])

      appointments = await prisma.appointment.findMany({
        where: { doctorId: nurse.doctorId },
        include: {
          patient: { select: patientSelect }
        },
        orderBy: { token: "asc" }
      })
    }

    /* ===== ADMIN ===== */
    else if (user.role === "admin") {

      const search = url.searchParams.get("search") || ""
      const page = Number(url.searchParams.get("page") || 1)
      const limit = 6
      const skip = (page - 1) * limit

      const where = search ? {
        OR: [
          { patient: { name: { contains: search } } },
          { doctor: { name: { contains: search } } }
        ]
      } : {}

      const [data, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          include: {
            patient: { select: patientSelect },
            doctor: { select: doctorSelect }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        }),
        prisma.appointment.count({ where })
      ])

      return NextResponse.json({
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    return NextResponse.json(appointments)

  } catch (err) {
    console.log(err)
    return NextResponse.json([], { status: 500 })
  }
}
/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const user: any = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    let { doctorId, patientId, date, time } = body

    if (!doctorId || !date || !time) {
      return NextResponse.json(
        { error: "Fill all fields" },
        { status: 400 }
      )
    }

    /* 🔥 AUTO PATIENT */
    if (user.role === "patient") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id }
      })
      patientId = patient?.id
    }

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 400 }
      )
    }

    /* 🔥 VALIDATE */
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    })

    if (!patient || !doctor) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      )
    }

    /* 🔥 PAST DATE */
    const today = new Date()
    today.setHours(0,0,0,0)

    if (new Date(date) < today) {
      return NextResponse.json(
        { error: "Cannot book past date" },
        { status: 400 }
      )
    }

    /* 🔥 DAY CHECK */
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    })

    const availability = doctor.availability as {
      days?: string[]
    } | null

    const normalize = (d: string) => {
      if (d === "Mon") return "Monday"
      if (d === "Tue") return "Tuesday"
      if (d === "Wed") return "Wednesday"
      if (d === "Thu") return "Thursday"
      if (d === "Fri") return "Friday"
      if (d === "Sat") return "Saturday"
      if (d === "Sun") return "Sunday"
      return d
    }

    const normalizedDays = (availability?.days || []).map(normalize)

    if (availability?.days && !normalizedDays.includes(dayName)) {
      return NextResponse.json(
        { error: "Doctor not available on this day" },
        { status: 400 }
      )
    }

    /* 🔥 DATE RANGE */
    const selectedDate = new Date(date)

    const start = new Date(selectedDate)
    start.setHours(0,0,0,0)

    const end = new Date(selectedDate)
    end.setHours(23,59,59,999)

    /* 🔥 DOUBLE BOOK CHECK */
    const alreadyBooked = await prisma.appointment.findFirst({
      where:{
        doctorId,
        patientId,
        date:{ gte:start, lt:end }
      }
    })

    if(alreadyBooked){
      return NextResponse.json(
        { error:"You already have appointment today" },
        { status:400 }
      )
    }

    /* 🔥 SLOT CHECK */
    const slotTaken = await prisma.appointment.findFirst({
      where: {
        doctorId,
        time,
        date:{ gte:start, lt:end },
        status:{ not:"cancelled" }
      }
    })

    if (slotTaken) {
      return NextResponse.json(
        { error: "Slot already booked" },
        { status: 400 }
      )
    }

    /* 🔥 TOKEN */
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date:{ gte:start, lt:end }
      },
      orderBy: { token: "desc" }
    })

    const nextToken = lastAppointment ? lastAppointment.token + 1 : 1

    /* 🔥 CREATE */
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        date: selectedDate,
        time,
        status: "pending",
        token: nextToken
      },
      include: {
        patient: { select: patientSelect },
        doctor: { select: doctorSelect }
      }
    })
   const bill = await prisma.bill.create({
      data: {
        patientId,
        appointmentId: appointment.id,
        type: "DOCTOR",
        title: `${doctor.name} Consultation`,
        totalAmount: 500,
        status: "pending"
      }
    })

    return NextResponse.json({
      success: true,
      data: appointment,
      billId: bill.id
    })

  } catch (err: any) {
    console.log("Appointment creation error:", err)

    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}