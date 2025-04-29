import z, { type ZodError } from 'zod'

export const ProcessedOrderSchema = z.object({
  userId: z.number(),
  userName: z.string(),
  orderId: z.number(),
  productId: z.number(),
  value: z.number(),
  purchaseDate: z.date(),
})

export const UserOrderSchema = z.object({
  user_id: z.number(),
  user_name: z.string(),
  orders: z.array(
    z.object({
      order_id: z.number(),
      total: z.number(),
      date: z.string(),
      products: z.array(
        z.object({
          product_id: z.number(),
          value: z.number(),
        }),
      ),
    }),
  ),
})

export const OrdersFiltersSchema = z
  .object({
    orderId: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: 'orderId must be a number',
      })
      .transform((val) => (val ? Number(val) : undefined)),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'startDate must be a valid date string',
      })
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'endDate must be a valid date string',
      })
      .transform((val) => (val ? new Date(val) : undefined)),
  })
  .refine(
    (data) => {
      return (
        (!data.startDate && !data.endDate) || (data.startDate && data.endDate)
      )
    },
    {
      message: 'Both startDate and endDate are required if one is provided',
      path: ['startDate', 'endDate'],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate
      }
      return true
    },
    {
      message: 'startDate must be less than or equal to endDate',
      path: ['startDate', 'endDate'],
    },
  )

export type OrderLayout = Array<{
  fieldName: string
  start: number
  end: number
  pad: string
  type: 'string' | 'number' | 'date' | 'decimal'
}>

export type UserOrder = z.infer<typeof UserOrderSchema>

export type ProcessedOrder = z.infer<typeof ProcessedOrderSchema>

export type OrdersFilters = z.infer<typeof OrdersFiltersSchema>

export interface ProtocolOrder {
  verifyFilters: (filter: Record<string, unknown>) => OrdersFilters | ZodError
  processRaw: (
    contents: string[],
    layout: OrderLayout,
  ) => ProcessedOrder[] | ZodError
  group: (processedOrders: ProcessedOrder[]) => UserOrder[] | ZodError
  getOrderById: (id: number, orders: UserOrder[]) => UserOrder | undefined
  getOrderBetweenDates: (
    startDate: Date,
    endDate: Date,
    orders: UserOrder[],
  ) => UserOrder[]
}
