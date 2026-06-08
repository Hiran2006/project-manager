import { API_ENDPOINTS } from "./endpoints"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function getPersistedTokens() {
  if (typeof window === "undefined") return { authtoken: null, refreshtoken: null }
  try {
    const rootStr = localStorage.getItem("persist:jisa_root")
    if (!rootStr) return { authtoken: null, refreshtoken: null }
    const root = JSON.parse(rootStr)
    if (!root.auth) return { authtoken: null, refreshtoken: null }
    const auth = JSON.parse(root.auth)
    return {
      authtoken: auth.authtoken || null,
      refreshtoken: auth.refreshtoken || null,
    }
  } catch (e) {
    console.error("Failed to parse persisted tokens", e)
    return { authtoken: null, refreshtoken: null }
  }
}

function updatePersistedAccessToken(newAccessToken: string) {
  if (typeof window === "undefined") return
  try {
    const rootStr = localStorage.getItem("persist:jisa_root")
    if (!rootStr) return
    const root = JSON.parse(rootStr)
    if (!root.auth) return
    const auth = JSON.parse(root.auth)
    auth.authtoken = newAccessToken
    root.auth = JSON.stringify(auth)
    localStorage.setItem("persist:jisa_root", JSON.stringify(root))
  } catch (e) {
    console.error("Failed to update persisted access token", e)
  }
}

function clearPersistedState() {
  if (typeof window === "undefined") return
  localStorage.removeItem("persist:jisa_root")
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const { authtoken, refreshtoken } = getPersistedTokens()

  const headers = new Headers(options.headers || {})
  if (authtoken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authtoken}`)
  }

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && refreshtoken) {
    // Attempt token refresh
    try {
      const refreshResponse = await fetch(`${API_BASE}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshtoken }),
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        if (refreshData.success && refreshData.data.accessToken) {
          const newAccessToken = refreshData.data.accessToken

          // Update persisted storage directly to sync with Redux Persist
          updatePersistedAccessToken(newAccessToken)

          // Retry the original request
          headers.set("Authorization", `Bearer ${newAccessToken}`)
          const retryResponse = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
          })

          const retryData = await retryResponse.json()
          if (!retryResponse.ok) {
            throw new Error(retryData.message || "Request failed after token refresh")
          }
          return retryData
        }
      }
    } catch (refreshErr) {
      console.error("Token refresh failed, logging out...", refreshErr)
      clearPersistedState()
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    }
  }

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}
