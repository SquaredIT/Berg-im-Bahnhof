import 'dotenv/config'
import express from 'express'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify SMTP connection on startup
transporter.verify().then(() => {
  console.log('SMTP connection verified')
}).catch((err) => {
  console.error('SMTP connection error:', err.message)
})

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { services, projectType, areaSize, timeframe, message, firstName, lastName, email, phone, address } = req.body

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Name und E-Mail sind Pflichtfelder.' })
  }

  const serviceList = Array.isArray(services) ? services.join(', ') : services || 'Keine Angabe'

  const htmlBody = `
    <h2>Neue Anfrage über die Website</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Leistungen</td><td style="padding:8px;border:1px solid #ddd;">${serviceList}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">E-Mail</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
      ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Telefon</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>` : ''}
      ${address ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Adresse</td><td style="padding:8px;border:1px solid #ddd;">${address}</td></tr>` : ''}
      ${projectType ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Objektart</td><td style="padding:8px;border:1px solid #ddd;">${projectType}</td></tr>` : ''}
      ${areaSize ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Fläche</td><td style="padding:8px;border:1px solid #ddd;">${areaSize} m²</td></tr>` : ''}
      ${timeframe ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Zeitraum</td><td style="padding:8px;border:1px solid #ddd;">${timeframe}</td></tr>` : ''}
      ${message ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Beschreibung</td><td style="padding:8px;border:1px solid #ddd;">${message}</td></tr>` : ''}
    </table>
  `

  try {
    await transporter.sendMail({
      from: `"Berg im Bahnhof Website" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.MAIL_TO,
      cc: process.env.MAIL_CC,
      subject: `Neue Anfrage über Website: ${serviceList}`,
      html: htmlBody,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Mail error:', err.message)
    res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden.' })
  }
})

// Serve static build
app.use(express.static(join(__dirname, 'dist')))

// SPA fallback for subpages
app.get('/pages/:page', (req, res) => {
  const page = join(__dirname, 'dist', 'pages', req.params.page)
  res.sendFile(page)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
