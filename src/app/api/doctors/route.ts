import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const SECRET = process.env.JWT_SECRET!

/* 🔐 AUTH */
async function getUser(){
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if(!token) return null

  try{
    return jwt.verify(token, SECRET)
  }catch{
    return null
  }
}

/* -------- GET -------- */

export async function GET(req:Request){
  try{

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const page = Number(url.searchParams.get("page") || 1)
    const limit = 6
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { specialization: { contains: search, mode: "insensitive" as const } }
      ]
    } : {}

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        orderBy:{ createdAt:"desc" },
        select:{
          id:true,
          name:true,
          specialization:true,
          experience:true,
          nurses:{
            select:{
              id:true,
              name:true
            }
          }
        },
        skip,
        take: limit
      }),
      prisma.doctor.count({ where })
    ])

    return NextResponse.json({
      data: doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  }catch(error){
    return NextResponse.json({ error:"Failed" },{ status:500 })
  }
}

/* -------- CREATE -------- */

export async function POST(req:Request){
  try{

    const admin:any = await getUser()

    if(!admin || admin.role !== "admin"){
      return NextResponse.json({ error:"Unauthorized" },{ status:401 })
    }

    const body = await req.json()
    let { name,email,password,specialization,experience } = body

    email = email.toLowerCase().trim()

    const exist = await prisma.user.findUnique({ where:{ email } })

    if(exist){
      return NextResponse.json({ error:"User exists" },{ status:400 })
    }

    const hashed = await bcrypt.hash(password,10)

    const user = await prisma.user.create({
      data:{ email,password:hashed,role:"doctor" }
    })

    const doctor = await prisma.doctor.create({
      data:{
        userId:user.id,
        name,
        specialization: specialization || "General",
        experience:Number(experience) || 0
      },
      include:{
        user:{ select:{ email:true } }
      }
    })

    return NextResponse.json(doctor)

  }catch{
    return NextResponse.json({ error:"Failed" },{ status:500 })
  }
}

/* -------- UPDATE -------- */

export async function PUT(req:Request){
  try{

    const admin:any = await getUser()

    if(!admin || admin.role !== "admin"){
      return NextResponse.json({ error:"Unauthorized" },{ status:401 })
    }

    const { id, ...data } = await req.json()

    const updated = await prisma.doctor.update({
      where:{ id },
      data,
      include:{
        user:{ select:{ email:true } }
      }
    })

    return NextResponse.json(updated)

  }catch{
    return NextResponse.json({ error:"Failed" },{ status:500 })
  }
}