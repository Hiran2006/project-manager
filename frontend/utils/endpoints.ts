export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forget-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    ME: "/users/me",
  },
  PROJECTS: {
    BASE: "/projects",
    BY_KEY: (key: string) => `/projects/key/${key}`,
    MEMBERS: (projectId: number) => `/projects/${projectId}/members`,
    MEMBER_BY_ID: (projectId: number, memberId: number) => `/projects/${projectId}/members/${memberId}`,
    BY_ID: (projectId: number) => `/projects/${projectId}`,
  },
  ISSUES: {
    BASE: "/issues",
    BY_ID: (issueId: number) => `/issues/${issueId}`,
  },
  COMMENTS: {
    BASE: "/comments",
    BY_ID: (commentId: number) => `/comments/${commentId}`,
  },
}
