# Neev — prototype context

## What this is
Neev is a startup building earned-wage-access (salary advance) for blue-collar employees.
Core model: employee requests an advance on salary already earned → Neev disburses instantly →
employee's employer (e.g. Zomato) deducts the amount on payday and pays it to Neev, not the employee.

This repo is a **click-through prototype only**, built by a PM intern (not a dev) to pitch/get
sign-off from Neev's founders. **If approved, an actual dev team rebuilds it for production.**
That constraint drives every technical decision below — optimize for fast editing and a good demo,
not for production architecture.

**Repo map for humans:** `README.md` (structure, data flow, run/check commands). Research lives in `docs/research/`, PDF exports in `docs/exports/`.

## The three apps
- `employee.html` — phone-mockup mobile app for the blue-collar employee (login, onboarding,
  request advance, repayment history, referral, grievances, government schemes)
- `company.html` — web dashboard for the employer's HR team (verify employees, run payroll
  deductions, pre/post-payday confirmation, policy config, analytics)
- `admin.html` — internal Neev/NBFC ops dashboard (KYC queue, fraud alerts, credit limits,
  loan origination, disbursements, reconciliation, risk & compliance, day-end closure)

Each is currently a single self-contained HTML file (vanilla CSS + JS, `.screen`/`.active`
show-hide pattern, a `nav()` function per file). No build step, no framework — opens directly
in a browser.

## Key decisions made so far (don't relitigate without reason)
1. **No React / no Vite.** Considered it, rejected it — this is throwaway-after-approval, and
   build tooling adds risk/learning curve for no long-term payoff here.
2. **Tailwind (CDN, no build) + plain JS template functions** is the planned direction for the
   next restructuring pass — not done yet. Goal: pull the repeated sidebar/topbar/card/stat-card
   markup (duplicated almost identically between `company.html` and `admin.html`) into
   `shared/components.js`, and shared design tokens into `shared/theme.css`. This is mainly to
   cut editing effort AND to cut Claude token usage — smaller files per edit instead of
   1000+ line monoliths.
3. **`shared/` folder exists but is empty** — the extraction hasn't happened yet. Do this before
   or alongside adding new pages, not after, so new pages are built on the shared components
   rather than more copy-pasted markup.
4. Files started as the intern's working versions (31 Aug 2026), then iterated through versions 1.2 and now 2.0.

## PM review notes (from acting as senior fintech PM on the existing build)
**Strengths to protect/keep prominent in the pitch:**
- Text-to-speech + voice language picker in `employee.html` (`speakScreen`, language modal) —
  genuinely differentiating for low-literacy blue-collar users, better than most EWA competitors.
- Bilateral loan agreement flow (employee + Neev) — changed from tripartite; keeps Neev compliant
  with digital lending guidelines.
- VAN (virtual account number) based repayment collection, FnF/exit recovery flow — real
  fintech patterns, not just UI polish.

**Gaps flagged, not yet fixed:**
- Confirm-advance screen should visibly show a full cost breakdown (Key Fact Statement style) —
  RBI digital lending rules expect this; investors will ask.
- Voice narration exists but full UI text localization (Hindi/regional script, not just TTS)
  would widen who can self-navigate.

**Traction features proposed, not yet built (ranked):**
1. On-time repayment → visible credit-limit increase (streak/gamification) — `employee.html`'s
   `s-history` screen already has scaffolding for this (`hist-limitNote`, badge levels) — extend it.
2. WhatsApp-based balance check/reminders (not just in-app notifications).
3. Employer-facing "ROI / attrition impact" analytics on `company.html`'s Analytics screen — this
   is what actually gets employers like Zomato to renew, prioritize over more employee-side polish.
4. First-advance-free / instant-approval framing, if not already emphasized.

## Architecture: employee.html

### Screen navigation
- All screens are `<div class="screen" id="s-xxx">`, only one has `.active` at a time.
- `go('s-xxx')` switches screens (defined in `employee/js/core.js`).
- Phone mockup div is 812px fixed height with `overflow:visible` — content below that is invisible in the phone frame. This is a known pre-existing limitation.
- Language modal auto-appears and may block interaction; dismiss via JS if needed during testing.

### State object `S`
Global state stored in `S` (defined in `core.js`). Key fields added/used:
- `S.company`, `S.ecn`, `S.salary`, `S.department`, `S.designation` — employer info
- `S.name`, `S.aadhaar`, `S.mobile`, `S.dob`, `S.gender`, `S.address` — identity
- `S.currentAddress` — current address (may differ from Aadhaar address)
- `S.signupCompany` — company name captured during signup (for lead gen, before formal employer verify)
- `S.panNumber`, `S.panName` — PAN card info
- `S.enachConfirmed`, `S.esignConfirmed`, `S.t2eSigned` — loan consent flags (t2e name retained in code, now bilateral)
- `S.region` — employer region from KNOWN_COMPANIES
- `S.bsSelectedAccount` — bank account user selected as salary account during bank statement step
- `S.bankStatementDone` — flag: bank statement + ESIC/EPF verification completed (gates access to Loans Hub)
- `S._fromLoans` — flag: employer verify was triggered from loans flow (routes back to loan after verify)
- `S._panThenLoan` — flag: PAN capture was triggered from loan flow (routes to permissions after PAN)
- `S._panFetched` — temporary PAN OCR data before user confirms
- `S.hrReferral` — {name, phone, email, company} collected when user's company isn't partnered with Neev

