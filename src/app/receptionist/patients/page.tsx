"use client"

import { useEffect, useState } from "react"
import { User, Mail, Phone, Search, Activity } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Patients(){

  const [patients,setPatients] = useState<any[]>([])
  const [filtered,setFiltered] = useState<any[]>([])
  const [search,setSearch] = useState("")
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState("")
  const [page,setPage] = useState(1)
  const [totalPages,setTotalPages] = useState(1)

  useEffect(()=>{

    const load = async()=>{

      try{

        const res = await fetch(`/api/patients?search=${search}&page=${page}`,{
          credentials:"include"
        })

        const data = await res.json()

        if(!res.ok){
          setError(data.error || "Failed to load")
        }else{
          setPatients(Array.isArray(data) ? data : (data.data || []))
          setFiltered(Array.isArray(data) ? data : (data.data || []))
          setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1))
        }

      }catch(err){
        console.log(err)
        setError("Something went wrong")
      }

      setLoading(false)
    }

    load()

  },[search, page])

  /* SEARCH LOCAL */
  useEffect(()=>{

    const q = search.toLowerCase()

    const f = patients.filter((p:any)=>
      p.name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.mrn?.toLowerCase().includes(q)
    )

    setFiltered(f)

  },[search,patients])

  /* LOADING */
  if(loading){
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1,2,3,4].map((_,i)=>(
          <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border"/>
        ))}
      </div>
    )
  }

  if(error){
    return <div className="p-10 text-red-500">{error}</div>
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-6 mb-10">

          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
            <User size={26}/>
            Patients
          </h1>

          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-3 text-gray-400"/>
            <input
              placeholder="Search patient..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 border rounded-xl w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            No patients found
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((p:any,i)=>(

            <Link key={p.id} href={`/receptionist/patients/${p.id}`}>

              <motion.div
                initial={{opacity:0,y:20}}
                animate={{opacity:1,y:0}}
                transition={{delay:i*0.05}}
                whileHover={{y:-6,scale:1.02}}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition border cursor-pointer"
              >

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-5">

                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center">
                    <User size={20}/>
                  </div>

                  <div>
                    <p className="font-semibold text-lg">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      MRN: {p.mrn}
                    </p>
                  </div>

                </div>

                {/* INFO */}
                <div className="space-y-2 text-sm text-gray-600">

                  <div className="flex items-center gap-2">
                    <Mail size={14}/>
                    {p.user?.email || "No email"}
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone size={14}/>
                    {p.phone || "No phone"}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Activity size={12}/>
                    Blood Group: {p.bloodGroup || "-"}
                  </div>

                </div>

              </motion.div>

            </Link>

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