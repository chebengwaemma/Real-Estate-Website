import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { verifySmtpConnection } from './services/emailService.js'
import routes from './routes/routes.js'

const app = express()

app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((v) => v.trim()),
    methods: ['GET', 'POST', 'OPTIONS'],
  }),
)
app.use(express.json({ limit: '32kb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'hopeland-mail-server' })
})

app.use('/api', routes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(config.port, async () => {
  try {
    await verifySmtpConnection()
    console.log(`Mail server listening on port ${config.port}`)
    console.log(`SMTP: ${config.smtp.host}:${config.smtp.port} as ${config.smtp.user}`)
  } catch (err) {
    console.error('SMTP verification failed — check .env (SMTP_HOST, SMTP_USER, SMTP_PASS)')
    console.error(err)
    process.exit(1)
  }
})
