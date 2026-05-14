"use client"

import { useEffect, useState } from "react"
import {
  User,
  Stethoscope,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Search,
  Calendar,
  RefreshCw,
  Filter,
  CalendarCheck,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function NurseAppointments(){

  const [appointments,setAppointments] = useState<any[]>([])
  const [filtered,setFiltered] = useState<any[]>([])
  const [loading,setLoading] = useState(true)
  const [search,setSearch] = useState("")
  const [lastUpdated,setLastUpdated] = useState<Date | null>(null)

  /* LOAD */
  const loadAppointments = async () => {
    try{
      const res = await fetch("/api/appointments",{ credentials:"include" })
      const raw = await res.json()
      const data = Array.isArray(raw) ? raw : (raw.data || [])

      const now = new Date()

      const today = data.filter((a:any)=>{
        const d = new Date(a.date)
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        )
      })

      setAppointments(today)
      setFiltered(today)
      setLastUpdated(new Date())

    }catch(err){
      console.log(err)
    }

    setLoading(false)
  }

  useEffect(()=>{
    loadAppointments()
    const i = setInterval(loadAppointments,5000)
    return ()=>clearInterval(i)
  },[])

  /* SMART SEARCH */
  useEffect(()=>{

    const s = search.toLowerCase()

    const f = appointments.filter((a:any)=>{

      const patient = a.patient?.name?.toLowerCase() || ""
      const doctor = a.doctor?.name?.toLowerCase() || ""

      const d = new Date(a.date)

      const date = d.toLocaleDateString().toLowerCase()
      const time = (a.time || "").toLowerCase()
      const day = d.toLocaleDateString(undefined,{ weekday:"long" }).toLowerCase()

      return (
        patient.includes(s) ||
        doctor.includes(s) ||
        date.includes(s) ||
        time.includes(s) ||
        day.includes(s)
      )

    })

    setFiltered(f)

  },[search,appointments])

  /* ACTION */
  const markReady = async(id:string)=>{
    try {
      await fetch(`/api/appointments/${id}`,{
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ status:"ready" }),
        credentials:"include"
      })
      loadAppointments()
    } catch(err) {
      console.log(err)
    }
  }

  /* CRITICAL */
  const isCritical = (a:any)=>{
    const v = a.vitals
    if(!v) return false
    return v.bp > 140 || v.temperature > 100 || v.oxygen < 92
  }

  /* FORMAT */
  const formatDate = (d:string)=>{
    const date = new Date(d)
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
      day: date.toLocaleDateString(undefined,{ weekday:"short" })
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" }
      case "ready":
        return { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500", label: "Ready" }
      case "completed":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500", label: "Completed" }
      case "cancelled":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" }
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-500", label: status }
    }
  }

  /* LOADING */
  if(loading){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-64" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i=>(
                <div key={i} className="bg-white rounded-2xl p-5 h-56" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* STATS */
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a=>a.status==="pending").length,
    ready: appointments.filter(a=>a.status==="ready").length,
    critical: appointments.filter(a=>isCritical(a)).length
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <CalendarCheck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Today's Appointments
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </span>
            <button
              onClick={loadAppointments}
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
            { label: "Total", value: stats.total, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Ready", value: stats.ready, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
            { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-red-600 bg-red-50" }
          ].map((stat, i)=>(
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={14} />
                </div>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, doctor, date, or time..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
            />
            {search && (
              <button
                onClick={()=>setSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {search && (
            <p className="text-xs text-gray-500 mt-2 ml-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </p>
          )}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={()=>setSearch("")}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {filtered.length === 0 && appointments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarCheck size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments today</h3>
            <p className="text-sm text-gray-500">Appointments will appear here when scheduled</p>
          </motion.div>
        )}

        {/* APPOINTMENT CARDS */}
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {filtered.map((a:any, i:number)=>{

              const { date, time, day } = formatDate(a.date)
              const statusConfig = getStatusConfig(a.status)
              const critical = isCritical(a)

              return(
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  whileHover={{ y: -2 }}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
                    ${critical ? "border-red-300 border-2" : "border-gray-100 hover:border-blue-200"}
                  `}
                >

                  {/* CRITICAL BADGE */}
                  {critical && (
                    <div className="bg-red-50 px-5 py-2 border-b border-red-100 flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-600" />
                      <span className="text-xs font-semibold text-red-600">Critical Patient</span>
                    </div>
                  )}

                  <div className="p-5">

                    {/* PATIENT INFO */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {a.patient?.name || "Unnamed Patient"}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Stethoscope size={11} />
                            Dr. {a.doctor?.name || "-"}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* DETAILS GRID */}
                    <div className="space-y-2.5 mb-4">

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600">{date} ({day})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600">{a.time || time}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600 capitalize">{a.status}</span>
                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="space-y-2 pt-3 border-t border-gray-100">

                      <a
                        href={`/nurse/vitals?patient=${a.patientId}&appointment=${a.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
                      >
                        <Activity size={14} />
                        Add Vitals
                      </a>

                      {a.status === "pending" && (
                        <button
                          onClick={()=>markReady(a.id)}
                          className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 py-2.5 rounded-xl text-xs font-medium transition-colors"
                        >
                          <CheckCircle size={14} />
                          Mark Ready
                        </button>
                      )}

                    </div>

                  </div>

                </motion.div>
              )
            })}

          </div>
        </AnimatePresence>

        {/* BOTTOM INFO */}
        {filtered.length > 0 && (
          <div className="text-center text-xs text-gray-400 py-4">
            Showing {filtered.length} of {appointments.length} appointments
          </div>
        )}

      </div>

    </div>
  )
}