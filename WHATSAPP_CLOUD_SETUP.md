# WhatsApp Cloud API Setup (TACTIOPBOT)

## 1) Create Meta App + WhatsApp Product
- Go to Meta for Developers.
- Create an app and add **WhatsApp** product.
- In WhatsApp API setup, copy:
  - `Temporary/Permanent Access Token` -> `WHATSAPP_ACCESS_TOKEN`
  - `Phone Number ID` -> `WHATSAPP_PHONE_NUMBER_ID`

## 2) Configure Environment
- Copy `.env.example` to `.env`.
- Fill:
  - `WHATSAPP_VERIFY_TOKEN` (your random secret string)
  - `WHATSAPP_ACCESS_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `PORT` (default `3000`)
- Optional:
  - `GROQ_API_KEY` to enable AI chat replies for non-command messages.
  - `GROQ_MODEL` to override model (default `llama-3.1-8b-instant`).

## 3) Start Bot
```bash
npm install
npm run start:wa-cloud
```

## 4) Expose Webhook URL
- Use a public HTTPS URL (server, Railway, Render, or ngrok).
- Webhook endpoint is:
  - `GET /webhook` (verification)
  - `POST /webhook` (incoming messages)

Example webhook URL:
`https://your-domain.com/webhook`

## 5) Verify Webhook in Meta
- In WhatsApp webhook settings:
  - Callback URL: `https://your-domain.com/webhook`
  - Verify Token: same value as `WHATSAPP_VERIFY_TOKEN`
- Subscribe to message events (at minimum `messages`).

## 6) Business Display Name
- Set WhatsApp Business display name to `TACTIOPBOT` in Meta/Business settings.
- This is what users will see as the bot identity.

## 7) Use Command
Send:
`/!clanmission! Breach | Cover | Logistics`

The bot replies with:
- Operator assignment text
- Generated mission image
