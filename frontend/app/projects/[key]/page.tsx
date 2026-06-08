"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store/store"
import { apiFetch } from "@/utils/api"
import { API_ENDPOINTS } from "@/utils/endpoints"
import { fetchProjectByKey } from "@/store/projectSlice"
import { fetchIssues, createIssue, updateIssueStatus, deleteIssue } from "@/store/issueSlice"
import { 
  Plus, Users, ArrowLeft, Terminal, FileText, CheckCircle2, 
  Clock, AlertCircle, Edit, Trash, MessageSquare, PlusCircle, X, ChevronRight, UserPlus, Trash2
} from "lucide-react"
import Link from "next/link"

const STATUSES = ["Backlog", "To Do", "In Progress", "In Review", "Done"]
const PRIORITIES = ["Low", "Medium", "High", "Critical"]
const TYPES = ["Story", "Task", "Bug", "Epic"]

export default function ProjectBoardPage({ params }: { params: Promise<{ key: string }> }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)
  const resolvedParams = React.use(params)
  const projectKey = resolvedParams.key

  const project = useSelector((state: RootState) => state.projects.currentProject)
  const issues = useSelector((state: RootState) => state.issues.issues)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals & Panels State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isMemberPanelOpen, setIsMemberPanelOpen] = useState(false)
  const [activeDetailIssue, setActiveDetailIssue] = useState<any>(null)
  
  // Create Issue Form State
  const [issueTitle, setIssueTitle] = useState("")
  const [issueDesc, setIssueDesc] = useState("")
  const [issueStatus, setIssueStatus] = useState("To Do")
  const [issuePriority, setIssuePriority] = useState("Medium")
  const [issueType, setIssueType] = useState("Task")
  const [issueAssignee, setIssueAssignee] = useState("")
  const [issueCreateLoading, setIssueCreateLoading] = useState(false)

  // Add Member State
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState("member")
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberError, setMemberError] = useState<string | null>(null)

  // Edit Issue Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editPriority, setEditPriority] = useState("")
  const [editType, setEditType] = useState("")
  const [editAssignee, setEditAssignee] = useState("")

  // Comments State
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push("/")
      return
    }
    loadData()
  }, [auth.isAuthenticated, projectKey])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 1. Get Project metadata via thunk
      const projRes = await dispatch(fetchProjectByKey(projectKey)).unwrap()

      // 2. Get Issues for this project via thunk
      await dispatch(fetchIssues(projRes.id)).unwrap()
    } catch (err: any) {
      setError(err.message || "Failed to load project board data")
    } finally {
      setLoading(false)
    }
  }

  // Load comments when an issue is selected
  useEffect(() => {
    if (activeDetailIssue) {
      fetchComments(activeDetailIssue.id)
      
      // Initialize edit fields
      setEditTitle(activeDetailIssue.title)
      setEditDesc(activeDetailIssue.description || "")
      setEditStatus(activeDetailIssue.status)
      setEditPriority(activeDetailIssue.priority)
      setEditType(activeDetailIssue.type)
      setEditAssignee(activeDetailIssue.assignee_id ? String(activeDetailIssue.assignee_id) : "")
    }
  }, [activeDetailIssue])

  const fetchComments = async (issueId: number) => {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.COMMENTS.BASE}?issueId=${issueId}`)
      if (res.success) {
        setComments(res.data)
      }
    } catch (err) {
      console.error("Failed to load comments", err)
    }
  }

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setIssueCreateLoading(true)
    try {
      const resultAction = await dispatch(
        createIssue({
          title: issueTitle,
          description: issueDesc,
          status: issueStatus,
          priority: issuePriority,
          type: issueType,
          projectId: project.id,
          assigneeId: issueAssignee ? Number(issueAssignee) : null,
        })
      )

      if (createIssue.fulfilled.match(resultAction)) {
        setIssueTitle("")
        setIssueDesc("")
        setIssueStatus("To Do")
        setIssuePriority("Medium")
        setIssueType("Task")
        setIssueAssignee("")
        setIsIssueModalOpen(false)
      } else {
        alert(resultAction.payload as string || "Failed to create issue")
      }
    } catch (err: any) {
      alert(err.message || "Failed to create issue")
    } finally {
      setIssueCreateLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberLoading(true)
    setMemberError(null)
    try {
      const res = await apiFetch(API_ENDPOINTS.PROJECTS.MEMBERS(project.id), {
        method: "POST",
        body: JSON.stringify({
          email: memberEmail,
          role: memberRole,
        }),
      })

      if (res.success) {
        setMemberEmail("")
        // Refresh project data to get new member list
        dispatch(fetchProjectByKey(projectKey))
      }
    } catch (err: any) {
      setMemberError(err.message || "Failed to add member")
    } finally {
      setMemberLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this squad member?")) return
    try {
      const res = await apiFetch(API_ENDPOINTS.PROJECTS.MEMBER_BY_ID(project.id, memberId), {
        method: "DELETE",
      })

      if (res.success) {
        dispatch(fetchProjectByKey(projectKey))
      }
    } catch (err: any) {
      alert(err.message || "Failed to remove member")
    }
  }

  const handleUpdateIssueStatus = async (issueId: number, newStatus: string) => {
    try {
      const resultAction = await dispatch(
        updateIssueStatus({
          issueId,
          status: newStatus,
          projectId: project.id,
        })
      )
      if (updateIssueStatus.fulfilled.match(resultAction)) {
        if (activeDetailIssue && activeDetailIssue.id === issueId) {
          setActiveDetailIssue((prev: any) => ({ ...prev, status: newStatus }))
        }
      } else {
        alert(resultAction.payload as string || "Failed to update status")
      }
    } catch (err: any) {
      alert(err.message || "Failed to update issue status")
    }
  }

  const handleSaveIssueEdits = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await apiFetch(API_ENDPOINTS.ISSUES.BY_ID(activeDetailIssue.id), {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          status: editStatus,
          priority: editPriority,
          type: editType,
          assigneeId: editAssignee ? Number(editAssignee) : null,
        }),
      })

      if (res.success) {
        setIsEditing(false)
        // Refresh details & board
        const updatedIssue = await apiFetch(API_ENDPOINTS.ISSUES.BY_ID(activeDetailIssue.id))
        if (updatedIssue.success) {
          setActiveDetailIssue(updatedIssue.data)
        }
        dispatch(fetchIssues(project.id))
      }
    } catch (err: any) {
      alert(err.message || "Failed to save edits")
    }
  }

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm("Are you sure you want to abort (delete) this operation task?")) return
    try {
      const resultAction = await dispatch(
        deleteIssue({
          issueId,
          projectId: project.id,
        })
      )
      if (deleteIssue.fulfilled.match(resultAction)) {
        setActiveDetailIssue(null)
      } else {
        alert(resultAction.payload as string || "Failed to delete issue")
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete issue")
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const res = await apiFetch(API_ENDPOINTS.COMMENTS.BASE, {
        method: "POST",
        body: JSON.stringify({
          content: newComment,
          issueId: activeDetailIssue.id,
        }),
      })

      if (res.success) {
        setNewComment("")
        fetchComments(activeDetailIssue.id)
      }
    } catch (err: any) {
      alert(err.message || "Failed to post comment")
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    try {
      const res = await apiFetch(API_ENDPOINTS.COMMENTS.BY_ID(commentId), {
        method: "DELETE",
      })
      if (res.success) {
        fetchComments(activeDetailIssue.id)
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete comment")
    }
  }

  // Get color for Priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default: return "bg-zinc-700/30 text-zinc-400 border-zinc-700/50"
    }
  }

  // Get icon for Issue Type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Bug": return "bg-red-600/10 text-red-500 border-red-500/20"
      case "Story": return "bg-purple-600/10 text-purple-500 border-purple-500/20"
      case "Epic": return "bg-cyan-600/10 text-cyan-500 border-cyan-500/20"
      default: return "bg-blue-600/10 text-blue-500 border-blue-500/20"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#ff5a28] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Accessing Board Protocol...</span>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold uppercase italic text-red-400 mb-2">ACCESS FAILED</h2>
        <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
          {error || "Project data could not be parsed. Make sure you are authorized."}
        </p>
        <Link
          href="/dashboard"
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Scanline Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]"></div>
      
      {/* Header navbar */}
      <nav className="border-b border-zinc-800/80 bg-[#121214]/60 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-[#ff5a28]/50 hover:text-[#ff5a28] transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#ff5a28]/10 text-[#ffbba6] text-[10px] font-mono font-bold px-2 py-1 border border-[#ff5a28]/25 rounded-md">
              {project.key}
            </span>
            <h1 className="text-lg font-black uppercase tracking-wide text-white">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMemberPanelOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-[#00e5ff]/50 hover:text-[#00e5ff] text-zinc-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Users size={14} />
            <span>Squad ({project.members.length})</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="bg-[#ff5a28] hover:bg-[#ff6c3e] text-black font-extrabold px-4.5 py-2 rounded-full text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0_0_#00e5ff] active:translate-x-0.5 active:translate-y-0.5"
          >
            <Plus size={14} strokeWidth={3} />
            <span>File Issue</span>
          </button>
        </div>
      </nav>

      {/* Kanban Board Container */}
      <main className="flex-1 p-6 md:p-8 flex gap-6 overflow-x-auto select-none items-stretch z-10">
        {STATUSES.map(status => {
          const statusIssues = issues.filter(i => i.status === status)
          return (
            <div
              key={status}
              className="flex-1 min-w-[280px] max-w-[340px] flex flex-col bg-[#121214]/65 border border-zinc-800/80 rounded-2xl p-4"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/50">
                <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === "Done" ? "bg-green-500" : status === "In Progress" ? "bg-amber-500" : "bg-zinc-600"}`}></span>
                  {status}
                </h3>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-[10px] px-2 py-0.5 rounded-md">
                  {statusIssues.length}
                </span>
              </div>

              {/* Issue Cards Stack */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
                {statusIssues.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-[11px] font-mono border border-dashed border-zinc-800/60 rounded-xl bg-zinc-900/10">
                    EMPTY SECTOR
                  </div>
                ) : (
                  statusIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => setActiveDetailIssue(issue)}
                      className="group bg-[#17171a] border border-zinc-800 hover:border-[#ff5a28]/60 p-4.5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,90,40,0.04)]"
                    >
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase font-mono ${getTypeColor(issue.type)}`}>
                          {issue.type}
                        </span>
                        
                        {/* Quick Status Dropdown to switch without drag-drop */}
                        <select
                          value={issue.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateIssueStatus(issue.id, e.target.value)}
                          className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-400 focus:outline-none px-2 py-0.5 rounded-md font-mono"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      <h4 className="text-xs font-bold leading-normal text-white group-hover:text-[#ffbba6] transition-colors mb-3 line-clamp-2">
                        {issue.title}
                      </h4>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>

                        <span className="text-zinc-400 font-bold flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-md">
                          <Users size={10} className="text-zinc-500" />
                          {issue.assignee_name ? issue.assignee_name.split(" ")[0] : "UNASSIGNED"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </main>

      {/* Deployed Squad Members Sidebar Panel */}
      {isMemberPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#131315] border-l border-zinc-800 w-full max-w-sm h-full p-8 flex flex-col animate-[slideIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold uppercase italic text-[#ffbba6] flex items-center gap-2">
                <Users size={20} className="text-[#ff5a28]" />
                Squad Members
              </h2>
              <button
                onClick={() => setIsMemberPanelOpen(false)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Add member form */}
            <form onSubmit={handleAddMember} className="mb-8 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#00e5ff]">Enlist Operative</h3>
              
              {memberError && (
                <div className="bg-red-950/40 border border-red-800 text-red-200 text-[10px] p-2 rounded-lg font-mono">
                  {memberError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">OPERATIVE EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="agent@jisa.hq"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">ROLE / CLEARENCE</label>
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#ff5a28]"
                >
                  <option value="member">MEMBER</option>
                  <option value="admin">ADMIN / MODERATOR</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={memberLoading}
                className="w-full bg-[#00e5ff] hover:bg-[#2ae8ff] text-black font-extrabold py-2.5 rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[3px_3px_0_0_#ff5a28] active:translate-x-0.5 active:translate-y-0.5"
              >
                {memberLoading ? (
                  <div className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={14} />
                    <span>Enlist Operative</span>
                  </>
                )}
              </button>
            </form>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-400 mb-4">ACTIVE SQUAD</h3>
              
              {project.members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/40 rounded-xl hover:border-zinc-800 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase">{member.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{member.email}</span>
                    <span className="text-[9px] font-mono font-bold text-[#ff5a28] mt-1 tracking-wider uppercase">
                      {member.role === "admin" ? "ADMINISTRATOR" : "OPERATIVE"}
                    </span>
                  </div>

                  {/* Remove Member button (do not show for the project owner) */}
                  {project.owner_id !== member.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:text-red-400 text-zinc-500 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Issue Dialog Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#151517] border border-zinc-800 w-full max-w-lg rounded-2xl p-8 shadow-[10px_10px_0px_0px_#ff5a28] relative">
            <h2 className="text-2xl font-bold mb-2 uppercase italic text-[#ffbba6]">File Task/Issue</h2>
            <p className="text-zinc-400 text-xs mb-6">Describe task parameters for campaign tracking.</p>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] uppercase tracking-widest">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Implement secure Auth token rotation"
                  value={issueTitle}
                  onChange={e => setIssueTitle(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all"
                />
              </div>

              <div className="space-y-1.5 group/input">
                <label className="block text-[9px] font-bold text-zinc-400 group-focus-within/input:text-[#ffbba6] uppercase tracking-widest">
                  Task Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail operations parameters, guidelines, and definitions of done..."
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-3 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#ff5a28] focus:ring-1 focus:ring-[#ff5a28] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">STATUS</label>
                  <select
                    value={issueStatus}
                    onChange={e => setIssueStatus(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#ff5a28]"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">PRIORITY</label>
                  <select
                    value={issuePriority}
                    onChange={e => setIssuePriority(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#ff5a28]"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">TYPE</label>
                  <select
                    value={issueType}
                    onChange={e => setIssueType(e.target.value)}
                    className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-[#ff5a28]"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">ASSIGN TO SQUAD OPERATIVE</label>
                <select
                  value={issueAssignee}
                  onChange={e => setIssueAssignee(e.target.value)}
                  className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-3 text-xs text-zinc-300 focus:outline-none focus:border-[#ff5a28]"
                >
                  <option value="">UNASSIGNED / BACKLOG</option>
                  {project.members.map((member: any) => (
                    <option key={member.id} value={member.id}>{member.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueCreateLoading}
                  className="flex-1 bg-[#ff5a28] hover:bg-[#ff6c3e] text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {issueCreateLoading ? (
                    <div className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Deploy Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task/Issue Detail Modal Sidepanel */}
      {activeDetailIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#121214] border border-zinc-800 w-full max-w-4xl h-[90vh] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative">
            
            {/* Left side: details, comments */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-zinc-800">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                  ISSUE_REPORT_KEY: {project.key}-{activeDetailIssue.id}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                    title="Edit issue details"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(activeDetailIssue.id)}
                    className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 hover:border-red-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              {/* Edit Form or Normal Content */}
              {isEditing ? (
                <form onSubmit={handleSaveIssueEdits} className="space-y-4 mb-8">
                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">TITLE</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff5a28]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">DESCRIPTION</label>
                    <textarea
                      rows={5}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff5a28] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">STATUS</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">PRIORITY</label>
                      <select
                        value={editPriority}
                        onChange={e => setEditPriority(e.target.value)}
                        className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">TYPE</label>
                      <select
                        value={editType}
                        onChange={e => setEditType(e.target.value)}
                        className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none"
                      >
                        {TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">ASSIGNEE</label>
                    <select
                      value={editAssignee}
                      onChange={e => setEditAssignee(e.target.value)}
                      className="w-full bg-[#1b1b1d] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="">UNASSIGNED</option>
                      {project.members.map((member: any) => (
                        <option key={member.id} value={member.id}>{member.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-2.5 rounded-full text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#ff5a28] text-black font-extrabold py-2.5 rounded-full text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold uppercase tracking-wide text-white mb-4 leading-snug">
                    {activeDetailIssue.title}
                  </h3>

                  <div className="p-4 bg-zinc-900/35 border border-zinc-800/80 rounded-xl">
                    <h4 className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                      {activeDetailIssue.description || "No operational description provided."}
                    </p>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-auto pt-6 border-t border-zinc-800">
                <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-[#00e5ff] mb-4 flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Operational Log ({comments.length})
                </h4>

                {/* Comment Logger Form */}
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                  <input
                    type="text"
                    required
                    placeholder="Enter message log to enregister..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="flex-1 bg-[#1b1b1d] border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#ff5a28]"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading}
                    className="bg-[#ff5a28] hover:bg-[#ff6c3e] text-black font-extrabold px-6 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
                  >
                    Send
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="text-zinc-650 font-mono text-[10px] text-center py-4">NO RECORDED COMMITTALS</div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="p-3 bg-zinc-900/50 border border-zinc-800/40 rounded-xl flex flex-col hover:border-zinc-800 transition-all">
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                          <span className="font-bold text-zinc-300">{c.user_name}</span>
                          <span className="flex items-center gap-2">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            
                            {/* Delete Comment button */}
                            {(Number(c.user_id) === Number(auth.userId) || Number(project.owner_id) === Number(auth.userId)) && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                              >
                                [DELETE]
                              </button>
                            )}
                          </span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-normal font-medium">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right side: metadata overview */}
            <div className="w-full md:w-80 bg-zinc-900/30 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-850">
                  Mission Overview
                </h3>

                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1.5">TASK STATUS</span>
                    <select
                      value={activeDetailIssue.status}
                      onChange={(e) => handleUpdateIssueStatus(activeDetailIssue.id, e.target.value)}
                      className="w-full bg-[#1b1b1d] border border-zinc-800 text-xs text-white focus:outline-none px-3 py-2 rounded-lg"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1">PRIORITY STATUS</span>
                    <span className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(activeDetailIssue.priority)}`}>
                      {activeDetailIssue.priority}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1">TACTICAL TYPE</span>
                    <span className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getTypeColor(activeDetailIssue.type)}`}>
                      {activeDetailIssue.type}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1">ASSIGNED AGENT</span>
                    <div className="bg-[#1b1b1d] border border-zinc-800 px-3 py-2 rounded-lg text-zinc-300 font-bold uppercase">
                      {activeDetailIssue.assignee_name || "UNASSIGNED"}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase tracking-widest mb-1">REPORTER</span>
                    <div className="bg-[#1b1b1d] border border-zinc-800 px-3 py-2 rounded-lg text-zinc-400 text-[11px]">
                      {activeDetailIssue.reporter_name.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveDetailIssue(null)}
                className="w-full bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all mt-8 cursor-pointer"
              >
                Close File
              </button>
            </div>

            {/* Absolute close button */}
            <button
              onClick={() => setActiveDetailIssue(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-full cursor-pointer md:hidden"
            >
              <X size={20} />
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
