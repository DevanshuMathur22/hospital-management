"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Calendar,
  Clock,
  Search,
  Activity,
  CheckCircle,
  XCircle
} from "lucide-react"

export default function DoctorAppointments(){

  const router = useRouter()

  const [appointments,setAppointments] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [search,setSearch] = useState("")

  /* ================= FETCH ================= */

  const fetchAppointments = async ()=>{
    try{
      const res = await fetch("/api/appointments",{ credentials:"include" })
      const data = await res.json()
      setAppointments(Array.isArray(data) ? data : (data.data || []))
    }catch{
      setAppointments([])
    }
  }

  useEffect(()=>{

    const load = async()=>{
      await fetchAppointments()
      setLoading(false)
    }

    load()

    const interval = setInterval(()=>{
      fetchAppointments()
    },5000)

    return ()=>clearInterval(interval)

  },[])

  /* ================= STATUS UPDATE ================= */

  const updateStatus = async(id:string,status:string)=>{

    if(status==="cancelled"){
      if(!confirm("Cancel appointment?")) return
    }

    if(status==="no-show"){
      if(!confirm("Mark as no-show?")) return
    }

    try{
      const res = await fetch(`/api/appointments/${id}`,{
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({status}),
        credentials:"include"
      })

      const result = await res.json()

      if(!res.ok){
        alert(result.error || "Failed ❌")
        return
      }

      await fetchAppointments()

      if(status==="completed"){
        router.push(`/doctor/prescription/${id}`)
      }

    }catch{
      alert("Error ❌")
    }
  }

  /* ================= FILTER ================= */

  const filtered = appointments.filter((a:any)=>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= LOADING ================= */

  if(loading){
    return <div className="p-6">Loading...</div>
  }

  return(

    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      <h1 className="text-2xl font-bold">Appointments</h1>

      {/* SEARCH */}
      <div className="relative w-full sm:w-80">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>

        <input
          placeholder="Search patient..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
        />
      </div>

      {/* EMPTY */}
      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm">No appointments</p>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

        {filtered.map((a:any)=>{

          const isActive = a.status === "pending" || a.status === "ready"

          return(

            <div
              key={a.id}
              className="bg-white border rounded-2xl p-4 shadow-sm space-y-3"
            >

              {/* PATIENT */}
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={16}/>
                </div>

                <div>
                  <p className="font-semibold text-sm">
                    {a.patient?.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    Patient
                  </p>
                </div>

              </div>

              {/* DATE */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14}/>
                {new Date(a.date).toDateString()}
              </div>

              {/* TIME */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14}/>
                {a.time}
              </div>

              {/* STATUS */}
              <span className={`text-xs px-2 py-1 rounded-full w-fit capitalize
                ${a.status==="pending" &&  "bg-yellow-100 text-yellow-700"}
                ${a.status==="ready" && "bg-blue-100 text-blue-700"}
                ${a.status==="completed" && "bg-green-100 text-green-700"}
                ${a.status==="cancelled" && "bg-red-100 text-red-700"}
                ${a.status==="no-show" && "bg-gray-200 text-gray-700"}
              `}>
                {a.status}
              </span>

              {/* ACTIONS */}
              <div className="flex flex-wrap gap-2 pt-2">

                {/* 🔥 PENDING + READY */}
                {isActive && (
                  <>
                    <button
                      onClick={()=>updateStatus(a.id,"completed")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
                    >
                      <CheckCircle size={14}/> Complete
                    </button>

                    <button
                      onClick={()=>updateStatus(a.id,"cancelled")}
                      className="bg-red-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
                    >
                      <XCircle size={14}/> Cancel
                    </button>

                    <button
                      onClick={()=>updateStatus(a.id,"no-show")}
                      className="bg-gray-600 text-white px-3 py-1.5 rounded text-xs"
                    >
                      No-show
                    </button>
                  </>
                )}

                {/* COMPLETED */}
                {a.status === "completed" && (
                  <button
                    onClick={()=>router.push(`/doctor/prescription/${a.id}`)}
                    className="bg-green-700 text-white px-3 py-1.5 rounded text-xs"
                  >
                    View Prescription
                  </button>
                )}

                {/* ALWAYS */}
                <button
                  onClick={()=>router.push(`/doctor/vitals/${a.id}`)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
                >
                  <Activity size={14}/> Vitals
                </button>

                <button
                  onClick={()=>router.push(`/doctor/patients/${a.patient?.id}`)}
                  className="bg-black text-white px-3 py-1.5 rounded text-xs"
                >
                  History
                </button>

              </div>

            </div>

          )
        })}

      </div>

    </div>
  )
}