import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiFetch } from "@/utils/api"
import { API_ENDPOINTS } from "@/utils/endpoints"

export interface IssueState {
  issues: any[]
  loading: boolean
  error: string | null
}

const initialState: IssueState = {
  issues: [],
  loading: false,
  error: null,
}

export const fetchIssues = createAsyncThunk(
  "issues/fetchIssues",
  async (projectId: number, { rejectWithValue }) => {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.ISSUES.BASE}?projectId=${projectId}`)
      if (!res.success) throw new Error(res.message || "Failed to fetch issues")
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch issues")
    }
  }
)

export const createIssue = createAsyncThunk(
  "issues/createIssue",
  async (
    issueData: {
      title: string
      description?: string
      status?: string
      priority?: string
      type?: string
      projectId: number
      assigneeId?: number | null
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.ISSUES.BASE, {
        method: "POST",
        body: JSON.stringify(issueData),
      })
      if (!res.success) throw new Error(res.message || "Failed to create issue")
      dispatch(fetchIssues(issueData.projectId))
      return res.data
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create issue")
    }
  }
)

export const updateIssueStatus = createAsyncThunk(
  "issues/updateIssueStatus",
  async (
    { issueId, status, projectId }: { issueId: number; status: string; projectId: number },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.ISSUES.BY_ID(issueId), {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
      if (!res.success) throw new Error(res.message || "Failed to update status")
      dispatch(fetchIssues(projectId))
      return { issueId, status }
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update status")
    }
  }
)

export const deleteIssue = createAsyncThunk(
  "issues/deleteIssue",
  async (
    { issueId, projectId }: { issueId: number; projectId: number },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const res = await apiFetch(API_ENDPOINTS.ISSUES.BY_ID(issueId), {
        method: "DELETE",
      })
      if (!res.success) throw new Error(res.message || "Failed to delete issue")
      dispatch(fetchIssues(projectId))
      return issueId
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete issue")
    }
  }
)

const issueSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchIssues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.issues = action.payload
        state.loading = false
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default issueSlice.reducer