### JS files (in `employee/js/`, loaded via `<script>` tags with `?v=N` cache busting)
| File | Purpose | Current version |
|------|---------|-----------------|
| `core.js` | `go()`, `toast()`, `fmt()`, state `S`, nav helpers | — |
| `main.js` | Init, bottom nav, profile rendering | — |
| `signup.js` | Phone OTP → straight to home; existing number → redirects to login; camera modal also serves schemes OCR | `?v=8` |
| `login.js` | Returning user login | — |
| `home.js` | Home screen, banner carousel (profile CTA: employer → DigiLocker KYC → PIN), Sakhi, Loans Hub slider | `?v=8` |
| `employer-setup.js` | Name prompt (if missing) → Company select (with badge scan) → ECN verify → phone OTP; BuildRight always resolves to Ramesh Kumar (demo) | `?v=12` |
| `pan.js` | DigiLocker (Aadhaar+PAN) + KYC consents + selfie face match | `?v=8` |
| `apply.js` | Loan flow: reason tiles → KFS (collapsible) → T&C → e-sign/e-nach → success; not-partnered screen (company name + HR contact) | `?v=13` |
| `bankstatement.js` | AA consent + OTP → fetch accounts → select salary account (no upload, no ESIC/EPF) | `?v=6` |
| `enach.js` | E-NACH mandate modal (auto-populated from AA, readonly fields) | `?v=4` |
| `permissions.js` | Loan consents (CIBIL, EPFO, ESIC) — 3 toggles only, no AA | `?v=3` |
| `i18n.js` | Language selection (Hindi, English, Voice only), translation, voice/TTS | `?v=4` |
| `insurance.js` | Insurance products flow | — |
| `investment.js` | FD/investment flow | — |
| `schemes.js` | Govt schemes: Aadhaar + profile (`s-scheme-profile`) → gamified quiz (CF-15) → eligibility-matched list with docs, scheme-specific agent form | `?v=19` |
| `ledger.js` | Loan list, loan detail, repayment timeline | — |
| Others | `loyalty.js`, `referral.js`, `bbps.js`, `grievance.js`, etc. | — |

### Modals
- Pattern: `<div class="modal-bg" id="xxxModal">` with `.show` class to display.
- E-NACH modal: `id="enachModal"` — form with bank details, mandate setup.
- E-Sign modal: `id="esignModal"` — name input (first-time) or OTP-only (repeat), no auto-fill button (removed in 2.0).
- Loan T&C modal: `id="loanTcModal"` — full Terms & Conditions (11 sections), checkbox to agree, then reveals e-sign/e-nach.
- Camera permission modal: `id="cameraPermModal"` — allow/deny for Aadhaar scan.

## Changes made (all in employee.html app)

### 1. Signup OTP "Verified" button
- After OTP verification, button text changes to "Verified ✓", gets disabled with reduced opacity.
- File: `signup.js` → `verifySignupOtp()`

### 2. Current address capture during signup
- After Aadhaar scan, shows Aadhaar address with checkbox "This is my current address".
- If unchecked, reveals fields: address line, city, state, PIN.
- Saves to `S.currentAddress` (different from `S.address` which is Aadhaar address).
- HTML: `id="signupAddressBlock"`, `id="currentAddressFields"`, `id="sameAddressCheck"`
- JS: `toggleSignupAddress()` (named to avoid conflict with existing `toggleCurrentAddress()` in identity-verify section), `completeSignup()` validates and saves address before calling `finishSignup()`.

### 3. Loan details: APR unbolded + Interest row added
- APR row: removed `total` class (was bold), matches font size of other rows.
- Added "Interest" row showing the service charge amount in the cost breakdown.
- Location: loan details breakdown rows in `employee.html` (~line 1021-1028).

### 4. E-Sign converted to modal (like E-NACH)
- Previously inline section; now checkbox-based card that opens a modal form.
- E-Sign card: checkbox + label, clicking opens modal (`onEsignCheckClick()`).
- E-Sign modal (`id="esignModal"`): name input, Aadhaar OTP fields, auto-fill button, confirm/cancel.
- First-time vs repeat: first-time shows name input + agreement text; repeat shows "T2E already signed" banner, skips name.
- Order on KFS screen: E-Sign card first, then E-NACH card below it.
- JS functions: `onEsignCheckClick()`, `openEsignForm()`, `autoFillEsign()`, `confirmEsignForm()`, `cancelEsignForm()` — all in `apply.js`.

### 5. Insurance & Investment "Done" buttons fixed
- Insurance success screen "Done" → `go('s-home')` (was going to wrong screen).
- Investment/FD success screen "Done" → `go('s-home')`.

### 6. Separated employer verify from loan flow + progressive KYC gate
Two distinct scenarios:
- **Scenario A — User clicks "Complete your employer verification" nudge on home**: Only verifies employer (company select → ECN → phone OTP), then goes to home. Does NOT ask for PAN or redirect to loans.
- **Scenario B — User clicks Loans tile**: Progressive KYC gate in `openLoansEntry()` checks each prerequisite in order and routes to the first missing step:
  1. Employer verify (if `!S.company`) → `startEmployerSetup()` with `S._fromLoans=true`
  2. PAN capture (if `!S.panNumber`) → `openPanCapture()` with `S._panThenLoan=true`
  3. Permissions (if not all 3 granted) → `startPermissions()`
  4. Bank statement + ESIC/EPF (if `!S.bankStatementDone`) → `openBankStatementStep()`
  5. If all done → `openLoansHub()` (salary dashboard)
