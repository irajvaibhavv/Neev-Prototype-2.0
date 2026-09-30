# Central health, insurance, pension and worker-registration schemes: eligibility for blue-collar and unorganised workers (as of Sep 2026)

Confidence tags: [H] high = official source read directly; [M] medium = official snippet or several agreeing secondary sources; [L] low = one secondary source or my own inference.
Note: pib.gov.in, labour.gov.in PDFs and jansuraksha.gov.in PDFs returned 403 or TLS errors when fetched. Their content here comes from search-result snippets of those official pages, so it is tagged [M] unless another official page confirmed it.

## Ayushman Bharat PM-JAY (including Vay Vandana 70+, ASHA/Anganwadi, gig workers)

### Takeaway
Only two routes can be decided from a questionnaire alone: (a) age 70 or more, which qualifies anyone regardless of income, and (b) ASHA, Anganwadi worker or Anganwadi helper. Core PM-JAY eligibility depends on whether the family appears in the SECC-2011 database or a state-supplied list, so an app can say "possibly eligible, check beneficiary.nha.gov.in" but should not say "eligible". As of the latest official sources found (Dec 2025), PM-JAY cover for platform/gig workers had been announced but not confirmed as launched.

### Cited Findings
- Benefit: Rs 5 lakh per family per year for secondary and tertiary hospitalisation, cashless, at 31,000+ empanelled hospitals [H/M] — [PIB, Labour Ministry on platform workers](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2109421)
- Rural SECC deprivation criteria used for PM-JAY: D1 one room with kucha walls and roof; D2 no adult member aged 16-59; D3 female-headed household with no adult male aged 16-59; D4 disabled member and no able-bodied adult; D5 SC/ST household; D7 landless household earning mainly from manual casual labour. D6 is not used [M] — [PMC review of Ayushman Bharat](https://pmc.ncbi.nlm.nih.gov/articles/PMC10360977/); [District Kangra (govt) PMJAY page](https://hpkangra.nic.in/scheme/pmjay-ayushman-bharat-or-ab-nhpm/)
- Rural automatic inclusion: households without shelter, destitute or living on alms, manual scavenger families, primitive tribal groups, legally released bonded labourers [M] — same sources as above
- Urban: 11 occupational categories, including rag-pickers, beggars, domestic workers, street vendors and cobblers, construction workers, plumbers, masons, head-load workers, daily-wage workers and electricians [M] — [PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10360977/)
- March 2024: 37 lakh families of ASHAs, Anganwadi Workers and Anganwadi Helpers were added [M] — [PIB_India on X](https://x.com/PIB_India/status/1870072084451471629); [Business Standard](https://www.business-standard.com/budget/news/interim-budget-over-3-mn-asha-anganwadi-workers-added-to-ayushman-bharat-124020101499_1.html)
- 29 Oct 2024 (Ayushman Vay Vandana): every citizen aged 70+ is covered "irrespective of socio-economic status". People on CGHS, ECHS or Ayushman CAPF must choose between that scheme and PM-JAY. Those with private insurance or ESIC remain eligible [M] — [PIB, Vay Vandana enrolment](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2082288&reg=48&lang=2) (snippet); [PIB_India on X](https://x.com/PIB_India/status/1870072084451471629); [Niva Bupa (secondary)](https://www.nivabupa.com/govt-scheme-articles/ayushman-vay-vandana-card.html)
- Families already covered by PM-JAY get an extra Rs 5 lakh top-up that only their 70+ members can use [L]. This is widely reported but was not confirmed from an official page in this session.
- Gig and platform workers: Budget 2025-26 announced e-Shram registration, ID cards and PM-JAY healthcare for online platform workers. A Labour Ministry release said the scheme was "soon" to be launched and urged platform workers to register on e-Shram [M] — [PIB PRID 2109421](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2109421)
- As of 1 Dec 2025, about 5.12 lakh platform workers were registered on e-Shram. The Rajya Sabha reply lists the budget measures but the snippets do not show a launch date [M] — [PIB, Welfare schemes for gig economy workers](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2196927&reg=3&lang=1)
- A secondary blog says gig-worker PM-JAY was rolled out nationally in 2026 with e-Shram UAN as the gate. It cites no official notification and contains doubtful claims (e.g. "no upper age limit"), so treat it as unreliable [L] — [indiapolicyhub.in](https://indiapolicyhub.in/2026/06/12/gig-workers-ayushman-bharat-enrollment-guide-2026/)
- Sep 2026, 8-year milestone: 48.5 crore Ayushman cards, 38,000+ hospitals, and 1.36 crore Vay Vandana cards [L/M] — [Organiser, 25 Sep 2026](https://organiser.org/2026/09/25/382568/bharat/ayushman-bharat-completes-eight-years-with-48-5-crore-cards-distribution-and-13-25-crore-hospital-admissions/)

### Inferences
- For zero false positives:
  - Mark eligible only if age is 70 or more (and not on CGHS/ECHS/CAPF, or willing to switch), or if the user is an ASHA, Anganwadi worker or Anganwadi helper.
  - Construction, domestic and urban casual workers match the SECC occupational categories, but whether their family is covered depends on the 2011 list. Show "may be eligible, verify with Aadhaar at beneficiary.nha.gov.in / PM-JAY app".
  - Gig/delivery workers: show "register on e-Shram; PM-JAY for platform workers is announced". Do not show them as eligible.
- There is no individual income threshold in central PM-JAY. Eligibility is family- and list-based, so a single income question cannot decide it.
- Documents (standard): Aadhaar, ration card or family ID, mobile number for OTP [L, not verified on an official page this session].

### Gaps
- NFSA/Antyodaya linkage: I found no official source this session. It is commonly reported that NHA allowed states to use NFSA/AAY ration-card data to fill SECC gaps, and many states now treat AAY/PHH cards as the entitlement, but this varies by state. Needs a source from pmjay.gov.in or an NHA circular.
- Whether PM-JAY for platform workers actually launched in 2026, and its gating rules (e-Shram UAN, aggregator-verified, family definition): not confirmed officially.
- No official source found for a separate central PM-JAY extension to construction workers (BOCW) in 2025. Some states add them via state schemes.
- Official pages pmjay.gov.in and beneficiary.nha.gov.in were not fetched.

## PM Shram Yogi Maandhan (PM-SYM)

### Takeaway
This is a deterministic questionnaire scheme. The user qualifies if all of these hold: entry age 18-40, monthly income at or below Rs 15,000, unorganised or casual worker, not a member of EPFO/ESIC/NPS, not an income-tax payer, and has Aadhaar and a savings or Jan Dhan account.

### Cited Findings
- Entry age 18-40. Monthly income below Rs 15,000. Occupations include home-based workers, street vendors, head-loaders, brick-kiln workers, cobblers, rag-pickers, domestic workers, and construction, agricultural, handloom and leather workers [H] — [maandhan.in FAQ](https://maandhan.in/show_content.php?lang=1&level=1&ls_id=79&lid=63&page=74)
- Exclusions: covered under NPS, ESIC or EPFO, or any statutory social security scheme; income-tax payers [H] — [maandhan.in FAQ](https://maandhan.in/show_content.php?lang=1&level=1&ls_id=79&lid=63&page=74); [EPFO brief on PM-SYM](https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/Scheme_PM-SYM.pdf)
- Documents: Aadhaar, savings bank or Jan Dhan passbook with IFSC, self-certification form, auto-debit consent. The first contribution is paid in cash at a CSC [H] — [maandhan.in FAQ](https://maandhan.in/show_content.php?lang=1&level=1&ls_id=79&lid=63&page=74)
- Benefit: minimum assured pension of Rs 3,000/month from age 60. Spouse gets 50% as family pension. If the subscriber dies before 60, the spouse can continue the scheme. The Centre matches the worker's contribution 1:1 [H] — [maandhan.in FAQ](https://maandhan.in/show_content.php?lang=1&level=1&ls_id=79&lid=63&page=74)
- Contribution starts at Rs 55/month for an 18-year-old entrant [M] — [Sunday Guardian](https://sundayguardianlive.com/india/pradhan-mantri-shram-yogi-maandhan-pm-sym-yojana-how-to-get-3000-monthly-pension-by-paying-just-55-per-month-eligibility-benefits-explained-179527/)
- If the worker moves into the organised sector (EPFO), they may continue without the government share, or exit with savings-bank interest [H] — [maandhan.in FAQ](https://maandhan.in/show_content.php?lang=1&level=1&ls_id=79&lid=63&page=74)

### Inferences
- Income-boundary wording conflicts: maandhan.in says "less than Rs 15,000", while other briefs say "Rs 15,000 or below". For zero false positives, require income strictly below Rs 15,000.
- A Zomato/Swiggy delivery partner with no ESIC deduction would qualify. A payroll employee with ESIC or EPF would not. The app needs an explicit "Is PF or ESIC deducted from your salary?" question.

### Gaps
- Contribution at age 40 (widely cited as Rs 200/month) was not verified on an official chart this session.
- No 2023-26 rule changes found. Status of this and the related NPS-Traders scheme under the Social Security Code was not checked.

## e-Shram card (National Database of Unorganised Workers)

### Takeaway
This is registration, not a benefit scheme. Eligible if age 16-59, an unorganised worker (home-based, self-employed or wage worker), not a member of EPFO or ESIC, and not an income-tax payer. There is no income limit. It needs Aadhaar and an Aadhaar-linked mobile (or biometric at a CSC). It is the gateway for platform workers to get PM-JAY.

### Cited Findings
- Age 16-59. Unorganised worker means a home-based, self-employed or wage worker in the unorganised sector who is not a member of ESIC or EPFO. No income criteria. Registration is free and the card never expires. Gives a 12-digit UAN [H] — [eshram.gov.in FAQs](https://eshram.gov.in/faqs)
- Unorganised sector definition: units employing fewer than 10 workers and not covered by ESIC/EPFO [H] — [eshram.gov.in FAQs](https://eshram.gov.in/faqs)
- Documents: Aadhaar number and Aadhaar-linked mobile. Without a linked mobile, register at a CSC with biometrics [H] — [eshram.gov.in FAQs](https://eshram.gov.in/faqs)
- Must not be an income-tax payer. EPFO, ESIC and Income Tax validate the data periodically [M] — [eshram.gov.in FAQs](https://eshram.gov.in/faqs) (search snippet); [Shoonya blog](https://blog.shoonya.com/e-shram-card/)
- Platform/gig workers are explicitly urged to register to access PM-JAY. About 5.12 lakh platform workers were registered by 1 Dec 2025, and 30.98 crore unorganised workers overall by Aug 2025 [M] — [PIB 2109421](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2109421); [PIB 2196927](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2196927&reg=3&lang=1)
- In June 2026 the Labour Ministry reportedly set 21 June 2026 as the deadline for aggregators (Swiggy, Zomato, Uber) to register their gig workers on e-Shram [L] — secondary search summary only; no official page seen

### Inferences
- Bank account is not listed as mandatory on the FAQ, but benefit transfers need one. Do not make it an eligibility gate.
- Blue-collar employees on Neev's target employers' payrolls who have ESIC or EPF deductions are not eligible. Gig partners generally are.

### Gaps
- The Rs 2 lakh accident cover for e-Shram registrants (a PMSBY premium waiver for the first year, from 2021) appears only in secondary sources. Its current status in 2025-26 is unverified. Do not advertise it.

## PM Jeevan Jyoti Bima Yojana (PMJJBY)

### Takeaway
Enrol at age 18-50 with a savings bank or post office account and auto-debit consent. Premium is Rs 436 a year. Pays Rs 2 lakh on death from any cause. There is no income, occupation or EPFO/ESIC exclusion.

### Cited Findings
- Age 18-50 with a bank account. Rs 436/year. Rs 2 lakh cover for death from any cause. Risk period 1 June to 31 May. Auto-debit. Offered by LIC and other insurers. 23.12 crore cumulative enrolments as of 28 Feb 2025 [H] — [DFS PMJJBY page](https://financialservices.gov.in/pradhan-mantri-jeevan-jyoti-bima-yojana-pmjjby)
- Revised rules effective 1 June 2022 (the premium revision) [M] — [PMJJBY Revised Rules, jansuraksha.gov.in](https://jansuraksha.gov.in/Files/PMJJBY/ENGLISH/Rules.pdf) (title only; PDF could not be fetched)
- Cover continues to age 55 if renewed without a break [M] — [Niva Bupa](https://www.nivabupa.com/govt-scheme-articles/what-is-pmjjby-premium-436-plan.html)
- 10-year milestone release, May 2025 [M] — [PIB 2127981](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2127981&reg=48&lang=2)

### Inferences
- Eligibility check: age 18-50 and has a savings account. There is no exclusion for income-tax payers or salaried people.

### Gaps
- Not verified officially: the 30-day lien (waiting) period for new enrolees, pro-rata premium by enrolment quarter, and whether Aadhaar is the mandatory KYC. The rules PDF was unreachable.

## PM Suraksha Bima Yojana (PMSBY)

### Takeaway
Enrol at age 18-70 with a bank account and auto-debit. Premium is Rs 20 a year. Pays Rs 2 lakh for accidental death or total permanent disability, and Rs 1 lakh for partial permanent disability. There are no other exclusions.

### Cited Findings
- Age 18-70 with a bank account and auto-debit consent. Premium Rs 20/year. Rs 2 lakh for death or permanent total disability, Rs 1 lakh for partial disability. Risk period 1 June to 31 May. 50.15 crore cumulative enrolments as of 28 Feb 2025 [H] — [DFS PMSBY page](https://financialservices.gov.in/pradhan-mantri-suraksha-bima-yojana-pmsby)
- Official FAQ [M, not fetched] — [PMSBY FAQ, jansuraksha.gov.in](https://jansuraksha.gov.in/Files/PMSBY/ENGLISH/FAQ.pdf)

### Inferences
- This is the easiest win for any Neev user with a bank account: age 18-70 only.

### Gaps
- The premium revision date (Rs 12 to Rs 20, June 2022) and the rule that only one account per person can be enrolled were not confirmed from an official page this session.

## Atal Pension Yojana (APY)

### Takeaway
Eligible if age 18-40, an Indian citizen with a savings bank or post office account, and has never been an income-tax payer (for anyone joining on or after 1 Oct 2022). Pension is guaranteed at Rs 1,000-5,000 a month from age 60. There is no income cap and no EPFO/ESIC exclusion. PFRDA says government employees and NPS subscribers may join.

### Cited Findings
- Age 18-40 with a savings bank or post office savings account. One APY account per person. NRIs, government/PSU employees and NPS subscribers are allowed if they meet the criteria [H] — [PFRDA APY FAQ](https://www.pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana)
- From 1 Oct 2022, anyone who "is or has been an income-tax payer" as on the date of application cannot open an APY account. Those who joined on or before 30 Sep 2022 continue. Someone who becomes a taxpayer after joining may continue [H] — [PFRDA APY FAQ](https://www.pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana)
- Gazette notification of 10 Aug 2022: if a post-Oct-2022 joiner is later found to have been a taxpayer, the account is closed and the accumulated corpus returned. "Income-tax payer" means someone liable to pay tax under the IT Act 1961 [M] — [Moneylife](https://www.moneylife.in/article/taxpayers-barred-from-joining-atal-pension-yojana-from-1st-october-govt/68038.html); [Business Standard](https://www.business-standard.com/article/pf/income-tax-payers-can-no-longer-be-a-part-of-the-atal-pension-yojana-mof-122081100492_1.html)
- Benefit: guaranteed Rs 1,000/2,000/3,000/4,000/5,000 per month from age 60 for life. Then the same pension to the spouse, then the corpus to the nominee. Contribution depends on entry age, frequency and pension slab [H] — [PFRDA APY FAQ](https://www.pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana); [npscra.nsdl.co.in](https://www.npscra.nsdl.co.in/scheme-details.php)
- The government co-contribution applied only to people who joined by 31 Mar 2016 [H] — [PFRDA APY FAQ](https://www.pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana)
- Aadhaar is "desirable, not mandatory" at enrolment but must be provided later. e-APY is available for online enrolment [H] — [PFRDA APY FAQ](https://www.pfrda.org.in/web/pfrda/w/faqs/atal-pension-yojana)
- DFS scheme page [not fetched] — [financialservices.gov.in APY](https://financialservices.gov.in/atal-pension-yojana)

### Inferences
- The question needs to be "Have you ever paid income tax / been liable to pay it?", not "Do you pay tax now?".
- The APY FAQ excludes "statutory social security" members only for the old co-contribution. The current bar is only the income-tax condition, so do not exclude EPFO or ESIC members.

### Gaps
- The exact contribution chart (commonly cited as Rs 42/month at age 18 for Rs 1,000 up to about Rs 1,454/month at age 40 for Rs 5,000) was not verified on the official annexure.
- No 2023-26 eligibility changes found.

## Cross-scheme summary for questionnaire (inferences, based on the findings above)

| Scheme | Age | Income | Excludes EPFO/ESIC | Excludes income-tax payer | Other gate |
|---|---|---|---|---|---|
| PM-JAY | any (70+ auto) | list-based | no | no (70+) | SECC/state list; ASHA/AWW/AWH; 70+ |
| PM-SYM | 18-40 entry | <Rs 15,000/month (individual) | yes (and NPS) | yes | Aadhaar + savings account |
| e-Shram | 16-59 | none | yes | yes [M] | Aadhaar + linked mobile |
| PMJJBY | 18-50 entry (cover to 55) | none | no | no | bank account + auto-debit |
| PMSBY | 18-70 | none | no | no | bank account + auto-debit |
| APY | 18-40 | none | no | yes (ever, for joins from 1 Oct 2022) | savings account; one per person |

Minimum questionnaire: date of birth; monthly income; "PF or ESIC deducted?"; "Ever paid income tax?"; "Have a savings account?"; occupation (incl. ASHA/Anganwadi); NPS member?; CGHS/ECHS?
