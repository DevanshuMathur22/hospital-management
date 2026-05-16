"use client"

import {useEffect,useState} from "react"
import jsPDF from "jspdf"
import {motion,AnimatePresence} from "framer-motion"
import {
Search,
CalendarDays,
FileText,
Clock3,
User,
Download,
Pill,
Stethoscope,
X
} from "lucide-react"

export default function PatientPrescriptions(){

const [prescriptions,setPrescriptions]=useState<any[]>([])
const [filtered,setFiltered]=useState<any[]>([])
const [loading,setLoading]=useState(true)
const [selected,setSelected]=useState<any>(null)

const [search,setSearch]=useState("")

useEffect(()=>{

fetch("/api/prescriptions",{credentials:"include"})
.then(res=>res.json())
.then(data=>{

setPrescriptions(data||[])
setFiltered(data||[])

})
.catch(()=>{})
.finally(()=>setLoading(false))

},[])

useEffect(()=>{

const s=search.toLowerCase()

const f=prescriptions.filter((p:any)=>{

const doctor=p.doctor?.name?.toLowerCase()||""
const patient=p.patient?.name?.toLowerCase()||""

const d=new Date(p.createdAt)

const date=d.toLocaleDateString().toLowerCase()
const time=d.toLocaleTimeString().toLowerCase()
const day=d.toLocaleDateString(undefined,{weekday:"long"}).toLowerCase()

return(
doctor.includes(s)||
patient.includes(s)||
date.includes(s)||
time.includes(s)||
day.includes(s)
)

})

setFiltered(f)

},[search,prescriptions])

const formatDate=(d:string)=>{

const date=new Date(d)

return{
date:date.toLocaleDateString(),
time:date.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
}),
day:date.toLocaleDateString(undefined,{
weekday:"short"
})
}

}

const downloadPDF=(p:any)=>{

const doc=new jsPDF()

doc.setFontSize(20)

doc.text("Medical Prescription",105,20,{align:"center"})

doc.setFontSize(11)

doc.text(`Doctor: Dr. ${p.doctor?.name}`,20,40)
doc.text(`Patient: ${p.patient?.name}`,20,48)
doc.text(`Date: ${new Date(p.createdAt).toLocaleString()}`,20,56)

let y=72

p.medicine?.forEach((m:any,i:number)=>{

doc.text(
`${i+1}. ${m.name} - ${m.dosage} (${m.timing||"-"})`,
20,
y
)

y+=8

})

doc.save(`Prescription-${p.doctor?.name}.pdf`)

}

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-7xl mx-auto space-y-6">

<div className="bg-white rounded-[30px] h-28 animate-pulse border border-gray-100"/>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

