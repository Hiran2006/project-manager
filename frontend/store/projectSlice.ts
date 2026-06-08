import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiFetch } from "@/utils/api"
import { API_ENDPOINTS } from "@/utils/endpoints"

export interface ProjectState {
  projects: any[]
  currentProject: any | null
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.PROJECTS.BASE)
      if (!res.success) throw new Error(res.message || "Failed to fetch projects")
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch projects")
    }
  }
)

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (
    projectData: { name: string; key: string; description?: string },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.PROJECTS.BASE, {
        method: "POST",
        body: JSON.stringify(projectData),
      })
      if (!res.success) throw new Error(res.message || "Failed to create project")
      dispatch(fetchProjects())
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create project")
    }
  }
)

export const fetchProjectByKey = createAsyncThunk(
  "projects/fetchProjectByKey",
  async (key: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.PROJECTS.BY_KEY(key))
      if (!res.success) throw new Error(res.message || "Failed to fetch project detail")
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch project detail")
    }
  }
)

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload
        state.loading = false
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchProjectByKey
      .addCase(fetchProjectByKey.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjectByKey.fulfilled, (state, action) => {
        state.currentProject = action.payload
        state.loading = false
      })
      .addCase(fetchProjectByKey.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearCurrentProject } = projectSlice.actions
export default projectSlice.reducer
