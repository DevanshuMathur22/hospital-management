"use client"

import {useEffect,useState} from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {motion,AnimatePresence} from "framer-motion"
import {CalendarDays,Clock3,CheckCircle2,XCircle,RotateCw,X} from "lucide-react"
import toast from "react-hot-toast"

export default function PatientAdvancedAppointments(){

const [appointments,setAppointments]=useState<any[]>([])
const [selected,setSelected]=useState<any>(null)
const [newDate,setNewDate]=useState<Date|null>(null)
const [newTime,setNewTime]=useState("")
const [availability,setAvailability]=useState<any>(null)
const [loading,setLoading]=useState(true)

function generateTimeSlots(start:string,end:string){

if(!start||!end)return[]

const slots:any[]=[]

const [sh,sm]=start.split(":").map(Number)
const [eh,em]=end.split(":").map(Number)

let startMin=sh*60+sm
let endMin=eh*60+em

for(let i=startMin;i<endMin;i+=15){

const h=Math.floor(i/60)
const m=i%60

const value=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`

const label=new Date(`1970-01-01T${value}`).toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})

slots.push({value,label})

}

return slots

}

const loadData=async()=>{

setLoading(true)

try{

const res=await fetch("/api/appointments",{credentials:"include"})
const data=await res.json()

setAppointments(Array.isArray(data)?data:[])

}catch(err){

console.log(err)
setAppointments([])

}

setLoading(false)

}

useEffect(()=>{
loadData()
},[])

const openReschedule=async(a:any)=>{

const doctorId=a.doctor?.id||a.doctorId

if(!doctorId){
toast.error("Doctor not found")
return
}

setSelected(a)
setNewDate(new Date(a.date))
setNewTime(a.time)

try{

const res=await fetch(
`/api/doctors/availability?doctorId=${doctorId}`,
{
credentials:"include"
}
)

const data=await res.json()

if(!res.ok){
toast.error(data.error||"Availability failed")
return
}

setAvailability(data||{})

}catch(err){

console.log(err)

toast.error("Something went wrong")

}

}

const timeSlots=availability
?generateTimeSlots(availability.start,availability.end)
:[]

const isSlotBooked=(date:Date,time:string)=>{

return appointments.some((a)=>
new Date(a.date).toDateString()===date.toDateString() &&
a.time===time &&
a.id!==selected?.id
)

}

const isDoctorAvailable=(date:Date)=>{

if(!availability?.days)return true

const day=date.toLocaleDateString("en-US",{weekday:"long"})

return availability.days.includes(day)

}

const saveReschedule=async()=>{

if(!selected||!newDate||!newTime){
toast.error("Select date & time")
return
}

const res=await fetch(`/api/appointments/${selected.id}`,{
method:"PUT",
credentials:"include",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
date:newDate,
time:newTime
})
})

if(res.ok){

toast.success("Rescheduled ✅")

setSelected(null)

await loadData()

}else{

const err=await res.json()

toast.error(err.error||"Failed")

}

}

const cancelAppointment=async(id:string)=>{

await fetch(`/api/appointments/${id}`,{
method:"DELETE",
credentials:"include"
})

toast.success("Cancelled ❌")

await loadData()

}

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-7xl mx-auto space-y-6">

<div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 animate-pulse h-28"/>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

{[1,2,3].map(i=>(

<div
key={i}
className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 animate-pulse h-52"
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
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Appointments</h1>
<p className="text-sm text-gray-500 mt-1">Manage upcoming consultations</p>
</div>

<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
<CalendarDays size={17}/>
{appointments.length} Appointments
</div>

</div>

{appointments.length===0&&(

<div className="bg-white rounded-[30px] border border-dashed border-gray-300 p-14 text-center shadow-sm">

<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
<CalendarDays size={28}/>
</div>

<h2 className="font-semibold text-lg">No Appointments</h2>
<p className="text-sm text-gray-500 mt-1">Your bookings will appear here</p>

</div>

)}

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

{appointments.map((a:any)=>(

<motion.div
key={a.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className={`rounded-[30px] p-5 shadow-sm border space-y-5 ${
a.status==="cancelled"
?"bg-red-50 border-red-200"
:"bg-white border-gray-100"
}`}
>

<div className="flex items-start justify-between">

<div>
<h2 className="font-semibold text-lg">
Dr. {a.doctor?.name||"-"}
</h2>

<p className="text-sm text-gray-500 mt-1">
Patient: {a.patient?.name||"-"}
</p>
</div>

<div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
a.status==="cancelled"
?"bg-red-100 text-red-500"
:a.status==="completed"
?"bg-green-100 text-green-600"
:"bg-yellow-100 text-yellow-600"
}`}>

{a.status==="cancelled"
?<XCircle size={20}/>
:a.status==="completed"
?<CheckCircle2 size={20}/>
:<Clock3 size={20}/>
}

</div>

</div>

<div className="space-y-2 text-sm">

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
<span className="text-gray-500">Date</span>
<span className="font-medium">
{new Date(a.date).toDateString()}
</span>
</div>

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
<span className="text-gray-500">Time</span>
<span className="font-medium">{a.time}</span>
</div>

</div>

<div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
a.status==="cancelled"
?"bg-red-100 text-red-600"
:a.status==="completed"
?"bg-green-100 text-green-600"
:"bg-yellow-100 text-yellow-700"
}`}>

{a.status==="cancelled"
?"Cancelled"
:a.status==="completed"
?"Completed"
:"Pending"}

</div>

{a.status==="pending"&&(

<div className="flex gap-3">

<button
onClick={()=>openReschedule(a)}
className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-medium"
>
<RotateCw size={16}/>
Reschedule
</button>

<button
onClick={()=>cancelAppointment(a.id)}
className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl text-sm font-medium"
>
Cancel
</button>

</div>

)}

</motion.div>

))}

</div>

<AnimatePresence>

{selected&&(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
>

<motion.div
initial={{scale:.9,opacity:0}}
animate={{scale:1,opacity:1}}
exit={{scale:.9,opacity:0}}
className="w-full max-w-md bg-white rounded-[32px] p-6 space-y-5"
>

<div className="flex items-start justify-between">

<div>
<h2 className="text-xl font-bold">Reschedule</h2>
<p className="text-sm text-gray-500 mt-1">
Choose new slot
</p>
</div>

<button
onClick={()=>setSelected(null)}
className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center"
>
<X size={18}/>
</button>

</div>

<div className="space-y-2">

<p className="text-sm font-medium">Select Date</p>

<DatePicker
selected={newDate}
onChange={(d)=>setNewDate(d)}
filterDate={(d)=>isDoctorAvailable(d)}
className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none"
/>

</div>

<div className="space-y-3">

<div className="flex items-center gap-2">
<Clock3 size={16}/>
<p className="text-sm font-medium">Available Slots</p>
</div>

<div className="flex flex-wrap gap-2 max-h-52 overflow-auto pr-1">

{timeSlots.map((slot:any)=>{

const booked=newDate
?isSlotBooked(newDate,slot.value)
:false

return(

<button
key={slot.value}
disabled={booked}
onClick={()=>setNewTime(slot.value)}
className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
booked
?"bg-red-100 text-red-500 line-through"
:newTime===slot.value
?"bg-blue-600 text-white"
:"bg-gray-100 hover:bg-gray-200"
}`}
>
{booked?"Full":slot.label}
</button>

)

})}

</div>

</div>

<button
onClick={saveReschedule}
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium"
>
Save Changes
</button>

<button
onClick={()=>setSelected(null)}
className="w-full bg-gray-100 py-3 rounded-2xl font-medium"
>
Close
</button>

</motion.div>

</motion.div>

)}

</AnimatePresence>

</div>

</div>

)
}