- **Full first-time loan flow (2.0)**: Employer verify (with badge scan + company select) → DigiLocker KYC (Aadhaar+PAN + consents + selfie) → Bank Statement (AA consent + OTP → fetch accounts → choose salary account) → Loans Hub (interactive slider + manual input) → Get Advance (reason tiles) → KFS (collapsible sections) → T&C → E-Sign/E-NACH → Success
- Key routing:
  - `employer-setup.js` → `verifyEcnPhoneOtp()`: checks `S._fromLoans` flag; if true → PAN (or permissions if PAN done), else → `go('s-home')`.
  - `pan.js` → `confirmPanDetails()`: checks `S._panThenLoan`; if true → `startPermissions()`, else → `openLoansHub()`.
  - `permissions.js` → `continueFromPermissions()`: → `openBankStatementStep()`.
  - `bankstatement.js` → `finishBankStatementStep()`: sets `S.bankStatementDone=true`, → `openLoansHub()`.
  - `apply.js` → `goToConfirm()`: → `continueFromBankStatement()` (directly to KFS, since all verifications already done).
  - Home screen "Verify my employer" button: calls `startEmployerSetup()` WITHOUT setting `S._fromLoans`.

### 7. Loan Account Number label
- Success screen: changed "Loan Account (LAN)" to "Loan Account Number (LAN)" at ~line 1123.

### 8. Splash screen skip — language selection auto-navigates to signup
- Selecting a language on the splash screen now goes straight to signup (no "Get started" button tap needed).
- The `selectLanguage()` function in `i18n.js` checks if the active screen is `s-splash` and calls `go('s-signup')`.
- "Get started" button still exists as fallback if the language modal is dismissed without picking.

### 9. Account Aggregator consent (moved to bank statement screen)
- AA consent is no longer on the Loan Consents screen (`s-permissions`). The permissions screen now has only 3 toggles: CIBIL, EPFO, ESIC.
- `ALL_PERM_KEYS` array is now `['cibil','epfo','esic']` (3 items, no AA).
- AA consent is handled entirely on the bank statement screen (`s-bank-statement`): checkbox → OTP → fetch accounts → choose salary account → upload statement.

### 10. Loan Terms & Conditions modal before e-sign/e-nach
- Clicking "I agree to the loan terms..." checkbox now opens `loanTcModal` instead of directly revealing e-sign/e-nach.
- Modal contains scrollable T&C document (11 sections: nature of facility, eligibility, charges, repayment, T2E, E-NACH, cooling-off, data privacy, grievance, governing law).
- Checkbox at bottom: "I have read and agree to the above Terms & Conditions...".
- On accept → modal closes → agree checkbox checked → e-sign and e-nach cards reveal.
- JS functions: `openTcModal()`, `toggleTcAgree()`, `confirmTcModal()`, `cancelTcModal()` — all in `apply.js`.

### 11. Company name capture during signup (lead gen)
- After OTP verification, a new "Where do you work?" step appears before Aadhaar scan.
- Dropdown with known companies (BuildRight, QuickServe, SecureGuard, Zomato, Swiggy, Urban Company, BigBasket, Dunzo, Porter, Rapido) + "Other (type below)" option.
- Selecting "Other" reveals a free-text input for any company name.
- Saves to `S.signupCompany` — separate from `S.company` (which is set during formal employer verification later).
- Purpose: capture company names early for B2B lead gen, even from users who only use Neev for govt schemes.
- HTML: `id="signupCompanyBlock"`, `id="signupCompanySelect"`, `id="signupCompanyOther"`
- JS functions: `onSignupCompanyChange()`, `continueFromSignupCompany()` — in `signup.js`.
- Flow: Phone OTP → **Company select** → Aadhaar scan → Address → Home.

### 12. Profile button moved from bottom nav to avatar
- Removed the Profile button from the bottom nav (now 3 buttons: Home, Ledger, Scan).
- The user's initials avatar (RK) on the home screen header is now clickable — tapping opens Profile.

### 13. Interest percentage on KFS
- Interest row on the Key Fact Statement now shows "Interest (1.5% per week)" with the percentage.
- Interest amount is also dynamically populated via `kfsInterest` in `apply.js`.

### 14. Disbursement "Save account" button
- The "+ Add another account" form in KFS now has a "Save account" button.
- Validates account number, IFSC, and bank name fields.
- Adds the new account to the dropdown (e.g. "HDFC Bank ****6789"), auto-selects it, hides the form.
- JS function: `saveOtherBankAccount()` in `apply.js`.

### 15. Aadhaar scan moved to separate screen
- Aadhaar capture was previously nested inside `s-signup` as a hidden block. Now it's a standalone screen `s-signup-aadhaar`.
- Flow: Phone OTP → Company select → **Continue navigates to `s-signup-aadhaar`** → scan/manual → address → home.
- New screen has its own topbar with back arrow (returns to `s-signup`).
- Aadhaar capture state resets each time the screen is entered.
- Added `s-signup-aadhaar` to `RESTORABLE_SCREENS` in `core.js`.

### 16. AA consent checkbox on bank statement screen
- The bank statement screen (`s-bank-statement`) previously showed the AA OTP input immediately.
- Now shows: consent disclosure text → checkbox "I agree to share my financial data via Account Aggregator" → OTP appears only after checkbox is checked.
- Same pattern as the AA consent modal on the permissions screen.
- JS function: `toggleBsAaConsentOtp()` in `bankstatement.js`.
- After OTP verification, checkbox row hides and "Consent verified" badge shows.

### 17. Home screen banner carousel (replaces profile nudge)
- Replaced static `profileNudge` div with swipeable banner carousel (6 slides).
- Slides: profile completion progress + 5 promos (gold, insurance, referral, salary advance, bills).
- Auto-rotates every 2 seconds, supports touch/mouse swipe.
- Profile completion slide is removed once profile is 100% complete.
- HTML: `id="bannerCarousel"`, `id="bannerTrack"`, `id="bannerDots"`.
- CSS: `.banner-carousel`, `.banner-track`, `.banner-slide`, `.banner-card` with color variants (`--profile`, `--gold`, `--insurance`, `--referral`, `--advance`, `--bills`).
- JS in `home.js`: `initBannerCarousel()`, `updateProfileSlide()`, `goToSlide()`, `nextSlide()`, touch/mouse handlers, `startBannerTimer()`.
- Legacy compat: `updateProfileNudge()` calls `updateProfileSlide()` + `initBannerCarousel()`.

