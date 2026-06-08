import projectService from "@src/services/project.service.js"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"

async function createProject(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const project = await projectService.createProject({
      name: req.body.name,
      key: req.body.key,
      description: req.body.description,
      ownerId: req.user!.id,
    })
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function getProject(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const project = await projectService.getProject(Number(req.params.id), req.user!.id)
    return res.json({ success: true, data: project })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ success: false, message: error.message })
    }
  }
}

async function getProjectByKey(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const project = await projectService.getProjectByKey(String(req.params.key), req.user!.id)
    return res.json({ success: true, data: project })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(404).json({ success: false, message: error.message })
    }
  }
}

async function listProjects(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const projects = await projectService.listProjects(req.user!.id)
    return res.json({ success: true, data: projects })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, message: error.message })
    }
  }
}

async function addMember(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const result = await projectService.addMember({
      projectId: Number(req.params.id),
      email: req.body.email,
      role: req.body.role,
      currentUserId: req.user!.id,
    })
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function removeMember(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const result = await projectService.removeMember(
      Number(req.params.id),
      Number(req.params.memberId),
      req.user!.id,
    )
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

async function deleteProject(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const result = await projectService.deleteProject(Number(req.params.id), req.user!.id)
    return res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, message: error.message })
    }
  }
}

export default {
  createProject,
  getProject,
  getProjectByKey,
  listProjects,
  addMember,
  removeMember,
  deleteProject,
}
