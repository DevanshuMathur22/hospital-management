"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import { Search, Calendar, FileText, Clock, User } from "lucide-react"

export default function PatientPrescriptions() {

const [prescriptions, setPrescriptions] = useState<any[]>([])
const [filtered, setFiltered] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [selected, setSelected] = useState<any>(null)

const [search, setSearch] = useState("")

/* FETCH */
useEffect(() => {
fetch("/api/prescriptions",{ credentials: "include" })
.then(res => res.json())
.then(data => {
setPrescriptions(data || [])
setFiltered(data || [])
})
.catch(()=>{})
.finally(()=>setLoading(false))
},[])

/* 🔥 SMART SEARCH */
useEffect(()=>{

const s = search.toLowerCase()

const f = prescriptions.filter((p:any)=>{

const doctor = p.doctor?.name?.toLowerCase() || ""
const patient = p.patient?.name?.toLowerCase() || ""

const d = new Date(p.createdAt)

const date = d.toLocaleDateString().toLowerCase()
const time = d.toLocaleTimeString().toLowerCase()
const day = d.toLocaleDateString(undefined,{ weekday:"long" }).toLowerCase()

return (
  doctor.includes(s) ||
  patient.includes(s) ||
  date.includes(s) ||
  time.includes(s) ||
  day.includes(s)
)

})

setFiltered(f)

},[search,prescriptions])

/* FORMAT */
const formatDate = (d:string)=>{
const date = new Date(d)
return {
date: date.toLocaleDateString(),
time: date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }),
day: date.toLocaleDateString(undefined,{ weekday:"short" })
}
}

/* PDF */
const downloadPDF = (p:any)=>{
const doc = new jsPDF()

doc.setFontSize(18)
doc.text("Medical Prescription",105,20,{ align:"center" })

doc.setFontSize(11)

doc.text(`Doctor: Dr. ${p.doctor?.name}`,20,40)
doc.text(`Patient: ${p.patient?.name}`,20,48)
doc.text(`Date: ${new Date(p.createdAt).toLocaleString()}`,20,56)

let y = 70

p.medicine?.forEach((m:any,i:number)=>{
doc.text(`${i+1}. ${m.name} - ${m.dosage} (${m.timing || "-"})`,20,y)
y += 8
})

doc.save(`Prescription-${p.doctor?.name}.pdf`)
}

/* STATES */
if(loading) return <div className="p-6">Loading...</div>

return(

<div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

{/* HEADER */}
<h1 className="text-2xl font-bold flex items-center gap-2">
<FileText size={22}/> My Prescriptions
</h1>

{/* SEARCH */}
<div className="relative w-full sm:w-96">

<Search className="absolute left-3 top-3 text-gray-400" size={16}/>

<input
placeholder="Search doctor, date, time..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-9 pr-3 py-2 border rounded-lg w-full"
/>

</div>

{/* EMPTY */}
{filtered.length === 0 && (
<p className="text-gray-500">No prescriptions found</p>
)}

{/* GRID */}
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

{filtered.map((p:any)=>{

const { date, time, day } = formatDate(p.createdAt)

return(

<div
key={p.id}
className="bg-white rounded-2xl shadow p-5 space-y-3 hover:shadow-md"
>

{/* TOP */}
<div className="flex items-center gap-3">

<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
<User size={16}/>
</div>

<div>
<p className="font-semibold">Dr. {p.doctor?.name}</p>
<p className="text-xs text-gray-500">Doctor</p>
</div>

</div>

{/* DATE */}
<div className="flex justify-between text-xs text-gray-500">

<div className="flex items-center gap-1">
<Calendar size={14}/> {date} ({day})
</div>

<div className="flex items-center gap-1">
<Clock size={14}/> {time}
</div>

</div>

{/* MEDS */}
<div className="text-sm space-y-1">

{p.medicine?.slice(0,2).map((m:any,i:number)=>(
<div key={i}>
{m.name} - {m.dosage}
</div>
))}

{p.medicine?.length > 2 && (
<div className="text-gray-500 text-xs">
+{p.medicine.length - 2} more
</div>
)}

</div>

{/* ACTION */}
<div className="flex gap-2 pt-2">

<button
onClick={()=>setSelected(p)}
className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
>
View
</button>

<button
onClick={()=>downloadPDF(p)}
className="bg-green-600 text-white px-3 py-1 rounded text-sm"
>
PDF
</button>

</div>

</div>

)

})}

</div>

{/* MODAL */}
{selected && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

<div className="bg-white w-full max-w-2xl p-6 rounded-2xl space-y-6 shadow-lg">

  {/* HEADER */}
  <div className="text-center border-b pb-4">
    <h1 className="text-xl font-bold">City Care Hospital</h1>
    <p className="text-sm text-gray-500">Medical Prescription</p>
  </div>

  {/* INFO */}
  <div className="grid grid-cols-2 gap-4 text-sm">

    <div>
      <p><b>Patient:</b> {selected.patient?.name || "-"}</p>
      <p><b>Phone:</b> {selected.patient?.phone || "-"}</p>
      <p><b>Gender:</b> {selected.patient?.gender || "-"}</p>
    </div>

    <div className="text-right">
      <p><b>Doctor:</b> Dr. {selected.doctor?.name || "-"}</p>
      <p><b>Date:</b> {new Date(selected.createdAt).toLocaleDateString()}</p>
      <p><b>Time:</b> {new Date(selected.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p>
      <p><b>Day:</b> {new Date(selected.createdAt).toLocaleDateString(undefined,{weekday:"long"})}</p>
    </div>

  </div>

  {/* MEDICINES TABLE */}
  <div>

    <h2 className="font-semibold mb-3">Medicines</h2>

    <table className="w-full text-sm border rounded overflow-hidden">

      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">#</th>
          <th className="p-2 text-left">Medicine</th>
          <th className="p-2 text-center">Dosage</th>
          <th className="p-2 text-center">Days</th>
          <th className="p-2 text-left">Note</th>
        </tr>
      </thead>

      <tbody>
        {selected.medicine?.map((m:any,i:number)=>(
          <tr key={i} className="border-t">

            <td className="p-2">{i+1}</td>

            <td className="p-2">{m.name}</td>

            <td className="text-center">
              {m.morning && "M "}
              {m.afternoon && "A "}
              {m.night && "N"}
            </td>

            <td className="text-center">
              {m.days || "-"}
            </td>

            <td className="p-2">
              {m.note || "-"}
            </td>

          </tr>
        ))}
      </tbody>

    </table>

  </div>

  {/* NOTES */}
  <div>
    <h2 className="font-semibold mb-1">Notes</h2>
    <p className="text-sm text-gray-600">
      {selected.notes || "-"}
    </p>
  </div>

  {/* FOOTER */}
  <div className="flex justify-between items-end pt-6 text-sm">

    <p>Helpline: +91 XXXXXXXX</p>

    <div className="text-right">
      <div className="border-t w-40 mb-1"></div>
      <p>Doctor Signature</p>
    </div>

  </div>

  {/* ACTIONS */}
  <div className="flex gap-3 pt-4">

    <button
      onClick={()=>downloadPDF(selected)}
      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
    >
      Download PDF
    </button>

    <button
      onClick={()=>setSelected(null)}
      className="flex-1 bg-gray-600 text-white py-2 rounded-lg"
    >
      Close
    </button>

  </div>

</div>

</div>

)}
</div>

)
}