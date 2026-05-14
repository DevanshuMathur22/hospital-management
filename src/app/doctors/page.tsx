"use client"

import { useEffect, useState } from "react"
import { CalendarPlus, UserRound, UserRoundCheck } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import Navbar from "../../components/layout/Navbar"
import Footer from "../../components/layout/Footer"

export default function Doctors() {

  const [doctors, setDoctors] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors",{ credentials: "include" })
      const data = await res.json()
      const docs = Array.isArray(data) ? data : (data.data || [])
      setDoctors(docs)
    }
    fetchDoctors()
  }, [])

  const handleBook = () => {
    const user = localStorage.getItem("user") // simple auth check

    if (!user) {
      router.push("/login") // 🔥 redirect
    } else {
      router.push("/appointment")
    }
  }

  return (
    <>
      <Navbar />

      <div className="py-20 px-6 min-h-screen 
      bg-gradient-to-b from-white via-blue-50 to-white">

        {/* TITLE */}
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Our Doctors
        </h1>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

          {doctors.map((doc: any) => (
            <motion.div
              key={doc._id || doc.id}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative bg-white/40 backdrop-blur-2xl 
              border border-white/20 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)]
              overflow-hidden cursor-pointer group"
            >

              {/* GLOW EFFECT */}
              <div className="absolute inset-0 bg-gradient-to-r 
              from-blue-400/10 via-white/10 to-purple-400/10 
              opacity-0 group-hover:opacity-100 transition duration-500 blur-xl"></div>

              {/* ICON */}
              <div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center relative z-10">

                {doc.gender === "female" ? (
                  <UserRoundCheck size={42} className="text-white" />
                ) : (
                  <UserRound size={42} className="text-white" />
                )}

              </div>

              {/* INFO */}
              <div className="p-6 text-center relative z-10">

                <h3 className="text-lg font-semibold text-gray-800">
                  {doc.name}
                </h3>

                <p className="text-gray-500 text-sm">
                  {doc.specialization}
                </p>

                <span className="inline-block mt-3 text-xs 
                bg-blue-100/70 backdrop-blur 
                text-blue-600 px-3 py-1 rounded-full">
                  {doc.experience} Years Experience
                </span>

                <button
                  onClick={handleBook}
                  className="mt-5 w-full flex items-center justify-center gap-2 
                  bg-blue-600 hover:bg-blue-700 
                  text-white py-2 rounded-xl text-sm 
                  transition transform hover:scale-105"
                >
                  <CalendarPlus size={16} />
                  Book Appointment
                </button>

              </div>

            </motion.div>
          ))}

        </div>
      </div>

      <Footer />
    </>
  )
}