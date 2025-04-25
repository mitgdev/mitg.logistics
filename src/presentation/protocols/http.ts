import { Request, Response } from 'express'

export type Context = {
  req: Request
  res: Response
  url: string
  method: string
  headers: Record<string, unknown>
  body?: unknown
}

export type HttpResponse = {
  statusCode: number
  body: unknown
}
