"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { logoutUser } from "@/store/authSlice"
import { fetchProjects, createProject } from "@/store/projectSlice"
import type { RootState, AppDispatch } from "@/store/store"
import { Folder, Plus, LogOut, Briefcase, Terminal, Users, ExternalLink, Shield } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)
  const { projects, loading, error } = useSelector((state: RootState) => state.projects)

  // Project Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [projectKey, setProjectKey] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }
    dispatch(fetchProjects())
  }, [auth.isAuthenticated, router, dispatch])

  const handleLogout = () => {
    dispatch(logoutUser())
    router.push("/")
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError(null)

    try {
      const resultAction = await dispatch(
        createProject({
          name: projectName,
          key: projectKey,
          description: projectDesc,
        })
      )

      if (createProject.fulfilled.match(resultAction)) {
        setProjectName("")
        setProjectKey("")
        setProjectDesc("")
        setIsModalOpen(false)
      } else {
        setCreateError(resultAction.payload as string || "Failed to create project")
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create project")
    } finally {
      setCreateLoading(false)
    }
  }

  if (!auth.isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Scanline Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
      
      {/* Top Navbar */}
      <nav className="border-b border-zinc-800/80 bg-[#121214]/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#ff5a28] text-black text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-xs italic">
            TACTICAL
          </div>
          <span className="text-xl font-black italic tracking-tighter text-[#ffbba6]">JISA PROTO</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right font-mono text-xs">
            <span className="text-white font-bold">{auth.name}</span>
            <span className="text-zinc-500 text-[10px]">{auth.gmail}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-[#ff5a28]/50 hover:text-[#ff5a28] text-zinc-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <span className="w-2.5 h-8 bg-[#ff5a28] inline-block animate-pulse"></span>
              Mission Control
            </h1>
            <p className="text-zinc-400 text-sm">
              List of deployed project campaigns. Initialize a new campaign to begin tracking tasks.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5a28] hover:bg-[#ff6c3e] text-black font-extrabold px-6 py-3.5 rounded-full transition-all duration-150 flex items-center gap-2 self-start md:self-center cursor-pointer shadow-[4px_4px_0_0_#00e5ff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#00e5ff]"
          >
            <Plus size={16} strokeWidth={3} />
            <span className="uppercase text-xs tracking-wider font-black">New Campaign</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-200 text-sm px-4 py-3 rounded-xl mb-8 font-mono">
            ERROR: {error}
          </div>
        )}

        {/* Dashboard Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-[#ff5a28] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-zinc-500 font-mono text-xs">SYNCHRONIZING TACTICAL DATA...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center max-w-lg mx-auto mt-12 bg-zinc-900/30">
            <Briefcase size={48} className="mx-auto text-zinc-600 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold mb-2 uppercase text-white">No active operations</h3>
            <p className="text-zinc-500 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
              There are no project campaigns assigned to your agent profile. Deploy a new project campaign to begin tracking tasks.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Initialize Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.4s_ease-out]">
            {projects.map((project: any) => (
              <Link
                key={project.id}
                href={`/projects/${project.key}`}
                className="group block bg-[#131315] border border-zinc-800/80 rounded-2xl p-6 hover:border-[#ff5a28] transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(255,90,40,0.08)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                  <Terminal size={96} className="text-[#ff5a28] translate-x-4 -translate-y-4" />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="bg-[#ff5a28]/10 text-[#ffbba6] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#ff5a28]/20 tracking-wider">
                    {project.key}
                  </div>
                  <ExternalLink size={14} className="text-zinc-600 group-hover:text-[#ff5a28] transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide group-hover:text-[#ffbba6] transition-colors">
                  {project.name}
                </h3>

                <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-6">
                  {project.description || "No description provided for this tactical command operations."}
                </p>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <Users size={12} className="text-zinc-400" />
                    Squad Owner: {project.owner_name || "Agent"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#151517] border border-zinc-800 w-full max-w-md rounded-2xl p-8 shadow-[10px_10px_0px_0px_#ff5a28] relative">
            <h2 className="text-2xl font-bold mb-2 uppercase italic text-[#ffbba6]">Deploy Operation</h2>
            <p className="text-zinc-400 text-xs mb-6">Specify parameters for the new campaign.</p>

            {createError && (
              <div className="bg-red-950/40 border border-red-800 text-red-200 text-xs p-3 rounded-lg mb-4 font-mono">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] uppercase tracking-widest">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Phoenix Protocol"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all"
                />
              </div>

              <div className="space-y-1 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] uppercase tracking-widest">
                  Project Key (Short Letters only, max 10 chars)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="E.g., PHX"
                  value={projectKey}
                  onChange={e => setProjectKey(e.target.value.toUpperCase())}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all font-mono"
                />
              </div>

              <div className="space-y-1 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] uppercase tracking-widest">
                  Campaign Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the parameters of this operational deploy..."
                  value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-[#ff5a28] hover:bg-[#ff6c3e] text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {createLoading ? (
                    <div className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Deploy"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
