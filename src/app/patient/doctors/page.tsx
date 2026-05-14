"use client"

import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

export default function PatientDoctors() {

  const [doctors, setDoctors] = useState<any[]>([])
  const [groupedDoctors, setGroupedDoctors] = useState<any>({})
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState("")
  const [appointments, setAppointments] = useState<any[]>([])
  const [availability, setAvailability] = useState<any>(null)

  const [filter, setFilter] = useState("all")

  // 🔥 PAYMENT
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMode, setPaymentMode] = useState("UPI")

  // 🔥 SLOT GENERATOR
  function generateSlots(start: string, end: string) {
    if (!start || !end) return []
    const slots = []

    let startMin = +start.split(":")[0] * 60 + +start.split(":")[1]
    let endMin = +end.split(":")[0] * 60 + +end.split(":")[1]

    for (let i = startMin; i < endMin; i += 15) {
      const h = Math.floor(i / 60)
      const m = i % 60

      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`

      const label = new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })

      slots.push({ value, label })
    }

    return slots
  }

  // 🔥 FETCH DOCTORS
  useEffect(() => {
    fetch("/api/doctors")
      .then(res => res.json())
      .then(data => {
        const docs = Array.isArray(data) ? data : (data.data || [])
        setDoctors(docs)

        const grouped = docs.reduce((acc: any, doc: any) => {
          if (!acc[doc.specialization]) acc[doc.specialization] = []
          acc[doc.specialization].push(doc)
          return acc
        }, {})

        setGroupedDoctors(grouped)
      })
  }, [])

  useEffect(() => {
    setAppointments([])
    setTime("")
    setDate(null)
  }, [selectedDoctor])

  // 🔥 AVAILABILITY
  useEffect(() => {
    if (!selectedDoctor?.id) return

    fetch(`/api/doctors/availability?doctorId=${selectedDoctor.id}`)
      .then(res => res.json())
      .then(data => setAvailability(data))
  }, [selectedDoctor])

  // 🔥 DEFAULT DATE
  useEffect(() => {
    if (!availability?.days) return

    const today = new Date()
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" })

    if (availability.days.includes(dayName)) {
      setDate(today)
    }
  }, [availability])

  // 🔥 FETCH BOOKED SLOTS
  useEffect(() => {
    if (!selectedDoctor?.id || !date) return

    fetch(`/api/appointments/slots?doctorId=${selectedDoctor.id}&date=${date.toISOString()}`)
      .then(res => res.json())
      .then(data => setAppointments(Array.isArray(data) ? data : []))
  }, [selectedDoctor, date])

  const timeSlots = availability
    ? generateSlots(availability.start, availability.end)
    : []

  const isSlotBooked = (slot: string) => {
    return appointments.some((a: any) => a.time === slot)
  }

  // 🔥 CONFIRM (CHECK FIRST)
  const handleConfirm = async () => {
  if (!time) return

  const res = await fetch("/api/appointments/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      doctorId: selectedDoctor.id,
      date: date?.toISOString()
    })
  })

  let data: any = {}

  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    toast.error(data.error || "Already booked")
    return
  }

  setShowPayment(true)
}

  // 🔥 FINAL BOOKING
  const finalBooking = async () => {
    const res = await fetch("/api/appointments", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctorId: selectedDoctor.id,
        date: date?.toISOString(),
        time,
        paymentMode,
        amount: 500
      })
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || "Booking failed")
      return
    }

    // 🔥 PAYMENT AFTER SUCCESS
    if (paymentMode === "UPI") {
      toast.loading("Processing UPI Payment...")
      await new Promise(res => setTimeout(res, 2000))
      toast.dismiss()
      toast.success("Payment Successful ✅")
    }

    if (paymentMode === "CASH") {
      toast("Pay at hospital 💰")
    }

    window.location.href = `/patient/invoice/${data.billId}`
  }

  const specializations = ["all", ...Object.keys(groupedDoctors)]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      <h1 className="text-2xl font-bold">Find Doctors</h1>

      {/* FILTER */}
      <div className="flex flex-wrap gap-2">
        {specializations.map((sp) => (
          <button
            key={sp}
            onClick={() => setFilter(sp)}
            className={`px-3 py-1 rounded-full border ${
              filter === sp ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {sp}
          </button>
        ))}
      </div>

      {/* DOCTORS */}
      {Object.entries(groupedDoctors)
        .filter(([category]) => filter === "all" || filter === category)
        .map(([category, docs]: any) => (

          <div key={category} className="space-y-4">

            <h2 className="font-semibold">🏥 {category}</h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {docs.map((doc: any) => (

                <div key={doc.id} className="bg-white p-4 rounded-xl shadow space-y-2">

                  <h3 className="font-semibold">{doc.name}</h3>

                  <p className="text-sm text-gray-500">
                    {doc.experience} yrs experience
                  </p>

                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    Book
                  </button>

                </div>

              ))}

            </div>

          </div>

        ))}

      {/* BOOK MODAL */}
      <AnimatePresence>
        {selectedDoctor && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">

              <div className="flex justify-between">
                <h2 className="font-bold">Book Appointment</h2>
                <button onClick={() => setSelectedDoctor(null)}>
                  <X size={18} />
                </button>
              </div>

              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                minDate={new Date()}
                className="w-full border p-2 rounded"
              />

              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => {
                  const booked = isSlotBooked(slot.value)

                  return (
                    <button
                      key={slot.value}
                      disabled={booked}
                      onClick={() => setTime(slot.value)}
                      className={`px-3 py-1 rounded border text-sm ${
                        booked
                          ? "bg-red-200 text-red-600 line-through"
                          : time === slot.value
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {booked ? "Full" : slot.label}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleConfirm}
                disabled={!time}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                Confirm
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">

            <h2 className="font-bold text-lg">Payment</h2>

            <p>Doctor Fee: ₹500</p>

            <select
              className="w-full border p-2 rounded"
              onChange={(e)=>setPaymentMode(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
            </select>

            <button
              onClick={finalBooking}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Pay & Confirm
            </button>

            <button
              onClick={()=>setShowPayment(false)}
              className="w-full bg-gray-300 py-2 rounded"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  )
}