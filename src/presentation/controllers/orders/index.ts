import type { OrderLayout } from '@/data/protocols/order'
import {
  badRequest,
  ok,
  serverError,
} from '@/presentation/helpers/http/http-helper'
import type { Controller } from '@/presentation/protocols/controller'
import type { Context, HttpResponse } from '@/presentation/protocols/http'
import { ZodError } from 'zod'

export const orderLayout: OrderLayout = [
  { fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'number' },
  { fieldName: 'userName', start: 10, end: 55, pad: ' ', type: 'string' },
  { fieldName: 'orderId', start: 55, end: 65, pad: '0', type: 'number' },
  { fieldName: 'productId', start: 65, end: 75, pad: '0', type: 'number' },
  { fieldName: 'value', start: 75, end: 87, pad: ' ', type: 'decimal' },
  { fieldName: 'purchaseDate', start: 87, end: 95, pad: '0', type: 'date' },
]

export class OrdersRouter implements Controller {
  async handle(ctx: Context): Promise<HttpResponse> {
    try {
      const filters = ctx.clients.order.verifyFilters(ctx.req.query)

      if (filters instanceof ZodError) {
        return badRequest(filters)
      }

      const files = ctx.clients.file.verify(
        ['text/plain'],
        ctx.req.files as Express.Multer.File[] | undefined,
      )

      if (files instanceof ZodError) {
        return badRequest(files)
      }

      const contents = ctx.clients.file.read(files)

      const processedOrders = ctx.clients.order.processRaw(
        contents,
        orderLayout,
      )

      if (processedOrders instanceof ZodError) {
        return badRequest(processedOrders)
      }

      let usersOrders = ctx.clients.order.group(processedOrders)

      if (usersOrders instanceof ZodError) {
        return badRequest(usersOrders)
      }

      if (filters.startDate && filters.endDate) {
        const startDate = filters.startDate
        const endDate = filters.endDate

        usersOrders = ctx.clients.order.getOrderBetweenDates(
          startDate,
          endDate,
          usersOrders,
        )
      }

      if (filters.orderId) {
        const userOrder = ctx.clients.order.getOrderById(
          filters.orderId,
          usersOrders,
        )

        usersOrders = userOrder ? [userOrder] : []
      }

      return ok({
        data: usersOrders,
      })
    } catch (error) {
      return serverError(error, ctx.url)
    }
  }
}
