import userRepository from "@src/repositories/user.repository.js"
import type { JwtPayload } from "jsonwebtoken"
import type { Request, Response } from "express"

async function getMe(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const user = await userRepository.findById(req.user!.id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: true,
        message: error.message,
      })
    }
  }
}

export default { getMe }
