import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { beforeEach, describe, expect, test } from 'vitest'
import { upload } from '../upload'
import app from '@/main/config/app'

describe('Upload Middleware', () => {
  const testFilePath = path.join(__dirname, 'test_file.txt')

  beforeAll(() => {
    app.post('/upload', upload.single('file'), (req, res) => {
      const statusCode = req.file ? 200 : 400

      res.status(statusCode).json({ filename: req.file?.filename })
    })
  })

  afterAll(() => {
    // Clean up the test file after tests
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath)
    }
  })

  beforeEach(() => {
    fs.writeFileSync(testFilePath, 'test content')
  })

  test('should upload a file successfully', async () => {
    const res = await request(app).post('/upload').attach('file', testFilePath)

    expect(res.status).toBe(200)
    expect(res.body.filename).toMatch(/^file-\d+-\d+\.txt$/)
  })

  test('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/upload')
    expect(res.status).toBe(400)
  })
})
