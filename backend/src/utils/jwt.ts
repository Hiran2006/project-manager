import jwt from "jsonwebtoken"
import ENV from "../ENV.js"

function generateAccessToken(users: {
  id: string
  email: string
  role: "ADMIN" | "USER"
}) {
  return jwt.sign(
    { id: users.id, email: users.email, role: users.role },
    ENV.JWT_SECRET,
    { expiresIn: "15m" },
  )
}

function generateRefreshToken(user: { id: string }) {
  return jwt.sign({ id: user.id }, ENV.JWT_REFRESH_SECRET, { expiresIn: "7d" })
}

function verifyAccessToken(token: string) {
  return jwt.verify(token, ENV.JWT_SECRET)
}
function verifyRefreshToken(token: string) {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET)
}
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}
