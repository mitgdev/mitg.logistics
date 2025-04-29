import type { AvailableMimeType, ProtocolFile } from '@/data/protocols/file'
import { ZodError } from 'zod'
import fs from 'fs'

export class FileClient implements ProtocolFile {
  verify(
    availableMimetype: Array<'text/plain'>,
    files?: Array<Express.Multer.File>,
  ): Array<Express.Multer.File> | ZodError {
    if (!files) {
      return new ZodError([
        {
          message: 'Files is required',
          code: 'invalid_type',
          expected: 'array',
          received: 'undefined',
          path: ['files'],
          fatal: false,
        },
      ])
    }

    const anyFileHasIncorrectMimeType = files.find((file) => {
      const isCorrectMimeType = availableMimetype.includes(
        file.mimetype as AvailableMimeType,
      )
      return !isCorrectMimeType
    })

    if (anyFileHasIncorrectMimeType) {
      return new ZodError([
        {
          message: 'Invalid file type',
          code: 'invalid_literal',
          expected: 'text/plain',
          path: ['files'],
          received: anyFileHasIncorrectMimeType.mimetype,
          fatal: false,
        },
      ])
    }

    return files
  }

  read(files: Array<Express.Multer.File>): string[] {
    const content: string[] = []

    for (const file of files) {
      const fileContent = fs.readFileSync(file.path, 'utf-8')

      content.push(fileContent)
    }

    return content
  }
}
