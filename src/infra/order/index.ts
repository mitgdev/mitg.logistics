import {
  OrdersFiltersSchema,
  ProcessedOrderSchema,
  type OrderLayout,
  type OrdersFilters,
  type ProcessedOrder,
  type ProtocolOrder,
  type UserOrder,
} from '@/data/protocols/order'
import { z, ZodError } from 'zod'

export class OrderClient implements ProtocolOrder {
  processRaw(
    contents: string[],
    layout: OrderLayout,
  ): ProcessedOrder[] | ZodError {
    const processedOrders: ProcessedOrder[] = []

    if (!contents || contents.length === 0) {
      return new ZodError([
        {
          code: 'invalid_type',
          expected: 'array',
          received: 'undefined',
          message: 'The content is required and cannot be empty',
          path: [],
          fatal: true,
        },
      ])
    }

    if (!layout || layout.length === 0) {
      return new ZodError([
        {
          code: 'invalid_type',
          expected: 'array',
          received: 'undefined',
          message: 'The layout is required and cannot be empty',
          path: [],
          fatal: true,
        },
      ])
    }

    for (const content of contents) {
      const lines = content.split('\n')

      for (const line of lines) {
        const payload: Record<string, unknown> = {}

        if (line.trim() === '') {
          continue
        }

        for (const layoutItem of layout) {
          const { start, end, pad, type, fieldName } = layoutItem

          const field = line.substring(start, end).trim()

          if (type === 'number') {
            payload[fieldName] = parseInt(field.padStart(end - start, pad), 10)
          }

          if (type === 'string') {
            payload[fieldName] = field.padEnd(end - start, pad).trim()
          }

          if (type === 'decimal') {
            payload[fieldName] = parseFloat(field.replace(',', '.'))
          }

          if (type === 'date') {
            const year = field.substring(0, 4)
            const month = field.substring(4, 6)
            const day = field.substring(6, 8)
            payload[fieldName] = new Date(`${year}-${month}-${day}`)
          }
        }

        processedOrders.push(payload as ProcessedOrder)
      }
    }

    const parsedPayload = z
      .array(ProcessedOrderSchema)
      .safeParse(processedOrders)

    if (!parsedPayload.success) {
      return parsedPayload.error
    }

    return parsedPayload.data
  }

  group(processedOrders: ProcessedOrder[]): UserOrder[] | ZodError {
    const processedOrdersIsValid = z
      .array(ProcessedOrderSchema)
      .safeParse(processedOrders)

    if (!processedOrdersIsValid.success) {
      return processedOrdersIsValid.error
    }

    const userOrdersMap = new Map<
      number,
      {
        user_id: number
        user_name: string
        orders: Map<
          number,
          {
            order_id: number
            total: number
            date: string
            products: Array<{
              product_id: number
              value: number
            }>
          }
        >
      }
    >()

    for (const order of processedOrders) {
      const { userId, orderId, productId, purchaseDate, userName, value } =
        order

      if (!userOrdersMap.has(userId)) {
        userOrdersMap.set(userId, {
          user_id: userId,
          user_name: userName,
          orders: new Map(),
        })
      }

      const user = userOrdersMap.get(userId)!

      if (!user.orders.has(orderId)) {
        user.orders.set(orderId, {
          order_id: orderId,
          total: 0,
          date: `${purchaseDate.getFullYear()}-${(purchaseDate.getMonth() + 1)
            .toString()
            .padStart(
              2,
              '0',
            )}-${purchaseDate.getDate().toString().padStart(2, '0')}`,
          products: [],
        })
      }

      const orderGroup = user.orders.get(orderId)!

      orderGroup.total += value

      orderGroup.products.push({
        product_id: productId,
        value: value,
      })
    }

    const userOrders: UserOrder[] = []

    userOrdersMap.forEach((user) => {
      const orders = Array.from(user.orders.values())

      userOrders.push({
        user_id: user.user_id,
        user_name: user.user_name,
        orders: orders,
      })
    })

    return userOrders
  }

  verifyFilters(filters: Record<string, unknown>): OrdersFilters | ZodError {
    if (filters?.startDate == '' || filters?.endDate == '') {
      return new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'startDate or endDate cannot be empty strings',
          path: ['startDate', 'endDate'],
          fatal: true,
        },
      ])
    }

    const parsedFilters = OrdersFiltersSchema.safeParse(filters)

    if (!parsedFilters.success) {
      return parsedFilters.error
    }

    return parsedFilters.data
  }

  getOrderById(id: number, orders: UserOrder[]): UserOrder | undefined {
    for (const userOrder of orders) {
      const order = userOrder.orders.find((o) => o.order_id === id)

      if (order) {
        return {
          user_id: userOrder.user_id,
          user_name: userOrder.user_name,
          orders: [
            {
              order_id: order.order_id,
              total: order.total,
              date: order.date,
              products: order.products,
            },
          ],
        }
      }
    }
    return undefined
  }

  getOrderBetweenDates(
    startDate: Date,
    endDate: Date,
    userOrders: UserOrder[],
  ): UserOrder[] {
    return userOrders
      .map((userOrder) => {
        const orders = userOrder.orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate >= startDate && orderDate <= endDate
        })

        if (orders.length === 0) {
          return undefined
        }

        return {
          user_id: userOrder.user_id,
          user_name: userOrder.user_name,
          orders: orders,
        }
      })
      .filter((userOrder) => userOrder !== undefined) as UserOrder[]
  }
}