### 18. Removed "Gullak" text from FD/investment tiles
- Small FD tile and FD screen title no longer say "Gullak".

### 19. Removed language modal description texts
- Removed subtitle text and "All languages are supported" from language selection modal. Only title remains.

### 20. Company auto-skip in employer setup
- If `S.signupCompany` matches a known company, the company dropdown (`id="esCompanyRow"`) is hidden during employer verify — user only needs to enter ECN.
- `KNOWN_COMPANIES` in `employer-setup.js` now includes `region` field (Pune, Mumbai, Delhi NCR).
- Verified popup shows department + region: `'🏢 '+(S.department||'Operations')+' · '+(S.region||'Mumbai')`, stays for 3 seconds.

### 21. Bilateral agreement (replaces tripartite)
- All references to "tripartite", "T2E", "3-way agreement" changed to "Loan agreement" (bilateral between employee and Neev only).
- Removed description texts from E-Sign and E-NACH cards on KFS screen.
- Updated Hindi translations in `i18n.js`.

### 22. Salary account hint on bank statement screen
- Added `id="bsSalaryHint"` card asking "Which account does your salary get credited to? Select that account and upload its bank statement."
- Shown after AA fetches bank accounts.
- Removed AA consent disclosure paragraph from bank statement screen.

### 23. Static disbursement display (replaces dropdown)
- Disbursement dropdown removed from KFS screen.
- Replaced with static display of the salary account user selected during bank statement step.
- HTML: `id="kfsSalaryAccountDisplay"`, `id="kfsSalaryBank"`.
- `populateDisbursementAccounts()` in `apply.js` now populates the static element.

### 24. Loan user personalization strips
- White card strip with teal avatar showing user initials, name, and company on all 3 loan screens (s-apply, s-bank-statement, s-kfs).
- HTML: `.loan-user-strip` divs on each screen.
- CSS: `.loan-user-strip`, `.loan-user-avatar` (teal gradient circle).
- JS: `renderLoanUserStrips()` in `apply.js`, called from `openApply()` and `openBankStatementStep()`.

### 25. Removed "Remaining salary to you" from repayment timeline
- Removed timeline step from loan detail view in `ledger.js`.
- Removed corresponding Hindi translation from `i18n.js`.

### 26. Government schemes state selector
- Replaced static scheme cards with state-aware dynamic rendering.
- HTML: state dropdown (`id="schemeStateSelect"`, 14 states), count text (`id="schemeCountText"`), dynamic container (`id="schemesList"`), hint (`id="schemeStateHint"`).
- JS in `schemes.js`: `CENTRAL_SCHEMES` (3 schemes available everywhere), `STATE_SCHEMES` (2 schemes per state for 14 states), `initSchemes()`, `onSchemeStateChange()`, `renderSchemes()`, `getStateFromAddress()`, `updateSchemeHint()`.
- Auto-selects state from user's Aadhaar address; shows "Based on your address" or "You changed from X" hint.
- Each scheme card has "Central" or state-name badge, Apply Yourself (free) and Apply with Agent (₹49) buttons.
- Tile on home: `onclick="initSchemes();go('s-schemes')"`.

### 27. Employer verify routes through progressive KYC chain
- After employer verify with `S._fromLoans=true`, routes to PAN → Permissions → Bank Statement → Loans Hub (not directly to Loans Hub).
- User completes all verification steps before seeing salary details in Loans Hub.

### 28. Removed "Verify your employer" intermediate screen from Loans Hub
- The `loansVerifyPrompt` card (🏢 "Verify your employer to get started") is no longer shown.
- `openLoansEntry()` handles all prerequisite routing before reaching Loans Hub.
- `renderLoansHub()` always shows the dashboard directly (no redirect logic).

### 29. "Link your employer" renamed to "Verify employment details"
- Employer setup screen (`s-employer-setup`) topbar title changed.
- Home screen nudge text updated to match.

### 30. PAN verification required before Loans Hub
- `openLoansEntry()` checks `S.panNumber` after employer verify.
- After PAN confirm with `_panThenLoan`, routes to `startPermissions()` (not Loans Hub).

### 31. Restructured loan flow: all verifications before amount selection
- Old flow: Loans Hub → Get Advance → Permissions → Bank Statement → KFS
- New flow: Employer → PAN → Permissions → Bank Statement (AA + ESIC/EPF) → Loans Hub → Get Advance → KFS
- Rationale: client needs salary data from 3 sources (payroll, AA, bank statement) upfront, so all input collection happens before showing the advance screen.
- `goToConfirm()` in `apply.js` now goes directly to KFS (calls `continueFromBankStatement()`).
- Loan consent modal (`loanConsentModal`) and its JS functions removed — permissions is now a full screen step.
- Step stepper (`.loan-steps`) removed from apply, bank statement, and KFS screens.

### 32. E-Sign and E-NACH cards made compact on KFS
- Removed "Confirm E-Sign" and "Confirm E-NACH" text labels from checkbox cards.
- Cards now single-row: title on left, checkbox on right, with tighter padding (`12px 14px`).

### 33. Bank statement saves salary account to state
- `uploadBankStatement()` in `bankstatement.js` now saves `S.bankName` and `S.bankLast4` from the selected AA account.
- `finishBankStatementStep()` sets `S.bankStatementDone=true` and routes to `openLoansHub()`.

