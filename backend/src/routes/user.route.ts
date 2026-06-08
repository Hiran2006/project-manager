import { Router } from "express"
import authMiddleware from "@src/middleware/auth.middleware.js"
import userController from "@src/controllers/user.controller.js"

const router = Router()

router.get("/me", authMiddleware, userController.getMe as any)

export default router

