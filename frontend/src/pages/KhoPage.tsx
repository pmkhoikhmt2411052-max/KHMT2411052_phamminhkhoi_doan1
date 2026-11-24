import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

/** Khung trang kho cho UC06–UC08 (chưa có nghiệp vụ). */
export function KhoPage() {
  return (
    <Card className="mx-auto max-w-3xl">
      <Title level={2}>Quản lý kho</Title>
      <Paragraph type="secondary">
        Khu vực nhân viên kho (nhập kho, tồn kho, kiểm kê) sẽ được bổ sung ở bước sau.
      </Paragraph>
    </Card>
  )
}
