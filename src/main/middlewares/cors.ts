import { env } from '@/environment'
import pCors from 'cors'

export const cors = pCors({
  origin: env.CORS_ORIGIN,
  credentials: true,
})
