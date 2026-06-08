import { Router } from "express"
import authMiddleware from "@src/middleware/auth.middleware.js"
import projectController from "@src/controllers/project.controller.js"
import validate from "@src/middleware/validate.js"
import { body } from "express-validator"

const router = Router()

router.use(authMiddleware)

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Project name is required"),
    body("key")
      .notEmpty()
      .withMessage("Project key is required")
      .isLength({ min: 2, max: 10 })
      .withMessage("Key must be between 2 and 10 characters")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Key must contain letters only"),
  ],
  validate,
  projectController.createProject as any,
)

router.get("/", projectController.listProjects as any)
router.get("/:id", projectController.getProject as any)
router.get("/key/:key", projectController.getProjectByKey as any)

router.post(
  "/:id/members",
  [body("email").isEmail().withMessage("Invalid email address")],
  validate,
  projectController.addMember as any,
)

router.delete("/:id/members/:memberId", projectController.removeMember as any)
router.delete("/:id", projectController.deleteProject as any)

export default router