### 34. Government schemes hint updated to "Based on your Aadhaar address"
- `updateSchemeHint()` in `schemes.js` now shows "Based on your Aadhaar address" (was "Based on your address").
- Default hint text in HTML updated to match.
- Cache bumped to `?v=3`.

### 35. Bank statement screen UI redesign
- Topbar title changed from "Verify your details" to "Bank verification".
- Added centered hero section with bank icon in styled container, "Link your bank account" heading, and trust description.
- AA consent card redesigned: green header bar with lock icon + "Account Aggregator consent", checkbox in padded body.
- Added trust footer: "Regulated by RBI · 256-bit encrypted · Read-only access".
- Fetching accounts loading state improved with styled icon circle and subtitle text.

### 36. Loans Hub salary display made dynamic
- Salary amount in meter footer was hardcoded "₹20,000/mo" — now dynamically set from `S.salary` via `renderLoansHub()`.
- Company name in meter footer also dynamically set from `S.company`.
- HTML: added `id="meterSalary"` to the salary span.
- JS: `renderLoansHub()` in `home.js` now sets `companyNameHome` and `meterSalary`. Cache bumped to `?v=5`.

### 37. "Not partnered" screen for unknown companies
- When user selected "Other" company during signup and taps Loans tile, they see `s-not-partnered` screen instead of employer dropdown.
- Screen shows "We're not with [company] yet" with company name from `S.signupCompany`.
- Collects HR/Manager contact: name (required), phone (required), email (optional).
- On submit: saves to `S.hrReferral`, shows toast, navigates to home after 1.2s.
- Bottom hint: "You can still use insurance, investments & government schemes".
- Gate: `openLoansEntry()` in `apply.js` checks `S.signupCompany && !KNOWN_COMPANIES[S.signupCompany]` before employer setup.
- JS functions: `openNotPartnered()`, `submitHrReferral()` in `apply.js`. Cache bumped to `?v=10`.
- Also updated `esNotTiedUp` "Request my company" button to point to `s-request-company` (dead link, screen not yet built — `s-not-partnered` handles the loans flow case).

## Version 2.0 changes (client feedback, Sep 2026)

### CF-1. Language options reduced
- Only Hindi, English, and Voice in the language modal. All other languages removed.
- File: `i18n.js` `?v=3`

### CF-2. OTP auto-read simulation
- After OTP is sent, boxes auto-fill with "1234" after 1.5s delay (simulates SMS auto-read).
- File: `signup.js` `?v=4`

### CF-3. Simplified onboarding
- After OTP verification, user goes straight to Home.
- "Where do you work?" step removed from signup (moved to employer verify in CF-5).
- Aadhaar scan step removed from signup (moved to DigiLocker KYC in CF-6).
- File: `signup.js` `?v=4`

### CF-4. Home screen tile changes
- Bill Payments tile removed.
- Points + Referral merged into single "Cash" tile with "Redeem Cash" and "Get ₹50 on successful conversion".
- Insurance tile: Personal, Accident, Two-Wheeler.
- Investment tile: Gold/Silver added, Small FDs removed.
- Files: `employee.html`, `home.js` `?v=6`

### CF-5. Employer verification redesign
- Company select moved here from signup onboarding.
- Badge scan option added ("Scan your employee badge" to auto-fetch details).
- If employer not listed: "Add company name" + "Scan your badge" options.
- Files: `employee.html`, `employer-setup.js` `?v=9`

### CF-6. DigiLocker KYC (replaces PAN photo)
- PAN photo step replaced with DigiLocker — fetches Aadhaar and PAN together.
- All consents collected on this screen: CKYC, CIBIL, EPFO, ESIC.
- After DigiLocker fetch, selfie capture for face match (CERSAI CKYC requirement).
- Files: `employee.html`, `pan.js` `?v=7`

### CF-7. Bank statement upload removed
- "Upload bank statement" option removed. Only AA account selection remains.
- Files: `employee.html`, `bankstatement.js` `?v=6`

### CF-8. ESIC/EPF fields removed from bank step
- ESIC number and UAN (EPF) fields removed from bank verification stage.
- To be collected after the employee takes the advance.
- Files: `employee.html`, `bankstatement.js` `?v=6`

### CF-9. Loans screen interactive withdraw
- "Salary earned so far" card removed.
- "You can withdraw up to ₹7,000" tile now has slider + manual entry field.
- After withdrawal, shows remaining withdrawable amount.
- Files: `employee.html`, `home.js` `?v=6`

### CF-10. Advance reason tiles
- "Why do you need this advance?" dropdown replaced with 4 selectable tiles: Medical, Personal, Education, Others.
- Files: `employee.html`, `apply.js` `?v=11`

### CF-11. KFS collapsible sections
- Each KFS section heading is now collapsible (expand/collapse).
- Loan details + Disbursement open by default, others collapsed.
- File: `employee.html` (inline `toggleKfsSection()` + CSS)

### CF-12. E-Sign auto-fill removed
- "Auto-fill" button removed from E-Sign modal.
- Files: `employee.html`, `apply.js` `?v=11`

### CF-13. E-NACH auto-populate + readonly
- Salary account auto-populated from Account Aggregator data.
- Bank fields made non-editable (readonly).
- "Cancel" button renamed to "Back".
- Files: `employee.html`, `enach.js` `?v=4`

## Client deployment version
- A separate folder **"Neev Prototype client"** on Desktop contains an older copy (based on 1.2 + some feedback changes) with copy/screenshot protections.
- **This version (2.0) is the latest clean development copy** — no security protections.
- To create a new client deployment: copy this 2.0 folder, run the conversion scripts (convert_to_js.py + obfuscate_names.py), and add protect.js.
- Deploy the **client folder** to Netlify, not this one.

