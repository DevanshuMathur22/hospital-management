"use client"

import { useEffect, useState } from "react"
import {
  User,
  Mail,
  Stethoscope,
  Phone,
  Pencil,
  Check,
  X,
  ShieldCheck,
  Calendar,
  Clock
} from "lucide-react"
import { motion } from "framer-motion"

export default function NurseProfile(){

  const [nurse,setNurse] = useState<any>(null)
  const [loading,setLoading] = useState(true)
  const [edit,setEdit] = useState(false)
  const [saving,setSaving] = useState(false)

  const [form,setForm] = useState({
    name:"",
    phone:""
  })

  /* ================= LOAD ================= */

  useEffect(()=>{

    const loadProfile = async () => {
      try{
        const res = await fetch("/api/nurses/me", { cache:"no-store", credentials:"include" })
        const data = await res.json()

        const nurseData = data.data

        setNurse(nurseData)

        setForm({
          name:nurseData?.name || "",
          phone:nurseData?.phone || ""
        })

      }catch(err){
        console.log(err)
      }

      setLoading(false)
    }

    loadProfile()

  },[])

  /* ================= SAVE ================= */

  const handleSave = async ()=>{

    setSaving(true)

    try{

      const res = await fetch("/api/nurses/profile",{
        method:"PATCH",credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(form)
      })

      const data = await res.json()

      if(!data.success){
        alert(data.error || "Update failed")
        setSaving(false)
        return
      }

      setNurse(data.data)
      setEdit(false)

    }catch(err){
      console.log(err)
      alert("Something went wrong")
    }

    setSaving(false)
  }

  /* ================= UI ================= */

  if(loading){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl p-8">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-40" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-4">
                {[1,2,3,4].map(i=>(
                  <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(!nurse){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Profile Not Found</h2>
          <p className="text-gray-500 mt-1">Unable to load profile data</p>
        </div>
      </div>
    )
  }

  return(

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account details</p>
            </div>
          </div>

          <button
            onClick={()=>setEdit(!edit)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm
              ${edit
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {edit ? (
              <>
                <X size={15} />
                Cancel
              </>
            ) : (
              <>
                <Pencil size={15} />
                Edit Profile
              </>
            )}
          </button>

        </div>

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >

          {/* PROFILE HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {nurse.name?.charAt(0) || "N"}
                </span>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{nurse.name || "Nurse"}</h2>
                <div className="flex items-center gap-2 mt-1 text-blue-100">
                  <ShieldCheck size={14} />
                  <span className="text-sm">Nurse</span>
                </div>
                {nurse.email && (
                  <div className="flex items-center gap-2 mt-2 text-blue-200 text-sm">
                    <Mail size={13} />
                    {nurse.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="p-6 sm:p-8">

            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">Personal Information</h3>

            <div className="space-y-1">

              {/* NAME */}
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                  {edit ? (
                    <input
                      value={form.name}
                      onChange={(e)=>setForm({...form,name:e.target.value})}
                      className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{nurse.name || "-"}</p>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                  <p className="font-medium text-gray-900">{nurse.email || "No email"}</p>
                </div>
              </div>

              {/* PHONE */}
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                  {edit ? (
                    <input
                      value={form.phone}
                      onChange={(e)=>setForm({...form,phone:e.target.value})}
                      className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{nurse.phone || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* DOCTOR */}
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Assigned Doctor</p>
                  <p className="font-medium">
                    {nurse?.doctor?.name ? (
                      <span className="text-green-600">Dr. {nurse.doctor.name}</span>
                    ) : (
                      <span className="text-gray-400">Not Assigned</span>
                    )}
                  </p>
                </div>
              </div>

              {/* MEMBER SINCE */}
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {nurse.createdAt ? new Date(nurse.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "-"}
                  </p>
                </div>
              </div>

            </div>

            {/* SAVE BUTTON */}
            {edit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100"
              >
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  <Check size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={()=>{
                    setForm({ name: nurse.name || "", phone: nurse.phone || "" })
                    setEdit(false)
                  }}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <X size={15} />
                  Discard
                </button>
              </motion.div>
            )}

          </div>

        </motion.div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck size={18} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="font-semibold text-gray-900">Nurse</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Stethoscope size={18} className="text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Assigned To</p>
            <p className="font-semibold text-gray-900">{nurse?.doctor?.name ? "Dr." : "Unassigned"}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <User size={18} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
        </div>

      </div>

    </div>
  )
}