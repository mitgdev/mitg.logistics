import { FileClient } from '@/infra/file/file'

export class Clients {
  private static instance: Clients
  public file: FileClient

  private constructor() {
    this.file = new FileClient()
  }

  public static getInstance(): Clients {
    if (!Clients.instance) {
      Clients.instance = new Clients()
    }
    return Clients.instance
  }
}

export const clients = Clients.getInstance()
