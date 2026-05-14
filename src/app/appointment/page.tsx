"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter } from "next/navigation"

export default function Appointment(){

const router = useRouter()

const [isLogged,setIsLogged] = useState(false)

const [department,setDepartment] = useState("")
const [doctor,setDoctor] = useState("")
const [date,setDate] = useState<Date | null>(null)
const [time,setTime] = useState("")

const [doctors,setDoctors] = useState<any[]>([])
const [filteredDoctors,setFilteredDoctors] = useState<any[]>([])
const [appointments,setAppointments] = useState<any[]>([])

const timeSlots = [
"09:00 AM","10:00 AM","11:00 AM","12:00 PM",
"02:00 PM","03:00 PM","04:00 PM"
]

// LOGIN CHECK
useEffect(()=>{
const patient = localStorage.getItem("patient")
if(patient) setIsLogged(true)
},[])

// FETCH DATA
useEffect(()=>{
if(!isLogged) return

fetch("/api/doctors")
.then(res=>res.json())
.then(data=>{
  const docs = Array.isArray(data) ? data : (data.data || [])
  setDoctors(docs)
})

fetch("/api/appointments",{ credentials:"include" })
.then(res=>res.json())
.then(data=>{
if(Array.isArray(data)) setAppointments(data)
})

},[isLogged])

// FILTER DOCTORS
useEffect(()=>{
const filtered = department === ""
? []
: doctors.filter((d:any)=> d.specialization === department)

setFilteredDoctors(filtered)
},[department,doctors])

// BOOK
const handleSubmit = async(e:any)=>{
e.preventDefault()

if(!doctor || !date || !time){
Swal.fire({ icon:"warning", title:"Select all fields" })
return
}

await fetch("/api/appointments",{
method:"POST",
credentials:"include",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
doctorId:doctor,
date,
time
})
})

Swal.fire({ icon:"success", title:"Appointment Booked" })

window.location.reload()
}

// DELETE
const deleteAppointment = async(id:string)=>{
await fetch("/api/appointments",{
method:"DELETE",
credentials:"include",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({ id })
})

setAppointments(appointments.filter(a=>a.id !== id))
}

// REMINDER
function sendReminder(a:any){
if(Notification.permission === "granted"){
new Notification("Reminder",{
body:`Dr. ${a.doctor?.name} at ${a.time}`
})
}else{
Notification.requestPermission()
}
}

// WHATSAPP
function sendWhatsapp(a:any){
const message = encodeURIComponent(
`Appointment

Doctor: ${a.doctor?.name}
Date: ${new Date(a.date).toDateString()}
Time: ${a.time}`
)

window.open(`https://wa.me/?text=${message}`)
}

return(

<div className="py-20 bg-blue-50 min-h-screen flex flex-col items-center px-6 space-y-10">

{/* LOGIN */}
{!isLogged && (
<div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
<h1 className="text-3xl font-bold mb-4">Login Required</h1>
<button
onClick={()=>router.push("/login")}
className="bg-blue-600 text-white px-6 py-3 rounded-lg"
>
Login Now
</button>
</div>
)}

{/* FORM */}
{isLogged && (

<motion.form
onSubmit={handleSubmit}
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg space-y-6"
>

<h1 className="text-3xl font-bold text-center">
Book Appointment
</h1>

<select
value={department}
onChange={(e)=>setDepartment(e.target.value)}
className="w-full p-3 border rounded-lg"
>
<option>Select Department</option>
{[...new Set(doctors.map((doc:any)=>doc.specialization))].map((dep:any)=>(
<option key={dep} value={dep}>🏥 {dep}</option>
))}
</select>

<select
value={doctor}
onChange={(e)=>setDoctor(e.target.value)}
className="w-full p-3 border rounded-lg"
>
<option>Select Doctor</option>
{filteredDoctors.map((doc:any)=>(
<option key={doc.id} value={doc.id}>
👨‍⚕️ {doc.name}
</option>
))}
</select>

<DatePicker
selected={date}
onChange={(d)=>setDate(d)}
placeholderText="Select Date"
className="w-full p-3 border rounded-lg"
/>

<select
value={time}
onChange={(e)=>setTime(e.target.value)}
className="w-full p-3 border rounded-lg"
>
<option>Select Time</option>
{timeSlots.map((slot)=>(
<option key={slot}>{slot}</option>
))}
</select>

<button
type="submit"
className="w-full bg-blue-600 text-white py-3 rounded-xl"
>
Book Now
</button>

</motion.form>
)}

{/* APPOINTMENTS GRID */}

<div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

{appointments.map((a:any)=>(

<div
key={a.id}
className="relative bg-white p-5 rounded-2xl shadow hover:shadow-xl transition"
>

{/* DELETE TOP RIGHT */}
<button
onClick={()=>deleteAppointment(a.id)}
className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-7 h-7 flex items-center justify-center rounded-full shadow-md z-10"
>
✕
</button>
<h2 className="font-bold text-lg">
👨‍⚕️ Dr. {a.doctor?.name}
</h2>

<p className="text-gray-600 text-sm mt-1">
📅 {new Date(a.date).toDateString()}
</p>

<p className="text-gray-600 text-sm">
⏰ {a.time}
</p>

<div className="flex gap-3 mt-4">

<button
onClick={()=>sendReminder(a)}
className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
>
Reminder
</button>

<button
onClick={()=>sendWhatsapp(a)}
className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm"
>
WhatsApp
</button>

</div>

</div>

))}

</div>

</div>

)
}