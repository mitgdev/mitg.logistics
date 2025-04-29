import { FileClient } from '@/infra/file'
import { OrderClient } from '@/infra/order'

export class Clients {
  private static instance: Clients
  public file: FileClient
  public order: OrderClient

  private constructor() {
    this.file = new FileClient()
    this.order = new OrderClient()
  }

  public static getInstance(): Clients {
    if (!Clients.instance) {
      Clients.instance = new Clients()
    }
    return Clients.instance
  }
}

export const clients = Clients.getInstance()
