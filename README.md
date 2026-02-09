# KPET - Cricket Team Management SaaS

Multi-tenant SaaS for amateur cricket team managers. Automates player availability collection via WhatsApp polls and reminders.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** PostgreSQL
- **Messaging:** Twilio WhatsApp Business API
- **Scheduler:** node-cron

## Prerequisites

- Node.js 18+
- PostgreSQL running locally
- (Optional) Twilio account for WhatsApp messaging

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials and JWT secret
   ```

3. **Create database and run migrations:**
   ```bash
   createdb kpet  # or create via psql
   npm run db:migrate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```
   - Server: http://localhost:3000
   - Client: http://localhost:5173

## Features

- **Auth:** Register manager + team, JWT login
- **Players:** CRUD, CSV bulk import, deactivation
- **Events:** Match/training creation with auto-poll
- **WhatsApp Polls:** Automated availability polls via Twilio
- **Reminders:** Cron-based reminders to non-responders (24h, 12h before event)
- **Dashboard:** Squad readiness overview (Ready / At Risk / Not Ready)
- **Webhook:** Twilio inbound handler for player responses (reply 1/2/3)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register user + team |
| POST | /api/auth/login | Login, get JWT |
| GET | /api/players | List active players |
| POST | /api/players | Create player |
| PUT | /api/players/:id | Update player |
| PATCH | /api/players/:id/deactivate | Deactivate player |
| POST | /api/players/import | CSV bulk import |
| GET | /api/events | List events |
| POST | /api/events | Create event (auto-sends poll) |
| GET | /api/events/:id | Event detail with responses |
| PUT | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |
| GET | /api/polls/:eventId | Poll summary + readiness |
| POST | /api/polls/:eventId/send | Manually send/resend poll |
| POST | /api/webhook/twilio | Twilio inbound webhook |

## WhatsApp Flow

1. Manager creates an event → poll is auto-created and sent to all active players
2. Players reply with 1 (Available), 2 (Not Available), or 3 (Maybe)
3. System confirms response and updates dashboard
4. Cron sends reminders to non-responders at configured intervals

## Assumptions

- One team per user registration
- Players identified by WhatsApp number for inbound matching
- Most recent upcoming poll used for matching inbound responses
- Without Twilio credentials, messages are logged to console
- Squad readiness: Ready (>= required), At Risk (within 2), Not Ready (below)
