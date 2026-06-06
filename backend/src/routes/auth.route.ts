import authController from "@src/controllers/auth.controller.js"
import validate from "@src/middleware/validate.js"
import { Router } from "express"
import { body } from "express-validator"

const router = Router()

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register,
)

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  authController.login,
)

router.post("/refresh", authController.refresh)
router.post("/logout", authController.logout)

export default router
