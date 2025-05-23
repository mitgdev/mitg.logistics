import { clients } from '@/presentation/clients'
import type { Context } from '@/presentation/protocols/http'
import { Request, Response } from 'express'

export function adaptContext(req: Request, res: Response): Context {
  return {
    clients,
    req,
    res,
    headers: req.headers,
    method: req.method,
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    body: req.body,
  }
}
