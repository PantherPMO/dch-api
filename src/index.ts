import { Hono } from 'hono'
import { logger } from "hono/logger"
import { cors } from 'hono/cors'
import 'dotenv/config'
import connectDB from './db/index'
import artifactRoutes from './modules/artifact/artifact.routes'
import exhibitionRoutes from './modules/exhibition/exhibition.routes'
import voiceRoutes from './modules/voice/voice.routes'


const app = new Hono()

app.use('*', logger())
// Cors Configuration
app.use(cors({
  origin: ['http://localhost:8080', 'https://voicedch.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposeHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))


connectDB()

const port = process.env.PORT || 3000


app.get('/', (c) => {
  return c.text('Hello DCH!')
})

app.route('/api/artifacts', artifactRoutes)
app.route('/api/exhibitions', exhibitionRoutes)
app.route('/api/voice-command', voiceRoutes)

console.log(`

	🟢 Server is running on port ${port}

		📅 ${new Date().toLocaleDateString()} 
		⌚ ${new Date().toLocaleTimeString()}

`)


export default {
  port,
  fetch: app.fetch,
}
