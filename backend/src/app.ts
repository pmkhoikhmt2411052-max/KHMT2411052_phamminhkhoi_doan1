import express from 'express'
import { errorHandler } from './middlewares/error-handler.middleware'
import { notFoundHandler } from './middlewares/not-found.middleware'
import { authRouter } from './routes/auth.routes'
import { healthRouter } from './routes/health.routes'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json())

  app.use('/api', healthRouter)
  app.use('/api/auth', authRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export const app = createApp()
