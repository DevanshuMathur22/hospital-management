"use client"

import { useEffect, useState } from "react"
import {
  User,
  Phone,
  Search,
  Calendar,
  Clock,
  Stethoscope,
  Activity,
  RefreshCw,
  Filter,
  Users,
  ChevronRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type DateFormat = {
  date: string
  day: string
  time: string
}

export default function NursePatients() {

  const [patients, setPatients] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  /* LOAD */
  const loadPatients = async () => {
    try {
      const res = await fetch("/api/appointments", { credentials: "include" })
      const raw = await res.json()
      const data = Array.isArray(raw) ? raw : (raw.data || [])

      const map = new Map()

      data.forEach((a: any) => {
        if (a.patient && !map.has(a.patient.id)) {
          map.set(a.patient.id, {
            ...a.patient,
            lastVisit: a.date || null,
            time: a.time || "-",
            doctor: a.doctor || null,
            appointmentId: a.id,
            status: a.status
          })
        }
      })

      const arr = Array.from(map.values())

      setPatients(arr)
      setFiltered(arr)
      setLastUpdated(new Date())

    } catch (err) {
      console.log(err)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadPatients()
    const i = setInterval(loadPatients, 8000)
    return () => clearInterval(i)
  }, [])

  /* SEARCH */
  useEffect(() => {
    const s = search.toLowerCase()

    const f = patients.filter((p: any) => {
      const name = p.name?.toLowerCase() || ""
      const phone = p.phone || ""
      const email = p.user?.email?.toLowerCase() || ""
      const doctor = p.doctor?.name?.toLowerCase() || ""

      const d = p.lastVisit ? new Date(p.lastVisit) : null

      const date = d ? d.toLocaleDateString().toLowerCase() : ""
      const day = d ? d.toLocaleDateString(undefined, { weekday: "long" }).toLowerCase() : ""
      const time = (p.time || "").toLowerCase()

      return (
        name.includes(s) ||
        phone.includes(s) ||
        email.includes(s) ||
        doctor.includes(s) ||
        date.includes(s) ||
        day.includes(s) ||
        time.includes(s)
      )

    })

    setFiltered(f)

  }, [search, patients])

  /* FORMAT */
  const formatDate = (d: any): DateFormat => {
    if (!d) {
      return { date: "-", day: "-", time: "-" }
    }

    const date = new Date(d)

    if (isNaN(date.getTime())) {
      return { date: "-", day: "-", time: "-" }
    }

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      day: date.toLocaleDateString(undefined, { weekday: "short" }),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700"
      case "ready": return "bg-blue-100 text-blue-700"
      case "completed": return "bg-green-100 text-green-700"
      case "cancelled": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  /* LOADING SKELETON */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-48" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 space-y-4 h-52" />
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Patient Registry
              </h1>
              <p className="text-sm text-gray-500">
                View all assigned patients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </span>
            <button
              onClick={loadPatients}
              className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Patients", value: patients.length, icon: Users, color: "text-blue-600 bg-blue-50" },
            { label: "Showing", value: filtered.length, icon: Filter, color: "text-indigo-600 bg-indigo-50" },
            { label: "Search Results", value: search ? filtered.length : "-", icon: Search, color: "text-purple-600 bg-purple-50" },
            { label: "Last Refresh", value: lastUpdated ? `${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago` : "-", icon: Clock, color: "text-teal-600 bg-teal-50" }
          ].map((stat, i) => (
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

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients by name, phone, email, doctor, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
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
        {filtered.length === 0 && patients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No patients found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={() => setSearch("")}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Clear search
            </button>
          </motion.div>
        )}

        {filtered.length === 0 && patients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No patients assigned</h3>
            <p className="text-sm text-gray-500">Patients will appear here when assigned to you</p>
          </motion.div>
        )}

        {/* PATIENT CARDS */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {filtered.map((p: any, i: number) => {

              const { date, day, time } = formatDate(p.lastVisit)

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden group"
                >

                  {/* CARD HEADER */}
                  <div className="p-5 pb-4">

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                          <User size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {p.name || "Unnamed Patient"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate max-w-[140px]">
                            {p.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                      {p.status && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(p.status)}`}>
                          {p.status}
                        </span>
                      )}
                    </div>

                    {/* INFO GRID */}
                    <div className="space-y-2.5">

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600">{p.phone || "No phone"}</span>
                      </div>

                      {p.doctor && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Stethoscope size={12} className="text-gray-400" />
                          </div>
                          <span className="text-gray-600">Dr. {p.doctor.name || "-"}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600">{date}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock size={12} className="text-gray-400" />
                        </div>
                        <span className="text-gray-600">{day} at {p.time || time}</span>
                      </div>

                    </div>

                  </div>

                  {/* CARD FOOTER */}
                  <div className="px-5 pb-4">
                    <div className="flex gap-2 pt-3 border-t border-gray-100">

                      <a
                        href={`/nurse/vitals?patient=${p.id}&appointment=${p.appointmentId || ""}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Activity size={13} />
                        Vitals
                      </a>

                      <button
                        onClick={() => {
                          const params = new URLSearchParams()
                          params.set("patient", p.id)
                          if (p.appointmentId) params.set("appointment", p.appointmentId)
                          window.location.href = `/nurse/vitals?${params.toString()}`
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-xs font-medium hover:bg-indigo-100 transition-colors"
                      >
                        <Stethoscope size={13} />
                        Record
                      </button>

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
            Showing {filtered.length} of {patients.length} patients
          </div>
        )}

      </div>

    </div>

  )
}