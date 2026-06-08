import authService from "@src/services/auth.service.js"
import type { Request, Response } from "express"

async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body)

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}
async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body.email, req.body.password)
    return res.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      })
    }
  }
}

async function refresh(req: Request, res: Response) {
  try {
    const result = await authService.refresh(req.body.refreshToken)
    return res.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      })
    }
  }
}

async function logout(req: Request, res: Response) {
  try {
    await authService.logout(req.body.refreshToken)
    return res.json({ success: true, message: "Logged out" })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

async function forgotPassword(req: Request, res: Response) {
  try {
    const result = await authService.forgotPassword(req.body.email)
    return res.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    return res.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}
export default {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
}
