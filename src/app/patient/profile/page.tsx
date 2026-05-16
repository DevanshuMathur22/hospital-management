"use client"

import {useEffect,useState} from "react"
import {
User,
Edit3,
Save,
X,
Phone,
MapPin,
Droplets,
ShieldAlert,
Cake,
VenusAndMars
} from "lucide-react"
import {motion} from "framer-motion"
import toast from "react-hot-toast"

export default function PatientProfile(){

const [loading,setLoading]=useState(true)
const [editing,setEditing]=useState(false)

const [form,setForm]=useState({
name:"",
phone:"",
gender:"",
dob:"",
bloodGroup:"",
address:"",
emergencyContact:""
})

const getAge=(dob:string)=>{

if(!dob)return"-"

const birth=new Date(dob)
const today=new Date()

let age=today.getFullYear()-birth.getFullYear()

const m=today.getMonth()-birth.getMonth()

if(m<0||(m===0&&today.getDate()<birth.getDate()))age--

return age

}

const load=async()=>{

const res=await fetch("/api/auth/me",{
cache:"no-store",
credentials:"include"
})

const data=await res.json()

if(data.user){

setForm({
name:data.user.name||"",
phone:data.user.phone||"",
gender:data.user.gender||"",
dob:data.user.dob?data.user.dob.split("T")[0]:"",
bloodGroup:data.user.bloodGroup||"",
address:data.user.address||"",
emergencyContact:data.user.emergencyContact||""
})

}

setLoading(false)

}

useEffect(()=>{
load()
},[])

const handleChange=(e:any)=>{
setForm({...form,[e.target.name]:e.target.value})
}

const save=async()=>{

await fetch("/api/profile",{
method:"PUT",
credentials:"include",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(form)
})

toast.success("Profile Updated ✅")

setEditing(false)

load()

}

if(loading){

return(

<div className="min-h-screen bg-[#f4f7fb] p-6">

<div className="max-w-5xl mx-auto bg-white rounded-[32px] h-[650px] animate-pulse border border-gray-100"/>

</div>

)

}

const fields=[
{
label:"Phone",
name:"phone",
icon:<Phone size={16}/>,
value:form.phone
},
{
label:"Gender",
name:"gender",
icon:<VenusAndMars size={16}/>,
value:form.gender
},
{
label:"DOB",
name:"dob",
icon:<Cake size={16}/>,
value:form.dob
},
{
label:"Age",
name:"age",
icon:<User size={16}/>,
value:getAge(form.dob)
},
{
label:"Blood Group",
name:"bloodGroup",
icon:<Droplets size={16}/>,
value:form.bloodGroup
},
{
label:"Emergency",
name:"emergencyContact",
icon:<ShieldAlert size={16}/>,
value:form.emergencyContact
}
]

return(

<div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6 md:p-8">

<div className="max-w-5xl mx-auto">

<motion.div
initial={{opacity:0,y:20}}
animate={{opacity:1,y:0}}
className="bg-white border border-gray-100 rounded-[36px] shadow-xl overflow-hidden"
>

<div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 text-white">

<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

<div className="flex items-center gap-4">

<div className="w-20 h-20 rounded-[28px] bg-white/10 backdrop-blur flex items-center justify-center">
<User size={34}/>
</div>

<div>
<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
{form.name||"Patient"}
</h1>

<p className="text-blue-100 text-sm mt-1">
Patient Profile
</p>
</div>

</div>

{!editing?(
<button
onClick={()=>setEditing(true)}
className="flex items-center justify-center gap-2 bg-white text-blue-700 px-5 py-3 rounded-2xl text-sm font-semibold"
>
<Edit3 size={16}/>
Edit Profile
</button>
):(

<div className="flex gap-3">

<button
onClick={save}
className="flex items-center gap-2 bg-green-600 px-5 py-3 rounded-2xl text-sm font-semibold"
>
<Save size={16}/>
Save
</button>

<button
onClick={()=>{
setEditing(false)
load()
}}
className="flex items-center gap-2 bg-white/10 backdrop-blur px-5 py-3 rounded-2xl text-sm font-semibold"
>
<X size={16}/>
Cancel
</button>

</div>

)}

</div>

</div>

<div className="p-5 sm:p-7 space-y-7">

<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

<div className="bg-blue-50 border border-blue-100 rounded-[30px] p-5">

<p className="text-sm text-blue-700">
Full Name
</p>

{editing?(
<input
name="name"
value={form.name}
onChange={handleChange}
className="w-full mt-3 bg-white border border-blue-200 rounded-2xl px-4 py-3 outline-none"
/>
):(
<h2 className="text-xl font-bold mt-3">
{form.name||"-"}
</h2>
)}

</div>

{fields.map((f:any,i:number)=>(

<div
key={i}
className="bg-gray-50 border border-gray-100 rounded-[30px] p-5"
>

<div className="flex items-center gap-2 text-gray-500 text-sm">

{f.icon}
{f.label}

</div>

{editing&&f.name!=="age"?(

f.name==="gender"?(

<select
name="gender"
value={form.gender}
onChange={handleChange}
className="w-full mt-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 outline-none"
>

<option value="">Select Gender</option>
<option value="male">Male</option>
<option value="female">Female</option>

</select>

):(

<input
type={f.name==="dob"?"date":"text"}
name={f.name}
value={f.value}
onChange={handleChange}
className="w-full mt-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 outline-none"
/>

)

):(

<h2 className="text-lg font-semibold mt-3 capitalize">
{f.value||"-"}
</h2>

)}

</div>

))}

</div>

<div className="bg-gray-50 border border-gray-100 rounded-[30px] p-5">

<div className="flex items-center gap-2 text-gray-500 text-sm">
<MapPin size={16}/>
Address
</div>

{editing?(
<textarea
name="address"
value={form.address}
onChange={handleChange}
rows={4}
className="w-full mt-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 outline-none resize-none"
/>
):(
<p className="text-base font-medium mt-3 leading-7">
{form.address||"-"}
</p>
)}

</div>

</div>

</motion.div>

</div>

</div>

)
}