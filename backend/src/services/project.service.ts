import projectRepository from "@src/repositories/project.repository.js"
import userRepository from "@src/repositories/user.repository.js"

async function createProject(data: {
  name: string
  key: string
  description?: string
  ownerId: number
}) {
  const existing = await projectRepository.findByKey(data.key)
  if (existing) {
    throw new Error("A project with this key already exists")
  }

  const ownerIdNum = Number(data.ownerId)
  const createData: any = {
    name: data.name,
    key: data.key.toUpperCase(),
    ownerId: ownerIdNum,
  }
  if (data.description !== undefined) {
    createData.description = data.description
  }

  const projectId = await projectRepository.createProject(createData)

  // Add owner as admin member
  await projectRepository.addProjectMember(Number(projectId), ownerIdNum, "admin")

  return { id: projectId, name: data.name, key: data.key.toUpperCase() }
}

async function getProject(projectId: number, userId: number) {
  const projIdNum = Number(projectId)
  const userIdNum = Number(userId)

  const members = await projectRepository.getProjectMembers(projIdNum)
  const isMember = members.some((m: any) => Number(m.id) === userIdNum)
  const project = await projectRepository.findById(projIdNum)

  if (!project) {
    throw new Error("Project not found")
  }

  if (Number(project.owner_id) !== userIdNum && !isMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  return { ...project, members }
}

async function getProjectByKey(key: string, userId: number) {
  const project = await projectRepository.findByKey(key.toUpperCase())
  if (!project) {
    throw new Error("Project not found")
  }

  const projIdNum = Number(project.id)
  const userIdNum = Number(userId)
  const members = await projectRepository.getProjectMembers(projIdNum)
  const isMember = members.some((m: any) => Number(m.id) === userIdNum)

  if (Number(project.owner_id) !== userIdNum && !isMember) {
    throw new Error("Access denied: You are not a member of this project")
  }

  return { ...project, members }
}

async function listProjects(userId: number) {
  return await projectRepository.listProjectsByUserId(Number(userId))
}

async function addMember(data: {
  projectId: number
  email: string
  role?: string
  currentUserId: number
}) {
  const projIdNum = Number(data.projectId)
  const currentUserIdNum = Number(data.currentUserId)

  const project = await projectRepository.findById(projIdNum)
  if (!project) {
    throw new Error("Project not found")
  }

  // Verify current user is owner or admin
  const members = await projectRepository.getProjectMembers(projIdNum)
  const currentUserMember = members.find((m: any) => Number(m.id) === currentUserIdNum)
  const isOwner = Number(project.owner_id) === currentUserIdNum
  const isAdmin = currentUserMember && currentUserMember.role === "admin"

  if (!isOwner && !isAdmin) {
    throw new Error("Access denied: Only project owners or admins can add members")
  }

  const userToAdd = await userRepository.findByEmail(data.email)
  if (!userToAdd) {
    throw new Error("User not found with this email")
  }

  const isAlreadyMember = members.some((m: any) => Number(m.id) === Number(userToAdd.id))
  if (isAlreadyMember) {
    throw new Error("User is already a member of this project")
  }

  await projectRepository.addProjectMember(projIdNum, Number(userToAdd.id), data.role || "member")
  return { success: true, message: "Member added successfully" }
}

async function removeMember(projectId: number, userIdToRemove: number, currentUserId: number) {
  const projIdNum = Number(projectId)
  const userIdToRemoveNum = Number(userIdToRemove)
  const currentUserIdNum = Number(currentUserId)

  const project = await projectRepository.findById(projIdNum)
  if (!project) {
    throw new Error("Project not found")
  }

  const members = await projectRepository.getProjectMembers(projIdNum)
  const currentUserMember = members.find((m: any) => Number(m.id) === currentUserIdNum)
  const isOwner = Number(project.owner_id) === currentUserIdNum
  const isAdmin = currentUserMember && currentUserMember.role === "admin"

  if (!isOwner && !isAdmin) {
    throw new Error("Access denied: Only project owners or admins can remove members")
  }

  if (Number(project.owner_id) === userIdToRemoveNum) {
    throw new Error("Cannot remove the project owner")
  }

  await projectRepository.removeProjectMember(projIdNum, userIdToRemoveNum)
  return { success: true, message: "Member removed successfully" }
}

async function deleteProject(projectId: number, currentUserId: number) {
  const projIdNum = Number(projectId)
  const currentUserIdNum = Number(currentUserId)

  const project = await projectRepository.findById(projIdNum)
  if (!project) {
    throw new Error("Project not found")
  }

  if (Number(project.owner_id) !== currentUserIdNum) {
    throw new Error("Access denied: Only the project owner can delete this project")
  }

  await projectRepository.deleteProject(projIdNum)
  return { success: true, message: "Project deleted successfully" }
}

export default {
  createProject,
  getProject,
  getProjectByKey,
  listProjects,
  addMember,
  removeMember,
  deleteProject,
}
