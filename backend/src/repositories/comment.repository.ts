import type { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "@src/config/db.js"

async function createComment(comment: {
  issueId: number
  userId: number
  content: string
}) {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into comments(issue_id, user_id, content) values(?,?,?)",
    [comment.issueId, comment.userId, comment.content],
  )
  return result.insertId
}

async function listCommentsByIssueId(issueId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `select c.*, u.name as user_name, u.email as user_email
     from comments c
     join users u on c.user_id = u.id
     where c.issue_id = ?
     order by c.created_at asc`,
    [issueId],
  )
  return rows
}

async function deleteComment(id: number) {
  await db.execute("delete from comments where id=?", [id])
}

async function findById(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from comments where id=?",
    [id],
  )
  return rows[0]
}

export default {
  createComment,
  listCommentsByIssueId,
  deleteComment,
  findById,
}
