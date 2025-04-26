import type { ZodError } from 'zod'

export type AvailableMimeType = 'text/plain'

export interface ProtocolFile {
  verify: (
    availableMimetype: Array<AvailableMimeType>,
    files?: Array<Express.Multer.File>,
  ) => Array<Express.Multer.File> | ZodError
  read: (files: Array<Express.Multer.File>) => string[]
}
