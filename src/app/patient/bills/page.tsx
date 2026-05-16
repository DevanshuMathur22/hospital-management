"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PatientBills() {
  const router = useRouter()

  const [bills, setBills] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)

  // 🔥 FETCH
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch("/api/patient/bills", {
          credentials: "include"
        })

        const data = await res.json()
        setBills(Array.isArray(data) ? data : [])
      } catch (err) {
        console.log("BILL FETCH ERROR:", err)
        setBills([])
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  // 🔥 FILTER
  const filtered = bills.filter((b) => {
    const name = (b.title || "bill").toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
    const matchFilter = filter === "ALL" || b.type === filter
    return matchSearch && matchFilter
  })

  if (loading) {
    return <div className="p-6 text-sm">Loading bills...</div>
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen space-y-6">

      {/* HEADER */}
      <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
        My Bills
      </h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">

        <input
          placeholder="Search bills..."
          className="border p-2 rounded w-full"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="DOCTOR">Doctor</option>
          <option value="LAB">Lab</option>
          <option value="PHARMACY">Pharmacy</option>
          <option value="ADMISSION">Admission</option>
        </select>

      </div>

      {/* LIST */}
      <div className="grid gap-4">

        {filtered.map((bill) => (
          <div
            key={bill.id}
            className="bg-white p-4 rounded-xl shadow border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-md transition"
          >

            {/* LEFT */}
            <div
              className="cursor-pointer"
              onClick={() => router.push(`/patient/invoice/${bill.id}`)}
            >
              <p className="font-semibold">
                {bill.title || "Hospital Bill"}
              </p>

              <p className="text-sm text-gray-500">
                {bill.type} •{" "}
                {new Date(bill.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:items-end gap-2">

              <p className="font-bold text-blue-600">
                ₹{bill.totalAmount}
              </p>

              {/* STATUS */}
              <span
                className={`text-xs px-2 py-1 rounded-full w-fit ${
                  bill.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : bill.status === "partial"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {bill.status}
              </span>

              {/* 🔥 PAY NOW BUTTON */}
              {bill.status === "pending" && (
                <button
                  onClick={() =>
                    router.push(`/patient/invoice/${bill.id}`)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                >
                  Pay Now
                </button>
              )}

            </div>

          </div>
        ))}

        {/* EMPTY */}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm">
            No bills found
          </p>
        )}

      </div>

    </div>
  )
}