{[1,2,3].map(i=>(

<div
key={i}
className="bg-white rounded-[30px] h-64 animate-pulse border border-gray-100"
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
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
<FileText size={28}/>
My Prescriptions
</h1>

<p className="text-sm text-gray-500 mt-1">
View & download medical prescriptions
</p>
</div>

<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
<Pill size={17}/>
{filtered.length} Records
</div>

</div>

<div className="relative max-w-md">

<Search
size={17}
className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
/>

<input
placeholder="Search doctor, patient, date..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500"
/>

</div>

{filtered.length===0&&(

<div className="bg-white rounded-[30px] border border-dashed border-gray-300 p-14 text-center shadow-sm">

<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
<FileText size={28}/>
</div>

<h2 className="font-semibold text-lg">
No Prescriptions Found
</h2>

<p className="text-sm text-gray-500 mt-1">
Your prescriptions will appear here
</p>

</div>

)}

<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

{filtered.map((p:any)=>{

const {date,time,day}=formatDate(p.createdAt)

return(

<motion.div
key={p.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className="bg-white rounded-[30px] border border-gray-100 p-5 shadow-sm hover:shadow-xl transition space-y-5"
>

<div className="flex items-start justify-between">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
<Stethoscope size={20}/>
</div>

<div>
<p className="font-semibold">
Dr. {p.doctor?.name}
</p>

<p className="text-xs text-gray-500 mt-1">
Prescription Record
</p>
</div>

</div>

<div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
Active
</div>

</div>

<div className="space-y-3 text-sm">

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">

<div className="flex items-center gap-2 text-gray-500">
<CalendarDays size={15}/>
Date
</div>

<span className="font-medium">
{date} ({day})
</span>

</div>

<div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">

<div className="flex items-center gap-2 text-gray-500">
<Clock3 size={15}/>
Time
</div>

<span className="font-medium">
{time}
</span>

</div>

</div>

<div className="space-y-2">

{p.medicine?.slice(0,2).map((m:any,i:number)=>(

<div
key={i}
className="bg-blue-50 text-blue-700 rounded-2xl px-3 py-2 text-sm"
>
{m.name} • {m.dosage}
</div>

))}

{p.medicine?.length>2&&(

<div className="text-xs text-gray-500">
+{p.medicine.length-2} more medicines
</div>

)}

</div>

<div className="flex gap-3 pt-2">

<button
onClick={()=>setSelected(p)}
className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-medium"
>
View
</button>

<button
onClick={()=>downloadPDF(p)}
className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 rounded-2xl text-sm font-medium"
>
<Download size={16}/>
PDF
</button>

</div>

</motion.div>

)

})}

</div>

<AnimatePresence>

{selected&&(

<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
exit={{opacity:0}}
className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
>

<motion.div
initial={{scale:.9,opacity:0}}
animate={{scale:1,opacity:1}}
exit={{scale:.9,opacity:0}}
className="bg-white w-full max-w-4xl rounded-[36px] shadow-2xl overflow-hidden"
>

<div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white flex items-start justify-between">

<div>
<h1 className="text-2xl font-bold">
City Care Hospital
</h1>

<p className="text-blue-100 text-sm mt-1">
Medical Prescription
</p>
</div>

<button
onClick={()=>setSelected(null)}
className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"
>
<X size={18}/>
</button>

</div>

<div className="p-6 sm:p-7 space-y-7">

<div className="grid sm:grid-cols-2 gap-5 text-sm">

<div className="bg-gray-50 rounded-[28px] p-5 border border-gray-100 space-y-2">

<div className="flex items-center gap-2 font-semibold text-blue-700">
<User size={17}/>
Patient Details
</div>

<p>
<span className="text-gray-500">Name:</span>{" "}
<span className="font-medium">
{selected.patient?.name||"-"}
</span>
</p>

<p className="text-gray-600">
📞 {selected.patient?.phone||"-"}
</p>

<p className="text-gray-600">
Gender: {selected.patient?.gender||"-"}
</p>

</div>

<div className="bg-gray-50 rounded-[28px] p-5 border border-gray-100 space-y-2 sm:text-right">

<div className="flex sm:justify-end items-center gap-2 font-semibold text-blue-700">
<Stethoscope size={17}/>
Doctor Details
</div>

<p>
<span className="text-gray-500">Doctor:</span>{" "}
<span className="font-medium">
Dr. {selected.doctor?.name||"-"}
</span>
</p>

<p className="text-gray-600">
{new Date(selected.createdAt).toLocaleDateString()}
</p>

<p className="text-gray-600">
{new Date(selected.createdAt).toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})}
</p>

</div>

</div>

<div className="border border-gray-100 rounded-[30px] overflow-hidden">

<div className="bg-gray-50 px-5 py-4 grid grid-cols-5 text-sm font-semibold text-gray-600">

<p>#</p>
<p>Medicine</p>
<p className="text-center">Dosage</p>
<p className="text-center">Days</p>
<p>Notes</p>

</div>

<div className="divide-y">

{selected.medicine?.map((m:any,i:number)=>(

<div
key={i}
className="grid grid-cols-5 px-5 py-4 text-sm items-center"
>

<p>{i+1}</p>

<p className="font-medium">
{m.name}
</p>

<p className="text-center">
{m.morning&&"M "}
{m.afternoon&&"A "}
{m.night&&"N"}
</p>

<p className="text-center">
{m.days||"-"}
</p>

<p className="text-gray-500">
{m.note||"-"}
</p>

</div>

))}

</div>

</div>

<div className="bg-blue-50 border border-blue-100 rounded-[28px] p-5">

<h2 className="font-semibold mb-2">
Doctor Notes
</h2>

<p className="text-sm text-gray-600">
{selected.notes||"No notes added"}
</p>

</div>

<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 pt-2 text-sm">

<p className="text-gray-500">
Helpline: +91 XXXXXXXX
</p>

<div className="text-right">

<div className="border-t w-40 mb-2 ml-auto"/>

<p className="text-gray-500">
Doctor Signature
</p>

</div>

</div>

<div className="flex gap-3 pt-2">

<button
onClick={()=>downloadPDF(selected)}
className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium"
>
<Download size={17}/>
Download PDF
</button>

<button
onClick={()=>setSelected(null)}
className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-2xl font-medium"
>
Close
</button>

</div>

</div>

</motion.div>

</motion.div>

)}

</AnimatePresence>

</div>

</div>

)
}