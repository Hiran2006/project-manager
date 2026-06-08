import { Router } from "express"
import authMiddleware from "@src/middleware/auth.middleware.js"
import commentController from "@src/controllers/comment.controller.js"
import validate from "@src/middleware/validate.js"
import { body } from "express-validator"

const router = Router()

router.use(authMiddleware)

router.post(
  "/",
  [
    body("content").notEmpty().withMessage("Comment content cannot be empty"),
    body("issueId").notEmpty().withMessage("issueId is required"),
  ],
  validate,
  commentController.createComment as any,
)

router.get("/", commentController.listComments as any)
router.delete("/:id", commentController.deleteComment as any)

export default router
