"use client"

import { useEffect, useState } from "react"
import { User, Edit, Save, X } from "lucide-react"

export default function PatientProfile(){

  const [loading,setLoading] = useState(true)
  const [editing,setEditing] = useState(false)

  const [form,setForm] = useState({
    name:"",
    phone:"",
    gender:"",
    dob:"",
    bloodGroup:"",
    address:"",
    emergencyContact:""
  })

  const getAge = (dob:string)=>{
    if(!dob) return "-"
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if(m < 0 || (m === 0 && today.getDate() < birth.getDate())){
      age--
    }
    return age
  }

  const load = async()=>{
    const res = await fetch("/api/auth/me",{ cache:"no-store",credentials:"include" })
    const data = await res.json()

    if(data.user){
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        gender: data.user.gender || "",
        dob: data.user.dob ? data.user.dob.split("T")[0] : "",
        bloodGroup: data.user.bloodGroup || "",
        address: data.user.address || "",
        emergencyContact: data.user.emergencyContact || ""
      })
    }

    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const handleChange = (e:any)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  const save = async()=>{
    await fetch("/api/profile",{
      method:"PUT",credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(form)
    })
    setEditing(false)
    load()
  }

  if(loading){
    return <div className="p-6 text-sm">Loading...</div>
  }

  return(

    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">

      <div className="bg-white border rounded-2xl shadow p-4 sm:p-6 md:p-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20}/>
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold">
                {form.name || "Patient"}
              </h1>
              <p className="text-xs text-gray-500">
                Patient Profile
              </p>
            </div>

          </div>

          {!editing ? (
            <button
              onClick={()=>setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm w-full sm:w-fit"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-fit">
              <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded text-sm flex-1">
                Save
              </button>
              <button onClick={()=>{setEditing(false);load()}} className="bg-gray-400 text-white px-4 py-2 rounded text-sm flex-1">
                Cancel
              </button>
            </div>
          )}

        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          {/* Name */}
          <div>
            <p className="text-gray-500 text-xs">Name</p>
            {editing
              ? <input name="name" value={form.name} onChange={handleChange} className="border p-2 rounded w-full"/>
              : <p className="font-medium">{form.name || "-"}</p>}
          </div>

          {/* Phone */}
          <div>
            <p className="text-gray-500 text-xs">Phone</p>
            {editing
              ? <input name="phone" value={form.phone} onChange={handleChange} className="border p-2 rounded w-full"/>
              : <p className="font-medium">{form.phone || "-"}</p>}
          </div>

          {/* Gender */}
          <div>
            <p className="text-gray-500 text-xs">Gender</p>
            {editing
              ? (
                <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded w-full">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              )
              : <p className="font-medium">{form.gender || "-"}</p>}
          </div>

          {/* DOB */}
          <div>
            <p className="text-gray-500 text-xs">DOB</p>
            {editing
              ? <input type="date" name="dob" value={form.dob} onChange={handleChange} className="border p-2 rounded w-full"/>
              : <p className="font-medium">{form.dob || "-"}</p>}
          </div>

          {/* Age */}
          <div>
            <p className="text-gray-500 text-xs">Age</p>
            <p className="font-medium">{getAge(form.dob)}</p>
          </div>

          {/* Blood */}
          <div>
            <p className="text-gray-500 text-xs">Blood Group</p>
            {editing
              ? <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="border p-2 rounded w-full"/>
              : <p className="font-medium">{form.bloodGroup || "-"}</p>}
          </div>

          {/* Emergency */}
          <div>
            <p className="text-gray-500 text-xs">Emergency Contact</p>
            {editing
              ? <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="border p-2 rounded w-full"/>
              : <p className="font-medium">{form.emergencyContact || "-"}</p>}
          </div>

        </div>

        {/* ADDRESS */}
        <div>
          <p className="text-gray-500 text-xs">Address</p>
          {editing
            ? <input name="address" value={form.address} onChange={handleChange} className="border p-2 rounded w-full"/>
            : <p className="font-medium">{form.address || "-"}</p>}
        </div>

      </div>

    </div>

  )
}