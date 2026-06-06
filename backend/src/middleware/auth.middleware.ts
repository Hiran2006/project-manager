import { verifyAccessToken } from "@src/utils/jwt.js"
import type { Request, Response, NextFunction } from "express"
import type { JwtPayload } from "jsonwebtoken"

async function authMiddleware(
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.header("authorization")
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Token required" })
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header",
      })
    }

    const token = authHeader.substring(7)
    const decode = verifyAccessToken(token as string)
    req.user = decode as JwtPayload
    next()
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ success: false, message: "Invalid token" })
    }
  }
}

export default authMiddleware
