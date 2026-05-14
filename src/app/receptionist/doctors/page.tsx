"use client"

import { useEffect, useState } from "react"
import { User, Stethoscope, Search, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function Doctors(){

  const router = useRouter()

  const [doctors,setDoctors] = useState<any[]>([])
  const [search,setSearch] = useState("")
  const [loading,setLoading] = useState(true)
  const [page,setPage] = useState(1)
  const [totalPages,setTotalPages] = useState(1)

  useEffect(()=>{

    const load = async()=>{
      const res = await fetch(`/api/doctors?page=${page}&search=${search}`,{ credentials: "include" })
      const data = await res.json()
      setDoctors(Array.isArray(data) ? data : (data.data || []))
      setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1))
      setLoading(false)
    }

    load()

  },[page,search])

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  if(loading){
    return <div className="p-10 text-center">Loading doctors...</div>
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-10">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-10">

          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
            <Stethoscope size={26}/>
            Doctors
          </h1>

          {/* SEARCH */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
            <input
              placeholder="Search doctor / specialization"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-xl w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500">
            No doctors found
          </p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((d,i)=>(

            <motion.div
              key={d.id}
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              transition={{delay:i*0.05}}
              whileHover={{y:-6,scale:1.02}}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition space-y-4"
            >

              {/* HEADER */}
              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                  <User size={20}/>
                </div>

                <div>
                  <p className="font-semibold text-lg">
                    {d.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Doctor
                  </p>
                </div>

              </div>

              {/* SPECIALIZATION */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Stethoscope size={14}/>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {d.specialization}
                </span>
              </div>

              {/* ACTION */}
              <button
                onClick={()=>router.push(`/receptionist/book?doctorId=${d.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl hover:scale-105 transition"
              >
                <Calendar size={16}/>
                Book Appointment
              </button>

            </motion.div>

          ))}

        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-8">

          <button
            disabled={page===1}
            onClick={()=>setPage(p=>p-1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm px-2">
            {page} / {totalPages}
          </span>

          <button
            disabled={page===totalPages}
            onClick={()=>setPage(p=>p+1)}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    </div>

  )
}