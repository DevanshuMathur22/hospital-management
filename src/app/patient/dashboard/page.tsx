"use client"

import { motion } from "framer-motion"
import { CalendarDays, FileText, ClipboardList, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PatientDashboard(){

const router = useRouter()

const [stats,setStats] = useState({
total:0,
upcoming:0,
prescriptions:0
})

const [activity,setActivity] = useState<any[]>([])

/* 🔥 FETCH DATA */
useEffect(()=>{

const load = async()=>{

try{
const res = await fetch("/api/patient/dashboard",{ credentials:"include" })
const data = await res.json()

setStats(data.stats || {})
setActivity(data.activity || [])
}catch(err){
console.log(err)
}

}

load()

},[])


const cards = [
{
title:"Book Appointment",
desc:"Schedule a new appointment",
icon:<CalendarDays size={24}/>,
bg:"bg-blue-100",
link:"/patient/doctors"
},
{
title:"My Appointments",
desc:"View all appointments",
icon:<ClipboardList size={24}/>,
bg:"bg-green-100",
link:"/patient/appointments"
},
{
title:"Prescriptions",
desc:"Check prescriptions",
icon:<FileText size={24}/>,
bg:"bg-purple-100",
link:"/patient/prescriptions"
},
{
title:"My Profile",
desc:"Manage profile",
icon:<User size={24}/>,
bg:"bg-orange-100",
link:"/patient/profile"
}
]

return(

<div className="min-h-screen p-4 sm:p-6 md:p-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 space-y-6">

{/* 🔥 HEADER */}
<div className="space-y-1">
<h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
Patient Dashboard
</h1>
<p className="text-gray-600 text-sm">
Manage your appointments & health records
</p>
</div>

{/* 🔥 STATS */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

<div className="bg-white p-4 rounded-xl shadow">
<p className="text-xs text-gray-500">Total</p>
<h2 className="text-xl font-bold">{stats.total}</h2>
</div>

<div className="bg-white p-4 rounded-xl shadow">
<p className="text-xs text-gray-500">Upcoming</p>
<h2 className="text-xl font-bold">{stats.upcoming}</h2>
</div>

<div className="bg-white p-4 rounded-xl shadow">
<p className="text-xs text-gray-500">Prescriptions</p>
<h2 className="text-xl font-bold">{stats.prescriptions}</h2>
</div>

</div>

{/* 🔥 QUICK ACTIONS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

{cards.map((card,i)=>(

<motion.div
key={i}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{delay:i*0.1}}
whileHover={{scale:1.03}}
onClick={()=>router.push(card.link)}
className="cursor-pointer bg-white p-4 sm:p-6 rounded-2xl shadow hover:shadow-lg transition"
>

<div className={`w-12 h-12 flex items-center justify-center rounded-lg ${card.bg} mb-3`}>
{card.icon}
</div>

<h2 className="text-sm sm:text-base font-semibold">
{card.title}
</h2>

<p className="text-xs text-gray-500">
{card.desc}
</p>

</motion.div>

))}

</div>

{/* 🔥 RECENT ACTIVITY */}
<div className="bg-white p-4 sm:p-6 rounded-2xl shadow">

<h2 className="font-semibold mb-3 text-sm sm:text-base">
Recent Activity
</h2>

{activity.length === 0 && (
<p className="text-gray-500 text-sm">
No recent activity
</p>
)}

<div className="space-y-2 text-sm">

{activity.map((a:any,i:number)=>(

<div key={i} className="flex justify-between border-b pb-1">

<span>
{a.type === "appointment"
? `Appointment with Dr. ${a.doctor}`
: `Prescription added`}
</span>

<span className="text-gray-500 text-xs">
{new Date(a.date).toLocaleDateString()}
</span>

</div>

))}

</div>

</div>

{/* 🔥 FLOAT BUTTON */}
<motion.button
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
onClick={()=>router.push("/patient/doctors")}
className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm"
>
Book Appointment
</motion.button>

</div>

)
}