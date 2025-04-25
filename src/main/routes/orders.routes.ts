import type { Router } from 'express'

import { adaptRoute } from '@/main/adapters/express/express-routes-adapter'
import { OrdersRouter } from '@/presentation/controllers/orders/orders.controller'

export default (router: Router): void => {
  router.post('/orders', adaptRoute(new OrdersRouter()))
}
