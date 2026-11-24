import { App as AntdApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './routes/AuthContext'
import { AppRoutes } from './routes'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Không tìm thấy phần tử #root')

createRoot(rootElement).render(
  <StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#183BFF',
          colorPrimaryHover: '#345BFF',
          colorPrimaryActive: '#0F2EDB',
          colorBgBase: '#FFFFFF',
          colorBgLayout: '#FFFFFF',
          colorBgContainer: '#FFFFFF',
          colorBgElevated: '#FFFFFF',
          colorText: '#171923',
          colorTextSecondary: '#697386',
          colorTextTertiary: '#697386',
          colorBorder: '#E5E7EB',
          colorBorderSecondary: '#E5E7EB',
          borderRadius: 8,
          borderRadiusLG: 12,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Button: {
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
            fontWeight: 600,
          },
          Layout: {
            headerBg: '#183BFF',
            headerColor: '#FFFFFF',
            bodyBg: '#FFFFFF',
            footerBg: '#FFFFFF',
          },
          Table: { borderColor: '#E5E7EB', headerBg: '#EAF0FF', headerColor: '#171923' },
          Tabs: { itemSelectedColor: '#183BFF', inkBarColor: '#183BFF' },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
)
