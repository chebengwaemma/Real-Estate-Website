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
  console.log(`Starting mail server on port ${config.port}...`)
  console.log(`SMTP contact: ${config.smtp.host}:${config.smtp.port} as ${config.smtp.user}`)
  console.log(`SMTP admin: ${config.adminSmtp.host}:${config.adminSmtp.port} as ${config.adminSmtp.user}`)

  try {
    await verifySmtpConnection()
    console.log('All SMTP transporters verified — Hostinger connection OK')
    console.log(`Mail server listening on port ${config.port}`)
  } catch (err) {
    console.error('SMTP verification failed — check .env (SMTP_*, ADMIN_EMAIL, ADMIN_PASS)')
    console.error(err)
    process.exit(1)
  }
})
