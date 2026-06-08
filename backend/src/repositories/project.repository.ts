import type { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "@src/config/db.js"

async function createProject(project: {
  name: string
  key: string
  description?: string
  ownerId: number
}) {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into projects(name, `key`, description, owner_id) values(?,?,?,?)",
    [project.name, project.key, project.description || null, project.ownerId],
  )
  return result.insertId
}

async function addProjectMember(projectId: number, userId: number, role: string = "member") {
  await db.execute(
    "insert into project_members(project_id, user_id, role) values(?,?,?)",
    [projectId, userId, role],
  )
}

async function removeProjectMember(projectId: number, userId: number) {
  await db.execute(
    "delete from project_members where project_id=? and user_id=?",
    [projectId, userId],
  )
}

async function getProjectMembers(projectId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `select u.id, u.name, u.email, pm.role from project_members pm
     join users u on pm.user_id = u.id
     where pm.project_id = ?`,
    [projectId],
  )
  return rows
}

async function findById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from projects where id=?",
    [id],
  )
  return rows[0]
}

async function findByKey(key: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from projects where `key`=?",
    [key],
  )
  return rows[0]
}

async function listProjectsByUserId(userId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `select DISTINCT p.*, u.name as owner_name from projects p
     left join project_members pm on p.id = pm.project_id
     join users u on p.owner_id = u.id
     where p.owner_id = ? or pm.user_id = ?`,
    [userId, userId],
  )
  return rows
}

async function deleteProject(id: number) {
  await db.execute("delete from projects where id=?", [id])
}

export default {
  createProject,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  findById,
  findByKey,
  listProjectsByUserId,
  deleteProject,
}
