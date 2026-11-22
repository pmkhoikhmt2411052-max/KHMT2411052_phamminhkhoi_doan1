import { getTestDatabaseUrl } from './support/test-db-url'

// Chạy TRƯỚC khi test file import src/app: Prisma sẽ dùng CSDL test, không phải .env.
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = getTestDatabaseUrl()
process.env.JWT_SECRET ??= 'test-only-jwt-secret-1234567890'
process.env.JWT_EXPIRES_IN ??= '1h'
