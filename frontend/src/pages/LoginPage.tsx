import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-100">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center gap-12 px-4 py-8">
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="mb-5 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            BOOKMARK · NHÀ SÁCH
          </div>
          <Title className="!mb-4 !text-4xl !text-slate-900">Bán hàng tại quầy, quản lý tại một nơi</Title>
          <Text className="!text-base !text-slate-600">
            Tra cứu sách, báo giá, chốt đơn và in hóa đơn trong cùng một màn hình.
          </Text>
          <div className="mt-7 space-y-2 text-sm text-slate-600">
            <p>✓ Tiền và tồn kho do máy chủ tính toán</p>
            <p>✓ Hóa đơn in lại được từ danh sách đơn hàng</p>
            <p>✓ Phân quyền theo vai trò ở backend</p>
          </div>
        </div>

        <Card className="w-full max-w-md shadow-lg" styles={{ body: { padding: 28 } }}>
          <Title level={2} className="!mb-1">Đăng nhập</Title>
          <Text type="secondary" className="!mb-5 block">
            Tên đăng nhập, email hoặc số điện thoại.
          </Text>
          <Form<LoginValues>
            layout="vertical"
            requiredMark={false}
            initialValues={{ dinhDanh: '', matKhau: '' }}
            onFinish={(values) => void onFinish(values)}
          >
            <Form.Item name="dinhDanh" label="Định danh" rules={[requiredRule('định danh')]}>
              <Input size="large" autoComplete="username" placeholder="vd: thu-ngan-01" />
            </Form.Item>
            <Form.Item name="matKhau" label="Mật khẩu" rules={[requiredRule('mật khẩu')]}>
              <Input.Password size="large" autoComplete="current-password" placeholder="Mật khẩu" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block className="!mt-1">
              Đăng nhập
            </Button>
          </Form>
          <div className="mt-4 text-center text-sm text-slate-500">
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký khách hàng</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
