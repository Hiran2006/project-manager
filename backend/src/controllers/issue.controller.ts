import issueService from "@src/services/issue.service.js"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"

async function createIssue(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const issue = await issueService.createIssue({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status,
      priority: req.body.priority,
      type: req.body.type,
      projectId: Number(req.body.projectId),
      reporterId: req.user!.id,
      assigneeId: req.body.assigneeId ? Number(req.body.assigneeId) : null,
    })
    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function updateIssue(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const updateData: any = {}
    if (req.body.title !== undefined) updateData.title = req.body.title
    if (req.body.description !== undefined) updateData.description = req.body.description
    if (req.body.status !== undefined) updateData.status = req.body.status
    if (req.body.priority !== undefined) updateData.priority = req.body.priority
    if (req.body.type !== undefined) updateData.type = req.body.type
    if (req.body.assigneeId !== undefined) {
      updateData.assigneeId = req.body.assigneeId ? Number(req.body.assigneeId) : null
    }

    const result = await issueService.updateIssue(
      Number(req.params.id),
      updateData,
      req.user!.id,
    )
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function getIssue(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const issue = await issueService.getIssue(Number(req.params.id), req.user!.id)
    return res.json({ success: true, data: issue })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ success: false, message: error.message })
    }
  }
}

async function listIssues(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const projectId = req.query.projectId
    if (!projectId) {
      return res.status(400).json({ success: false, message: "projectId is required" })
    }
    const issues = await issueService.listIssues(Number(projectId), req.user!.id)
    return res.json({ success: true, data: issues })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }
}

async function deleteIssue(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const result = await issueService.deleteIssue(Number(req.params.id), req.user!.id)
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

export default {
  createIssue,
  updateIssue,
  getIssue,
  listIssues,
  deleteIssue,
}
