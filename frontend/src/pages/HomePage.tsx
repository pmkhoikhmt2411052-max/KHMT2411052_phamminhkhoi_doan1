import { Button, Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../routes/AuthContext'

const { Title, Paragraph } = Typography

/** Trang chủ khách hàng — khung cho UC10–UC14 (sẽ bổ sung nghiệp vụ sau). */
export function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/dang-nhap', { replace: true })
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <Title level={2}>Trang chủ khách hàng</Title>
      <Paragraph type="secondary">
        Xin chào {user?.khachHang?.hoTen ?? user?.taiKhoan.username}. Khu vực mua sắm trực tuyến sẽ được bổ sung ở bước sau.
      </Paragraph>
      <Button danger onClick={handleLogout}>Đăng xuất</Button>
    </Card>
  )
}
