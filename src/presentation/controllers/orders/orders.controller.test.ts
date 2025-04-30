import type { Context } from '@/presentation/protocols/http'
import { OrdersRouter } from '.'
import { FileClient } from '@/infra/file'
import { OrderClient } from '@/infra/order'
import { ZodError } from 'zod'

const makeSut = () => {
  const sut = new OrdersRouter()
  return {
    sut,
  }
}

const makeFileClientStub = (): FileClient => {
  class FileClientStub extends FileClient {
    verify = vi.fn().mockReturnValue([])
    read = vi.fn().mockReturnValue([])
  }

  return new FileClientStub()
}

const makeOrderClientStub = (): OrderClient => {
  class OrderClientStub extends OrderClient {
    verifyFilters = vi.fn().mockReturnValue({})
    processRaw = vi.fn().mockReturnValue([])
    group = vi.fn().mockReturnValue([])
    getOrderBetweenDates = vi.fn().mockReturnValue([])
  }

  return new OrderClientStub()
}

const files = [
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
      file: makeFileClientStub(),
      order: makeOrderClientStub(),
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

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue(new ZodError([]))

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 if files are invalid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = files

    ctx.clients.file.verify = vi.fn().mockReturnValue(new ZodError([]))

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 if processRaw is invalid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = files

    ctx.clients.order.processRaw = vi.fn().mockReturnValue(new ZodError([]))

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })

  test('should return 400 if group is invalid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = files

    ctx.clients.order.group = vi.fn().mockReturnValue(new ZodError([]))

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(400)
  })

  test('should return 200 if filters startDate and endDate are valid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    }

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue({
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
    })

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
  })

  test('should return 200 if filters orderId is valid', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {
      orderId: 'valid-order-id',
    }

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue({
      orderId: 'valid-order-id',
    })

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
  })

  test('should return 200 if filters are empty', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {}

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue({})

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
  })

  test('should return 500 if an unexpected error occurs', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = files

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockImplementation(() => {
      throw new Error('Unexpected error')
    })
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(500)
  })

  test('should return empty data if no orders are found for the given orderId', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {
      orderId: 'non-existing-order-id',
    }

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue({
      orderId: 'non-existing-order-id',
    })

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    ctx.clients.order.getOrderById = vi.fn().mockReturnValue(undefined)

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      data: [],
    })
  })

  test('should return a valid responde for a existing orderId', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.query = {
      orderId: 'non-existing-order-id',
    }

    ctx.clients.order.verifyFilters = vi.fn().mockReturnValue({
      orderId: 'non-existing-order-id',
    })

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    ctx.clients.order.getOrderById = vi.fn().mockReturnValue({})

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      data: [{}],
    })
  })

  test('should return 200 if everything is ok', async () => {
    const { sut } = makeSut()
    const ctx = makeCtx()

    ctx.req.files = files

    ctx.clients.file.verify = vi.fn().mockReturnValue(files)
    ctx.clients.file.read = vi.fn().mockReturnValue([])
    ctx.clients.order.processRaw = vi.fn().mockReturnValue([])
    ctx.clients.order.group = vi.fn().mockReturnValue([])

    const response = await sut.handle(ctx)

    expect(response.statusCode).toBe(200)
  })
})
