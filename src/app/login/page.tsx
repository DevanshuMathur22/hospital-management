"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {

  const router = useRouter()

  const [mode, setMode] = useState<"password" | "otp">("password")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")

  const [loading, setLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)

  // PASSWORD LOGIN

  const handleLogin = async (e: any) => {

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Login failed")
        setLoading(false)
        return
      }

      router.refresh()

      if (data.role === "doctor") {
        router.push("/doctor/dashboard")
      }

      if (data.role === "patient") {
        router.push("/patient/dashboard")
      }

      if (data.role === "receptionist") {
        router.push("/receptionist/dashboard")
      }

      if (data.role === "nurse") {
        router.push("/nurse/dashboard")
      }

      if (data.role === "admin") {
        router.push("/admin/dashboard")
      }

    } catch (err) {

      console.log(err)
      alert("Server error")

    }

    setLoading(false)
  }

  // SEND OTP

  const handleSendOtp = async () => {

    try {

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
        return
      }

      alert("OTP sent successfully")

      setShowOtpInput(true)

    } catch (err) {

      console.log(err)
      alert("Failed to send OTP")
    }
  }

  // VERIFY OTP

  const handleVerifyOtp = async () => {

    try {

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
        return
      }

      alert("Login successful")

      if (data.role === "doctor") {
  router.push("/doctor/dashboard")
}

if (data.role === "patient") {
  router.push("/patient/dashboard")
}

if (data.role === "receptionist") {
  router.push("/receptionist/dashboard")
}

if (data.role === "nurse") {
  router.push("/nurse/dashboard")
}

if (data.role === "admin") {
  router.push("/admin/dashboard")
}

    } catch (err) {

      console.log(err)
      alert("OTP verification failed")
    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4">

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl p-8">

        {/* HEADER */}

        <div className="text-center">

          <h1 className="text-3xl font-bold text-slate-800">
            Hospital Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure access to your hospital dashboard
          </p>

        </div>

        {/* TOGGLE */}

        <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">

          <button
            onClick={() => setMode("password")}
            className={`rounded-xl py-3 text-sm font-semibold transition-all ${
              mode === "password"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500"
            }`}
          >
            Password Login
          </button>

          <button
            onClick={() => setMode("otp")}
            className={`rounded-xl py-3 text-sm font-semibold transition-all ${
              mode === "otp"
                ? "bg-white shadow text-slate-900"
                : "text-slate-500"
            }`}
          >
            OTP Login
          </button>

        </div>

        {/* PASSWORD LOGIN */}

        {mode === "password" && (

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            <div>

              <label className="text-sm font-medium text-slate-600">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

            </div>

            <div>

              <label className="text-sm font-medium text-slate-600">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

            </div>

            <div className="flex justify-end">

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

        )}

        {/* OTP LOGIN */}

        {mode === "otp" && (

          <div className="mt-8 space-y-5">

            <div>

              <label className="text-sm font-medium text-slate-600">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            {!showOtpInput && (

              <button
                onClick={handleSendOtp}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Send OTP
              </button>

            )}

            {showOtpInput && (

              <>

                <div>

                  <label className="text-sm font-medium text-slate-600">
                    OTP
                  </label>

                  <input
                    type="text"
                    placeholder="Enter 6 digit OTP"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:ring-2 focus:ring-green-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                </div>

                <button
                  onClick={handleVerifyOtp}
                  className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Verify OTP
                </button>

              </>

            )}

          </div>

        )}

        {/* FOOTER */}

        <p className="mt-8 text-center text-sm text-slate-500">

          Don&apos;t have an account?{" "}

          <span
            onClick={() => router.push("/register")}
            className="cursor-pointer font-medium text-blue-600 hover:underline"
          >
            Register
          </span>

        </p>

      </div>

    </div>
  )
}