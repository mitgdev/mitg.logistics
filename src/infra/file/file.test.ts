import { ZodError } from 'zod'
import { FileClient } from '.'
import fs from 'fs'

const makeSut = () => {
  return new FileClient()
}

describe('File Client', () => {
  describe('verify()', () => {
    test('should return a ZodError if file is undefined', () => {
      const sut = makeSut()
      const files = sut.verify(['text/plain'], undefined)

      expect(files).toBeInstanceOf(ZodError)

      const error = files as ZodError

      expect(error.issues[0].message).toBe('Files is required')
    })

    test('should return a ZodError if file is not in the available mimetype', () => {
      const sut = makeSut()
      const files = [
        {
          mimetype: 'application/json',
        } as Express.Multer.File,
      ]

      const result = sut.verify(['text/plain'], files)

      expect(result).toBeInstanceOf(ZodError)

      const error = result as ZodError

      expect(error.issues[0].message).toBe('Invalid file type')
    })

    test('should return the file if it is in the available mimetype', () => {
      const sut = makeSut()
      const files = [
        {
          mimetype: 'text/plain',
        },
      ] as Express.Multer.File[]

      const result = sut.verify(['text/plain'], files)

      expect(result).toEqual(files)
    })
  })

  describe('read()', () => {
    test('should read the file content', () => {
      const sut = makeSut()
      const files = [
        {
          mimetype: 'text/plain',
        },
      ] as Express.Multer.File[]
      const readFileSyncSpy = vitest
        .spyOn(fs, 'readFileSync')
        .mockReturnValue('file content')
      const result = sut.read(files)
      expect(result).toStrictEqual(['file content'])
      expect(readFileSyncSpy).toHaveBeenCalledWith(files[0].path, 'utf-8')
      readFileSyncSpy.mockRestore()
    })

    test('should throw an error if readFileSync throws', () => {
      const sut = makeSut()
      const files = [
        { path: '/fake/path', mimetype: 'text/plain' } as Express.Multer.File,
      ] as Express.Multer.File[]

      vitest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Error reading file')
      })

      expect(() => sut.read(files)).toThrow('Error reading file')
    })
  })
})
