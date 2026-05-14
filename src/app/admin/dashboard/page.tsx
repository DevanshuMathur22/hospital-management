"use client";

import { useEffect, useState } from "react";
import {
Users,
Stethoscope,
CalendarCheck,
Activity,
UserPlus,
CalendarPlus
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard(){

const [stats,setStats] = useState({
doctors:0,
patients:0,
appointments:0,
today:0
})

const [recentAppointments,setRecentAppointments] = useState<any[]>([])
const [recentDoctors,setRecentDoctors] = useState<any[]>([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

Promise.all([
fetch("/api/stats",{ credentials:"include" }).then(res=>res.json()),
fetch("/api/appointments",{ credentials:"include" }).then(res=>res.json()),
fetch("/api/doctors",{ credentials:"include" }).then(res=>res.json())
])
.then(([statsData,appData,docData])=>{

setStats({
doctors:statsData.doctors || 0,
patients:statsData.patients || 0,
appointments:statsData.appointments || 0,
today:statsData.today || 0
})

const docs = Array.isArray(docData) ? docData : (docData.data || [])
const apps = Array.isArray(appData) ? appData : (appData.data || [])

setRecentAppointments(apps.slice(0,5))
setRecentDoctors(docs.slice(0,5))

})
.catch(()=>{})
.finally(()=>setLoading(false))

},[])

/* STATUS UPDATE */
const updateStatus = async(id:string,status:string)=>{

await fetch(`/api/appointments/${id}`,{
method:"PUT",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ status }),credentials:"include"
})

setRecentAppointments(prev =>
prev.map(a => a.id === id ? {...a,status} : a)
)

}

/* STATUS COLOR */
const getStatusColor = (status:string)=>{

switch(status){
case "confirmed": return "bg-green-100 text-green-600"
case "cancelled": return "bg-red-100 text-red-600"
case "completed": return "bg-blue-100 text-blue-600"
default: return "bg-yellow-100 text-yellow-600"
}

}

const cards = [
{title:"Doctors",value:stats.doctors,icon:Stethoscope,color:"bg-blue-100 text-blue-600"},
{title:"Patients",value:stats.patients,icon:Users,color:"bg-green-100 text-green-600"},
{title:"Appointments",value:stats.appointments,icon:CalendarCheck,color:"bg-purple-100 text-purple-600"},
{title:"Active Today",value:stats.today,icon:Activity,color:"bg-orange-100 text-orange-600"}
]

if(loading){
return(
<div className="flex items-center justify-center min-h-screen text-sm">
Loading dashboard...
</div>
)
}

return(

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

{/* HEADER */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
Admin Dashboard
</h1>

<div className="flex flex-col sm:flex-row gap-3">

<Link
href="/admin/add-doctor"
className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
>
<UserPlus size={16}/>
Add Doctor
</Link>

<Link
href="/admin/appointments"
className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
>
<CalendarPlus size={16}/>
Appointments
</Link>

</div>

</div>

{/* STATS */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

{cards.map((card,i)=>{
const Icon = card.icon

return(
<div key={i} className="p-4 sm:p-5 bg-white rounded-xl shadow border">

<div className="flex justify-between items-center">

<div>
<p className="text-[10px] sm:text-xs text-gray-500">
{card.title}
</p>
<h2 className="text-lg sm:text-xl font-bold">
{card.value}
</h2>
</div>

<div className={`p-2 sm:p-3 rounded-lg ${card.color}`}>
<Icon size={18}/>
</div>

</div>

</div>
)
})}

</div>

{/* MAIN GRID */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

{/* APPOINTMENTS */}
<div className="bg-white rounded-xl shadow p-4 sm:p-6">

<h2 className="text-lg sm:text-xl font-semibold mb-4">
Recent Appointments
</h2>

{recentAppointments.length === 0 && (
<p className="text-gray-500 text-sm">No appointments yet</p>
)}

<div className="space-y-3">

{recentAppointments.map((a:any)=>(

<div key={a.id} className="border-b pb-3 text-sm space-y-2">

<div className="flex justify-between">
<span className="truncate">{a.patient?.name}</span>
<span className="text-gray-500 text-xs">
{new Date(a.date).toLocaleDateString()}
</span>
</div>

<div className="flex flex-wrap justify-between items-center gap-2">

<span className={`px-2 py-1 text-xs rounded ${getStatusColor(a.status)}`}>
{a.status}
</span>

<div className="flex gap-2 flex-wrap">

<button
onClick={()=>updateStatus(a.id,"confirmed")}
className="text-green-600 text-xs"
>
Confirm
</button>

<button
onClick={()=>updateStatus(a.id,"cancelled")}
className="text-red-600 text-xs"
>
Cancel
</button>

</div>

</div>

</div>

))}

</div>

</div>

{/* DOCTORS */}
<div className="bg-white rounded-xl shadow p-4 sm:p-6">

<h2 className="text-lg sm:text-xl font-semibold mb-4">
New Doctors
</h2>

{recentDoctors.length === 0 && (
<p className="text-gray-500 text-sm">No doctors found</p>
)}

<div className="space-y-3">

{recentDoctors.map((d:any)=>(

<div key={d.id} className="flex justify-between border-b pb-2 text-sm">

<span className="truncate">{d.name}</span>

<span className="text-gray-500 text-xs">
{d.specialization}
</span>

</div>

))}

</div>

</div>

</div>

{/* QUICK ACTIONS */}
<div className="bg-white p-4 sm:p-6 rounded-xl shadow">

<h2 className="text-lg sm:text-xl font-semibold mb-4">
Quick Actions
</h2>

<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

<Link href="/admin/doctors" className="p-3 border rounded-lg text-sm text-center">Doctors</Link>
<Link href="/admin/patients" className="p-3 border rounded-lg text-sm text-center">Patients</Link>
<Link href="/admin/appointments" className="p-3 border rounded-lg text-sm text-center">Appointments</Link>
<Link href="/admin/calendar" className="p-3 border rounded-lg text-sm text-center">Calendar</Link>
<Link href="/admin/reports" className="p-3 border rounded-lg text-sm text-center">Reports</Link>
<Link href="/admin/add-doctor" className="p-3 border rounded-lg text-sm text-center">Add Doctor</Link>

</div>

</div>

</div>

)
}