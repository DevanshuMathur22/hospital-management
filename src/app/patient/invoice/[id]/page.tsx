"use client"

import { useParams } from "next/navigation"
import { Printer, Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

export default function InvoicePage() {
  const params = useParams()
  const id = params?.id as string

  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState(0)
  const [paymentMode, setPaymentMode] = useState("UPI")

  // 🔥 FETCH BILL
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await fetch(`/api/bills/${id}`)
        const data = await res.json()

        setInvoice(data)

        const remaining =
          Number(data?.totalAmount || 0) -
          Number(data?.paidAmount || 0)

        setPayAmount(remaining)
      } catch (err) {
        console.log("FETCH ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchBill()
  }, [id])

  // 🔥 DOWNLOAD PDF
  const handleDownload = async () => {
    if (!invoiceRef.current) return

    const canvas = await html2canvas(invoiceRef.current, {
      backgroundColor: "#ffffff"
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")

    pdf.addImage(imgData, "PNG", 0, 0, 210, 0)
    pdf.save(`invoice-${id}.pdf`)
  }

  // 🔥 PAYMENT
  const handlePayment = async () => {
    const res = await fetch("/api/bills/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        billId: id,
        amount: payAmount,
        paymentMode
      })
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || "Payment failed")
      return
    }

    toast.success("Payment Successful ✅")

    setInvoice(data.bill)

    // 🔥 AUTO DOWNLOAD RECEIPT
    setTimeout(() => {
      handleDownload()
    }, 500)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  // ✅ SAFE VALUES
  const total = Number(invoice?.totalAmount || 0)
  const paid = Number(invoice?.paidAmount || 0)
  const remaining = total - paid

  return (
    <div className="min-h-screen bg-white flex justify-center p-3 sm:p-6">

      <div
        ref={invoiceRef}
        className="w-full max-w-2xl rounded-2xl shadow-xl p-4 sm:p-6 space-y-6 bg-white"
      >

        {/* HEADER */}
        <div className="flex justify-between border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              Medicare Hospital
            </h1>
            <p className="text-sm text-gray-500">Jaipur, Rajasthan</p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Invoice ID</p>
            <p className="font-semibold">{invoice.id || "N/A"}</p>
          </div>
        </div>

        {/* DETAILS */}
       {/* DETAILS */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

  {/* PATIENT */}
  <div className="bg-gray-50 p-3 rounded-lg border">
    <p className="font-semibold text-blue-700 mb-1">Patient Details</p>

    <p><b>Name:</b> {invoice?.patient?.name || "N/A"}</p>

    <p className="text-xs text-gray-600">
      📞 {invoice?.patient?.phone || "N/A"}
    </p>

    <p className="text-xs text-gray-600">
      MRN: {invoice?.patient?.mrn || "N/A"}
    </p>

    <p className="text-xs text-gray-600">
      Age: {invoice?.patient?.age || "N/A"}
    </p>

    <p className="text-xs text-gray-600">
      Gender: {invoice?.patient?.gender || "N/A"}
    </p>
  </div>

  {/* DOCTOR */}
  <div className="bg-gray-50 p-3 rounded-lg border">
    <p className="font-semibold text-blue-700 mb-1">Doctor Details</p>

    <p><b>Name:</b> {invoice?.doctor?.name || "N/A"}</p>

    <p className="text-xs text-gray-600">
      {invoice?.doctor?.specialization || ""}
    </p>
  </div>

</div>
        {/* DATE */}
        <div className="text-sm">
          <p className="font-semibold">Date</p>
          <p>
            {invoice?.createdAt
              ? new Date(invoice.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        {/* BILL */}
        <div className="border rounded-lg p-4 flex justify-between text-sm">
          <span>{invoice?.title || "Hospital Bill"}</span>
          <span>₹{total}</span>
        </div>

        {/* PAYMENT STATUS */}
        <div className="border-t pt-4 text-sm space-y-2">

          <p><b>Paid:</b> ₹{paid}</p>
          <p><b>Remaining:</b> ₹{remaining}</p>

          <p>
            <b>Status:</b>{" "}
            <span
              className={`font-semibold ${
                invoice.status === "paid"
                  ? "text-green-600"
                  : invoice.status === "partial"
                  ? "text-blue-600"
                  : "text-yellow-600"
              }`}
            >
              {invoice.status}
            </span>
          </p>

          <p>
            <b>Payment Mode:</b> {invoice.paymentMode || "N/A"}
          </p>

        </div>

        {/* PAYMENT SECTION */}
        {invoice.status !== "paid" && (
          <div className="space-y-3">

            {/* 🔥 PAYMENT MODE */}
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="UPI">UPI</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>

            {/* 🔥 AMOUNT */}
            <input
              type="number"
              value={payAmount}
              onChange={(e) =>
                setPayAmount(Number(e.target.value) || 0)
              }
              className="w-full border p-2 rounded"
              placeholder="Enter amount"
            />

            {/* 🔥 PAY */}
            <button
              onClick={handlePayment}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Pay & Download Receipt
            </button>

          </div>
        )}

      </div>

      {/* ACTION BUTTONS */}
      <div className="fixed bottom-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Printer size={16} /> Print
        </button>

        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          <Download size={16} /> Download
        </button>
      </div>

    </div>
  )
}