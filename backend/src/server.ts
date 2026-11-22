import { app } from './app'
import { env } from './config/env'

const server = app.listen(env.PORT, () => {
  console.log(`BookMark API đang chạy tại http://localhost:${env.PORT}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
