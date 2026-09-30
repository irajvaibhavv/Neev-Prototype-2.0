# Neev Schemes Portal

Manager website for the Government-schemes flow in the Neev employee app: user funnel, leads,
New / Incomplete / Pending / Filled applications, application detail, document reminders, trends.

React 19 + Vite + Tailwind v4. Design follows the Saralya dashboard.

```bash
npm install
npm run build        # outputs to ../agent — open http://localhost:3000/agent/ (python -m http.server 3000 from the repo root)
node tests/applications.check.mjs
```

Prototype only: data is read from the employee app's localStorage (same origin), so it works on one computer.
Production needs a shared realtime backend (e.g. Supabase, Mumbai region). See the root README for how it connects to the app.
Demo login: 9876500001, OTP 1234.
