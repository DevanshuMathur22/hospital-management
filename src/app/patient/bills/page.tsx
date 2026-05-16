"use client"

import {useEffect,useState} from "react"
import {useRouter} from "next/navigation"
import {motion} from "framer-motion"
import {
Receipt,
Search,
CalendarDays,
ArrowRight,
Wallet,
CheckCircle2,
Clock3
} from "lucide-react"

export default function PatientBills(){

const router=useRouter()

const [bills,setBills]=useState<any[]>([])
const [search,setSearch]=useState("")
const [filter,setFilter]=useState("ALL")
const [loading,setLoading]=useState(true)

useEffect(()=>{

const fetchBills=async()=>{

try{

const res=await fetch("/api/patient/bills",{
credentials:"include"
})

const data=await res.json()

setBills(Array.isArray(data)?data:[])

}catch(err){

console.log("BILL FETCH ERROR:",err)

setBills([])

}finally{

setLoading(false)

}

}

fetchBills()

},[])

const filtered=bills.filter((b)=>{

const name=(b.title||"bill").toLowerCase()

const matchSearch=name.includes(search.toLowerCase())

const matchFilter=filter==="ALL"||b.type===filter

return matchSearch&&matchFilter

})

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-7xl mx-auto space-y-6">

<div className="bg-white rounded-[30px] h-28 animate-pulse border border-gray-100"/>

<div className="grid gap-4">

{[1,2,3].map(i=>(

<div
key={i}
className="bg-white rounded-[30px] h-32 animate-pulse border border-gray-100"
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
My Bills
</h1>

<p className="text-sm text-gray-500 mt-1">
Manage hospital invoices & payments
</p>
</div>

<div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-medium">
<Receipt size={17}/>
{filtered.length} Bills
</div>

</div>

<div className="flex flex-col lg:flex-row gap-4">

<div className="relative flex-1">

<Search
size={17}
className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
/>

<input
placeholder="Search bills..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500"
/>

</div>

<select
onChange={(e)=>setFilter(e.target.value)}
className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
>

<option value="ALL">All Bills</option>
<option value="DOCTOR">Doctor</option>
<option value="LAB">Lab</option>
<option value="PHARMACY">Pharmacy</option>
<option value="ADMISSION">Admission</option>

</select>

</div>

{filtered.length===0&&(

<div className="bg-white rounded-[30px] border border-dashed border-gray-300 p-14 text-center shadow-sm">

<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
<Receipt size={28}/>
</div>

<h2 className="font-semibold text-lg">
No Bills Found
</h2>

<p className="text-sm text-gray-500 mt-1">
Your invoices will appear here
</p>

</div>

)}

<div className="grid gap-5">

{filtered.map((bill:any)=>(

<motion.div
key={bill.id}
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
whileHover={{y:-3}}
className="bg-white border border-gray-100 rounded-[30px] p-5 shadow-sm hover:shadow-xl transition"
>

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

<div
onClick={()=>router.push(`/patient/invoice/${bill.id}`)}
className="flex items-start gap-4 cursor-pointer"
>

<div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
<Wallet size={24}/>
</div>

<div className="space-y-2">

<h2 className="font-semibold text-lg">
{bill.title||"Hospital Bill"}
</h2>

<div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">

<span className="bg-gray-100 px-3 py-1 rounded-full">
{bill.type}
</span>

<div className="flex items-center gap-1">
<CalendarDays size={14}/>
{new Date(bill.createdAt).toLocaleDateString()}
</div>

</div>

</div>

</div>

<div className="flex flex-col sm:flex-row sm:items-center gap-4">

<div className="sm:text-right">

<p className="text-2xl font-bold text-blue-600">
₹{bill.totalAmount}
</p>

<div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mt-2 ${
bill.status==="paid"
?"bg-green-100 text-green-700"
:bill.status==="partial"
?"bg-blue-100 text-blue-700"
:"bg-yellow-100 text-yellow-700"
}`}>

{bill.status==="paid"
?<CheckCircle2 size={13}/>
:<Clock3 size={13}/>
}

{bill.status}

</div>

</div>

{bill.status==="pending"&&(

<button
onClick={()=>router.push(`/patient/invoice/${bill.id}`)}
className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl text-sm font-medium"
>
Pay Now
<ArrowRight size={16}/>
</button>

)}

</div>

</div>

</motion.div>

))}

</div>

</div>

</div>

)
}