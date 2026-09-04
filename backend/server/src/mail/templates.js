import { config, formatFrom, formatUsdCents } from '../config.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout({ preheader, title, bodyHtml, ctaHref, ctaLabel }) {
  const preheaderText = escapeHtml(preheader)
  const siteUrl = config.siteUrl

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheaderText}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 55%,#0f172a 100%);padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.72);">Hopeland Global Checkers</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
              ${
                ctaHref && ctaLabel
                  ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="border-radius:999px;background:#2563eb;">
                    <a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
    Questions? Email <a href="mailto:admin@hcheckers.org" style="color:#2563eb;">admin@hcheckers.org</a><br />
                Atlanta, Georgia, USA — July 19–25, 2027
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;font-size:11px;color:#94a3b8;">© Hopeland Global Checkers · <a href="${escapeHtml(siteUrl)}" style="color:#64748b;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function registrationConfirmationHtml(reg, feeLabel) {
  const firstName = escapeHtml(reg.first_name)
  const lastName = escapeHtml(reg.last_name)
  const email = escapeHtml(reg.email)
  const country = escapeHtml(reg.country)
  const nationality = reg.nationality ? escapeHtml(reg.nationality) : ''
  const city = reg.city ? escapeHtml(reg.city) : ''

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">Dear <strong>${firstName} ${lastName}</strong>,</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      Thank you for registering with <strong>Hopeland Global Checkers</strong>. We are genuinely glad to welcome you
      into the championship community. Completing your registration is an important first step, and we appreciate
      the time and trust you have placed in us.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      Your place in the Hopeland Global Checkers World Championship has been received. Please do not worry about
      next steps just yet. <strong>Hopeland Checkers Admin will contact you</strong> directly from
      <a href="mailto:admin@hcheckers.org" style="color:#2563eb;">admin@hcheckers.org</a>
      with the information you need, including how we will stay in touch, what to expect before Atlanta, and any
      details we still need from you.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      Until then, keep this email for your records. Below is a short summary of the registration we have on file.
      If anything looks incorrect, reply to this message or write to us at
      <a href="mailto:admin@hcheckers.org" style="color:#2563eb;">admin@hcheckers.org</a> and we will correct it.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;margin:0 0 20px;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Registration on file</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Email:</strong> ${email}</p>
          ${city ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>City:</strong> ${city}</p>` : ''}
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Country:</strong> ${country}</p>
          ${nationality ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Nationality:</strong> ${nationality}</p>` : ''}
          <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Registration fee received:</strong> ${escapeHtml(feeLabel)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      The championship will take place in <strong>Atlanta, Georgia, USA, July 19–25, 2027</strong>. In the coming
      days and weeks, Hopeland Checkers Admin will reach out with guidance so you know exactly what comes next.
      Please watch your inbox (and your spam or promotions folder) for messages from
      <strong>admin@hcheckers.org</strong>.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      If you created a password during registration, you may sign in on our website with this same email address
      whenever you are ready. There is no rush. Our team will contact you personally.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:#334155;">
      Once again, thank you for registering. We are honoured to have you with us, and we look forward to being in
      touch soon.
    </p>
    <p style="margin:0;font-size:16px;line-height:1.8;color:#334155;">
      With appreciation,<br />
      <strong>Hopeland Checkers Admin</strong><br />
      Hopeland Global Checkers (Draughts) Federation<br />
      <a href="mailto:admin@hcheckers.org" style="color:#2563eb;">admin@hcheckers.org</a>
    </p>
  `

  return layout({
    preheader: `Thank you for registering. Hopeland Checkers Admin will contact you soon.`,
    title: 'Thank you for registering',
    bodyHtml,
    ctaHref: `${config.siteUrl}/account`,
    ctaLabel: 'Open my account',
  })
}

export function adminRegistrationNotifyHtml(reg, feeLabel) {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
      Someone just completed registration. Please follow up from <strong>admin@hcheckers.org</strong> so they hear from Hopeland Checkers Admin on time.
    </p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
      <strong>${escapeHtml(reg.first_name)} ${escapeHtml(reg.last_name)}</strong> is now on file. A thank-you email was sent to the player from this same mailbox.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Fee:</strong> ${escapeHtml(feeLabel)}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Email:</strong> ${escapeHtml(reg.email)}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Phone:</strong> ${escapeHtml(reg.phone || '—')}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>City:</strong> ${escapeHtml(reg.city || '—')}</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Country:</strong> ${escapeHtml(reg.country || '—')}</p>
        </td>
      </tr>
    </table>
  `

  return layout({
    preheader: `New paid registration: ${reg.first_name} ${reg.last_name}`,
    title: 'New paid registration',
    bodyHtml,
    ctaHref: `${config.siteUrl}/admin/registrations`,
    ctaLabel: 'Open admin dashboard',
  })
}

export function contactNotificationHtml({ name, email, message, phone = '' }) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')
  const safePhone = phone ? escapeHtml(phone) : ''

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">
      A new message was submitted through the website contact form.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${safePhone ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0f172a;"><strong>Phone:</strong> ${safePhone}</p>` : ''}
          <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">${safeMessage}</p>
        </td>
      </tr>
    </table>
  `

  return layout({
    preheader: `New contact message from ${name}`,
    title: 'New contact message',
    bodyHtml,
  })
}

export { formatUsdCents }
