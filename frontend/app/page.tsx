"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Shield, AtSign, Lock, Zap, Cloud } from "lucide-react"
import { loginUser } from "@/store/authSlice"
import type { RootState, AppDispatch } from "@/store/store"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const error = useSelector((state: RootState) => state.auth.error)
  const isLoading = useSelector((state: RootState) => state.auth.loading)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [latency, setLatency] = useState(12)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  // Live latency simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const diff = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const next = prev + diff
        return next < 8 ? 8 : next > 25 ? 25 : next
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex items-center justify-center p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background grid + scanlines effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>

      <div className="flex flex-col lg:flex-row w-full max-w-[1150px] gap-8 items-stretch relative z-10 animate-[fadeIn_0.6s_ease-out]">
        {/* Left Section - Hero Image & Branding */}
        <div className="flex-[1.25] relative border-[3px] border-[#ff5a28] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,90,40,0.15)] min-h-[500px] lg:h-[720px] flex flex-col justify-between p-8 md:p-10 group">
          {/* Background Image with Hover Slow-Zoom */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src="/hero.png"
              alt="Tactical Board"
              fill
              className="object-cover object-center transition-transform duration-[8000ms] ease-out group-hover:scale-105"
              priority
            />
            {/* Dark overlays */}
            <div className="absolute inset-0 bg-black/45 transition-opacity duration-500 group-hover:bg-black/40"></div>
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/20 mix-blend-multiply"></div>

            {/* Animated radar/scanline sweeping effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff5a28]/5 to-transparent h-[50%] w-full top-0 left-0 -translate-y-full animate-[sweep_6s_linear_infinite] pointer-events-none"></div>
          </div>

          {/* Top Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#ff5a28] text-black text-[10px] font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-[0_0_15px_rgba(255,90,40,0.4)] transition-transform duration-300 hover:scale-105 select-none">
              <Shield
                size={12}
                className="stroke-[2.5] animate-pulse"
              />
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
              </span>
              System Encrypted
            </div>
            <h1 className="flex flex-col text-[4.5rem] leading-[0.8] font-black italic uppercase tracking-tighter mt-2 transition-all duration-500 group-hover:translate-x-1 select-none">
              <span className="text-[#ffbba6] drop-shadow-[0_2px_10px_rgba(255,187,166,0.15)]">
                Jisa
              </span>
              <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">
                PROTO
              </span>
            </h1>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-auto">
            <div className="max-w-xs md:max-w-sm transition-all duration-500 group-hover:translate-x-1">
              <h2 className="text-[22px] font-bold mb-3 uppercase tracking-wider text-white drop-shadow-md flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#ff5a28] inline-block animate-pulse"></span>
                MISSION: PRODUCTIVITY
              </h2>
              <p className="text-zinc-300 text-[13px] leading-relaxed font-medium drop-shadow-md">
                Accessing the tactical board. Please authenticate to initialize
                Mission Control and tactical squad deployment.
              </p>
            </div>
            <div className="text-left md:text-right space-y-1 text-[10px] font-bold tracking-widest uppercase self-start md:self-end font-mono">
              <p className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] flex items-center md:justify-end gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-ping"></span>
                LATENCY: {latency}MS
              </p>
              <p className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                ENCRYPTION: AES-256
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form Wrapper */}
        <div className="flex-1 flex flex-col justify-between lg:h-[720px] gap-4">
          {/* Card with interactive orange shadow backing */}
          <div className="flex-1 bg-[#151517] border border-zinc-800/80 rounded-2xl p-8 md:p-10 flex flex-col justify-center shadow-[10px_10px_0px_0px_#ff5a28] transition-all duration-300 hover:shadow-[14px_14px_0px_0px_#ff5a28] hover:-translate-x-1 hover:-translate-y-1">
            <h2 className="text-[3rem] leading-[1.05] font-bold mb-2 text-[#ffbba6] select-none">
              Welcome
              <br />
              back
            </h2>
            <p className="text-zinc-400 text-xs mb-8 font-medium">
              Identify yourself to continue the operation.
            </p>

            {error && (
              <div className="bg-red-950/40 border border-red-800 text-red-200 text-[11px] px-3.5 py-2.5 rounded-xl uppercase tracking-wider font-bold mb-6 font-mono select-none">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email Input */}
              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] transition-colors uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="agent@jisa.hq"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#242427] rounded-xl px-4 py-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#ff5a28] focus:bg-[#28282b] transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-600 group-focus-within/input:text-[#ff5a28] transition-colors">
                    <AtSign
                      size={16}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 group/input">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] transition-colors uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-[#00e5ff] hover:text-cyan-300 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#242427] rounded-xl px-4 py-3.5 text-xs text-white placeholder-zinc-500 tracking-widest focus:outline-none focus:ring-1 focus:ring-[#ff5a28] focus:bg-[#28282b] transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-600 group-focus-within/input:text-[#ff5a28] transition-colors">
                    <Lock
                      size={16}
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </div>

              {/* Login Button - Interactive Press Effect */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-[#ff5a28] hover:bg-[#ff6c3e] active:translate-x-1 active:translate-y-1 text-black font-extrabold py-3.5 rounded-full transition-all duration-150 flex items-center justify-center gap-2 text-lg disabled:opacity-50 relative overflow-hidden active:shadow-[0px_0px_0px_#00e5ff] group/btn"
                style={{
                  boxShadow: "4px 4px 0px 0px #00e5ff",
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-[2px] border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-wide uppercase text-sm font-black">
                      Login
                    </span>
                    <Zap
                      size={18}
                      className="fill-black transition-transform group-hover/btn:scale-125 group-hover/btn:rotate-12 duration-200"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">
                Social Login
              </span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            {/* Social Login Buttons - Hover Scale Lift */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#242427] hover:bg-[#2e2e32] active:scale-98 text-zinc-300 text-[11px] font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-transparent hover:border-zinc-700/50">
                <Shield
                  size={15}
                  className="text-zinc-500 transition-colors group-hover:text-zinc-300"
                />
                GitHub
              </button>
              <button className="bg-[#242427] hover:bg-[#2e2e32] active:scale-98 text-zinc-300 text-[11px] font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-transparent hover:border-zinc-700/50">
                <Cloud
                  size={15}
                  className="text-zinc-500 transition-colors group-hover:text-zinc-300"
                />
                Google
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-[13px] font-medium text-zinc-400 mt-10">
              New operative?{" "}
              <Link
                href="/register"
                className="text-[#ffbba6] hover:text-[#ff8866] font-bold transition-colors underline-offset-4 hover:underline"
              >
                Request Access
              </Link>
            </p>
          </div>

          {/* Bottom Indicators outside the card */}
          <div className="flex justify-between items-center px-2 animate-[fadeIn_0.8s_ease-out]">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff5a28] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#ff5a28]/40"></div>
              <div className="w-2 h-2 rounded-full bg-[#ff5a28]/20"></div>
            </div>
            <div className="text-[10px] font-bold text-zinc-600 tracking-widest font-mono select-none">
              v2.4.0_STABLE
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS animations */}
      <style
        jsx
        global
      >{`
        body {
          background-color: #0d0d0f;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.015) 8px,
            rgba(255, 255, 255, 0.015) 9px
          );
        }
        @keyframes sweep {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(200%);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
