import commentService from "@src/services/comment.service.js"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"

async function createComment(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const comment = await commentService.createComment({
      issueId: Number(req.body.issueId),
      content: req.body.content,
      userId: req.user!.id,
    })
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function listComments(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const issueId = req.query.issueId
    if (!issueId) {
      return res.status(400).json({ success: false, message: "issueId is required" })
    }
    const comments = await commentService.listComments(Number(issueId), req.user!.id)
    return res.json({ success: true, data: comments })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }
}

async function deleteComment(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const result = await commentService.deleteComment(Number(req.params.id), req.user!.id)
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

export default {
  createComment,
  listComments,
  deleteComment,
}
