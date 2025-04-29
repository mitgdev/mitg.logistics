import type { Router } from 'express'

import { adaptRoute } from '@/main/adapters/express/express-routes-adapter'
import { OrdersRouter } from '@/presentation/controllers/orders'
import { upload } from '../middlewares/upload'

export const setupOrdersRoutes = (router: Router): void => {
  console.log('Setting up orders routes')

  /**
   * @TODO - Implement a middleware to validate the fieldName is present in the request
   * to return a customError and not a multerError
   */
  router.post('/orders', upload.array('files'), adaptRoute(new OrdersRouter()))
}
