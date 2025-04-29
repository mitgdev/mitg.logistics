import { ZodError } from 'zod'
import { OrderClient } from '.'
import type {
  OrderLayout,
  ProcessedOrder,
  UserOrder,
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
})
