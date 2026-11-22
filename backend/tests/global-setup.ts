import { spawnSync } from 'node:child_process'
import { Client } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'
import { seedRoles } from '../prisma/roles'
import { getTestDatabaseName, getTestDatabaseUrl } from './support/test-db-url'

function redact(text: string | undefined, secrets: string[]): string {
  let result = text ?? ''
  for (const secret of secrets) result = result.split(secret).join('[REDACTED]')
  return result
}

/** Chạy một lần trước toàn bộ test: tạo CSDL test, migrate, seed 4 vai trò. */
export async function setup(): Promise<void> {
  const testUrl = getTestDatabaseUrl()
  const dbName = getTestDatabaseName(testUrl)

  // 1. Tạo CSDL nếu chưa có (kết nối qua CSDL postgres của cùng server).
  const adminUrl = new URL(testUrl)
  adminUrl.pathname = '/postgres'
  const admin = new Client({ connectionString: adminUrl.toString() })
  try {
    await admin.connect()
    const quotedName = `"${dbName.replace(/"/g, '""')}"`
    await admin.query(`CREATE DATABASE ${quotedName}`)
  } catch (error) {
    const code = (error as { code?: string }).code
    // 42P04 = duplicate_database
    if (code !== '42P04') {
      throw new Error(
        `Không thể tạo CSDL test "${dbName}": ${redact((error as Error).message, [testUrl])}`,
      )
    }
  } finally {
    await admin.end().catch(() => undefined)
  }

  // 2. Migration trên đúng CSDL test (gọi thẳng CLI để không cần shell).
  const migrate = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: testUrl },
    encoding: 'utf8',
  })
  if (migrate.error || migrate.status !== 0) {
    const detail = redact(`${migrate.stdout ?? ''}\n${migrate.stderr ?? ''}`.trim(), [
      testUrl,
      adminUrl.toString(),
    ]).slice(-1200)
    throw new Error(`prisma migrate deploy thất bại trên CSDL "${dbName}". ${detail}`)
  }

  // 3. Seed vai trò: dùng lại prisma/roles.ts (cùng nguồn với prisma db seed).
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: testUrl }) })
  try {
    await seedRoles(prisma)
  } finally {
    await prisma.$disconnect()
  }
}
