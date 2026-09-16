import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const CONTACT_RECIPIENT = 'aravm0720@utexas.edu'
const ALLOWED_ROLES = new Set(['Provider', 'Clinic', 'Insurer', 'Family'])
const CONFIRMATION_MESSAGES: Record<string, string> = {
  Provider: 'A clinical specialist will reach out within one business day.',
  Clinic: 'An implementation specialist will reach out within one business day.',
  Insurer: 'A coverage specialist will reach out within one business day.',
  Family: 'A family support specialist will reach out within one business day.',
}

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : ''
    const organization = typeof body.organization === 'string' ? body.organization.trim().slice(0, 200) : ''
    const submittedRole = typeof body.role === 'string' ? body.role.trim() : ''
    const role = ALLOWED_ROLES.has(submittedRole) ? submittedRole : ''

    if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid name and email.' }, { status: 400 })
    }

    const port = Number(process.env.SMTP_PORT ?? 465)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: requiredEnvironmentVariable('SMTP_USER'),
        pass: requiredEnvironmentVariable('SMTP_PASSWORD'),
      },
    })

    const from = process.env.SMTP_FROM ?? requiredEnvironmentVariable('SMTP_USER')

    await Promise.all([
      transporter.sendMail({
        from,
        to: CONTACT_RECIPIENT,
        replyTo: email,
        subject: `VisionWheel ${role || 'contact'} request from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Audience: ${role || 'Not specified'}`,
          `Organization: ${organization || 'Not provided'}`,
        ].join('\n'),
      }),
      transporter.sendMail({
        from,
        to: email,
        subject: 'We received your VisionWheel request',
        text: [
          `Hi ${name},`,
          '',
          'Thanks for contacting VisionWheel. We received your request.',
          CONFIRMATION_MESSAGES[role] ?? 'A member of our team will reach out within one business day.',
          '',
          '— The VisionWheel team',
        ].join('\n'),
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unable to send contact email:', error)
    return NextResponse.json({ error: 'Unable to send your request right now.' }, { status: 500 })
  }
}
