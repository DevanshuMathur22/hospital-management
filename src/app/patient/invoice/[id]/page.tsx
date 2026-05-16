"use client"

import {useParams} from "next/navigation"
import {
Printer,
Download,
Receipt,
Wallet,
CheckCircle2,
CreditCard,
CalendarDays,
User,
Stethoscope
} from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {useEffect,useRef,useState} from "react"
import {motion} from "framer-motion"
import toast from "react-hot-toast"

export default function InvoicePage(){

const params=useParams()
const id=params?.id as string

const invoiceRef=useRef<HTMLDivElement>(null)

const [invoice,setInvoice]=useState<any>(null)
const [loading,setLoading]=useState(true)
const [payAmount,setPayAmount]=useState(0)
const [paymentMode,setPaymentMode]=useState("UPI")

useEffect(()=>{

const fetchBill=async()=>{

try{

const res=await fetch(`/api/bills/${id}`)
const data=await res.json()

setInvoice(data)

const remaining=
Number(data?.totalAmount||0)-
Number(data?.paidAmount||0)

setPayAmount(remaining)

}catch(err){

console.log("FETCH ERROR:",err)

}finally{

setLoading(false)

}

}

if(id)fetchBill()

},[id])

const handleDownload=async()=>{

if(!invoiceRef.current)return

const canvas=await html2canvas(invoiceRef.current,{
backgroundColor:"#ffffff",
scale:2
})

const imgData=canvas.toDataURL("image/png")

const pdf=new jsPDF("p","mm","a4")

pdf.addImage(imgData,"PNG",0,0,210,0)

pdf.save(`invoice-${id}.pdf`)

}

const handlePayment=async()=>{

const res=await fetch("/api/bills/pay",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
billId:id,
amount:payAmount,
paymentMode
})
})

const data=await res.json()

if(!res.ok){
toast.error(data.error||"Payment failed")
return
}

toast.success("Payment Successful ✅")

setInvoice(data.bill)

setTimeout(()=>{
handleDownload()
},500)

}

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-3xl mx-auto bg-white rounded-[32px] h-[700px] animate-pulse border border-gray-100"/>

</div>

)

}

if(!invoice){

return(

<div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6">

<div className="bg-white rounded-[32px] p-14 text-center border border-dashed border-gray-300 shadow-sm">

<div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
<Receipt size={28}/>
</div>

<h2 className="font-semibold text-lg">
Invoice not found
</h2>

<p className="text-sm text-gray-500 mt-1">
Unable to load invoice details
</p>

</div>

</div>

)

}

const total=Number(invoice?.totalAmount||0)
const paid=Number(invoice?.paidAmount||0)
const remaining=total-paid

