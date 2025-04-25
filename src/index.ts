import { app } from '@/server'

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000')
  console.log('http://localhost:3000')
  console.log('Press Ctrl+C to stop the server')
})

const onCloseSignal = () => {
  console.log('Received shutdown signal, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit()
  })

  setTimeout(() => process.exit(1), 10000).unref() // Force shutdown after 10s
}

process.on('SIGINT', onCloseSignal)
process.on('SIGTERM', onCloseSignal)
