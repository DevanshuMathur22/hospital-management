"use client"

import {useEffect,useState} from "react"
import {motion} from "framer-motion"
import {
Stethoscope,
Calendar,
Clock3,
CheckCircle2,
XCircle,
Search,
History
} from "lucide-react"

export default function AppointmentHistory(){

const [appointments,setAppointments]=useState<any[]>([])
const [loading,setLoading]=useState(true)

const [search,setSearch]=useState("")
const [dateFilter,setDateFilter]=useState("")

useEffect(()=>{

fetch("/api/appointments?type=history",{credentials:"include"})
.then(res=>res.json())
.then(data=>{
setAppointments(Array.isArray(data)?data:[])
})
.catch(()=>setAppointments([]))
.finally(()=>setLoading(false))

},[])

const filtered=appointments.filter((a)=>{

const doctor=a.doctor?.name?.toLowerCase()||""

const searchMatch=doctor.includes(search.toLowerCase())

const dateMatch=dateFilter
?new Date(a.date).toLocaleDateString()===
new Date(dateFilter).toLocaleDateString()
:true

return searchMatch&&dateMatch

})

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-7xl mx-auto space-y-6">

<div className="bg-white rounded-[30px] h-28 animate-pulse border border-gray-100"/>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

{[1,2,3].map(i=>(

<div
key={i}
className="bg-white rounded-[30px] h-52 animate-pulse border border-gray-100"
/>

))}

</div>

</div>

</div>

)

}

return(

<div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 md:p-8">

<div className="max-w-7xl mx-auto space-y-8">

<div className="bg-white rounded-[30px] p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<div>
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
Appointment History
</h1>

<p className="text-sm text-gray-500 mt-1">
Track completed & cancelled appointments
</p>
</div>

<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
<History size={17}/>
{filtered.length} Records
</div>

</div>

<div className="flex flex-col lg:flex-row gap-4">

<div className="relative flex-1">

<Search
size={17}
className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
/>

<input
placeholder="Search doctor..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500"
/>

</div>

<input
type="date"
value={dateFilter}
onChange={(e)=>setDateFilter(e.target.value)}
className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
/>

</div>

{filtered.length===0&&(

<div className="bg-white rounded-[30px] border border-dashed border-gray-300 p-14 text-center shadow-sm">

<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
<History size={28}/>
</div>

<h2 className="font-semibold text-lg">
No Appointment History
</h2>

<p className="text-sm text-gray-500 mt-1">
Your previous appointments will appear here
</p>

</div>

)}

<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

{filtered.map((a:any)=>(

<motion.div
key={a.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className="bg-white border border-gray-100 rounded-[30px] p-5 shadow-sm hover:shadow-xl transition space-y-5"
>

<div className="flex items-start justify-between">

<div>
<h2 className="flex items-center gap-2 text-lg font-semibold">
<Stethoscope size={18}/>
Dr. {a.doctor?.name||"Unknown"}
</h2>

<p className="text-sm text-gray-500 mt-1">
Appointment Record
</p>
</div>

<div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
a.status==="completed"
?"bg-green-100 text-green-600"
:"bg-red-100 text-red-500"
}`}>

{a.status==="completed"
?<CheckCircle2 size={20}/>
:<XCircle size={20}/>
}

</div>

</div>

<div className="space-y-3 text-sm">

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
<div className="flex items-center gap-2 text-gray-500">
<Calendar size={15}/>
Date
</div>

<span className="font-medium">
{new Date(a.date).toDateString()}
</span>

</div>

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
<div className="flex items-center gap-2 text-gray-500">
<Clock3 size={15}/>
Time
</div>

<span className="font-medium">
{a.time}
</span>

</div>

</div>

<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
a.status==="completed"
?"bg-green-100 text-green-700"
:"bg-red-100 text-red-700"
}`}>

{a.status==="completed"
?<CheckCircle2 size={13}/>
:<XCircle size={13}/>
}

{a.status}

</div>

</motion.div>

))}

</div>

</div>

</div>

)
}