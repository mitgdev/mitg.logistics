import request from 'supertest'
import { setupRoutes } from './routes'
import app from './app'

describe('setupRoutes', () => {
  it('should register routes under /api', async () => {
    setupRoutes(app)

    // Wait a tick for dynamic imports to resolve
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Example: test a known route, e.g., /api/orders
    const res = await request(app).post('/api/orders').send({})

    // Adjust the assertion below to match your actual route/controller response
    expect(res.status).not.toBe(404)
  })
})
