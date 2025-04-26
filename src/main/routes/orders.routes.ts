import type { Router } from 'express'

import { adaptRoute } from '@/main/adapters/express/express-routes-adapter'
import { OrdersRouter } from '@/presentation/controllers/orders/orders.controller'
import { upload } from '../middlewares/upload'

export default (router: Router): void => {
  /**
   * @TODO - Implement a middleware to validate the fieldName is present in the request
   * to return a customError and not a multerError
   */
  router.post('/orders', upload.array('files'), adaptRoute(new OrdersRouter()))
}
