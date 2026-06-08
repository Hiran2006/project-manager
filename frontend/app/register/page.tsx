"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, User, AtSign, Lock, ArrowRight } from "lucide-react"
import { API_ENDPOINTS } from "@/utils/endpoints"

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acknowledged) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const response = await fetch(`${apiBase}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: fullName, email, password }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration failed")
      }

      setSuccess("Access Request Registered! Redirecting to login protocol...")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden">
      
      {/* Background scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>

      <div className="flex flex-col lg:flex-row w-full max-w-[1150px] gap-8 items-stretch relative z-10 animate-[fadeIn_0.6s_ease-out]">
        
        {/* Left Section - Tactical Recruitment Info */}
        <div className="flex-[1.15] relative bg-[#09090b] border border-zinc-800/80 rounded-2xl overflow-hidden min-h-[450px] lg:h-[720px] flex flex-col justify-between p-8 md:p-12 group">
          
          {/* Circular vector details in background */}
          <div className="absolute -bottom-16 -left-16 w-80 h-80 pointer-events-none opacity-20 z-0">
            <svg viewBox="0 0 200 200" className="w-full h-full text-zinc-600">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#ff5a28" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="40" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Logo Branding */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-[#ff5a28] text-black text-xs font-black px-3.5 py-1.5 uppercase tracking-widest rounded-xs italic">
              SYSTEM
            </div>
            <span className="text-[2rem] font-black italic tracking-tighter text-[#ffbba6]">JISA</span>
          </div>

          {/* Centered card with orange shadow backing */}
          <div className="relative z-10 my-auto max-w-[420px] bg-[#151517] border border-zinc-800 rounded-xl p-8 shadow-[8px_8px_0px_0px_#ff5a28] transition-all duration-300 hover:shadow-[12px_12px_0px_0px_#ff5a28] hover:-translate-x-1 hover:-translate-y-1">
            <h2 className="text-[26px] leading-snug font-black text-[#00e5ff] tracking-wide mb-4 uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.25)]">
              MISSION CONTROL RECRUITMENT
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-8 font-medium">
              Authorize your presence within the Jisa Tactical Network. Access mission analytics, squad management, and real-time inventory tracking.
            </p>
            {/* Step/Progress Blocks */}
            <div className="flex gap-2">
              <div className="h-1.5 w-10 bg-[#ffbba6] rounded-xs"></div>
              <div className="h-1.5 w-10 bg-zinc-800 rounded-xs"></div>
              <div className="h-1.5 w-10 bg-zinc-800 rounded-xs"></div>
              <div className="h-1.5 w-10 bg-zinc-800 rounded-xs"></div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] font-mono font-bold text-zinc-600 tracking-widest select-none">
            // INIT_SEQUENCE_ACTIVE
          </div>
        </div>

        {/* Right Section - Create Account Form */}
        <div className="flex-1 flex flex-col justify-between lg:h-[720px] gap-4">
          
          <div className="flex-1 bg-[#151517] border border-zinc-800/80 rounded-2xl p-8 md:p-10 flex flex-col justify-center">
            
            {/* Steps & Protocol Header */}
            <div className="flex justify-between items-center mb-1 text-[10px] font-black tracking-widest font-mono">
              <span className="text-[#ff5a28]">PROTOCOL: INITIALIZE</span>
              <span className="text-zinc-500">STEP 01/01</span>
            </div>

            <h2 className="text-[3rem] font-bold mb-4 text-white leading-none">Create Account</h2>
            
            {/* Steps bar */}
            <div className="flex gap-1.5 w-full mb-10">
              <div className="h-1 flex-1 bg-[#ffbba6] rounded-xs"></div>
              <div className="h-1 flex-1 bg-zinc-800 rounded-xs"></div>
              <div className="h-1 flex-1 bg-zinc-800 rounded-xs"></div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-800 text-red-200 text-[11px] px-3.5 py-2.5 rounded-xl uppercase tracking-wider font-bold mb-6 font-mono select-none">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-cyan-950/40 border border-[#00e5ff] text-[#00e5ff] text-[11px] px-3.5 py-2.5 rounded-xl uppercase tracking-wider font-bold mb-6 font-mono select-none">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] transition-colors uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-[#ff5a28] transition-colors">
                    <User size={16} strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Protagonist One"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800/80 rounded-lg pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] transition-colors uppercase tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-[#ff5a28] transition-colors">
                    <AtSign size={16} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="comms@jisa.network"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800/80 rounded-lg pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] transition-colors uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-[#ff5a28] transition-colors">
                    <Lock size={16} strokeWidth={2} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800/80 rounded-lg pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 tracking-widest focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Acknowledge Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group/check py-1 selection:bg-transparent">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={e => setAcknowledged(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-xs border transition-all duration-200 flex items-center justify-center ${
                    acknowledged 
                      ? "bg-[#ff5a28] border-[#ff5a28] text-black" 
                      : "border-zinc-700 bg-transparent group-hover/check:border-[#ffbba6]"
                  }`}>
                    {acknowledged && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-[4]" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium leading-relaxed group-hover/check:text-zinc-300 transition-colors">
                  I acknowledge the <span className="text-[#ffbba6] underline decoration-[#ffbba6]/45">Rules of Engagement</span> and authorize the collection of tactical operational data.
                </span>
              </label>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading || !acknowledged}
                className="w-full mt-6 bg-[#ff5a28] hover:bg-[#ff6c3e] active:scale-[0.99] text-black font-extrabold py-3.5 rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed group/btn shadow-[0_0_20px_rgba(255,90,40,0.15)]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-[2px] border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1 duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Already have an account footer wrapper */}
          <div className="flex justify-between items-center px-2">
            <p className="text-xs font-semibold text-zinc-500">
              Already part of the squad?{" "}
              <Link
                href="/"
                className="text-[#00e5ff] hover:text-cyan-300 transition-colors font-bold"
              >
                Mission Login
              </Link>
            </p>
            <div className="text-[14px] font-black text-zinc-800 tracking-wider font-mono select-none">
              JISA_01
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
