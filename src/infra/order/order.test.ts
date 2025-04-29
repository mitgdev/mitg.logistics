import { ZodError } from 'zod'
import { OrderClient } from '.'
import {
  OrdersFiltersSchema,
  type OrderLayout,
  type ProcessedOrder,
  type UserOrder,
} from '@/data/protocols/order'

const makeSut = () => {
  return new OrderClient()
}

const orderLayout: OrderLayout = [
  { fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'number' },
  { fieldName: 'userName', start: 10, end: 55, pad: ' ', type: 'string' },
  { fieldName: 'orderId', start: 55, end: 65, pad: '0', type: 'number' },
  { fieldName: 'productId', start: 65, end: 75, pad: '0', type: 'number' },
  { fieldName: 'value', start: 75, end: 87, pad: ' ', type: 'decimal' },
  { fieldName: 'purchaseDate', start: 87, end: 95, pad: '0', type: 'date' },
]

describe('Order Client', () => {
  describe('processRaw()', () => {
    test('should return a ZodError if file is undefined', () => {
      const sut = makeSut()

      const result = sut.processRaw([], [])

      const errorTyped = result as ZodError

      expect(errorTyped).toBeInstanceOf(ZodError)
      expect(errorTyped.issues[0].message).toBe(
        'The content is required and cannot be empty',
      )
    })

    test('should return a ZodError if layout is undefined', () => {
      const sut = makeSut()

      const result = sut.processRaw([''], [])

      const errorTyped = result as ZodError

      expect(errorTyped).toBeInstanceOf(ZodError)
      expect(errorTyped.issues[0].message).toBe(
        'The layout is required and cannot be empty',
      )
    })

    test('should return an empty array if file is empty', () => {
      const sut = makeSut()

      const result = sut.processRaw([''], orderLayout)

      expect(result).not.toBeInstanceOf(ZodError)
      expect(result).toEqual([])
    })

    test('should return a ZodError if layout is invalid', () => {
      const sut = makeSut()

      const resultNumber = sut.processRaw(
        ['valid content'],
        [{ fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'number' }],
      )

      const resultString = sut.processRaw(
        ['valid content'],
        [{ fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'string' }],
      )
      const resultDecimal = sut.processRaw(
        ['valid content'],
        [{ fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'decimal' }],
      )

      const resultDate = sut.processRaw(
        ['valid content'],
        [{ fieldName: 'userId', start: 0, end: 10, pad: '0', type: 'date' }],
      )

      expect(resultNumber).toBeInstanceOf(ZodError)
      expect(resultString).toBeInstanceOf(ZodError)
      expect(resultDecimal).toBeInstanceOf(ZodError)
      expect(resultDate).toBeInstanceOf(ZodError)
    })
  })

  describe('group()', () => {
    test('should return a grouped object by userId', () => {
      const sut = makeSut()

      const date = new Date('2024-01-01')
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

      const processedOrders: ProcessedOrder[] = [
        {
          userId: 1,
          userName: 'Alice',
          orderId: 10,
          productId: 100,
          value: 50.0,
          purchaseDate: date,
        },
        {
          userId: 1,
          userName: 'Alice',
          orderId: 11,
          productId: 101,
          value: 60.0,
          purchaseDate: date,
        },
        {
          userId: 2,
          userName: 'Bob',
          orderId: 12,
          productId: 102,
          value: 70.0,
          purchaseDate: date,
        },
      ]

      const grouped = sut.group(processedOrders)

      expect(grouped).not.toBeInstanceOf(ZodError)

      const groupedTyped = grouped as UserOrder[]

      expect(groupedTyped).not.toBeInstanceOf(ZodError)
      expect(groupedTyped).toEqual([
        {
          user_id: 1,
          user_name: 'Alice',
          orders: [
            {
              order_id: 10,
              total: 50.0,
              date: formattedDate,
              products: [{ product_id: 100, value: 50.0 }],
            },
            {
              order_id: 11,
              total: 60.0,
              date: formattedDate,
              products: [{ product_id: 101, value: 60.0 }],
            },
          ],
        },
        {
          user_id: 2,
          user_name: 'Bob',
          orders: [
            {
              order_id: 12,
              total: 70.0,
              date: formattedDate,
              products: [{ product_id: 102, value: 70.0 }],
            },
          ],
        },
      ])
    })

    test('should return a empty array if process order ir empty', () => {
      const sut = makeSut()

      const processedOrders: ProcessedOrder[] = []

      const grouped = sut.group(processedOrders)

      expect(grouped).not.toBeInstanceOf(ZodError)

      const groupedTyped = grouped as UserOrder[]

      expect(groupedTyped).toEqual([])
    })

    test('should return a ZodError if processedOrders is incorrect', () => {
      const sut = makeSut()

      const processedOrders = [
        {
          orderId: '2',
        },
      ] as unknown as ProcessedOrder[]

      const result = sut.group(processedOrders)

      expect(result).toBeInstanceOf(ZodError)
    })

    test('should return a ZodError if UserOrder has any incorrect properties', () => {
      const sut = makeSut()

      const processedOrders = [
        {
          userId: 1,
          userName: 'Alice',
          orderId: 10,
          productId: 100,
          value: '50.0' as unknown as number,
          purchaseDate: new Date('2024-01-01'),
        },
      ] as unknown as ProcessedOrder[]

      const result = sut.group(processedOrders)

      expect(result).toBeInstanceOf(ZodError)
    })
  })

  describe('verifyFilters()', () => {
    test('should return a ZodError if startDate or endDate is a empty string', () => {
      const sut = makeSut()

      const result = sut.verifyFilters({
        startDate: '',
        endDate: '',
      })

      expect(result).toBeInstanceOf(ZodError)
    })

    test('should return a ZodError if startDate or endDate is a invalid date', () => {
      const sut = makeSut()

      const result = sut.verifyFilters({
        startDate: 'invalid date',
        endDate: 'invalid date',
      })

      expect(result).toBeInstanceOf(ZodError)
    })

    test('should return a ZodError if orderId is not a number', () => {
      const sut = makeSut()

      const result = sut.verifyFilters({
        orderId: 'invalid orderId',
      })

      expect(result).toBeInstanceOf(ZodError)
    })

    test('should error if only startDate is provided', () => {
      const result = OrdersFiltersSchema.safeParse({ startDate: '2024-01-01' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              'Both startDate and endDate are required if one is provided',
          ),
        ).toBe(true)
      }
    })

    test('should error if only endDate is provided', () => {
      const result = OrdersFiltersSchema.safeParse({ endDate: '2024-01-01' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              'Both startDate and endDate are required if one is provided',
          ),
        ).toBe(true)
      }
    })

    test('should error if startDate is after endDate', () => {
      const result = OrdersFiltersSchema.safeParse({
        startDate: '2024-02-01',
        endDate: '2024-01-01',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError)
        expect(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              'startDate must be less than or equal to endDate',
          ),
        ).toBe(true)
      }
    })

    test('should pass if startDate is equal to endDate', () => {
      const result = OrdersFiltersSchema.safeParse({
        startDate: '2024-01-01',
        endDate: '2024-01-01',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startDate).toEqual(new Date('2024-01-01'))
        expect(result.data.endDate).toEqual(new Date('2024-01-01'))
      }
    })

    test('should pass if startDate is before endDate', () => {
      const result = OrdersFiltersSchema.safeParse({
        startDate: '2024-01-01',
        endDate: '2024-02-01',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.startDate).toEqual(new Date('2024-01-01'))
        expect(result.data.endDate).toEqual(new Date('2024-02-01'))
      }
    })

    test('should transform a numeric string orderId to number', () => {
      const result = OrdersFiltersSchema.safeParse({ orderId: '123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.orderId).toBe(123)
      }
    })
  })

  describe('getOrderBetweenDates()', () => {
    test('should return a user order between dates', () => {
      const sut = makeSut()

      const date = new Date('2024-01-01')

      const processedOrders: ProcessedOrder[] = [
        {
          userId: 1,
          userName: 'Alice',
          orderId: 10,
          productId: 100,
          value: 50.0,
          purchaseDate: date,
        },
        {
          userId: 2,
          userName: 'Bob',
          orderId: 11,
          productId: 101,
          value: 60.0,
          purchaseDate: new Date('2024-01-02'),
        },
      ]

      const grouped = sut.group(processedOrders) as UserOrder[]

      const result = sut.getOrderBetweenDates(date, date, grouped)

      console.log('result', result)

      expect(result).not.toBeInstanceOf(ZodError)
      expect(result).toMatchObject([
        {
          user_id: 2,
          user_name: 'Bob',
          orders: [
            {
              order_id: 11,
              total: 60.0,
              date: '2024-01-01',
              products: [{ product_id: 101, value: 60.0 }],
            },
          ],
        },
      ])
    })

    test('should return a empty array if no orders are found', () => {
      const sut = makeSut()

      const date = new Date('2024-01-01')

      const processedOrders: ProcessedOrder[] = [
        {
          userId: 1,
          userName: 'Alice',
          orderId: 10,
          productId: 100,
          value: 50.0,
          purchaseDate: date,
        },
        {
          userId: 2,
          userName: 'Bob',
          orderId: 11,
          productId: 101,
          value: 60.0,
          purchaseDate: new Date('2024-01-02'),
        },
      ]

      const grouped = sut.group(processedOrders) as UserOrder[]

      const result = sut.getOrderBetweenDates(
        new Date('2024-01-03'),
        new Date('2024-01-04'),
        grouped,
      )

      expect(result).not.toBeInstanceOf(ZodError)
      expect(result).toEqual([])
    })
  })

  describe('getOrderById()', () => {
    const date = new Date('2024-01-01')

    const processedOrders: ProcessedOrder[] = [
      {
        userId: 1,
        userName: 'Alice',
        orderId: 10,
        productId: 100,
        value: 50.0,
        purchaseDate: date,
      },
      {
        userId: 2,
        userName: 'Bob',
        orderId: 11,
        productId: 101,
        value: 60.0,
        purchaseDate: new Date('2024-01-02'),
      },
    ]

    test('should return a user order by id', () => {
      const sut = makeSut()

      const grouped = sut.group(processedOrders) as UserOrder[]

      const result = sut.getOrderById(11, grouped)

      expect(result).not.toBeInstanceOf(ZodError)
      expect(result).toMatchObject({
        user_id: 2,
        user_name: 'Bob',
        orders: [
          {
            order_id: 11,
            total: 60.0,
            date: '2024-01-01',
            products: [{ product_id: 101, value: 60.0 }],
          },
        ],
      })
    })

    test('should return a empty array if no orders are found', () => {
      const sut = makeSut()

      const grouped = sut.group(processedOrders) as UserOrder[]

      const result = sut.getOrderById(12, grouped)

      expect(result).toBe(undefined)
    })
  })
})
