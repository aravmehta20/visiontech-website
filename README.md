# visiontech-website-gi

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_1ijYBA88kaeY2dcwpxRoF4I44Umj)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To enable the contact form with Gmail, turn on 2-Step Verification for the
sending Google account, create a Google app password, and configure these
server environment variables in `.env.local` and in your deployment provider:

```bash
SMTP_USER=your-google-account@example.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM=VisionWheel <your-google-account@example.com>
```

`SMTP_FROM` is optional and defaults to `SMTP_USER`. A custom-domain sender can
only be used after it has been configured as a valid sender in Gmail or Google
Workspace. Gmail defaults to `smtp.gmail.com` on port `465`; `SMTP_HOST` and
`SMTP_PORT` may still be set to override these defaults. Never prefix these
values with `NEXT_PUBLIC_`; they must remain server-only, and never commit the
app password to the repository.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
