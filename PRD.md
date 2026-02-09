1. Product Objective

Build a SaaS web application that helps amateur cricket team managers:

manage players,

schedule matches and training,

automatically collect availability via WhatsApp polls,

send automated reminders to non-responders,

view squad readiness with minimal manual effort.

Primary goal: reduce manager time spent chasing players.

2. User Roles
Manager

Uses web app

Creates schedules

Views availability

Configures reminders

Player

Interacts only via WhatsApp

Responds to availability polls

3. Core Functional Scope (v1 Only)
3.1 Player Management

Add / edit / deactivate players

Required fields:

Name

WhatsApp number (E.164)

Role (Batsman / Bowler / All-rounder / WK)

Location (text)

Bulk import via CSV

3.2 Scheduling
Match

Opponent name

Venue

Date + time

Required players (default 11)

Training

Venue

Date + time

On creation:

System auto-creates an availability poll

3.3 Availability Polls

Each event has one poll.

Poll options

Available

Not Available

Maybe

Storage

Player ID

Response

Timestamp

3.4 WhatsApp Integration

Use WhatsApp Business API (Twilio or Meta).

Messages

Poll message

Reminder message

Final confirmation message

Poll Message Template

🏏 {EVENT_TYPE} Availability

📍 {VENUE}
🗓 {DATE}
⏰ {TIME}

Reply:
1 Available
2 Not Available
3 Maybe

3.5 Automated Reminders

Configurable reminder schedule (default: 24h, 12h before event)

Sent only to players with no response

Max reminders per event (default: 2)

3.6 Manager Dashboard

Web UI shows:

Availability counts

List of non-responders

Squad readiness:

Ready / At Risk / Not Ready

4. Non-Functional Requirements

Multi-tenant SaaS

PostgreSQL database

REST APIs

Cron jobs for reminders

Audit log for all WhatsApp messages

5. Data Model (Minimum)

User

Team

Player

Event (match/training)

Poll

PollResponse

MessageLog

6. Out of Scope

Payments

League tables

In-app chat

Advanced AI predictions

7. Success Criteria

Manager can schedule event in <2 minutes

≥80% players respond before deadline

Zero manual reminder needed for most events

8. Build Instruction (Critical)

Build full system:

Backend

Database schema + migrations

WhatsApp integration

Reminder automation

Basic React UI

Local + cloud deployable

Prefer correctness and automation over UI polish.A:
