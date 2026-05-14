"use client"

import { useEffect, useState } from "react"
import { Search, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

export default function Appointments() {

  const params = useSearchParams()
  const patientIdFromURL = params.get("patientId")

  const [doctors, setDoctors] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [slots, setSlots] = useState<any[]>([])
  const [loading,setLoading] = useState(true)

  const [patientSearch, setPatientSearch] = useState("")
  const [doctorSearch, setDoctorSearch] = useState("")

  const [showPatients, setShowPatients] = useState(false)
  const [showDoctors, setShowDoctors] = useState(false)

  const [form, setForm] = useState({
    doctorId: "",
    patientId: "",
    date: "",
    time: ""
  })

  /* ================= FETCH ================= */

  useEffect(()=>{

    const load = async()=>{

      const [d,p] = await Promise.all([
        fetch("/api/doctors", { credentials: "include" }),
        fetch("/api/patients", { credentials: "include" })
      ])

      const doctorsData = await d.json()
      const patientsData = await p.json()

      setDoctors(Array.isArray(doctorsData) ? doctorsData : (doctorsData.data || []))
      setPatients(Array.isArray(patientsData) ? patientsData : (patientsData.data || []))

      setLoading(false)
    }

    load()

  },[])

  /* 🔥 FETCH SLOTS */
  useEffect(()=>{

    if(!form.doctorId || !form.date) return

    const loadSlots = async()=>{

      const res = await fetch(
        `/api/slots?doctorId=${form.doctorId}&date=${form.date}`, { credentials: "include" }
      )

      const data = await res.json()

      /* 🔥 FORCE FIX (IMPORTANT) */
      const fixedSlots = (data || []).map((s:any)=>({
        ...s,
        isBooked:
          s.isBooked ||
          s.status === "booked" ||
          s.status === "completed" ||
          s.status === "pending"
      }))

      setSlots(fixedSlots)
    }

    loadSlots()

  },[form.doctorId,form.date])

  /* AUTO SELECT */
  useEffect(()=>{
    if(patientIdFromURL && patients.length > 0){
      const found = patients.find(p=>p.id === patientIdFromURL)
      if(found){
        setForm(prev=>({...prev,patientId:found.id}))
        setPatientSearch(found.name)
      }
    }
  },[patientIdFromURL,patients])

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(doctorSearch.toLowerCase())
  )

  /* 🔥 CREATE */
  async function createAppointment(){

    if (!form.doctorId || !form.patientId || !form.date || !form.time){
      toast.error("Fill all fields")
      return
    }

    const res = await fetch("/api/appointments",{
      method:"POST",
      credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if(!res.ok){
      toast.error(data.error || "Failed")
      return
    }

    toast.success("Appointment booked ✅")

    /* 🔥 REFRESH */
    const updated = await fetch(
      `/api/slots?doctorId=${form.doctorId}&date=${form.date}`, { credentials: "include" }
    )

    const updatedSlots = await updated.json()

    const fixedSlots = (updatedSlots || []).map((s:any)=>({
      ...s,
      isBooked:
        s.isBooked ||
        s.status === "booked" ||
        s.status === "completed" ||
        s.status === "pending"
    }))

    setSlots(fixedSlots)

    setForm(prev=>({...prev,time:""}))
  }

  if(loading){
    return <div className="p-10 text-center">Loading...</div>
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">

      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          className="bg-white rounded-3xl p-8 shadow-xl space-y-6"
        >

          <h1 className="text-2xl font-bold">
            Book Appointment
          </h1>

          <div className="grid md:grid-cols-2 gap-6">

            {/* PATIENT */}
            <div className="relative">
              <label className="text-sm mb-1 block">Patient</label>

              <div className="flex items-center border rounded-xl px-3 h-11 bg-gray-50">
                <Search size={16}/>
                <input
                  value={patientSearch}
                  onChange={(e)=>{
                    setPatientSearch(e.target.value)
                    setShowPatients(true)
                  }}
                  className="flex-1 outline-none bg-transparent ml-2"
                />
              </div>

              {showPatients && (
                <div className="absolute bg-white w-full mt-1 border rounded-xl shadow max-h-40 overflow-y-auto z-10">
                  {filteredPatients.map(p=>(
                    <div
                      key={p.id}
                      onClick={()=>{
                        setForm(prev=>({...prev,patientId:p.id}))
                        setPatientSearch(p.name)
                        setShowPatients(false)
                      }}
                      className="p-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DOCTOR */}
            <div className="relative">
              <label className="text-sm mb-1 block">Doctor</label>

              <div className="flex items-center border rounded-xl px-3 h-11 bg-gray-50">
                <Search size={16}/>
                <input
                  value={doctorSearch}
                  onChange={(e)=>{
                    setDoctorSearch(e.target.value)
                    setShowDoctors(true)
                  }}
                  className="flex-1 outline-none bg-transparent ml-2"
                />
              </div>

              {showDoctors && (
                <div className="absolute bg-white w-full mt-1 border rounded-xl shadow max-h-40 overflow-y-auto z-10">
                  {filteredDoctors.map(d=>(
                    <div
                      key={d.id}
                      onClick={()=>{
                        setForm(prev=>({...prev,doctorId:d.id}))
                        setDoctorSearch(d.name)
                        setShowDoctors(false)
                      }}
                      className="p-2 hover:bg-purple-50 cursor-pointer"
                    >
                      {d.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATE */}
            <div>
              <label className="text-sm mb-1 block">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e=>setForm(prev=>({...prev,date:e.target.value}))}
                className="border rounded-xl px-3 h-11 w-full"
              />
            </div>

          </div>

          {/* SLOTS */}
          <div>
            <label className="text-sm mb-2 block">Available Slots</label>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">

              {slots.length === 0 && (
                <p className="text-sm text-gray-500">
                  No slots available
                </p>
              )}

              {slots.map(slot=>{

                const selected = form.time === slot.time
                const isBooked = slot.isBooked

                return (
                  <button
                    key={slot.time}
                    disabled={isBooked}
                    onClick={()=>setForm(prev=>({...prev,time:slot.time}))}
                    className={`py-2 rounded-xl text-sm font-medium transition

                      ${isBooked
                        ? "bg-red-100 text-red-500 cursor-not-allowed border border-red-300"
                        : selected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                          : "bg-white border hover:bg-gray-100"
                      }`}
                  >
                    {isBooked ? "❌ " : ""}
                    {slot.time}
                  </button>
                )
              })}

            </div>

          </div>

          <button
            onClick={createAppointment}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:scale-105 transition"
          >
            <CheckCircle size={18}/>
            Book Appointment
          </button>

        </motion.div>

      </div>

    </div>
  )
}