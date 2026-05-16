"use client"

import {motion} from "framer-motion"
import {CalendarDays,FileText,ClipboardList,User,ArrowRight} from "lucide-react"
import {useRouter} from "next/navigation"
import {useEffect,useState} from "react"

export default function PatientDashboard(){

const router=useRouter()

const [stats,setStats]=useState({total:0,upcoming:0,prescriptions:0})
const [activity,setActivity]=useState<any[]>([])

useEffect(()=>{

const load=async()=>{

try{
const res=await fetch("/api/patient/dashboard",{credentials:"include"})
const data=await res.json()

setStats(data.stats||{})
setActivity(data.activity||[])
}catch(err){
console.log(err)
}

}

load()

},[])

const cards=[
{
title:"Book Appointment",
desc:"Schedule visit",
icon:<CalendarDays size={22}/>,
link:"/patient/doctors"
},
{
title:"Appointments",
desc:"Track bookings",
icon:<ClipboardList size={22}/>,
link:"/patient/appointments"
},
{
title:"Prescriptions",
desc:"Medical records",
icon:<FileText size={22}/>,
link:"/patient/prescriptions"
},
{
title:"Profile",
desc:"Manage account",
icon:<User size={22}/>,
link:"/patient/profile"
}
]

return(

<div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 md:p-8 space-y-6">

<div className="flex items-center justify-between bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
<div>
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Patient Dashboard</h1>
<p className="text-sm text-gray-500 mt-1">Appointments & health overview</p>
</div>

<motion.button
whileTap={{scale:.95}}
onClick={()=>router.push("/patient/doctors")}
className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium"
>
Book Now
<ArrowRight size={16}/>
</motion.button>
</div>

<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

{[
{label:"Appointments",value:stats.total},
{label:"Upcoming",value:stats.upcoming},
{label:"Prescriptions",value:stats.prescriptions}
].map((s,i)=>(

<motion.div
key={i}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{delay:i*.08}}
className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
>
<p className="text-xs text-gray-500">{s.label}</p>
<h2 className="text-3xl font-bold mt-2">{s.value}</h2>
</motion.div>

))}

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

{cards.map((card,i)=>(

<motion.div
key={i}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
transition={{delay:i*.1}}
whileHover={{y:-4}}
onClick={()=>router.push(card.link)}
className="group cursor-pointer bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition"
>

<div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
{card.icon}
</div>

<div className="flex items-center justify-between">
<div>
<h2 className="font-semibold">{card.title}</h2>
<p className="text-xs text-gray-500 mt-1">{card.desc}</p>
</div>

<ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition"/>
</div>

</motion.div>

))}

</div>

<div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">

<div className="flex items-center justify-between mb-5">
<h2 className="font-semibold text-base">Recent Activity</h2>
<p className="text-xs text-gray-400">{activity.length} Records</p>
</div>

{activity.length===0&&(
<div className="text-sm text-gray-500 py-10 text-center border border-dashed rounded-2xl">
No recent activity
</div>
)}

<div className="space-y-3">

{activity.map((a:any,i:number)=>(

<motion.div
key={i}
initial={{opacity:0}}
animate={{opacity:1}}
transition={{delay:i*.05}}
className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3"
>

<div>
<p className="text-sm font-medium">
{a.type==="appointment"
?`Appointment with Dr. ${a.doctor}`
:"Prescription added"}
</p>

<p className="text-xs text-gray-500 mt-1">
{new Date(a.date).toLocaleDateString()}
</p>
</div>

<div className="w-2 h-2 rounded-full bg-blue-600"/>

</motion.div>

))}

</div>

</div>

<motion.button
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
whileTap={{scale:.95}}
onClick={()=>router.push("/patient/doctors")}
className="sm:hidden fixed bottom-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-medium"
>
Book Appointment
</motion.button>

</div>

)
}