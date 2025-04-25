import { ok, serverError } from '@/presentation/helpers/http/http-helper'
import type { Controller } from '@/presentation/protocols/controller'
import type { Context, HttpResponse } from '@/presentation/protocols/http'

export class OrdersRouter implements Controller {
  constructor() {}

  async handle(ctx: Context): Promise<HttpResponse> {
    try {
      return ok({
        hello: 'world',
      })
    } catch (error) {
      return serverError(error, ctx.url)
    }
  }
}
