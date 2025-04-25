import type { Context, HttpResponse } from './http'

export interface Controller {
  handle: (ctx: Context) => Promise<HttpResponse>
}
