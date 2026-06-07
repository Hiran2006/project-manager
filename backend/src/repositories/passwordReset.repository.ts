import db from "@src/config/db.js"
import type { RowDataPacket } from "mysql2"

async function createResetToken(
  userId: string,
  token: string,
  expiresAt: Date,
) {
  await db.execute(
    "insert into password_resets(user_id,token,expires_at) values(?,?,?)",
    [userId, token, expiresAt],
  )
}

async function findByToken(token: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from password_resets where token=?",
    [token],
  )
  return rows[0]
}

async function deleteByToken(token: string) {
  await db.execute("delete from password_resets where token=?", [token])
}

export default { createResetToken, findByToken, deleteByToken }