## Sharing online (GitHub Pages)
- Repo is public → GitHub Pages serves it free: `https://irajvaibhavv.github.io/Neev-Prototype-2.0/` (root `index.html` = start page with links + 2-minute demo script; `employee.html`; `agent/` = manager dashboard). `.nojekyll` keeps files served as-is.
- Portal is built with `base: './'` (relative) so it works both at `localhost:3000/agent/` and under `/Neev-Prototype-2.0/agent/`. Keep all paths relative — never `src="/..."`.
- Pages updates automatically on every push to `main` (rebuild `agent/` first if portal source changed).
- Data is per-browser (localStorage): app + dashboard share data only in the same browser on the same device.

## Dev server setup
- `.claude/launch.json` configured with Python HTTP server (`autoPort: true`).
- Command: `python -m http.server` (port assigned automatically, typically 3000).
- Access at `http://localhost:3000/employee.html`
- Required because file:// protocol doesn't load external JS files properly.
- If port 3000 is in use, use `preview_start` with URL to whatever port the server got.

## Common pitfalls
1. **Script caching**: After editing a JS file, bump the `?v=N` query param on its `<script>` tag in `employee.html`, otherwise browser serves the old cached version.
2. **Function name conflicts**: `signup.js` and the identity-verify section both have address-related functions. Use unique names (e.g. `toggleSignupAddress` vs `toggleCurrentAddress`).
3. **Null references after refactoring**: When converting inline elements to modals, update ALL functions that reference the old inline elements (e.g. `continueFromBankStatement()` referenced deleted inline e-sign elements).
4. **Phone mockup overflow**: Content below 812px is clipped by the phone frame. Test by scrolling or checking DOM directly. On real phones (≤ 500px wide) the mockup is dropped: `@media (max-width:500px)` at the end of `employee/style.css` makes `.phone` the full viewport (no frame/notch/fake status bar/side note, safe-area insets, 16px inputs to stop iOS zoom). Keep new fixed/absolute UI inside `.screen-wrap` so it works in both views.

### Dead-code cleanup (Sep 2026)
- Removed screens nothing navigated to: `s-signup-success`, `s-signup-aadhaar` (+ signup company step), `s-identity-verify` (old PAN→Aadhaar→Photo tracker), `s-invest-fd` (FDs dropped in CF-4), plus their JS and ~50 unused CSS rules. Changes #2, #11, #15 below describe those removed steps (history only).
- `grantCameraPermission()` in `signup.js` now only serves the schemes Aadhaar scan. `core.js?v=2`, `investment.js?v=2`, `style.css?v=7`.

### CF-14. Government schemes eligibility flow (replaces state selector)
- Home tile → `openSchemes()`. Aadhaar data + complete `S.schemeProfile` → straight to results; else `s-scheme-profile`.
- `s-scheme-profile`: Part A Aadhaar (scan card OCR mock via shared `cameraPermModal` + `S._camForScheme`, or enter number; skipped if KYC gave aadhaar/gender/dob) → Part B **shortened flow** (Haqdarshak/myScheme research, `docs/research/haqdarshak-onboarding/`), config `SP_QUESTIONS` in `schemes.js`:
  - `auto`: Occupation (from `S.department` via `DEPT_TO_OCCUPATION`) and own income (`S.salary`) prefilled with "Change" — **only if the user did employer verify in the loan flow first**; otherwise asked.
  - `show`/`hidden`: daughter questions only if children > 0; four tax/govt/pension questions only if the gate `AnyTaxGovt` = yes (else implied "no").
  - `optional`: OwnHome, Car. Left blank → `eligibleSchemes()` evaluates rules under every possible answer; differing results → 'maybe' + "To confirm" line (`needs`), never 'yes'.
  - Result: 8 questions direct-to-schemes, 6 via loan flow (was 15). State select defaults to Aadhaar state (client ask).
