import type { HttpResponse } from '@/presentation/protocols/http'
import { ZodError } from 'zod'

export const badRequest = (error: ZodError): HttpResponse => {
  return {
    body: error,
    statusCode: 400,
  }
}

export const serverError = (error: unknown, path: string): HttpResponse => {
  const isZodError = error instanceof ZodError

  if (isZodError) {
    return {
      body: error,
      statusCode: 500,
    }
  }

  const message =
    error instanceof Error ? error.message : 'Internal server error'
  const stack =
    error instanceof Error && error.stack
      ? error.stack
      : 'No stack trace available'

  const customError = new ZodError([
    {
      message: message,
      code: 'custom',
      path: [path],
      fatal: true,
      params: {
        message: message,
        stack: stack,
        timestamp: new Date().toISOString(),
      },
    },
  ])

  return {
    body: customError,
    statusCode: 500,
  }
}

export const ok = (data: unknown): HttpResponse => ({
  body: data,
  statusCode: 200,
})

export const noContent = (): HttpResponse => ({
  body: null,
  statusCode: 204,
})
