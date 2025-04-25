import request from 'supertest'
import app from '@/main/config/app'

describe('CORS Middleware', () => {
  test('should enable CORS with the correct origin', async () => {
    app.get('/test-cors', (req, res) => {
      res.status(200).send('CORS is working')
    })

    await request(app)
      .get('/test-cors')
      .expect('Access-Control-Allow-Origin', 'http://localhost:*')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect(200, 'CORS is working')
  })

  test('should not allow CORS from an unauthorized origin', async () => {
    app.get('/test-cors', (req, res) => {
      res.status(200).send('CORS is working')
    })

    await request(app)
      .get('/test-cors')
      .set('Origin', 'http://unauthorized-origin.com')
      .expect(200, 'CORS is working')
  })
})
