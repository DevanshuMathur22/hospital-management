"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, Calendar, Clock, CheckCircle, XCircle, Search } from "lucide-react"

export default function AppointmentHistory(){

const [appointments,setAppointments] = useState<any[]>([])
const [loading,setLoading] = useState(true)

const [search,setSearch] = useState("")
const [dateFilter,setDateFilter] = useState("")

useEffect(()=>{

fetch("/api/appointments?type=history",{ credentials:"include" })
.then(res=>res.json())
.then(data=>{
setAppointments(Array.isArray(data) ? data : [])
})
.catch(()=>setAppointments([]))
.finally(()=>setLoading(false))

},[])


/* 🔥 FILTER */
const filtered = appointments.filter((a)=>{

const doctor = a.doctor?.name?.toLowerCase() || ""

const searchMatch = doctor.includes(search.toLowerCase())

const dateMatch = dateFilter
? new Date(a.date).toLocaleDateString() ===
  new Date(dateFilter).toLocaleDateString()
: true

return searchMatch && dateMatch

})


/* 🔥 LOADING */
if(loading){
return(
<div className="p-6 text-sm text-gray-500">
Loading history...
</div>
)
}


/* 🔥 UI */
return(

<div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">

{/* TITLE */}
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
Appointment History
</h1>


{/* 🔍 SEARCH + FILTER */}
<div className="flex flex-col sm:flex-row gap-3">

<div className="relative w-full sm:w-72">

<Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>

<input
placeholder="Search doctor..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-9 pr-3 py-2 text-sm border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

</div>

<input
type="date"
value={dateFilter}
onChange={(e)=>setDateFilter(e.target.value)}
className="border px-3 py-2 rounded-lg text-sm w-full sm:w-fit"
/>

</div>


{/* ❌ EMPTY */}
{filtered.length === 0 && (
<p className="text-gray-500 text-sm">
No appointment history
</p>
)}


{/* 🔥 CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

{filtered.map((a:any)=>(

<motion.div
key={a.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{scale:1.02}}
className="bg-white border p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-lg transition space-y-3"
>

{/* 👨‍⚕️ Doctor */}
<h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold truncate">
<Stethoscope size={16}/>
Dr. {a.doctor?.name || "Unknown"}
</h2>

{/* 📅 Date */}
<p className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
<Calendar size={14}/>
{new Date(a.date).toDateString()}
</p>

{/* ⏰ Time */}
<p className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
<Clock size={14}/>
{a.time}
</p>

{/* 🟢 STATUS */}
<span className={`flex items-center gap-1 w-fit px-2 py-1 text-xs rounded-full

${a.status==="completed" && "bg-green-100 text-green-700"}
${a.status==="cancelled" && "bg-red-100 text-red-700"}

`}>

{a.status==="completed" && <CheckCircle size={12}/>}
{a.status==="cancelled" && <XCircle size={12}/>}

{a.status}

</span>

</motion.div>

))}

</div>

</div>

)
}