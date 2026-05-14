"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Activity,
  CheckCircle,
  User,
  Stethoscope,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  UserCheck,
  Timer
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function NurseDashboard(){

  const [appointments,setAppointments] = useState<any[]>([])
  const [nurse,setNurse] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  const [lastUpdated,setLastUpdated] = useState<Date | null>(null)

  /* LOAD */
  const loadData = async () => {
    try{
      const [a,n] = await Promise.all([
        fetch("/api/appointments",{ credentials:"include" }),
        fetch("/api/auth/me",{ cache:"no-store",credentials:"include" })
      ])

      const apptRaw = await a.json()
      const appt = Array.isArray(apptRaw) ? apptRaw : (apptRaw.data || [])
      const nurseData = await n.json()

      setNurse(nurseData.user)

      const now = new Date()

      const filtered = appt.filter((a:any)=>{
        const d = new Date(a.date)
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })

      setAppointments(filtered)
      setLastUpdated(new Date())

    }catch(err){
      console.log(err)
    }

    setLoading(false)
  }

  useEffect(()=>{
    loadData()
    const interval = setInterval(loadData,5000)
    return ()=> clearInterval(interval)
  },[])

  /* ACTIONS */
  const markReady = async(id:string)=>{
    try {
      await fetch(`/api/appointments/${id}`,{
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ status:"ready" }),
        credentials:"include"
      })
      loadData()
    } catch(err) {
      console.log(err)
    }
  }

  const markComplete = async(id:string)=>{
    try {
      await fetch(`/api/appointments/${id}`,{
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ status:"completed" }),
        credentials:"include"
      })
      loadData()
    } catch(err) {
      console.log(err)
    }
  }

  /* CRITICAL */
  const isCritical = (a:any)=>{
    const v = a.vitals
    if(!v) return false
    return (
      v.bp > 140 ||
      v.temperature > 100 ||
      v.oxygen < 92
    )
  }

  /* FILTER */
  const pending = appointments.filter(a=>a.status==="pending")
  const ready = appointments.filter(a=>a.status==="ready")
  const completed = appointments.filter(a=>a.status==="completed")
  const criticalCount = [...pending, ...ready].filter(isCritical).length

  const queue = [...pending, ...ready]

  /* LOADING */
  if(loading){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i=>(
                <div key={i} className="bg-white rounded-xl p-6 h-24" />
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4].map(i=>(
                <div key={i} className="bg-white rounded-xl p-5 h-44" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nurse Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Assigned Doctor: <span className="font-medium text-gray-700">{nurse?.doctor?.name || "Not Assigned"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </span>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Today's Appointments", value: appointments.length, icon: Calendar, color: "text-blue-600 bg-blue-50", gradient: "from-blue-500 to-blue-600" },
            { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-600 bg-amber-50", gradient: "from-amber-500 to-amber-600" },
            { label: "Ready", value: ready.length, icon: UserCheck, color: "text-indigo-600 bg-indigo-50", gradient: "from-indigo-500 to-indigo-600" },
            { label: "Critical", value: criticalCount, icon: AlertTriangle, color: "text-red-600 bg-red-50", gradient: "from-red-500 to-red-600" }
          ].map((stat, i)=>(
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* QUEUE SECTION */}
        {queue.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Timer size={16} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Patient Queue</h2>
              <span className="text-xs text-gray-500 ml-auto">{queue.length} in queue</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {queue.map((a:any, i:number)=>(
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`min-w-[140px] px-4 py-3 rounded-xl text-center shadow-sm flex-shrink-0
                    ${i===0 ? "bg-gradient-to-br from-green-500 to-green-600 text-white" : "bg-gray-50 border border-gray-200"}`}
                >
                  <div className={`text-xs font-medium mb-1 ${i===0 ? "text-green-100" : "text-gray-500"}`}>
                    {i===0 ? "NOW SERVING" : `#${i+1}`}
                  </div>
                  <div className={`font-semibold text-sm ${i===0 ? "text-white" : "text-gray-900"}`}>
                    {a.patient?.name?.split(" ")[0] || "Patient"}
                  </div>
                  <div className={`text-xs mt-1 ${i===0 ? "text-green-100" : "text-gray-400"}`}>
                    {a.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE PATIENTS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Patients</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {queue.length}
            </span>
          </div>

          {queue.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No active patients in queue</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.map((a:any, i:number)=>(
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
                  ${isCritical(a) ? "border-red-300 border-2" : "border-gray-100 hover:border-blue-200"}
                `}
              >
                {isCritical(a) && (
                  <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-600" />
                    <span className="text-xs font-semibold text-red-600">Critical Patient</span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                      ${a.status === "ready" ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-amber-500 to-amber-600"}`}>
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {a.patient?.name || "Unnamed Patient"}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Stethoscope size={11} />
                        Dr. {a.doctor?.name || "-"}
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${a.status === "ready" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {a.time}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(a.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {a.status === "pending" && (
                      <button
                        onClick={()=>markReady(a.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
                      >
                        <UserCheck size={13} />
                        Mark Ready
                      </button>
                    )}
                    <a
                      href={`/nurse/vitals?patient=${a.patientId}&appointment=${a.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Activity size={13} />
                      Vitals
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* COMPLETED */}
        {completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Completed Today</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((a:any)=>(
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {a.patient?.name || "Patient"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dr. {a.doctor?.name || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Completed at {new Date(a.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  )
}