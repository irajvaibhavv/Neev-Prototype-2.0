# Neev — prototype

Neev offers earned-wage access (salary advance) and help with government schemes for blue-collar workers.
An employee draws on salary they have already earned, Neev pays it out instantly, and on payday the
employer deducts that amount and pays it to Neev.

This repository is a **click-through prototype** built for pitching and sign-off. It has no backend: all data is mocked
or kept in the browser's `localStorage`. If the product is approved, it will be rebuilt for production.

**Live:** https://irajvaibhavv.github.io/Neev-Prototype-2.0/

## Apps

| App | Entry | Stack | For |
|-----|-------|-------|-----|
| Employee app | [`employee.html`](employee.html) | Vanilla HTML/CSS/JS | Worker (mobile): signup, salary advance, govt schemes, insurance, gold |
| Schemes manager portal | [`agent/`](agent/) (built from [`agent-portal/`](agent-portal/)) | React 19 + Vite + Tailwind v4 | Neev manager: scheme funnel, leads, applications |
| Employer portal | [`company.html`](company.html) | Vanilla | Employer HR: verify employees, approvals, payroll deductions |
| NBFC ops dashboard | [`admin.html`](admin.html) | Vanilla | Neev ops: KYC, credit limits, disbursement, reconciliation |

[`index.html`](index.html) is the start page, with a 2-minute demo script.

## Structure

```
.
├── index.html                 start page (GitHub Pages root)
├── employee.html              employee app — markup for every screen
├── employee/
│   ├── style.css
│   └── js/                    one file per feature, loaded in order; main.js boots last
│       ├── core.js            state `S`, go()/goBack() navigation, toast, fmt
│       ├── account.js         persistence: localStorage 'neev_employee_db' keyed by mobile
│       ├── signup.js login.js pin.js
│       ├── employer-setup.js pan.js bankstatement.js permissions.js   loan KYC chain
│       ├── apply.js enach.js ledger.js history.js                     advance + repayment
│       ├── schemes.js         govt schemes: eligibility rules, application form, cart
│       └── …                  insurance, investment, bbps, referral, loyalty, grievance, i18n
├── company.html + company/js/ employer portal
├── admin.html   + admin/js/   NBFC ops dashboard
├── shared/                    theme.css (all apps), dashboard.css + components.js (company/admin),
│                              protect.js (client builds only, not loaded here)
├── agent-portal/              manager portal source (React)
│   ├── src/lib/               data layer: applications.js (reads app data), sample.js, labels.js
│   ├── src/pages/             Dashboard, Leads, StagePage, ApplicationDetail, Trends, Login
│   ├── src/components/        Shell (layout) and modals
│   └── scripts/sync-schemes.mjs   generates the scheme catalogue from employee/js/schemes.js
├── agent/                     built portal (committed so GitHub Pages can serve it; do not edit)
├── tests/                     checks for the vanilla apps (Node, no dependencies)
└── docs/
    ├── research/              sources for scheme eligibility rules and form fields
    └── exports/               PDF snapshots of the employer portal
```

The HTML entry files stay at the repository root because the shared links point to them.

## How the pieces connect

```
employee.html ──writes──▶ localStorage 'neev_employee_db' ──reads──▶ agent/ (manager portal)
                          { [mobile]: profile, funnel, schemeApplications[] }

agent/ ──writes──▶ 'neev_agent_stages' (stage, outcome, reminders, removals)
                   'neev_agent_added'  (applications the manager added)
```

- Both apps are served from the same origin, so they share data only **within one browser on one device**.
  A production version would replace this with a real backend.
- Scheme data lives in one place, [`employee/js/schemes.js`](employee/js/schemes.js). The portal's
  `schemeCatalog.json` is generated from it on every build and should never be edited by hand.
- Employee app screens are `<div class="screen" id="s-…">` elements. `go(id)` switches between them, and
  `S` holds all state. When you change a JS file, bump its `?v=N` on the `<script>` tag in `employee.html`.

## Run

```bash
python -m http.server 3000          # from repo root → http://localhost:3000
cd agent-portal && npm install && npm run build   # rebuilds agent/ after portal changes
```

A local server is needed because the JS files do not load over `file://`.
Portal logins (OTP `1234`): super admin `9876500000`, agent `9876500001`, sales `9876500002`.

## Checks

```bash
node tests/clicks.check.js                    # every onclick / go() / getElementById target exists
node tests/schemes.check.js                   # eligibility rules, forms, cart flow
node agent-portal/tests/applications.check.mjs
node agent-portal/tests/admin.check.mjs
```

## Deploy

GitHub Pages redeploys on every push to `main`. If you changed `agent-portal/`, run `npm run build` first,
because Pages serves the committed `agent/` folder. Keep all paths relative (`./`, never `/`).
