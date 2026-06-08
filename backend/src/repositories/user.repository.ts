import type { ResultSetHeader, RowDataPacket } from "mysql2"
import db from "@src/config/db.js"

async function findByEmail(email: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from users where email=?",
    [email],
  )
  return rows[0]
}

async function findById(id: string) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "select * from users where id=?",
    [id],
  )
  return rows[0]
}

async function createUser(user: {
  name: string
  email: string
  passwordHash: string
}) {
  const [result] = await db.execute<ResultSetHeader>(
    "insert into users(name,email,password_hash) values(?,?,?)",
    [user.name, user.email, user.passwordHash],
  )
  return result.insertId
}

async function updatePassword(user_id: string, password_hash: string) {
  await db.execute("update users set password_hash=? where id=?", [
    password_hash,
    user_id,
  ])
}

export default { findByEmail, createUser, findById, updatePassword }
