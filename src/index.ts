import { env } from './environment'

async function main() {
  const app = (await import('@/main/config/app')).default

  const server = app.listen(env.PORT, () => {
    console.log(
      `Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`,
    )
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
}

main().catch((error) => {
  console.error('Error starting the server:', error)
  process.exit(1)
})
