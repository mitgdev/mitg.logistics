import type { Controller } from '@/presentation/protocols/controller'
import { Request, Response } from 'express'
import { adaptContext } from './express-context-adapter'

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpResponse = await controller.handle(adaptContext(req, res))

    if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
      res.status(httpResponse.statusCode).json(httpResponse.body)
    } else {
      res.status(httpResponse.statusCode).json({
        error: httpResponse.body,
      })
    }
  }
}
