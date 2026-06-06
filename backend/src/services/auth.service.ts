import bcrypt from "bcrypt"
import userRepository from "@src/repositories/user.repository.js"
import sessionRepository from "@src/repositories/session.repository.js"

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@src/utils/jwt.js"
import type { JwtPayload } from "jsonwebtoken"

async function register(data: {
  name: string
  email: string
  password: string
}) {
  const existingUser = await userRepository.findByEmail(data.email)

  if (existingUser) {
    throw new Error("Email already exists")
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  const userId = await userRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  })

  return { id: userId, name: data.name, email: data.email }
}

async function login(email: string, password: string) {
  const user = await userRepository.findByEmail(email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatch) {
    throw new Error("Invalid credentials")
  }

  const accessToken = generateAccessToken(user as any)
  const refreshToken = generateRefreshToken(user as { id: string })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await sessionRepository.createSession(user.id, refreshToken, expiresAt)

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}
async function refresh(refreshToken: string) {
  const session = await sessionRepository.findByRefreshToken(refreshToken)
  if (!session) {
    throw new Error("Session not found")
  }
  const payload = verifyRefreshToken(refreshToken) as JwtPayload
  const user = await userRepository.findById(payload.id)
  if (!user) {
    throw new Error("User not found")
  }
  const accessToken = generateAccessToken(user as any)
  return { accessToken }
}

async function logout(refreshToken: string) {
  await sessionRepository.deleteByRefreshToken(refreshToken)
}

export default { register, login, refresh, logout }
