/**
 * Kiểm tra biến TEST_DATABASE_URL. Không đọc file .env và không in connection string.
 * Chỉ cho phép CSDL có tên kết thúc bằng "_test".
 */
export function getTestDatabaseUrl(): string {
  const raw = process.env.TEST_DATABASE_URL
  if (!raw) {
    throw new Error('Thiếu TEST_DATABASE_URL. Kiểm thử chỉ được chạy trên CSDL *_test.')
  }

  try {
    new URL(raw)
  } catch {
    throw new Error('TEST_DATABASE_URL không phải connection string hợp lệ.')
  }

  const dbName = getTestDatabaseName(raw)
  if (!dbName.endsWith('_test')) {
    throw new Error(
      `Từ chối chạy kiểm thử: CSDL "${dbName}" không kết thúc bằng "_test". ` +
        'Tuyệt đối không chạy test trên CSDL bookmark.',
    )
  }
  return raw
}

export function getTestDatabaseName(raw: string): string {
  return decodeURIComponent(new URL(raw).pathname.replace(/^\//, ''))
}
