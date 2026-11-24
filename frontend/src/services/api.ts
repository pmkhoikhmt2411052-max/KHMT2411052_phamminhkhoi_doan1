/**
 * Wrapper fetch duy nhất cho toàn bộ frontend.
 * - Mọi lời gọi dùng đường dẫn tương đối /api/...; Vite proxy chuyển sang http://localhost:3000.
 * - Tự gắn Authorization: Bearer <token> từ localStorage.
 * - Gặp 401 thì xóa token và quay về trang đăng nhập (ngoại trừ chính API đăng nhập/đăng ký
 *   để form còn hiển thị thông báo lỗi của server).
 * - Chuẩn hóa lỗi { error: { code, message, issues? } } thành ApiError.
 */

const TOKEN_KEY = 'bookmark_token'
const LOGIN_PATH = '/dang-nhap'

export interface ApiIssue {
  path: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly issues: ApiIssue[]

  constructor(status: number, code: string, message: string, issues: ApiIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.issues = issues
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/api/auth/dang-nhap') || path.startsWith('/api/auth/dang-ky')
}

function handleUnauthorized(path: string): void {
  clearToken()
  const alreadyOnLogin = window.location.pathname === LOGIN_PATH
  if (!alreadyOnLogin && !isAuthEndpoint(path)) {
    window.location.assign(LOGIN_PATH)
  }
}

export function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!path.startsWith('/api/')) {
    return Promise.reject(new ApiError(0, 'INVALID_PATH', 'Đường dẫn API phải bắt đầu bằng /api/'))
  }

  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(path, { ...init, headers })
    .then(async (response) => {
      let payload: unknown = null
      const text = await response.text()
      if (text) {
        try {
          payload = JSON.parse(text) as unknown
        } catch {
          throw new ApiError(response.status, 'INVALID_JSON', 'Máy chủ trả về dữ liệu không hợp lệ')
        }
      }

      if (!response.ok) {
        const body = (payload ?? {}) as { error?: Partial<ApiError> }
        const error = body.error ?? {}
        if (response.status === 401) handleUnauthorized(path)
        throw new ApiError(
          response.status,
          error.code ?? 'HTTP_ERROR',
          error.message ?? `Yêu cầu thất bại (${response.status})`,
          Array.isArray(error.issues) ? error.issues : [],
        )
      }
      return payload as T
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError) throw error
      throw new ApiError(0, 'NETWORK_ERROR', 'Không thể kết nối đến máy chủ. Kiểm tra backend và Vite proxy.')
    })
}

/** Tạo query string, bỏ qua giá trị undefined/null/rỗng. */
export function toQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const encoded = search.toString()
  return encoded ? `?${encoded}` : ''
}
