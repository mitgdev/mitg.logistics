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

export type OrderLayout = Array<{
  fieldName: string
  start: number
  end: number
  pad: string
  type: 'string' | 'number' | 'date' | 'decimal'
}>

export type UserOrder = z.infer<typeof UserOrderSchema>

export type ProcessedOrder = z.infer<typeof ProcessedOrderSchema>

export interface ProtocolOrder {
  processRaw: (
    contents: string[],
    layout: OrderLayout,
  ) => ProcessedOrder[] | ZodError
  group: (processedOrders: ProcessedOrder[]) => UserOrder[] | ZodError
}
