# TACTIOPBOT setup, shared database, and website

The Discord bot and same-origin website share the `TACTIOPBOT` MongoDB database through one MongoDB client in `db.js`. The static dashboard is served from `public/`; its browser code talks only to the Express API. MongoDB credentials and Discord OAuth tokens remain server-side.

## Local setup

1. Install Node.js 20.8 or newer and run `npm ci`.
2. Copy `.env.example` to `.env` and fill in local values. Never commit `.env`.
3. Add the local OAuth callback to the Discord Developer Portal and configure the website variables below.
4. Run `npm start`. The bot and website run in the same process on `PORT` (default `3000`).
5. Run `npm run test` for the offline test suite and `npm run test:db` to ping Atlas and verify migration.

## Website-only local OAuth testing

Use `npm run dev:web` to serve the existing website and authentication routes on `127.0.0.1` without starting the Discord client or notification scheduler. This launcher requires `TACTIOBOT_DEV_MONGODB_URI` and a `TACTIOBOT_DEV_MONGODB_DB_NAME` beginning with `TACTIOPBOT_DEV_`; it rejects a development URI identical to `MONGODB_URI` and selects only the explicitly named development database. Use a local MongoDB instance or a separate development cluster. Do not point it at production. Account records and server-side sessions created in this mode persist only in the selected development database. Dashboard guild APIs and Discord OAuth are disabled in this server.

For Google testing, set `TACTIOBOT_DEV_GOOGLE_OAUTH_ENABLED=true`, configure `TACTIOBOT_DEV_GOOGLE_CLIENT_ID` and `TACTIOBOT_DEV_GOOGLE_CLIENT_SECRET`, and register `http://localhost:3000/auth/google/callback` as an authorized redirect URI in Google Cloud Console. Set `TACTIOBOT_DEV_GOOGLE_OAUTH_REDIRECT_URI` to that exact URI. If using another `TACTIOBOT_DEV_PORT`, update both the callback URI and Google Cloud registration to that port. Development credentials and the enable flag are isolated from the production `GOOGLE_*` variables. Without the explicit development flag and callback, Google sign-in remains disabled. Start only after reviewing these development settings, then open `http://localhost:3000/`; stop with Ctrl+C. The launcher never prints connection URIs or credentials.

## Environment variables

Configure variables in the environment of each running service; a local `.env` file is not automatically uploaded to Deploy Hatch.

- `TOKEN` or `DISCORD_TOKEN`: Discord bot token. `DISCORD_TOKEN` takes precedence.
- `CLIENT_ID`: Discord application ID; used by command registration and website OAuth.
- `CLIENT_SECRET`: Discord application secret for the server-side OAuth token exchange.
- `MONGODB_URI`: MongoDB Atlas URI. Atlas network access and a database user with read/write access are required. The application explicitly selects database `TACTIOPBOT`, regardless of a database name in the URI.
- `PORT`: HTTP listen port, supplied by most deployment platforms.
- `DISCORD_OAUTH_REDIRECT_URI`: exact Discord-registered callback URL ending `/auth/discord/callback`; Discord is linked only after Google sign-in.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Google OAuth web-client credentials; keep both server-side.
- `GOOGLE_OAUTH_REDIRECT_URI`: exact Google-registered HTTPS callback ending `/auth/google/callback` in production.
- `GOOGLE_OAUTH_ENABLED=true`: enable the Google button only after the credentials and exact callback URL have been configured in Google Cloud Console. Without this explicit flag, Google sign-in remains unavailable.
- `WEB_SESSION_SECRET`: random secret of at least 32 characters; generate with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.
- `NODE_ENV=production`: enables secure session cookies and requires an HTTPS OAuth callback.
- `GUILD_ID`: optional development guild for command registration.
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`, and `TACTICOOL_API`: optional integrations used by other project features; configure only if those features are enabled.

Do not put any real secret in `.env.example`, source files, or frontend assets.

## Discord OAuth and deployment

In the Discord Developer Portal, configure the application ID and secret and add the exact `DISCORD_OAUTH_REDIRECT_URI`. The website requests only the `identify` and `guilds` scopes. For local development a callback may be `http://localhost:3000/auth/discord/callback`; after Deploy Hatch assigns your hostname, set the production URI to `https://<your-deploy-hatch-hostname>/auth/discord/callback` in both the service environment and Discord's registered redirect URLs.

