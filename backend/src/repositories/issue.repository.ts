import type { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "@src/config/db.js"

async function createIssue(issue: {
  title: string
  description?: string
  status?: string
  priority?: string
  type?: string
  projectId: number
  reporterId: number
  assigneeId?: number | null
}) {
  const [result] = await db.execute<ResultSetHeader>(
    `insert into issues(title, description, status, priority, type, project_id, reporter_id, assignee_id)
     values(?,?,?,?,?,?,?,?)`,
    [
      issue.title,
      issue.description || null,
      issue.status || "To Do",
      issue.priority || "Medium",
      issue.type || "Task",
      issue.projectId,
      issue.reporterId,
      issue.assigneeId || null,
    ],
  )
  return result.insertId
}

async function updateIssue(
  id: number,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    type?: string
    assigneeId?: number | null
  },
) {
  const fields: string[] = []
  const values: any[] = []

  if (data.title !== undefined) {
    fields.push("title=?")
    values.push(data.title)
  }
  if (data.description !== undefined) {
    fields.push("description=?")
    values.push(data.description)
  }
  if (data.status !== undefined) {
    fields.push("status=?")
    values.push(data.status)
  }
  if (data.priority !== undefined) {
    fields.push("priority=?")
    values.push(data.priority)
  }
  if (data.type !== undefined) {
    fields.push("type=?")
    values.push(data.type)
  }
  if (data.assigneeId !== undefined) {
    fields.push("assignee_id=?")
    values.push(data.assigneeId)
  }

  if (fields.length === 0) return

  values.push(id)
  await db.execute(`update issues set ${fields.join(", ")} where id=?`, values)
}

async function findById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `select i.*,
            r.name as reporter_name, r.email as reporter_email,
            a.name as assignee_name, a.email as assignee_email
     from issues i
     join users r on i.reporter_id = r.id
     left join users a on i.assignee_id = a.id
     where i.id = ?`,
    [id],
  )
  return rows[0]
}

async function listIssuesByProjectId(projectId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `select i.*,
            r.name as reporter_name, r.email as reporter_email,
            a.name as assignee_name, a.email as assignee_email
     from issues i
     join users r on i.reporter_id = r.id
     left join users a on i.assignee_id = a.id
     where i.project_id = ?
     order by i.created_at desc`,
    [projectId],
  )
  return rows
}

async function deleteIssue(id: number) {
  await db.execute("delete from issues where id=?", [id])
}

export default {
  createIssue,
  updateIssue,
  findById,
  listIssuesByProjectId,
  deleteIssue,
}