- Questions + scheme list chosen from deep research (Sep 2026): `docs/research/scheme-eligibility/`. 13 central schemes + 1–2 most-used per state (14 states).
- Schemes whose hard criteria the quiz can't check (Delhi Lakshmi: voter/10-yr/eldest woman; Haryana Lado Lakshmi: 15-yr residency) return `'maybe'`, and the agent form asks those as `must` declarations.
- Each scheme `rule(p)` returns `'yes'` (criteria fully covered by questions), `'maybe'` (official list / unverified rule decides — badge "May be eligible — confirm"), or false. `check` = criteria we can't ask, shown as "Also check". Accuracy over generosity (client requirement).
- "Apply with Agent" opens a scheme-specific form (`openAgentForm`): Aadhaar + the 13 answers prefilled read-only, then "New details" from `SCHEME_FORM` in `schemes.js`. **Rule: only fields CONFIRMED from the scheme's official form** (research: `docs/research/scheme-forms/`) — never add a field from memory/aggregators. 14 schemes have confirmed fields; the rest show "form not verified — agent collects the rest". Bank a/c is asked only where the form requires it. `must` = eligibility declaration that blocks submit. Submissions saved to `S.schemeApplications`. TODO: confirm forms for PM-SYM, e-Shram, PM-KISAN, Sukanya, NFSA, PM-JAY, Ladki Bahin, Gruha Lakshmi, MAA, TN/Odisha/WB/Gujarat (portals blocked fetch — needs browser/PDF).
- Check: `node tests/schemes.check.js`. File: `schemes.js` `?v=12`, `style.css?v=4`, `signup.js` `?v=6`, `style.css?v=2`
### CF-15. Gamified schemes quiz (lead feedback: too much text, too many questions → drop-off)
- `s-scheme-profile` is now **one question per screen**: big icon + short question + tap tiles (auto-advance), Skip, Back. Top bar = live counter `✅ N for you · 🔒 M to unlock` + progress bar + state picker.
- 3 levels (`lvl` in `SP_QUESTIONS`: Work / Family / Home) with a checkpoint after each: "N schemes for you · 🔒 M more · K quick questions" → Keep going / See my schemes.
- **Unlocked schemes stay on screen** (user ask): teal hero card = big unlocked count + 🔒 left + horizontal shelf of won schemes (icon, name, ₹ benefit = `win` field, taken from each scheme's research-based `desc`). Newly unlocked ones pop in with a NEW tag (`renderSpShelf`, `spShelfSeen`). Level pills Work / Family / Home replace a question counter (the total changes as questions become irrelevant).
- **Optional PAN** after Aadhaar in the same card (`spPanStep`, `saveSchemePan`): skipped if loan KYC already has PAN. Stored as `S.schemePan`, NOT `S.panNumber` — otherwise the loan flow would skip DigiLocker KYC. Counts for the "Parent Aadhaar & PAN" document and shows masked in the agent form.
- **Only questions that can still change a result are asked.** `schemeStatus()` tries every possible answer for unanswered questions a rule reads (`ruleKeys` parses `p.x` from the rule; `P_KEYS` maps to question keys): never true → hidden, always true → yes/maybe, depends → `'locked'` + `needs`. Replaces the old `optional` flag; any question can be skipped. Worst case 9 questions direct, 7 via loan flow; usually fewer.
- Answers saved after every tap (raw, not resolved — implied answers come from `spResolve`), so users can leave and return. Results: "🔒 Unlock N more" card asks the next useful question inline; scheme cards show name + ₹ benefit + badge, details/documents folded in `<details>`. "Edit answers" = `openSchemeProfile('edit')` (every question, current answers selected).
- PM Awas no longer reads family income (₹9L limit ≈ ₹75k/month — almost no user is above it): rule returns 'maybe', limit shown in its "Also check". So family income is asked only where a state scheme needs it (e.g. Delhi/Maharashtra women, everyone in Haryana).
- Family income asked per month (labels rounded down, so conservative); stored values unchanged (portal `labels.js` still valid).
- Files: `schemes.js?v=19`, `style.css?v=11`, `employee.html`, `tests/schemes.check.js`.
5. **Broken clicks**: after any HTML/JS change run `node tests/clicks.check.js` — flags onclick handlers calling undefined functions, go()/navTo()/goBack() to missing screens, and getElementById on missing ids. It can't judge whether a destination makes *sense* — check that by reading labels.
6. Bottom-nav **Scan** opens the scanner directly; the bank-account gate (`requireBank`) sits on the Pay button, not on opening the scanner.

## Schemes manager portal (4th app — React, separate from the 3 vanilla prototypes)
- Manager's ask (Sep 2026): see the whole Govt-schemes funnel of app users + work every application. The "no React" decision above covers only the 3 prototype apps; this one is React by request. (An earlier per-agent version was scrapped.)
- Source: `agent-portal/` (React 19 + Vite + Tailwind v4, plain JS, HashRouter). Build: `cd agent-portal && npm run build` → `agent/` (committed), served at `http://localhost:3000/agent/` — same origin as `employee.html`, so it reads the employee app's localStorage live. `npm run dev` (5173) can't see employee data.
- Design = Saralya dashboard (tokens from bank-branch-dashboard.vercel.app in `@theme`, `src/index.css`).
- **Colour rules (user: "too much purple")**: violet `brand` only for primary buttons, logo/avatars and the sidebar active item. Toggles/tabs = neutral segmented control (grey track, active = white pill + dark text). Charts use one hue per measure from the validated dataviz palette: users blue `c-users #2a78d6`, applications orange `c-apps #eb6834`, paid aqua `c-paid #199e70`; breakdown totals in neutral slate with the paid share in aqua. Status colours (ok/warn/bad/info) only for outcomes and stages. **Readability (user: "text too light")**: body weight 500; ink-2 `#3d3354`, ink-3 `#5f5680`, sidebar text/group darkened; links use `text-side-active` (not `text-brand`, 4.2:1); status text ok `#15803d` / warn `#b45309` / info `#1d4ed8` / bad `#b91c1c` — every text colour ≥ 4.5:1 on white and on its own tint. Don't reintroduce the lighter originals.
- **Three roles** (`src/lib/auth.js`, OTP 1234): super admin `9876500000` → `/admin/*`; agent `9876500001` → the applications portal below; sales `9876500002` → `/sales` (placeholder, user is building it next). `App.jsx` picks the area by `user.role`; each area passes its own sidebar `items` to `Shell`. Users stored in localStorage `neev_portal_users` (seeded with the 3 demo accounts); deleted/deactivated users lose their session.
- **Super admin**: Users (CRUD agent/sales users, active toggle; super admin can't be deleted) and Schemes (CRUD). Scheme edits live in localStorage `neev_portal_schemes` as an overlay on `schemeCatalog.json` (`src/lib/schemes.js`: added schemes, edits/deletes keyed by app name, "Undo edits") so re-syncs still work. The agent's Add application picker uses `getSchemes()`. The employee app does NOT see admin-added schemes (its eligibility rules are code in `schemes.js`).
- **Scheme pages**: add/edit is a full page (`/admin/schemes/new`, `/admin/schemes/:id`, `pages/admin/SchemeEdit.jsx`) with enable/disable (disabled = hidden from the agent's Add application picker; stored as `disabled` ids so Undo edits keeps it), description + apply-yourself link (`desc`/`url` synced from the app), and documents picked from Documents.
- **Documents** (`/admin/documents`, `lib/documents.js`, localStorage `neev_portal_documents`): supported document types, seeded from every doc name the schemes use. Each has help text and collection methods: photo (optionally front & back), PDF, typed number (with field label). Schemes reference documents by name; renaming a document rewrites it in every scheme (`renameDocInSchemes`); a document used by any scheme can't be deleted. Documents now has only name + description (collection settings removed from the UI).
- **Sidebar (super admin)**: Manage = Users, Schemes · Master data = Documents, Fields.
- **Fields** (`/admin/fields`, `lib/fields.js`, localStorage `neev_portal_fields`): information fields asked on a scheme's application form — name, description, type (text / number / date / yes-no / dropdown + options), required. Seeded from the app's `SCHEME_FORM` (synced into `schemeCatalog.json` as `fields`). Schemes reference fields by name (rename propagates, used fields can't be deleted).
- **Scheme page tabs**: General (status, details, price `fee`, apply link) · Documents · Information (fields) · Eligibility (age/gender, rules on the app's eligibility questions from `labels.js`, free-text requirements seeded from the app's `check`). All portal-only — the employee app still uses its own coded forms, rules and ₹49 fee.
- **Employee app side (`schemes.js` `?v=14`)**: `trackFunnel(step)` stamps `S.funnel` = schemesOpened (tile) → schemeClicked ("Apply via Neev" opens form) → formStarted (first typing / chip / doc upload; creates a `draft` application) → cartAdded ("Add to cart") → paid (cart checkout). `S.signupAt` = downloaded (`signup.js` `?v=7`). One application per scheme in `S.schemeApplications`: `draft` → `cart` → `paid`, with `docs`/`docsMissing` from mock per-document upload (skipping allowed). Cart screen `s-scheme-cart`: ₹49 × schemes (`SCHEME_FEE`), one mock UPI payment → each shows Complete or Pending. Agent assignment + per-form ₹49 link removed.
- **Portal sections**: Dashboard (KPIs, funnel with % continued / dropped and click-through, application summary cards, outcomes, by scheme, recent) · Leads (tabs: Viewed schemes / Clicked a scheme = interested but not started) · Applications: **New** (paid + all docs) · **Incomplete** (draft or in cart, unpaid) · **Pending** (paid, docs missing; "Documents received → New") · **Filled** (manager moved it after filing; outcome In process / Approved / Disapproved + filter tabs).
- Data: `src/lib/applications.js` (`loadAll`, `funnelCounts`, `leadsAt`, `useData`); manager decisions in localStorage `neev_agent_stages` (not synced back to app). `src/lib/sample.js` = ~500 seeded demo users (funnel ≈ 500→300→120→69→26→12); top-bar toggle "Include sample data"; live users tagged LIVE.
- **Application detail** (`/application/:id`, `pages/ApplicationDetail.jsx`): header with stage/outcome + actions, applicant (Aadhaar), eligibility answers (labels in `lib/labels.js` — mirror of `SP_QUESTIONS`, update together), scheme form fields, documents uploaded/missing, timeline (user steps + manager actions from `history`). Applicant names in section tables and dashboard "recent" link here.
- **Missing-document reminders** (`components/ReminderModal.jsx`, `lib/reminder.js`): Hindi/English message listing missing docs; real `wa.me` WhatsApp and `sms:` deep links; each send logged in `neev_agent_stages[id].reminders` and shown as "Reminded N×". Available on Pending rows and the detail page.
- **Trends** (`/trends`, `pages/Trends.jsx`): 7/30/60-day range; separate daily column charts (sign-ups, applications started, paid) — one per measure, never dual-axis; users by state and applications by scheme with paid %. Chart/Table toggle, hover tooltips. Brand violet validated with the dataviz palette validator.
- **Agent powers** (manager's ask): (1) **Remove application** — soft delete with required reason (`REMOVE_REASONS`; "Not eligible"/"Other" need details) → **Removed** section, restorable; paid ones flagged "₹49 refund due". Only that scheme is removed, the person's other applications stay. (2) **Documents** — agent can Delete an uploaded doc or mark a missing one Uploaded (`docOverrides`); section recomputes (Pending ↔ New). "Documents received → New" marks all missing as uploaded. (3) **Add application** for any person (detail page "+ Add another scheme", Leads "+ Add application"): pick from the synced catalogue, fee collected (₹49) or waived, tick documents collected → New or Pending. Stored in localStorage `neev_agent_added`. All actions logged to the timeline (`history[].note`).
- **Minimal documents rule** (user: "why ask Aadhaar again?"): `docOnFile(doc, scheme)` in `schemes.js` (`?v=15`) marks documents we already hold — Aadhaar card / parent Aadhaar / address or residence proof (Aadhaar verified), mobile & Aadhaar-linked mobile (OTP), bank account details (asked in that scheme's form, or verified in loan KYC), parent Aadhaar & PAN (DigiLocker). Those are never shown for upload, are saved as `'on-file'`, never count as missing, and scheme cards list only `docsToAsk(s)`. Conservative on purpose: copies like "Bank passbook", ration card, certificates are still asked. Portal shows them as "On file" (not deletable) and pre-ticks them in Add application.
- Scheme catalogue for the portal: `agent-portal/src/lib/schemeCatalog.json`, generated from `employee/js/schemes.js` by `scripts/sync-schemes.mjs` (runs as `prebuild`) — never edit the JSON by hand.
- Checks: `node agent-portal/tests/applications.check.mjs`, `node agent-portal/tests/admin.check.mjs`, `node tests/schemes.check.js` (includes cart flow).
- Next (user will add): more content, application detail, documents view.
