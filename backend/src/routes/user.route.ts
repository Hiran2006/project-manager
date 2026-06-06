import { Router, type RequestHandler } from "express"
import authMiddleware from "@src/middleware/auth.middleware.js"
import userController from "@src/controllers/user.controller.js"
import router from "./auth.route.js"

router.use(authMiddleware)

router.get("/me", authMiddleware, userController.getMe as any)

export default router
