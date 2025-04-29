import type { Context } from '@/presentation/protocols/http'
import { OrdersRouter } from '.'
import { FileClient } from '@/infra/file'
import { OrderClient } from '@/infra/order'

const makeSut = () => {
  const sut = new OrdersRouter()
  return {
    sut,
  }
}

const makeCtx = (): Context => {
  return {
    headers: {},
    method: 'GET',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: vitest.mocked({} as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: vitest.mocked({} as any),
    url: '/orders',
    body: {},
    clients: {
      file: vi.mocked(new FileClient()), // Mock FileClient
      order: vi.mocked(new OrderClient()), // Mock OrderClient
    },
  }
}

describe('OrdersController', () => {
  test('should be able to create an instance of OrdersRouter', () => {
    const { sut } = makeSut()
    expect(sut).toBeInstanceOf(OrdersRouter)
  })

  test('should call handle method with correct parameters', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    const handleSpy = vi.spyOn(sut, 'handle')
    await sut.handle(ctx)

    expect(handleSpy).toHaveBeenCalledWith(ctx)
  })

  test('should return 400 if filters are invalid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {
      startDate: 'invalid-date',
      endDate: 'invalid-date',
      orderId: 'invalid-order-id',
    }

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 if files are invalid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = [
      {
        fieldname: 'file',
        originalname: 'invalid-file.txt',
        encoding: 'utf-8',
        mimetype: 'text/plain',
        buffer: Buffer.from(''),
        size: 0,
        destination: '',
        filename: 'invalid-file.txt',
        path: '',
        stream: {} as unknown as Express.Multer.File['stream'],
      },
    ]

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })
})
