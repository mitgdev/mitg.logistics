import { Router, type Express } from 'express'
import { setupOrdersRoutes } from '@/main/routes/orders.routes'

export function setupRoutes(app: Express) {
  const router = Router()

  app.use('/api', router)

  setupOrdersRoutes(router)
}
