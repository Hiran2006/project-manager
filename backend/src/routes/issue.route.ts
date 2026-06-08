import { Router } from "express"
import authMiddleware from "@src/middleware/auth.middleware.js"
import issueController from "@src/controllers/issue.controller.js"
import validate from "@src/middleware/validate.js"
import { body } from "express-validator"

const router = Router()

router.use(authMiddleware)

router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Issue title is required"),
    body("projectId").notEmpty().withMessage("projectId is required"),
  ],
  validate,
  issueController.createIssue as any,
)

router.get("/", issueController.listIssues as any)
router.get("/:id", issueController.getIssue as any)
router.put("/:id", issueController.updateIssue as any)
router.delete("/:id", issueController.deleteIssue as any)

export default router
