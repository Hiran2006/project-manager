import bcrypt from "bcrypt"
import userRepository from "@src/repositories/user.repository.js"
import sessionRepository from "@src/repositories/session.repository.js"

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@src/utils/jwt.js"
import type { JwtPayload } from "jsonwebtoken"

import crypto from "crypto"
import passwordResetRepository from "@src/repositories/passwordReset.repository.js"

import { sentResetEmail } from "@src/utils/mail.js"
import { error } from "console"

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

async function forgotPassword(email: string) {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    return {
      message: "If the email exists, a reset link will be been generated",
    }
  }
  const token = crypto.randomBytes(32).toString("hex")

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await passwordResetRepository.createResetToken(user.id, token, expiresAt)
  const resetLink = `http://localhost:5000/reset-password?token=${token}`
  await sentResetEmail(user.email, resetLink)
  return { message: "Password reset email sent" }
}

async function resetPassword(token: string, password: string) {
  const reset = await passwordResetRepository.findByToken(token)
  if (!reset) {
    throw new Error("Invalid token")
  }
  if (new Date(reset.expires_at) < new Date()) {
    throw new Error("Token Expired")
  }
  const passwordHash = await bcrypt.hash(password, 10)
  await userRepository.updatePassword(reset.user_id, passwordHash)
  await passwordResetRepository.deleteByToken(token)
}
export default {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
}
