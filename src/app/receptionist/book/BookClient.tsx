"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import toast from "react-hot-toast"

export default function BookPage() {

  const params = useSearchParams()
  const patientIdFromURL = params.get("patientId")

  const [patients,setPatients] = useState<any[]>([])
  const [doctors,setDoctors] = useState<any[]>([])
  const [availability,setAvailability] = useState<any>(null)
  const [bookedSlots,setBookedSlots] = useState<string[]>([])

  const [patientSearch,setPatientSearch] = useState("")
  const [doctorSearch,setDoctorSearch] = useState("")

  const [showPatients,setShowPatients] = useState(false)
  const [showDoctors,setShowDoctors] = useState(false)

  const [form,setForm] = useState({
    doctorId:"",
    patientId:"",
    date:"",
    time:""
  })

  /* ================= FORMAT ================= */

  function formatTimeTo12H(time:string){
    const [h,m] = time.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour = h % 12 || 12
    return `${hour.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")} ${ampm}`
  }

  /* ================= SLOT GENERATOR ================= */

  function generateSlots(start="09:00",end="17:00",interval=15){
    const slots:string[]=[]
    let current = new Date()

    const [sh,sm] = start.split(":").map(Number)
    const [eh,em] = end.split(":").map(Number)

    current.setHours(sh,sm,0,0)

    const endTime = new Date()
    endTime.setHours(eh,em,0,0)

    while(current <= endTime){

      const h = current.getHours()
      const m = current.getMinutes()

      const ampm = h >= 12 ? "PM" : "AM"
      const hour = h % 12 || 12

      const formatted = `${hour.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")} ${ampm}`

      slots.push(formatted)

      current.setMinutes(current.getMinutes()+interval)
    }

    return slots
  }

  /* ================= FETCH ================= */

  useEffect(()=>{
    const load = async()=>{
      const [p,d] = await Promise.all([
        fetch("/api/patients",{credentials:"include"}),
        fetch("/api/doctors",{credentials:"include"})
      ])

      const patientsData = await p.json()
      const doctorsData = await d.json()

      setPatients(Array.isArray(patientsData) ? patientsData : (patientsData.data || []))

      const doctorsArr = Array.isArray(doctorsData) ? doctorsData : (doctorsData.data || [])
      const availableDoctors = doctorsArr.filter((doc:any)=>doc.isAvailable !== false)
      setDoctors(availableDoctors)
    }
    load()
  },[])

  /* ================= AUTO SELECT ================= */

  useEffect(()=>{
    if(patientIdFromURL && patients.length>0){
      const found = patients.find(p=>p.id===patientIdFromURL)
      if(found){
        setForm(prev=>({...prev,patientId:found.id}))
        setPatientSearch(found.name)
      }
    }
  },[patientIdFromURL,patients])

  /* ================= AVAILABILITY ================= */

  useEffect(()=>{
    if(!form.doctorId) return

    fetch(`/api/doctors/availability?doctorId=${form.doctorId}`)
      .then(res=>res.json())
      .then(setAvailability)

  },[form.doctorId])

  /* ================= BOOKED SLOTS ================= */

  const fetchBookedSlots = async()=>{
    if(!form.doctorId || !form.date) return

    try{
      const res = await fetch(`/api/appointments?doctorId=${form.doctorId}&date=${form.date}`)
      const data = await res.json()

      const times = Array.isArray(data)
        ? data.map((a:any)=>formatTimeTo12H(a.time))
        : []

      setBookedSlots(times)
    }catch{
      setBookedSlots([])
    }
  }

  useEffect(()=>{
    fetchBookedSlots()
  },[form.doctorId,form.date])

  /* ================= CHECK DAY ================= */

  const isAvailableDay = (date:string)=>{
    if(!availability?.days) return true

    const d = new Date(date)
    const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]

    return availability.days.includes(day)
  }

  /* ================= FINAL SLOTS ================= */

  const timeSlots = availability
    ? generateSlots(availability.start, availability.end)
        .filter(slot => !bookedSlots.includes(slot))
    : []

  /* ================= CREATE ================= */

  async function createAppointment(){

    if(!form.doctorId || !form.patientId || !form.date || !form.time){
      toast.error("Fill all fields")
      return
    }

    if(!isAvailableDay(form.date)){
      toast.error("Doctor not available ❌")
      return
    }

    const res = await fetch("/api/appointments",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(form)
    })

    const data = await res.json()

    if(!res.ok){
      toast.error(data.error || "Failed ❌")
      return
    }

    toast.success("Appointment booked ✅")

    setForm(prev=>({...prev,time:""}))

    // 🔥 refresh slots instantly
    await fetchBookedSlots()
  }

  /* ================= UI ================= */

  return(
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Book Appointment</h1>

      {/* PATIENT */}
      <input
        value={patientSearch}
        onChange={(e)=>{
          setPatientSearch(e.target.value)
          setShowPatients(true)
        }}
        placeholder="Search patient"
        className="border p-2 w-full"
      />

      {showPatients && (
        <div className="border max-h-40 overflow-auto">
          {patients
            .filter(p=>p.name.toLowerCase().includes(patientSearch.toLowerCase()))
            .map(p=>(
              <div key={p.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={()=>{
                  setForm(prev=>({...prev,patientId:p.id}))
                  setPatientSearch(p.name)
                  setShowPatients(false)
                }}>
                {p.name}
              </div>
            ))}
        </div>
      )}

      {/* DOCTOR */}
      <input
        value={doctorSearch}
        onChange={(e)=>{
          setDoctorSearch(e.target.value)
          setShowDoctors(true)
        }}
        placeholder="Search doctor"
        className="border p-2 w-full mt-3"
      />

      {showDoctors && (
        <div className="border max-h-40 overflow-auto">
          {doctors
            .filter(d=>d.name.toLowerCase().includes(doctorSearch.toLowerCase()))
            .map(d=>(
              <div key={d.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={()=>{
                  setForm(prev=>({...prev,doctorId:d.id}))
                  setDoctorSearch(d.name)
                  setShowDoctors(false)
                }}>
                {d.name}
              </div>
            ))}
        </div>
      )}

      {/* DATE */}
      <input
        type="date"
        value={form.date}
        onChange={(e)=>setForm(prev=>({...prev,date:e.target.value}))}
        className="border p-2 w-full mt-3"
      />

      {/* SLOTS */}
      <div className="grid grid-cols-3 gap-2 mt-3">

        {timeSlots.length === 0 && (
          <p className="text-sm text-gray-500">No slots available</p>
        )}

        {timeSlots.map(slot=>(
          <button
            key={slot}
            onClick={()=>setForm(prev=>({...prev,time:slot}))}
            className={`p-2 border rounded text-sm
              ${form.time===slot
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
              }`}
          >
            {slot}
          </button>
        ))}

      </div>

      <button
        onClick={createAppointment}
        className="bg-blue-600 text-white p-2 mt-4 w-full rounded"
      >
        Book Appointment
      </button>

    </div>
  )
}