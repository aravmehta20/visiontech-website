'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Reveal } from './reveal'

const ROLES = ['Provider', 'Clinic', 'Insurer', 'Family'] as const
type Role = (typeof ROLES)[number]

const ROLE_CONTENT: Record<
  Role,
  {
    eyebrow: string
    headline: string
    body: string
    emailLabel: string
    emailPlaceholder: string
    organizationLabel?: string
    organizationPlaceholder?: string
    submitLabel: string
  }
> = {
  Provider: {
    eyebrow: 'Clinical walkthrough',
    headline: 'See VisionWheel in clinical practice.',
    body: 'Explore patient assessment, fitting, calibration, and prescribing workflows with a clinical specialist.',
    emailLabel: 'Work email',
    emailPlaceholder: 'jordan@practice.org',
    organizationLabel: 'Practice or organization',
    organizationPlaceholder: 'Northside Rehabilitation',
    submitLabel: 'Request a clinical demo',
  },
  Clinic: {
    eyebrow: 'Deployment walkthrough',
    headline: 'See how VisionWheel fits your clinic.',
    body: 'Review onboarding, staff training, device deployment, and ongoing patient support with our implementation team.',
    emailLabel: 'Work email',
    emailPlaceholder: 'jordan@clinic.org',
    organizationLabel: 'Clinic or health system',
    organizationPlaceholder: 'Northside Rehabilitation',
    submitLabel: 'Request a clinic demo',
  },
  Insurer: {
    eyebrow: 'Coverage briefing',
    headline: 'Review the evidence behind VisionWheel.',
    body: 'Discuss clinical documentation, measurable outcomes, coverage pathways, and long-term value with our team.',
    emailLabel: 'Work email',
    emailPlaceholder: 'jordan@healthplan.com',
    organizationLabel: 'Insurance organization',
    organizationPlaceholder: 'Regional Health Plan',
    submitLabel: 'Request a coverage briefing',
  },
  Family: {
    eyebrow: 'Family consultation',
    headline: 'Explore what VisionWheel could make possible.',
    body: 'Tell us a little about your needs and speak one-on-one with someone who can answer questions about fit, setup, and next steps.',
    emailLabel: 'Email address',
    emailPlaceholder: 'jordan@example.com',
    submitLabel: 'Talk with our team',
  },
}

const AUDIENCE_TO_ROLE: Record<string, Role> = {
  providers: 'Provider',
  clinics: 'Clinic',
  insurers: 'Insurer',
  families: 'Family',
}

export function ContactFooter() {
  const [role, setRole] = useState<Role>('Provider')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const content = ROLE_CONTENT[role]

  useEffect(() => {
    const handleAudienceChange = (event: Event) => {
      const key = (event as CustomEvent<string>).detail
      const nextRole = AUDIENCE_TO_ROLE[key]
      if (nextRole) {
        setRole(nextRole)
        setStatus('idle')
      }
    }

    window.addEventListener('visiontech:audience-change', handleAudienceChange)
    return () => window.removeEventListener('visiontech:audience-change', handleAudienceChange)
  }, [])

  useEffect(() => {
    if (status !== 'success') return

    const timeout = window.setTimeout(() => setStatus('idle'), 3500)
    return () => window.clearTimeout(timeout)
  }, [status])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = event.currentTarget
    const data = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          organization: data.get('org'),
          role,
        }),
      })

      if (!response.ok) throw new Error('Request failed')

      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section id="contact" className="border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Pitch */}
          <div className="flex flex-col justify-center border-border px-6 py-16 sm:px-10 sm:py-24 lg:border-r lg:px-14">
            <Reveal>
              <p className="eyebrow text-accent">{content.eyebrow}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {content.headline}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {content.body}
              </p>
            </Reveal>
          </div>

          {/* Form */}
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-24 lg:px-14">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                <div>
                  <span className="eyebrow text-muted-foreground">I am a</span>
                  <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-4">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={role === r}
                        onClick={() => {
                          setRole(r)
                          setStatus('idle')
                        }}
                        className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                          role === r
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Full name" id="name" type="text" placeholder="Jordan Avery" />
                <Field
                  label={content.emailLabel}
                  id="email"
                  type="email"
                  placeholder={content.emailPlaceholder}
                />
                {content.organizationLabel && content.organizationPlaceholder && (
                  <Field
                    label={content.organizationLabel}
                    id="org"
                    type="text"
                    placeholder={content.organizationPlaceholder}
                    required={false}
                  />
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-1 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : content.submitLabel}
                </button>
                {status === 'error' && (
                  <p role="alert" className="text-sm text-destructive">
                    We couldn&apos;t send your request. Please try again.
                  </p>
                )}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  By submitting you agree to be contacted about VisionWheel. We
                  never sell your data.
                </p>
              </form>
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/visiontech-logo.png"
              alt=""
              width={896}
              height={512}
              className="h-6 w-auto"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              VisionWheel
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {['Overview', 'Calibration', 'Architecture', 'Compliance', 'Contact'].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>
          <p className="eyebrow text-muted-foreground/70">© 2026 VisionTech, Inc.</p>
        </div>
      </footer>

      {status === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
          Sent successfully!
        </div>
      )}
    </>
  )
}

function Field({
  label,
  id,
  type,
  placeholder,
  required = true,
}: {
  label: string
  id: string
  type: string
  placeholder: string
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  )
}
