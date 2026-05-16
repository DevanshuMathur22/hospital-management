"use client"

import {useEffect,useState} from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {motion,AnimatePresence} from "framer-motion"
import {X,Stethoscope,CalendarDays,Clock3,ArrowRight} from "lucide-react"
import toast from "react-hot-toast"

export default function PatientDoctors(){

const [doctors,setDoctors]=useState<any[]>([])
const [groupedDoctors,setGroupedDoctors]=useState<any>({})
const [selectedDoctor,setSelectedDoctor]=useState<any>(null)

const [date,setDate]=useState<Date|null>(null)
const [time,setTime]=useState("")
const [appointments,setAppointments]=useState<any[]>([])
const [availability,setAvailability]=useState<any>(null)

const [filter,setFilter]=useState("all")

const [showPayment,setShowPayment]=useState(false)
const [paymentMode,setPaymentMode]=useState("UPI")

function generateSlots(start:string,end:string){

if(!start||!end)return[]

const slots=[]

let startMin=+start.split(":")[0]*60 + +start.split(":")[1]
let endMin=+end.split(":")[0]*60 + +end.split(":")[1]

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

useEffect(()=>{

fetch("/api/doctors")
.then(res=>res.json())
.then(data=>{

const docs=Array.isArray(data)?data:(data.data||[])

setDoctors(docs)

const grouped=docs.reduce((acc:any,doc:any)=>{

if(!acc[doc.specialization])acc[doc.specialization]=[]

acc[doc.specialization].push(doc)

return acc

},{})

setGroupedDoctors(grouped)

})

},[])

useEffect(()=>{

setAppointments([])
setTime("")
setDate(null)

},[selectedDoctor])

useEffect(()=>{

if(!selectedDoctor?.id)return

fetch(`/api/doctors/availability?doctorId=${selectedDoctor.id}`)
.then(res=>res.json())
.then(data=>setAvailability(data))

},[selectedDoctor])

useEffect(()=>{

if(!availability?.days)return

const today=new Date()

const dayName=today.toLocaleDateString("en-US",{weekday:"long"})

if(availability.days.includes(dayName))setDate(today)

},[availability])

useEffect(()=>{

if(!selectedDoctor?.id||!date)return

fetch(`/api/appointments/slots?doctorId=${selectedDoctor.id}&date=${date.toISOString()}`)
.then(res=>res.json())
.then(data=>setAppointments(Array.isArray(data)?data:[]))

},[selectedDoctor,date])

const timeSlots=availability?generateSlots(availability.start,availability.end):[]

const isSlotBooked=(slot:string)=>appointments.some((a:any)=>a.time===slot)

const handleConfirm=async()=>{

if(!time)return

const res=await fetch("/api/appointments/check",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
doctorId:selectedDoctor.id,
date:date?.toISOString()
})
})

let data:any={}

try{
data=await res.json()
}catch{
data={}
}

if(!res.ok){
toast.error(data.error||"Already booked")
return
}

setShowPayment(true)

}

const finalBooking=async()=>{

const res=await fetch("/api/appointments",{
credentials:"include",
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
doctorId:selectedDoctor.id,
date:date?.toISOString(),
time,
paymentMode,
amount:500
})
})

const data=await res.json()

if(!res.ok){
toast.error(data.error||"Booking failed")
return
}

if(paymentMode==="UPI"){

toast.loading("Processing Payment...")

await new Promise(res=>setTimeout(res,2000))

toast.dismiss()

toast.success("Payment Successful ✅")

}

if(paymentMode==="CASH")toast("Pay at hospital 💰")

window.location.href=`/patient/invoice/${data.billId}`

}

const specializations=["all",...Object.keys(groupedDoctors)]

return(

<div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 md:p-8 space-y-8">

<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-[28px] p-5 shadow-sm border border-gray-100">

<div>
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Find Doctors</h1>
<p className="text-sm text-gray-500 mt-1">Book appointments instantly</p>
</div>

<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
<Stethoscope size={18}/>
{doctors.length} Doctors
</div>

</div>

<div className="flex flex-wrap gap-2">

{specializations.map(sp=>(

<button
key={sp}
onClick={()=>setFilter(sp)}
className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
filter===sp
?"bg-blue-600 text-white shadow-lg"
:"bg-white border border-gray-200 hover:border-blue-400"
}`}
>
{sp}
</button>

))}

</div>

<div className="space-y-8">

{Object.entries(groupedDoctors)
.filter(([category])=>filter==="all"||filter===category)
.map(([category,docs]:any)=>(

<div key={category} className="space-y-4">

<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-blue-600"/>
<h2 className="font-semibold text-lg">{category}</h2>
</div>

<div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

{docs.map((doc:any)=>(

<motion.div
key={doc.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className="group bg-white rounded-[26px] p-5 border border-gray-100 shadow-sm hover:shadow-xl transition space-y-4"
>

<div className="flex items-start justify-between">

<div>
<h3 className="font-semibold text-base">{doc.name}</h3>
<p className="text-sm text-gray-500 mt-1">{doc.experience} yrs experience</p>
</div>

<div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
<Stethoscope size={20}/>
</div>

</div>

<div className="flex items-center justify-between text-sm">

<div className="flex items-center gap-1 text-gray-500">
<CalendarDays size={15}/>
Available
</div>

<p className="font-semibold text-blue-600">₹500</p>

</div>

<button
onClick={()=>setSelectedDoctor(doc)}
className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-medium"
>
Book Appointment
<ArrowRight size={16}/>
</button>

</motion.div>

))}

</div>

</div>

))}

</div>

<AnimatePresence>

{selectedDoctor&&(

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
className="w-full max-w-md bg-white rounded-[30px] p-6 space-y-5"
>

<div className="flex items-start justify-between">

<div>
<h2 className="font-bold text-xl">{selectedDoctor.name}</h2>
<p className="text-sm text-gray-500">{selectedDoctor.specialization}</p>
</div>

<button
onClick={()=>setSelectedDoctor(null)}
className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"
>
<X size={18}/>
</button>

</div>

<div className="space-y-2">

<p className="text-sm font-medium">Select Date</p>

<DatePicker
selected={date}
onChange={(d)=>setDate(d)}
minDate={new Date()}
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

const booked=isSlotBooked(slot.value)

return(

<button
key={slot.value}
disabled={booked}
onClick={()=>setTime(slot.value)}
className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
booked
?"bg-red-100 text-red-500 line-through"
:time===slot.value
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
onClick={handleConfirm}
disabled={!time}
className="w-full bg-blue-600 disabled:opacity-50 text-white py-3 rounded-2xl font-medium"
>
Confirm Appointment
</button>

</motion.div>

</motion.div>

)}

</AnimatePresence>

<AnimatePresence>

{showPayment&&(

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
className="w-full max-w-sm bg-white rounded-[30px] p-6 space-y-5"
>

<div>
<h2 className="font-bold text-xl">Payment</h2>
<p className="text-sm text-gray-500 mt-1">Complete booking payment</p>
</div>

<div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
<p className="text-sm text-gray-600">Consultation Fee</p>
<p className="font-bold text-lg">₹500</p>
</div>

<select
onChange={(e)=>setPaymentMode(e.target.value)}
className="w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none"
>
<option value="UPI">UPI Payment</option>
<option value="CASH">Cash Payment</option>
</select>

<button
onClick={finalBooking}
className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium"
>
Pay & Confirm
</button>

<button
onClick={()=>setShowPayment(false)}
className="w-full bg-gray-100 py-3 rounded-2xl font-medium"
>
Cancel
</button>

</motion.div>

</motion.div>

)}

</AnimatePresence>

</div>

)
}