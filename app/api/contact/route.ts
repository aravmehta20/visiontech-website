import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const CONTACT_RECIPIENT = 'aravm0720@utexas.edu'
const ALLOWED_ROLES = new Set(['Provider', 'Clinic', 'Insurer', 'Family'])

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

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? requiredEnvironmentVariable('SMTP_USER'),
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `VisionWheel ${role || 'contact'} request from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Audience: ${role || 'Not specified'}`,
        `Organization: ${organization || 'Not provided'}`,
      ].join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unable to send contact email:', error)
    return NextResponse.json({ error: 'Unable to send your request right now.' }, { status: 500 })
  }
}
