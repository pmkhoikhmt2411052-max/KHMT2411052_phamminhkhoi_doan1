import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

/** Khung trang quản trị cho UC09, UC15–UC17 (chưa có nghiệp vụ). */
export function AdminPage() {
  return (
    <Card className="mx-auto max-w-3xl">
      <Title level={2}>Quản trị hệ thống</Title>
      <Paragraph type="secondary">
        Khu vực quản trị (danh mục, tài khoản, báo cáo) sẽ được bổ sung ở bước sau.
      </Paragraph>
    </Card>
  )
}
