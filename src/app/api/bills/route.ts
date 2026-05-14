import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

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

export async function GET(req: Request) {
  try {
    const user: any = await getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const page = Number(url.searchParams.get("page") || 1)
    const limit = 6
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { patient: { name: { contains: search, mode: "insensitive" } } },
        { title: { contains: search, mode: "insensitive" } },
        { patient: { mrn: { contains: search } } }
      ]
    }

    if (user.role === "patient") {
      const patient = await prisma.patient.findFirst({
        where: { userId: user.id }
      })
      if (!patient) return NextResponse.json([])
      where.patientId = patient.id
    } else if (user.role === "doctor") {
      const doctor = await prisma.doctor.findFirst({
        where: { userId: user.id }
      })
      if (!doctor) return NextResponse.json([])
      where.doctorId = doctor.id
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true, mrn: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.bill.count({ where })
    ])

    return NextResponse.json({
      data: bills,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (err) {
    console.log("BILLS LIST ERROR:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}