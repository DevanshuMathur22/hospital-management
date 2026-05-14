"use client";

import { useEffect,useState } from "react";
import { User, Stethoscope, Calendar, CheckCircle, XCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminAppointments(){

const [appointments,setAppointments] = useState<any[]>([])
const [loading,setLoading] = useState(true)
const [search,setSearch] = useState("")
const [page,setPage] = useState(1)
const [totalPages,setTotalPages] = useState(1)

/* FETCH */
const fetchAppointments = async()=>{
try{
const res = await fetch(`/api/appointments?page=${page}&search=${search}`,{ credentials:"include" })
const data = await res.json()
setAppointments(Array.isArray(data) ? data : (data.data || []))
setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1))
}catch(err){
console.log("APPOINTMENT ERROR:",err)
}
setLoading(false)
}

useEffect(()=>{
fetchAppointments()
},[page,search])

/* UPDATE */
const updateStatus = async(id:string,status:string)=>{
await fetch(`/api/appointments/${id}`,{
method:"PUT",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({status}),credentials:"include"
})

setAppointments(prev =>
prev.map(a => a.id === id ? { ...a, status } : a)
)
}

/* FILTER */
const filtered = appointments.filter((a:any)=>{
const patient = a.patient?.name?.toLowerCase() || ""
const doctor = a.doctor?.name?.toLowerCase() || ""
return patient.includes(search.toLowerCase()) || doctor.includes(search.toLowerCase())
})

/* STATS */
const stats = {
total: appointments.length,
completed: appointments.filter(a=>a.status==="completed").length,
pending: appointments.filter(a=>a.status==="pending").length,
cancelled: appointments.filter(a=>a.status==="cancelled").length
}

/* LOADING */
if(loading){
return(
<div className="flex items-center justify-center min-h-screen text-sm">
Loading appointments...
</div>
)
}

return(

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

{/* TITLE */}
<h1 className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold">
<Calendar size={22}/>
Admin Appointments
</h1>

{/* STATS */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

{[
{label:"Total",value:stats.total},
{label:"Completed",value:stats.completed},
{label:"Pending",value:stats.pending},
{label:"Cancelled",value:stats.cancelled}
].map((s,i)=>(
<div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow">
<p className="text-[10px] sm:text-xs text-gray-500">{s.label}</p>
<h2 className="text-lg sm:text-xl font-bold">{s.value}</h2>
</div>
))}

</div>

{/* SEARCH */}
<div className="relative w-full">

<Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>

<input
placeholder="Search doctor / patient..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-9 pr-3 py-2 text-sm border rounded-lg w-full sm:max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

</div>

{/* EMPTY */}
{filtered.length === 0 && (
<p className="text-gray-500 text-sm">
No appointments found
</p>
)}

{/* GRID */}
<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">

{filtered.map((a:any)=>(

<motion.div
key={a.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className="bg-white border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition space-y-3"
>

{/* DOCTOR */}
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
<Stethoscope size={16}/>
</div>
<div>
<p className="font-semibold text-sm truncate">
{a.doctor?.name || "Doctor"}
</p>
<p className="text-xs text-gray-500">
Doctor
</p>
</div>
</div>

{/* PATIENT */}
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
<User size={16}/>
</div>
<div>
<p className="font-medium text-sm truncate">
{a.patient?.name || "Patient"}
</p>
<p className="text-xs text-gray-500">
Patient
</p>
</div>
</div>

{/* DATE */}
<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
<Calendar size={14}/>
{new Date(a.date).toLocaleDateString()}
</div>

{/* STATUS */}
<span className={`text-xs px-2 py-1 rounded-full w-fit

${a.status==="pending" && "bg-yellow-100 text-yellow-700"}
${a.status==="completed" && "bg-green-100 text-green-700"}
${a.status==="cancelled" && "bg-red-100 text-red-700"}

`}>
{a.status}
</span>

{/* ACTIONS */}
<div className="flex flex-wrap gap-2 pt-2">

{a.status !== "completed" && (
<button
onClick={()=>updateStatus(a.id,"completed")}
className="flex items-center gap-1 bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs"
>
<CheckCircle size={12}/>
Complete
</button>
)}

{a.status !== "cancelled" && (
<button
onClick={()=>updateStatus(a.id,"cancelled")}
className="flex items-center gap-1 bg-red-600 text-white px-2.5 py-1.5 rounded-lg text-xs"
>
<XCircle size={12}/>
Cancel
</button>
)}

</div>

</motion.div>

))}

</div>

{/* PAGINATION */}
<div className="flex justify-center gap-2 mt-6">

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

)

}