"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Stethoscope, Trash2, Edit, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDoctors() {

const [doctors,setDoctors] = useState<any[]>([])
const [search,setSearch] = useState("")
const [loading,setLoading] = useState(true)
const [page,setPage] = useState(1)
const [totalPages,setTotalPages] = useState(1)

/* FETCH */
useEffect(()=>{

fetch(`/api/doctors?page=${page}&search=${search}`,{ credentials:"include" })
.then(res=>res.json())
.then(data=>{
  setDoctors(Array.isArray(data) ? data : (data.data || []))
  setTotalPages(Array.isArray(data) ? 1 : (data.totalPages || 1))
})
.catch(()=>setDoctors([]))
.finally(()=>setLoading(false))

},[page,search])

/* DELETE */
const deleteDoctor = async(id:string)=>{

const confirmDelete = confirm("Delete this doctor?")
if(!confirmDelete) return

try{

const res = await fetch(`/api/doctors/${id}`,{
method:"DELETE",credentials:"include"
})

if(!res.ok) throw new Error("Delete failed")

setDoctors(prev=>prev.filter(doc=>doc.id !== id))

}catch(err){
console.log("DELETE ERROR",err)
}

}

/* FILTER */
const filteredDoctors = doctors.filter((d:any)=>
d.name?.toLowerCase().includes(search.toLowerCase())
)

/* GROUP */
const grouped = filteredDoctors.reduce((acc:any,doc:any)=>{
if(!acc[doc.specialization]){
acc[doc.specialization] = []
}
acc[doc.specialization].push(doc)
return acc
},{})

/* LOADING */
if(loading){
return(
<div className="flex items-center justify-center min-h-screen text-sm">
Loading doctors...
</div>
)
}

return(

<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

{/* HEADER */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

<h1 className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold">
<Stethoscope size={22}/>
Doctors
</h1>

<div className="flex flex-col sm:flex-row gap-3">

{/* SEARCH */}
<div className="relative w-full sm:w-64">

<Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>

<input
placeholder="Search doctor..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="pl-9 pr-3 py-2 text-sm border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

</div>

{/* ADD */}
<Link
href="/admin/add-doctor"
className="flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
>
<Plus size={14}/>
Add Doctor
</Link>

</div>

</div>

{/* EMPTY */}
{filteredDoctors.length === 0 && (
<p className="text-sm text-gray-500">
No doctors found
</p>
)}

{/* SECTIONS */}
{Object.entries(grouped).map(([specialization,docs]:any)=>(

<div key={specialization} className="space-y-4">

<h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
<Stethoscope size={16}/>
{specialization}
</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">

{docs.map((doctor:any)=>

<motion.div
key={doctor.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-4}}
className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition space-y-3"
>

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
<User size={16}/>
</div>

<div>
<p className="font-semibold text-sm truncate">
{doctor.name}
</p>
<p className="text-xs text-gray-500">
Doctor
</p>
</div>

</div>

<span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
{doctor.specialization}
</span>

<p className="text-xs sm:text-sm text-gray-600">
{doctor.experience} years experience
</p>

<div className="flex gap-3 pt-1">

<Link
href={`/admin/edit-doctor/${doctor.id}`}
className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
>
<Edit size={13}/>
Edit
</Link>

<button
onClick={()=>deleteDoctor(doctor.id)}
className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs sm:text-sm"
>
<Trash2 size={13}/>
Delete
</button>

</div>

</motion.div>

)}

</div>

</div>

))}

{/* PAGINATION */}
<div className="flex justify-center gap-2 mt-6">

  <button
    disabled={page===1}
    onClick={()=>setPage(p=>p-1)}
    className="px-3 py-1 border rounded disabled:opacity-40"
  >
    Prev
  </button>

  <span className="text-sm px-2">
    {page} / {totalPages}
  </span>

  <button
    disabled={page===totalPages}
    onClick={()=>setPage(p=>p+1)}
    className="px-3 py-1 border rounded disabled:opacity-40"
  >
    Next
  </button>

</div>

</div>

)

}