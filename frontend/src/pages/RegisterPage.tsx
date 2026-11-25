import { Alert, App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthWave } from '../components/AuthWave'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { useAuth } from '../routes/AuthContext'
import { ROLE_HOME, type RegisterInput } from '../services/auth.service'
import { ApiError } from '../services/api'
import { emailRule, minLengthRule, phoneRule, requiredRule } from '../utils/formRules'

const { Title, Text } = Typography

/** Dịch lỗi 400/409 của API sang thông báo tiếng Việt rõ ràng. */
function registerErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Đăng ký thất bại. Vui lòng thử lại.'
  if (error.status === 409) {
    const text = error.message
    if (text.includes('Tên đăng nhập')) return 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'
    if (text.includes('Email')) return 'Email đã tồn tại. Vui lòng dùng email khác.'
    if (text.includes('Số điện thoại') || text.includes('điện thoại')) {
      return 'Số điện thoại đã tồn tại. Vui lòng dùng số khác.'
    }
    return 'Thông tin đăng ký đã tồn tại. Vui lòng kiểm tra lại.'
  }
  if (error.status === 400) {
    const details = error.issues.map((issue) => issue.message).filter(Boolean).join('; ')
    return details ? `Dữ liệu chưa hợp lệ: ${details}` : 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.'
  }
  return error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
}

export function RegisterPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form] = Form.useForm<RegisterInput>()
  const [formError, setFormError] = useState('')

  const onFinish = async (values: RegisterInput) => {
    setFormError('')
    try {
      const payload: RegisterInput = {
        username: values.username.trim().toLowerCase(),
        password: values.password,
        xacNhatMatKhau: values.xacNhatMatKhau,
        hoTen: values.hoTen.trim(),
        ...(values.email?.trim() ? { email: values.email.trim().toLowerCase() } : {}),
        ...(values.sdt?.trim() ? { sdt: values.sdt.trim() } : {}),
      }
      const me = await signUp(payload)
      message.success('Đăng ký thành công')
      navigate(ROLE_HOME[me.taiKhoan.vaiTro], { replace: true })
    } catch (error) {
      setFormError(registerErrorMessage(error))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="relative hidden min-h-96 items-center justify-center overflow-hidden rounded-2xl bg-surface lg:flex">
          <AuthWave />
          <div className="relative z-10 rounded-2xl bg-white px-8 py-6 shadow-sm">
            <Logo className="h-40" />
          </div>
        </div>

        <Card className="border-line shadow-sm" styles={{ body: { padding: 32 } }}>
          <Logo className="mx-auto mb-4 h-20 lg:hidden" />
          <Title level={2} className="!mb-1 !text-center !text-primary">
            Đăng ký tài khoản
          </Title>
          <Text type="secondary" className="!mb-1 block !text-center">
            Tạo tài khoản để trải nghiệm tốt hơn
          </Text>
          <Text type="secondary" className="!mb-5 block !text-center !text-xs">
            Nhập ít nhất email hoặc số điện thoại
          </Text>

          {formError && (
            <Alert
              type="error"
              showIcon
              closable
              message={formError}
              className="!mb-4"
              onClose={() => setFormError('')}
            />
          )}

          <Form<RegisterInput>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={{ username: '', password: '', hoTen: '', email: '', sdt: '' }}
            onFinish={(values) => void onFinish(values)}
          >
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <Form.Item name="hoTen" label="Họ và tên" rules={[requiredRule('họ tên')]}>
                <Input placeholder="Nguyễn Văn A" prefix={<Icon name="user" className="text-muted" />} />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                dependencies={['sdt']}
                rules={[
                  emailRule(),
                  ({ getFieldValue }) => ({
                    validator: (_rule, value) =>
                      String(value ?? '').trim() || String(getFieldValue('sdt') ?? '').trim()
                        ? Promise.resolve()
                        : Promise.reject(new Error('Cần email hoặc số điện thoại')),
                  }),
                ]}
              >
                <Input placeholder="a@example.com" prefix={<Icon name="mail" className="text-muted" />} />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[requiredRule('mật khẩu'), minLengthRule('Mật khẩu', 8)]}
              >
                <Input.Password placeholder="Ít nhất 8 ký tự" prefix={<Icon name="lock" className="text-muted" />} />
              </Form.Item>
              <Form.Item
                name="xacNhatMatKhau"
                label="Xác nhận mật khẩu"
                dependencies={['password']}
                rules={[
                  requiredRule('xác nhận mật khẩu'),
                  ({ getFieldValue }) => ({
                    validator: (_rule, value) =>
                      !value || value === getFieldValue('password')
                        ? Promise.resolve()
                        : Promise.reject(new Error('Mật khẩu xác nhận không khớp')),
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu" prefix={<Icon name="lock" className="text-muted" />} />
              </Form.Item>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[requiredRule('tên đăng nhập'), minLengthRule('Tên đăng nhập', 3)]}
              >
                <Input placeholder="vd: khach01" prefix={<Icon name="user" className="text-muted" />} />
              </Form.Item>
              <Form.Item name="sdt" label="Số điện thoại" rules={[phoneRule()]}>
                <Input placeholder="09xxxxxxxx" prefix={<Icon name="phone" className="text-muted" />} />
              </Form.Item>
            </div>
            <Button type="primary" htmlType="submit" size="large" block>
              Đăng ký
            </Button>
          </Form>

          <div className="mt-4 text-center text-sm text-muted">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="font-medium text-primary hover:text-primary-hover">
              Đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
