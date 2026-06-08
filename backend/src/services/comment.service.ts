import commentRepository from "@src/repositories/comment.repository.js"
import issueRepository from "@src/repositories/issue.repository.js"
import projectRepository from "@src/repositories/project.repository.js"

async function createComment(data: {
  issueId: number
  content: string
  userId: number
}) {
  const issueIdNum = Number(data.issueId)
  const userIdNum = Number(data.userId)

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

  const commentId = await commentRepository.createComment({
    issueId: issueIdNum,
    content: data.content,
    userId: userIdNum,
  })
  return { id: commentId, content: data.content, userId: userIdNum }
}

async function listComments(issueId: number, userId: number) {
  const issueIdNum = Number(issueId)
  const userIdNum = Number(userId)

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

  return await commentRepository.listCommentsByIssueId(issueIdNum)
}

async function deleteComment(commentId: number, userId: number) {
  const commentIdNum = Number(commentId)
  const userIdNum = Number(userId)

  const comment = await commentRepository.findById(commentIdNum)
  if (!comment) {
    throw new Error("Comment not found")
  }

  const issue = await issueRepository.findById(Number(comment.issue_id))
  if (!issue) {
    throw new Error("Issue not found")
  }

  const project = await projectRepository.findById(Number(issue.project_id))
  const isOwner = project && Number(project.owner_id) === userIdNum
  const isAuthor = Number(comment.user_id) === userIdNum

  if (!isOwner && !isAuthor) {
    throw new Error("Access denied: Only the comment author or project owner can delete this comment")
  }

  await commentRepository.deleteComment(commentIdNum)
  return { success: true }
}

export default {
  createComment,
  listComments,
  deleteComment,
}
