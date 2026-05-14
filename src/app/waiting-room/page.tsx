"use client"

import { useEffect,useState } from "react"

export default function WaitingRoom(){

const [queue,setQueue] = useState([])

useEffect(()=>{

fetch("/api/queue",{ credentials: "include" })
.then(res=>res.json())
.then(data=>{
  const arr = Array.isArray(data) ? data : (data.data || [])
  setQueue(arr)
})

const interval = setInterval(()=>{

fetch("/api/queue",{ credentials: "include" })
.then(res=>res.json())
.then(data=>{
  const arr = Array.isArray(data) ? data : (data.data || [])
  setQueue(arr)
})

},3000)

return ()=>clearInterval(interval)

},[])

return(

<div className="p-10 bg-black text-white min-h-screen">

<h1 className="text-5xl mb-10">
Patient Queue
</h1>

<div className="grid grid-cols-3 gap-8">

{queue.map((q:any)=>(

<div
key={q.id}
className="bg-gray-900 p-8 text-center rounded-xl"
>

<h2 className="text-4xl">
#{q.token}
</h2>

<p className="text-xl">
{q.patient?.name}
</p>

<p>
Dr {q.doctor?.name}
</p>

</div>

))}

</div>

</div>

)

}