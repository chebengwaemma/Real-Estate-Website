import { config } from '../config.js'

export function requireMailApiSecret(req, res, next) {
  const secret = config.mailApiSecret
  if (!secret) {
    return res.status(503).json({ error: 'Mail API is not configured.' })
  }

  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized.' })
  }

  return next()
}
