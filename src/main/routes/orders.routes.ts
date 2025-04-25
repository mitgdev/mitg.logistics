import type { Router } from 'express'

import { adaptRoute } from '@/main/adapters/express/express-routes-adapter'
import { OrdersRouter } from '@/presentation/controllers/orders/orders.controller'
import { upload } from '../middlewares/upload'

export default (router: Router): void => {
  router.post('/orders', upload.single('file'), adaptRoute(new OrdersRouter()))
}
