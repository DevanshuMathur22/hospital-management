import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

/* ========================= */
/* GET QUEUE */
/* ========================= */

export async function GET(req:Request){

  try{

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if(!token){
      return NextResponse.json([])
    }

    let payload:any

    try{
      payload = jwt.verify(token,process.env.JWT_SECRET!)
    }catch{
      return NextResponse.json({ error:"Invalid token" },{ status:401 })
    }

    let queue:any[] = []

    /* DOCTOR VIEW */
    if(payload.role === "doctor"){

      const url = new URL(req.url)
      const page = Number(url.searchParams.get("page") || 1)
      const limit = 10
      const skip = (page - 1) * limit

      const doctor = await prisma.doctor.findFirst({
        where:{ userId: payload.id }
      })

      const [queueData, total] = await Promise.all([
        prisma.queue.findMany({
          where:{ doctorId: doctor?.id },
          include:{
            patient:{
              include:{
                user:{ select:{ email:true } }
              }
            }
          },
          orderBy:{ token:"asc" },
          skip,
          take: limit
        }),
        prisma.queue.count({ where: { doctorId: doctor?.id } })
      ])

      return NextResponse.json({
        data: queueData,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    /* ADMIN + RECEPTIONIST */
    else if(payload.role === "admin" || payload.role === "receptionist"){

      const url = new URL(req.url)
      const page = Number(url.searchParams.get("page") || 1)
      const limit = 10
      const skip = (page - 1) * limit

      const [queueData, total] = await Promise.all([
        prisma.queue.findMany({
          include:{
            patient:{
              include:{
                user:{ select:{ email:true } }
              }
            },
            doctor:true
          },
          orderBy:{ token:"asc" },
          skip,
          take: limit
        }),
        prisma.queue.count()
      ])

      return NextResponse.json({
        data: queueData,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

  }catch(err){

    console.log("GET QUEUE ERROR:",err)

    return NextResponse.json(
      { error:"Failed to fetch queue" },
      { status:500 }
    )

  }

}


/* ========================= */
/* UPDATE QUEUE */
/* ========================= */

export async function PATCH(req:Request){

  try{

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if(!token){
      return NextResponse.json({ error:"Unauthorized" },{ status:401 })
    }

    let payload:any

    try{
      payload = jwt.verify(token,process.env.JWT_SECRET!)
    }catch{
      return NextResponse.json({ error:"Invalid token" },{ status:401 })
    }

    const body = await req.json()

    const queueItem = await prisma.queue.findUnique({
      where:{ id: body.id }
    })

    if(!queueItem){
      return NextResponse.json({ error:"Not found" },{ status:404 })
    }

    /* 🔐 doctor can update only own queue */
    if(payload.role === "doctor"){

      const doctor = await prisma.doctor.findFirst({
        where:{ userId: payload.id }
      })

      if(queueItem.doctorId !== doctor?.id){
        return NextResponse.json({ error:"Forbidden" },{ status:403 })
      }
    }

    /* admin/receptionist allowed */
    if(
      payload.role !== "doctor" &&
      payload.role !== "admin" &&
      payload.role !== "receptionist"
    ){
      return NextResponse.json({ error:"Forbidden" },{ status:403 })
    }

    const updated = await prisma.queue.update({
      where:{ id: body.id },
      data:{ status: body.status }
    })

    return NextResponse.json(updated)

  }catch(err){

    console.log("QUEUE UPDATE ERROR:",err)

    return NextResponse.json(
      { error:"Failed to update queue" },
      { status:500 }
    )

  }

}