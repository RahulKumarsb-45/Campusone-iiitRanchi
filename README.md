# CampusOne — IIIT Ranchi Campus Management Platform

CampusOne is a centralized campus portal designed to bring important student, event, institute, and hostel-related information into one place. It aims to reduce the need to check multiple channels for campus updates and make campus activities easier to discover and manage.

> **Project status:** Student project / work in progress. Features that depend on Supabase or email credentials require configuration and testing in the target environment. This repository is not an official IIIT Ranchi service unless formally adopted by the institute.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Application Routes](#application-routes)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Available Scripts](#available-scripts)
- [Product Management Case Study Opportunities](#product-management-case-study-opportunities)
- [Security and Production Checklist](#security-and-production-checklist)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Overview

CampusOne brings together common campus workflows in a single Next.js application:

- Discover campus events and manage event registrations.
- Browse campus announcements, notices, internship listings, and placement information.
- Explore student clubs and campus gallery content.
- Access hostel notices, lost-and-found listings, and a campus marketplace.
- Create an account, manage a profile, and view a personalized dashboard.

The application uses Supabase for database access and authentication-related workflows. The exact behaviour of database-backed features depends on the Supabase project configuration, applied migrations, and access policies.

## Features

### 1. Campus Events

- Browse and search campus events.
- View event details.
- Create and edit events.
- Register for events and review registrations from the dashboard.
- Cancel registrations and manage events created by the signed-in user.
- Display event participation information and volunteer-related fields where configured.

### 2. Student Dashboard and Profile

- Sign-in and registration pages.
- User profile information.
- Dashboard for event registrations and events created by the user.
- Summary counts for registered, upcoming, and created events.
- Recent campus activity view.

### 3. Campus Information

- Campus announcements.
- General college notices.
- Internship listings.
- Placement-drive information.
- Student clubs and club categories.

### 4. Institute and Hostel Services

- Hostel notices.
- Lost-and-found listings, including item status.
- Campus marketplace listings, including availability/sold status.
- Campus gallery.
- Quick links to commonly used services.

### 5. Interface

- Responsive layouts built with Tailwind CSS.
- Reusable UI components based on Radix UI and shadcn/ui-style components.
- Icons from Lucide React.
- Light/dark theme support through the theme provider.

**Note:** A page or interface being present in the code does not guarantee that it is production-ready or enabled in a live deployment. Database-dependent features must be verified with a configured Supabase project.

## Technology Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router (Next.js 15) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS |
| Components | Radix UI, reusable shadcn/ui-style components |
| Icons | Lucide React |
| Backend services / database | Supabase |
| Authentication | Supabase Auth integration |
| Forms and validation libraries | React Hook Form, Zod, `@hookform/resolvers` |
| Charts | Recharts |
| Notifications / toast UI | Sonner and custom toast components |
| Email utility | Nodemailer (requires SMTP configuration) |
| Package manager | pnpm (repository includes `pnpm-lock.yaml`) |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and campus overview |
| `/auth/login` | Authentication login page |
| `/auth/register` | Account registration page |
| `/login` | Additional login route |
| `/dashboard` | Personal dashboard |
| `/profile` | User profile |
| `/events` | Browse events |
| `/events/create` | Create an event |
| `/events/[id]` | View event details |
| `/events/[id]/edit` | Edit an event |
| `/clubs` | Browse clubs |
| `/campus-services/announcements` | Campus announcements |
| `/campus-services/notices` | College notices |
| `/campus-services/internships` | Internship listings |
| `/campus-services/placements` | Placement information |
| `/institute-services/hostel-notices` | Hostel notices |
| `/institute-services/lost-and-found` | Lost-and-found service |
| `/institute-services/marketplace` | Campus marketplace |
| `/institute-services/gallery` | Campus gallery |

## Architecture

The project uses the Next.js App Router structure:

```text
app/                  Route pages, layouts, and global styles
components/           Shared application components and UI primitives
contexts/             React context, including authentication state
hooks/                Reusable React hooks
lib/                  Supabase client, data operations, email utility, helpers
public/               Static assets
styles/               Global styling
supabase/
  migrations/         SQL migrations for database setup
  schema.sql          Core database schema
types/                TypeScript declarations
```

The `lib/supabase.ts` module defines data types and helper functions for working with events, registrations, clubs, internships, placements, notices, announcements, lost-and-found items, marketplace listings, and gallery images.

## Getting Started

### Prerequisites

Install the following before starting:

- Node.js version compatible with the installed Next.js release (Node.js 20 LTS or newer is recommended).
- pnpm.
- A Supabase project for database-backed functionality.

### 1. Clone the repository

```bash
git clone https://github.com/RahulKumarsb-45/Campusone-iiitRanchi.git
cd Campusone-iiitRanchi
```

### 2. Install dependencies

The repository contains a `pnpm-lock.yaml`, so use pnpm to keep dependency versions consistent.

```bash
corepack enable
pnpm install
```

If Corepack is unavailable, install pnpm using the official pnpm installation instructions.

### 3. Configure environment variables

Create a local environment file:

```bash
cp .env.example .env.local
```

If the repository does not yet include `.env.example`, create `.env.local` manually using the variables in the next section. On Windows, you can create the file in VS Code.

Add the values from your own Supabase project. Do not copy secret credentials into source code.

### 4. Set up Supabase

Follow the [Supabase Setup](#supabase-setup) instructions below and apply the database migrations.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Verify a production build

```bash
pnpm build
pnpm start
```

Run the production build after configuring the environment variables. A successful local build does not by itself confirm that every database workflow or authentication provider is configured correctly.

## Environment Variables

Create `.env.local` in the project root. The application references these variables:

| Variable | Required for | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase-backed features | Supabase project URL, for example `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase-backed features | Supabase publishable/anon key intended for browser use, with access controlled by Row Level Security |
| `EMAIL_HOST` | Email sending (optional) | SMTP server hostname |
| `EMAIL_PORT` | Email sending (optional) | SMTP server port, commonly `587` for STARTTLS |
| `EMAIL_SECURE` | Email sending (optional) | Set to `true` when the SMTP connection should use TLS immediately, commonly with port `465` |
| `EMAIL_USER` | Email sending (optional) | SMTP username |
| `EMAIL_PASSWORD` | Email sending (optional) | SMTP password or provider-issued app password |
| `EMAIL_FROM` | Email sending (optional) | Sender address used in outgoing email |

Example template:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

# Optional SMTP settings for email utilities
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

The example values are placeholders; replace them with your own values.

**Security rules**

- Never commit `.env.local`, passwords, SMTP credentials, Supabase service-role keys, or other private secrets.
- The `NEXT_PUBLIC_` prefix means a variable may be included in browser-side code. Only use the Supabase publishable/anon key here—not a service-role key.
- If a real secret was committed or exposed, rotate it in the provider dashboard. Removing it from the latest commit alone does not remove it from Git history.
- Do not put private credentials in screenshots, issues, or README examples.

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and publishable/anon key into `.env.local`.
3. Open the Supabase SQL Editor, or use the Supabase CLI if you have configured it for this project.
4. Apply the SQL migrations in chronological order:
   - `supabase/migrations/20250101000000_init_schema.sql`
   - `supabase/migrations/20250102000000_fix_users_registration.sql`
   - `supabase/migrations/20250103000000_campusone_full_features.sql`
5. Confirm that the expected tables exist and that the migration scripts completed without errors.
6. Configure authentication providers in Supabase if you want to enable them. For OAuth providers, configure the provider credentials and allowed redirect URLs in the Supabase dashboard.
7. Test sign-up, sign-in, event creation, event registration, registration cancellation, and each service listing with a non-production test account.

The repository also includes `supabase/schema.sql`; review it before using it as a separate schema source. Avoid applying overlapping schema definitions blindly. Use the migration sequence as the primary setup path unless you have confirmed a different setup is required.

### Important database security note

The SQL migrations define Row Level Security (RLS) policies and grants. Review every policy before using real student data or deploying publicly. In particular, policies that allow any authenticated user to create or update shared listings may be too permissive for a production campus platform. Enforce role-based permissions, validate ownership on updates/deletes, and restrict privileged operations on the server.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the local development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run the configured lint command |

The `lint` script currently uses `next lint`. Check compatibility with your installed Next.js version if the command fails; the build command is a separate check.

## Product Management Case Study Opportunities

CampusOne can also be presented as a product case study, not only as a software project. To make the portfolio evidence stronger, document actual work and results rather than inventing metrics.

Suggested product artifacts:

- **Problem discovery:** Interview students, hostel residents, club organizers, and staff about how they currently find campus information.
- **Personas and journeys:** Map the key jobs users need to complete, such as finding a hostel notice or registering for an event.
- **PRD:** Define the problem, target users, goals, requirements, edge cases, and acceptance criteria.
- **Prioritization:** Use MoSCoW or RICE to explain which features belong in the MVP and why.
- **Success metrics:** Consider weekly active users, event registration completion rate, notice views, search-to-action conversion, and time to find important information.
- **Usability testing:** Ask representative users to complete common tasks and record task success, time taken, and qualitative feedback.
- **AI extension (optional):** Consider a campus FAQ assistant grounded in approved campus documents. Evaluate answer accuracy, source coverage, unsafe answers, latency, and cost before describing it as reliable.

Only include interview counts, adoption figures, or performance results after collecting and validating real data.

## Security and Production Checklist

Before treating CampusOne as a production service:

- [ ] Verify `.env.local` and all secret files are excluded from Git.
- [ ] Review RLS policies and database grants table by table.
- [ ] Enforce role-based access for administrators, faculty, organizers, and students.
- [ ] Validate inputs and ownership for all create, update, and delete operations.
- [ ] Test authentication, session handling, and OAuth redirect configuration.
- [ ] Check accessibility, responsive layouts, and error/loading/empty states.
- [ ] Add tests for core event and listing workflows.
- [ ] Configure production environment variables in the hosting provider.
- [ ] Confirm that all displayed notices, placement details, and events are accurate and authorized for publication.
- [ ] Add a privacy policy and data-retention rules before collecting real student information.
- [ ] Do not use real student records in development or demo screenshots without authorization.

## Known Limitations

- Database-driven functionality requires a valid Supabase project, correct schema, and suitable RLS policies.
- Email notifications require valid SMTP credentials and must be tested separately.
- Some routes or UI elements may be prototypes; verify each workflow before relying on it.
- The repository does not by itself establish that the platform is officially endorsed by IIIT Ranchi.
- No live deployment URL or production-readiness claim is included here because one was not verified during this README preparation.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Make and test the change locally.
4. Commit with a descriptive message.
5. Open a pull request describing the change and how it was tested.

For feature proposals, explain the user problem, the proposed solution, and how success could be measured.

## Author

**Rahul Kumar**  
B.Tech, Computer Science and Engineering — IIIT Ranchi

- GitHub: [@RahulKumarsb-45](https://github.com/RahulKumarsb-45)
- Project repository: [Campusone-iiitRanchi](https://github.com/RahulKumarsb-45/Campusone-iiitRanchi)

## License

No license file was identified in the reviewed project archive. Until a license is added, others should not assume that the source code is licensed for reuse. Add a `LICENSE` file if you want to specify permissions for using, modifying, and distributing this project.
