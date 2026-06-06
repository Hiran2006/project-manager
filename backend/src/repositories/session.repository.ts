import type { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "@src/config/db.js"

async function createSession(
  userId: string,
  refreshToken: string,
  expiresIn: Date,
) {
  await db.execute<ResultSetHeader>(
    "insert into user_sessions(user_id, refresh_token, expires_at) values(?,?,?)",
    [userId, refreshToken, expiresIn],
  )
}

async function findByRefreshToken(refreshToken: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from user_sessions where refresh_token=?",
    [refreshToken],
  )

  return rows[0]
}

async function deleteByRefreshToken(refreshToken: string) {
  await db.execute("delete from user_sessions where refresh_token=?", [
    refreshToken,
  ])
}

export default { createSession, findByRefreshToken, deleteByRefreshToken }
