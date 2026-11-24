import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../services/api'
import {
  authService,
  type MeResponse,
  type RegisterInput,
  type Role,
} from '../services/auth.service'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

interface AuthContextValue {
  status: AuthStatus
  user: MeResponse | null
  role: Role | null
  refresh: () => Promise<void>
  /** Đăng nhập xong thì gọi lại /api/auth/toi để lấy vai trò thật từ server. */
  signIn: (dinhDanh: string, matKhau: string) => Promise<MeResponse>
  signUp: (input: RegisterInput) => Promise<MeResponse>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<MeResponse | null>(null)

  const refresh = useCallback(async () => {
    if (!authService.hasToken()) {
      setUser(null)
      setStatus('guest')
      return
    }
    try {
      setUser(await authService.toi())
      setStatus('authenticated')
    } catch (error) {
      authService.dangXuat()
      setUser(null)
      setStatus('guest')
      if (!(error instanceof ApiError) || ![401, 403].includes(error.status)) {
        console.warn('[auth] Không xác thực lại được:', error)
      }
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const afterAuthenticate = useCallback(async (): Promise<MeResponse> => {
    try {
      const me = await authService.toi()
      setUser(me)
      setStatus('authenticated')
      return me
    } catch (error) {
      authService.dangXuat()
      setUser(null)
      setStatus('guest')
      throw error
    }
  }, [])

  const signIn = useCallback(
    async (dinhDanh: string, matKhau: string) => {
      await authService.dangNhap(dinhDanh, matKhau)
      return afterAuthenticate()
    },
    [afterAuthenticate],
  )

  const signUp = useCallback(
    async (input: RegisterInput) => {
      await authService.dangKy(input)
      return afterAuthenticate()
    },
    [afterAuthenticate],
  )

  const signOut = useCallback(() => {
    authService.dangXuat()
    setUser(null)
    setStatus('guest')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, role: user?.taiKhoan.vaiTro ?? null, refresh, signIn, signUp, signOut }),
    [status, user, refresh, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return context
}
