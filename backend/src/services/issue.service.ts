import issueRepository from "@src/repositories/issue.repository.js"
import projectRepository from "@src/repositories/project.repository.js"

async function createIssue(data: {
  title: string
  description?: string
  status?: string
  priority?: string
  type?: string
  projectId: number
  reporterId: number
  assigneeId?: number | null
}) {
  const projectIdNum = Number(data.projectId)
  const reporterIdNum = Number(data.reporterId)
  const assigneeIdNum = data.assigneeId ? Number(data.assigneeId) : null

  // Check project membership
  const members = await projectRepository.getProjectMembers(projectIdNum)
  const isReporterMember = members.some((m: any) => Number(m.id) === reporterIdNum)
  const project = await projectRepository.findById(projectIdNum)

  if (!project) {
    throw new Error("Project not found")
  }

  const isOwner = Number(project.owner_id) === reporterIdNum
  if (!isOwner && !isReporterMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  if (assigneeIdNum) {
    const isAssigneeMember = members.some((m: any) => Number(m.id) === assigneeIdNum)
    if (!isAssigneeMember && Number(project.owner_id) !== assigneeIdNum) {
      throw new Error("Assignee must be a member of the project")
    }
  }

  const issueId = await issueRepository.createIssue({
    ...data,
    projectId: projectIdNum,
    reporterId: reporterIdNum,
    assigneeId: assigneeIdNum,
  })
  return { id: issueId, title: data.title, status: data.status || "To Do" }
}

async function updateIssue(
  issueId: number,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    type?: string
    assigneeId?: number | null
  },
  userId: number,
) {
  const issueIdNum = Number(issueId)
  const userIdNum = Number(userId)
  const assigneeIdNum = data.assigneeId ? Number(data.assigneeId) : (data.assigneeId === null ? null : undefined)

  const issue = await issueRepository.findById(issueIdNum)
  if (!issue) {
    throw new Error("Issue not found")
  }

  const projectIdNum = Number(issue.project_id)

  // Check project membership
  const members = await projectRepository.getProjectMembers(projectIdNum)
  const isMember = members.some((m: any) => Number(m.id) === userIdNum)
  const project = await projectRepository.findById(projectIdNum)

  const isOwner = project && Number(project.owner_id) === userIdNum
  if (!isOwner && !isMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  if (assigneeIdNum) {
    const isAssigneeMember = members.some((m: any) => Number(m.id) === assigneeIdNum)
    if (!isAssigneeMember && project && Number(project.owner_id) !== assigneeIdNum) {
      throw new Error("Assignee must be a member of the project")
    }
  }

  const updateFields: any = {}
  if (data.title !== undefined) updateFields.title = data.title
  if (data.description !== undefined) updateFields.description = data.description
  if (data.status !== undefined) updateFields.status = data.status
  if (data.priority !== undefined) updateFields.priority = data.priority
  if (data.type !== undefined) updateFields.type = data.type
  if (assigneeIdNum !== undefined) updateFields.assigneeId = assigneeIdNum

  await issueRepository.updateIssue(issueIdNum, updateFields)
  return { success: true }
}

async function getIssue(issueId: number, userId: number) {
  const issueIdNum = Number(issueId)
  const userIdNum = Number(userId)

  const issue = await issueRepository.findById(issueIdNum)
  if (!issue) {
    throw new Error("Issue not found")
  }

  const projectIdNum = Number(issue.project_id)
  const members = await projectRepository.getProjectMembers(projectIdNum)
  const isMember = members.some((m: any) => Number(m.id) === userIdNum)
  const project = await projectRepository.findById(projectIdNum)

  const isOwner = project && Number(project.owner_id) === userIdNum
  if (!isOwner && !isMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  return issue
}

async function listIssues(projectId: number, userId: number) {
  const projectIdNum = Number(projectId)
  const userIdNum = Number(userId)

  const members = await projectRepository.getProjectMembers(projectIdNum)
  const isMember = members.some((m: any) => Number(m.id) === userIdNum)
  const project = await projectRepository.findById(projectIdNum)

  const isOwner = project && Number(project.owner_id) === userIdNum
  if (!isOwner && !isMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  return await issueRepository.listIssuesByProjectId(projectIdNum)
}

async function deleteIssue(issueId: number, userId: number) {
  const issueIdNum = Number(issueId)
  const userIdNum = Number(userId)

  const issue = await issueRepository.findById(issueIdNum)
  if (!issue) {
    throw new Error("Issue not found")
  }

  const project = await projectRepository.findById(Number(issue.project_id))
  const isOwner = project && Number(project.owner_id) === userIdNum
  const isReporter = Number(issue.reporter_id) === userIdNum

  if (!isOwner && !isReporter) {
    throw new Error("Access denied: Only the project owner or issue reporter can delete this issue")
  }

  await issueRepository.deleteIssue(issueIdNum)
  return { success: true }
}

export default {
  createIssue,
  updateIssue,
  getIssue,
  listIssues,
  deleteIssue,
}