Google is the only website sign-in method. Create a Google OAuth web client and register the exact callback URI `http://localhost:3000/auth/google/callback` for local development or `https://<your-deploy-hatch-hostname>/auth/google/callback` after deployment. Set `GOOGLE_OAUTH_REDIRECT_URI` to the exact production URI and add that same URI in Google Cloud Console. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WEB_SESSION_SECRET` (at least 32 characters), and `GOOGLE_OAUTH_ENABLED=true` on the server. The application validates OAuth state, nonce, PKCE, the ID-token signature/audience, and Google's verified-email claim. It does not enable sign-in when configuration is partial. The browser displays Google sign-in as unavailable until the complete configuration is present. Do not put Google credentials in frontend code.

The [Procfile](../Procfile) starts the existing combined bot-and-web process with `npm start`; the package requires Node.js 20.8 or newer to satisfy `connect-mongo` 6. In Deploy Hatch, configure the variables above in the service's environment settings, use the existing Procfile/start command, and set `NODE_ENV=production`. Add the production callback URL to the Discord application. Allow the deployment host in Atlas Network Access and use a least-privilege database user.

The supported topology is a same-origin website and API, usually behind one reverse proxy. The server trusts one proxy hop in production for secure cookies. CORS is intentionally not enabled. If the frontend is deployed on a separate origin, place it behind a same-origin reverse proxy rather than broadening CORS or weakening cookie policy. A cross-site deployment would require a separately reviewed origin allowlist, credentialed CORS, and `SameSite=None; Secure` cookies.

The current `npm start`/Procfile runs the bot, API, and frontend together. If the bot and website backend are later split into separate Deploy Hatch services, configure the same Atlas URI on each server-side service, keep credentials in each service's private variables, and allow both service egress addresses in Atlas. The browser still talks to the website backend only; the Discord bot token and MongoDB URI must never be copied to the frontend. Use a shared same-origin reverse-proxy route for the site and API; this repository does not enable cross-origin credentialed requests.

## Website and API

OAuth access and refresh tokens and session IDs are stored server-side in MongoDB, never returned to browser JavaScript. Session cookies are HTTP-only, SameSite=Lax, and Secure in production. Authentication endpoints and API requests are rate-limited. A verified Google identity is required for all website sessions. Discord is optional for general website access; connecting it links the authenticated Google account to one Discord account. Discord-specific APIs require both identities, a valid Discord connection, live Manage Server or Administrator permission, and bot membership in the selected server. Google sign-in never silently merges with an existing account that has a conflicting email.

- `GET /auth/discord`: begin connecting Discord to the currently authenticated Google account using a cryptographically random OAuth state.
- `GET /auth/discord/callback`: validate state, exchange the code, and link the Discord identity to that same Google-backed account.
- `GET /auth/providers`: report which provider configurations are ready, without exposing credentials.
- `GET /auth/google` and `GET /auth/google/callback`: begin and complete Google sign-in when explicitly enabled and fully configured.
- `GET /auth/discord`: connect Discord to the current website account; the callback checks the account and Discord identities are not already linked elsewhere.
- `POST /auth/logout`: end the session; same-origin only.
- `GET /api/me`: current Google website account and, when connected, Discord user.
- `GET /api/languages`: supported notification languages.
- `GET /api/guilds`: manageable Discord servers and current settings.
- `GET /api/guilds/:guildId/resources`: text channels where the bot can send messages and selectable server roles.
- `GET /api/guilds/:guildId/clan-mission-notification`: read authorized server settings.
- `PUT /api/guilds/:guildId/clan-mission-notification`: create/update settings. Supported JSON fields are `channelId`, `roleId` (or `null`), `enabled`, and `language`; omitted fields keep their existing value. A new setting requires `channelId`.
- `DELETE /api/guilds/:guildId/clan-mission-notification`: delete authorized server settings.

The backend verifies submitted channel and role IDs against the selected Discord server. The browser never supplies a database credential or static API key.

## MongoDB collections and indexes

- `cm_notification_settings`: one document per guild; the Discord guild ID is the document `_id`, which MongoDB uniquely indexes automatically. The `guildId` field matches `_id` for use by the bot and API.
- `web_sessions`: server-side website sessions, including OAuth tokens. `connect-mongo` manages the TTL index and expires sessions after eight hours.
- `web_accounts`: Google website accounts and optional linked Discord IDs. The application creates unique indexes for normalized email, Google subject, and linked Discord ID when the first account operation occurs.

`npm run test:db` pings the explicitly selected database and lists the number of notification settings after migration verification. The settings collection uses MongoDB's built-in unique `_id` index; no separate index is required for its key lookup.

## Legacy notification migration

On the first notification-data access after MongoDB connects, the bot reads `data/clanMissionNotifications.json`, whose structure is `{ "guilds": { "<guildId>": { ...settings } } }`. Each guild ID becomes the MongoDB document `_id`. The migration imports with `$setOnInsert`, reads every document back, and verifies every source field. Existing MongoDB documents are not overwritten; a mismatch stops migration and leaves the JSON intact. The import is safe to retry after a partial import and across concurrent bot instances. If the JSON has no guild entries, the verifier reports zero; no settings are claimed as migrated.

Keep the JSON file as the rollback source until an operator has independently checked the reported count and records in Atlas. To roll back code, stop the service, redeploy the previous version, and restore the JSON-based implementation only if it still matches the retained file; do not delete or overwrite MongoDB documents as part of rollback.

## Checks and troubleshooting

- `npm test`: offline migration, data-access, scheduler, command-schema, Google/Discord OAuth, account-linking, CSRF, and provider-configuration tests.
- `npm run test:db`: live Atlas ping plus legacy import/read-back verification. It performs reads and safe idempotent imports; it does not delete production records.
- `GET /health/db`: reports connection status without returning credentials.

If the ping fails, verify the server-side `MONGODB_URI`, Atlas IP access list, database username/permissions, and deployment egress. Errors are logged by type only. If website OAuth reports that it is not configured, set the redirect URI and generate a new 48-byte `WEB_SESSION_SECRET`. If sign-in works but no settings can be managed, verify the user's live server permissions and that TACTIOPBOT is installed in that server.
