"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogIn, UserPlus } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const mainLinks = [
    { href: "/doctors", label: "Doctors" },
    { href: "/departments", label: "Departments" },
    { href: "/services", label: "Services" },
    { href: "/lab-tests", label: "Lab Tests" },
  ]

  const moreLinks = [
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/appointment", label: "Appointment" },
  ]

  const handleClose = () => setOpen(false)

  return (
    <header className="sticky top-4 z-50 px-4">

      {/* GLASS CONTAINER */}
     <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3
rounded-2xl
bg-white/30 backdrop-blur-2xl
border border-white/20
shadow-[0_8px_30px_rgba(0,0,0,0.08)]
relative">

        {/* GRADIENT BORDER GLOW */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none
        bg-gradient-to-r from-blue-400/20 via-white/10 to-purple-400/20 blur-xl opacity-60"></div>

        {/* LOGO */}
        <Link href="/" className="relative z-10 flex items-center gap-2 text-xl font-semibold text-blue-600 hover:scale-105 transition">
          🏥 MediCare
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium relative z-10">

          {mainLinks.map((link) => {
            const active = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  active
                    ? "text-blue-600 bg-white/50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-white/40"
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* MORE DROPDOWN */}
          <div className="relative group">
            <button className="px-3 py-2 text-gray-700 hover:text-blue-600 transition">
              More
            </button>

            <div className="absolute opacity-0 invisible group-hover:visible group-hover:opacity-100
            translate-y-3 group-hover:translate-y-0 transition-all duration-300
            top-10 bg-white/40 backdrop-blur-xl border border-white/20
            shadow-xl rounded-xl p-4 space-y-3 min-w-[150px]">

              {moreLinks.map((link) => {
                const active = pathname === link.href

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-2 py-1 rounded-md transition ${
                      active
                        ? "text-blue-600 bg-white/50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-white/40"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* LOGIN */}
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/40 transition"
          >
            <LogIn size={18} />
            Login
          </Link>

          {/* REGISTER */}
          <Link
            href="/register"
            className="flex items-center gap-2 bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 transition shadow-md"
          >
            <UserPlus size={18} />
            Register
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button className="md:hidden relative z-10" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="mx-4 mt-3 rounded-2xl bg-white/40 backdrop-blur-2xl
            border border-white/20 shadow-lg px-6 py-6 space-y-4"
          >
            {[...mainLinks, ...moreLinks].map((link) => {
              const active = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClose}
                  className={`block px-3 py-2 rounded-lg transition ${
                    active
                      ? "text-blue-600 bg-white/50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-white/40"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            <Link href="/login" onClick={handleClose} className="block text-gray-700">
              Login
            </Link>

            <Link
              href="/register"
              onClick={handleClose}
              className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
            >
              Register
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}