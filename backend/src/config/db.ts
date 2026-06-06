import mysql from "mysql2/promise"
import ENV from "../ENV.js"

const pool = mysql.createPool({
  host: ENV.DB_HOST,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
})

export default pool