return(

<div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 md:p-8">

<div className="max-w-3xl mx-auto">

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
ref={invoiceRef}
className="bg-white rounded-[36px] shadow-xl border border-gray-100 overflow-hidden"
>

<div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 text-white">

<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

<div>
<h1 className="text-3xl font-bold tracking-tight">
Medicare Hospital
</h1>

<p className="text-blue-100 text-sm mt-1">
Jaipur, Rajasthan
</p>
</div>

<div className="sm:text-right">

<p className="text-xs text-blue-100">
Invoice ID
</p>

<p className="font-semibold break-all">
#{invoice.id||"N/A"}
</p>

</div>

</div>

</div>

<div className="p-5 sm:p-7 space-y-7">

<div className="grid sm:grid-cols-2 gap-4">

<div className="bg-gray-50 rounded-[28px] p-5 border border-gray-100 space-y-3">

<div className="flex items-center gap-2 text-blue-700 font-semibold">
<User size={18}/>
Patient Details
</div>

<div className="space-y-2 text-sm">

<p>
<span className="text-gray-500">Name:</span>{" "}
<span className="font-medium">
{invoice?.patient?.name||"N/A"}
</span>
</p>

<p className="text-gray-600">
📞 {invoice?.patient?.phone||"N/A"}
</p>

<p className="text-gray-600">
MRN: {invoice?.patient?.mrn||"N/A"}
</p>

<p className="text-gray-600">
Age: {invoice?.patient?.age||"N/A"}
</p>

<p className="text-gray-600">
Gender: {invoice?.patient?.gender||"N/A"}
</p>

</div>

</div>

<div className="bg-gray-50 rounded-[28px] p-5 border border-gray-100 space-y-3">

<div className="flex items-center gap-2 text-blue-700 font-semibold">
<Stethoscope size={18}/>
Doctor Details
</div>

<div className="space-y-2 text-sm">

<p>
<span className="text-gray-500">Name:</span>{" "}
<span className="font-medium">
{invoice?.doctor?.name||"N/A"}
</span>
</p>

<p className="text-gray-600">
{invoice?.doctor?.specialization||"N/A"}
</p>

</div>

</div>

</div>

<div className="flex items-center gap-2 text-sm text-gray-500">

<CalendarDays size={16}/>

{invoice?.createdAt
?new Date(invoice.createdAt).toLocaleDateString()
:"N/A"}

</div>

<div className="border border-gray-100 rounded-[28px] overflow-hidden">

<div className="bg-gray-50 px-5 py-4 flex items-center justify-between text-sm font-medium text-gray-500">
<span>Description</span>
<span>Amount</span>
</div>

<div className="px-5 py-5 flex items-center justify-between">

<div className="flex items-center gap-3">

<div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
<Wallet size={22}/>
</div>

<div>
<p className="font-semibold">
{invoice?.title||"Hospital Bill"}
</p>

<p className="text-sm text-gray-500">
Medical Service
</p>
</div>

</div>

<p className="text-xl font-bold text-blue-600">
₹{total}
</p>

</div>

</div>

<div className="grid sm:grid-cols-3 gap-4">

<div className="bg-green-50 border border-green-100 rounded-[24px] p-5">

<p className="text-sm text-green-700">
Paid Amount
</p>

<h2 className="text-2xl font-bold text-green-600 mt-2">
₹{paid}
</h2>

</div>

<div className="bg-yellow-50 border border-yellow-100 rounded-[24px] p-5">

<p className="text-sm text-yellow-700">
Remaining
</p>

<h2 className="text-2xl font-bold text-yellow-600 mt-2">
₹{remaining}
</h2>

</div>

<div className={`rounded-[24px] p-5 border ${
invoice.status==="paid"
?"bg-blue-50 border-blue-100"
:invoice.status==="partial"
?"bg-cyan-50 border-cyan-100"
:"bg-orange-50 border-orange-100"
}`}>

<p className="text-sm text-gray-600">
Status
</p>

<div className="flex items-center gap-2 mt-2">

<CheckCircle2
size={18}
className={
invoice.status==="paid"
?"text-blue-600"
:invoice.status==="partial"
?"text-cyan-600"
:"text-orange-500"
}
/>

<h2 className="text-lg font-bold capitalize">
{invoice.status}
</h2>

</div>

</div>

</div>

<div className="bg-gray-50 border border-gray-100 rounded-[28px] p-5 flex items-center justify-between">

<div className="flex items-center gap-2 text-sm text-gray-500">
<CreditCard size={16}/>
Payment Mode
</div>

<p className="font-semibold">
{invoice.paymentMode||"N/A"}
</p>

</div>

{invoice.status!=="paid"&&(

<div className="space-y-4 border-t pt-6">

<div className="flex items-center gap-2 font-semibold">
<Wallet size={18}/>
Make Payment
</div>

<select
value={paymentMode}
onChange={(e)=>setPaymentMode(e.target.value)}
className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
>

<option value="UPI">UPI Payment</option>
<option value="CASH">Cash Payment</option>
<option value="CARD">Card Payment</option>

</select>

<input
type="number"
value={payAmount}
onChange={(e)=>setPayAmount(Number(e.target.value)||0)}
placeholder="Enter amount"
className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
/>

<button
onClick={handlePayment}
className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium"
>
Pay & Download Receipt
</button>

</div>

)}

</div>

</motion.div>

<div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">

<button
onClick={()=>window.print()}
className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium"
>
<Printer size={16}/>
Print
</button>

<button
onClick={handleDownload}
className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium"
>
<Download size={16}/>
Download
</button>

</div>

</div>

</div>

)
}