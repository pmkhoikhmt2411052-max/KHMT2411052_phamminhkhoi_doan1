import { App, Button, Card, Form, Input, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../routes/AuthContext'
import { ROLE_HOME, type RegisterInput } from '../services/auth.service'
import { ApiError } from '../services/api'
import {
  emailRule,
  minLengthRule,
  phoneRule,
  requiredRule,
} from '../utils/formRules'

const { Title, Text } = Typography

export function RegisterPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form] = Form.useForm<RegisterInput>()

  const onFinish = async (values: RegisterInput) => {
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
      message.error(error instanceof ApiError ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-100 py-8">
      <Card className="mx-auto w-full max-w-xl shadow-lg" styles={{ body: { padding: 28 } }}>
        <Title level={2} className="!mb-1">Đăng ký khách hàng</Title>
        <Text type="secondary" className="!mb-5 block">
          Cần ít nhất email hoặc số điện thoại. Tài khoản nhân viên do quản trị viên tạo.
        </Text>
        <Form<RegisterInput>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ username: '', password: '', hoTen: '', email: '', sdt: '' }}
          onFinish={(values) => void onFinish(values)}
        >
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[requiredRule('tên đăng nhập'), minLengthRule('Tên đăng nhập', 3)]}
            >
              <Input placeholder="vd: khach01" />
            </Form.Item>
            <Form.Item name="hoTen" label="Họ tên" rules={[requiredRule('họ tên')]}>
              <Input placeholder="Nguyễn Văn A" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[requiredRule('mật khẩu'), minLengthRule('Mật khẩu', 8)]}
            >
              <Input.Password placeholder="Ít nhất 8 ký tự" />
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
              <Input.Password placeholder="Nhập lại mật khẩu" />
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
              <Input placeholder="a@example.com" />
            </Form.Item>
            <Form.Item name="sdt" label="Số điện thoại" rules={[phoneRule()]}>
              <Input placeholder="09xxxxxxxx" />
            </Form.Item>
          </div>
          <Button type="primary" htmlType="submit" size="large" block>
            Đăng ký
          </Button>
        </Form>
        <div className="mt-4 text-center text-sm text-slate-500">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  )
}
