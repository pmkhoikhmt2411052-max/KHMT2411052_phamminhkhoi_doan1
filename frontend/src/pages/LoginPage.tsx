import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthWave } from '../components/AuthWave'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useAuth } from '../routes/AuthContext'
import { ROLE_HOME } from '../services/auth.service'
import { ApiError } from '../services/api'
import { requiredRule } from '../utils/formRules'

const { Title, Text } = Typography

interface LoginValues {
  dinhDanh: string
  matKhau: string
}

export function LoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { status, role, signIn } = useAuth()

  useEffect(() => {
    if (status === 'authenticated' && role) navigate(ROLE_HOME[role], { replace: true })
  }, [status, role, navigate])

  const onFinish = async (values: LoginValues) => {
    try {
      const me = await signIn(values.dinhDanh.trim(), values.matKhau)
      navigate(ROLE_HOME[me.taiKhoan.vaiTro], { replace: true })
      message.success(`Xin chào, ${me.taiKhoan.username}`)
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="relative hidden min-h-96 items-center justify-center overflow-hidden rounded-2xl bg-surface lg:flex">
          <AuthWave />
          <Logo className="relative z-10 h-40" />
        </div>

        <Card className="border-line shadow-sm" styles={{ body: { padding: 32 } }}>
          <Logo className="mx-auto mb-4 h-20 lg:hidden" />
          <Title level={2} className="!mb-1 !text-center !text-primary">
            Đăng nhập
          </Title>
          <Text type="secondary" className="!mb-6 block !text-center">
            Đăng nhập để tiếp tục sử dụng hệ thống
          </Text>

          <Form<LoginValues>
            layout="vertical"
            requiredMark={false}
            initialValues={{ dinhDanh: '', matKhau: '' }}
            onFinish={(values) => void onFinish(values)}
          >
            <Form.Item name="dinhDanh" label="Định danh" rules={[requiredRule('định danh')]}>
              <Input
                size="large"
                autoComplete="username"
                placeholder="Tên đăng nhập hoặc email"
                prefix={<Icon name="user" className="text-muted" />}
              />
            </Form.Item>
            <Form.Item name="matKhau" label="Mật khẩu" rules={[requiredRule('mật khẩu')]}>
              <Input.Password
                size="large"
                autoComplete="current-password"
                placeholder="Mật khẩu"
                prefix={<Icon name="lock" className="text-muted" />}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block className="!mt-1">
              Đăng nhập
            </Button>
          </Form>

          <div className="mt-4 text-center text-sm text-muted">
            <span className="cursor-not-allowed text-muted" title="Tính năng đặt lại mật khẩu chưa có API">
              Quên mật khẩu?
            </span>
            <span className="mx-2 text-line">|</span>
            <Link to="/dang-ky" className="font-medium text-primary hover:text-primary-hover">
              Đăng ký tài khoản
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
