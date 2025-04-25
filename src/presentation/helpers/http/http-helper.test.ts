import { ZodError, type ZodCustomIssue } from 'zod'
import { badRequest, noContent, ok, serverError } from './http-helper'

describe('HttpHelper', () => {
  describe('BadRequest', () => {
    test('Should return a ZodError if is BadRequest', () => {
      const error = new ZodError([
        {
          message: 'Error message',
          code: 'custom',
          path: ['path'],
          fatal: true,
          params: {},
        },
      ])

      const result = badRequest(error)

      expect(result.statusCode).toBe(400)
      expect(result.body).toBeInstanceOf(ZodError)
    })
  })

  describe('ServerError', () => {
    test('Should return a ZodError if is a generic error is used', () => {
      const message = 'Server error'
      const error = new Error(message)
      const path = 'path'

      const result = serverError(error, path)

      expect(result.statusCode).toBe(500)
      expect(result.body).toBeInstanceOf(ZodError)
    })

    test('Should return a Generic StackTrack if generic error not have a stack', () => {
      const message = 'Server error'
      const path = 'path'

      const result = serverError(message, path)

      const body = result.body as ZodError
      const customIssue = body.issues[0] as ZodCustomIssue

      expect(result.statusCode).toBe(500)
      expect(result.body).toBeInstanceOf(ZodError)
      expect(customIssue.params?.stack).toBe('No stack trace available')
    })

    test('Should return a ZodError if is a ZodError is used', () => {
      const path = 'path'
      const error = new ZodError([
        {
          message: 'Error message',
          code: 'custom',
          path: [path],
          fatal: true,
          params: {},
        },
      ])

      const result = serverError(error, path)

      expect(result.statusCode).toBe(500)
      expect(result.body).toBeInstanceOf(ZodError)
      expect(result.body).toMatchObject(error)
    })
  })

  test('Should return statusCode 200 and data if is ok', () => {
    const data = {
      hello: 'world',
    }

    const result = ok(data)

    expect(result.statusCode).toBe(200)
    expect(result.body).toEqual(data)
  })

  test('Should return statusCode 204 and null if noContent', () => {
    const result = noContent()

    expect(result.statusCode).toBe(204)
    expect(result.body).toBeNull()
  })
})
