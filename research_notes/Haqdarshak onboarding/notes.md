# Haqdarshak & scheme-eligibility onboarding — research notes (30 Sep 2026)

Legend: CONFIRMED = read on a source page/search snippet from it. UNVERIFIED = inferred or not read on primary source.

## Haqdarshak
- Model is **agent-led (assisted), not self-serve**: trained local "Haqdarshaks" (60%+ women) go door to door, screen citizens on an Android app, explain schemes, help apply. CONFIRMED (MIT Solve, Acumen, RightsCoLab)
- Screening = **dynamic questionnaire, decision-tree**; path changes with answers (branching/skip logic). CONFIRMED (MIT Solve)
- Rules engine + scheme DB runs **offline on device**. CONFIRMED (MIT Solve)
- Yojana Card flow: agent registers **a family or individual**, asks **40–45 questions** (housing conditions, income, religion, caste, etc.), app then shows **count of eligible schemes**. CONFIRMED (acrpro.org summary of Yojana Card; Google snippet of yojanacard.haqdarshak.com — primary page unreachable)
- Yojana Card = physical QR card linking to socio-economic profile + eligible/availed schemes; scan QR to see list, no app download needed. Fee ₹50 (+GST), split agent/company. Target: household income < ₹20k/mo. CONFIRMED (acrpro.org, search snippet)
- **Screening free, application support paid**: they moved to models where the first step (eligibility info) is free; citizens pay agent a small fee to apply. Agents pay ~USD 2/month subscription. CONFIRMED (MIT Solve, Acumen, RightsCoLab)
- 10–15 languages. CONFIRMED
- Aadhaar/DigiLocker pre-fill of the questionnaire: **no evidence found**. UNVERIFIED (appears to be manual agent entry)
- Exact question list/order: **not publicly documented**. Nimisha Das Medium case study on Haqdarshak onboarding optimisation exists but returned 403. UNVERIFIED
- Employer/B2B: Primark programme running across **7 supplier factories** to help workers access welfare; "partners with companies large and small to provide this support to their informal workers"; CSR clients (DBS Foundation, Mastercard CIG — 500k MSMEs). CONFIRMED (ABF/Primark page, Acumen, Mastercard newsroom)
- How employer onboarding works operationally (camps in factory, agent on-site, employer-paid fee): **no detail found**. Likely on-site camps with agents, employer/CSR pays fee. UNVERIFIED
- No Haqdarshak programme with Zomato/Swiggy found. CONFIRMED absence in search

## myScheme.gov.in ("Find schemes for you")
Order as described in guides (CONFIRMED from FAQ + third-party walkthroughs; not clicked through live):
1. Gender (Male / Female / Transgender)
2. Age
3. Marital status (asked conditionally — shown for women per walkthrough; FAQ lists it generally)
4. State
5. Area: Urban / Rural (some guides add district)
6. Social category / caste (General, OBC, SC, ST, etc.)
7. Differently abled? (Y/N)
8. Minority? (Y/N)
9. Student? / Employment status (student, employed, etc.), occupation
10. BPL card? (Y/N)
11. Annual family income
=> ~10–12 questions, all up front, all simple chips/yes-no. Then per-scheme **"Check Eligibility"** Yes/No questionnaire only when a user opens a scheme (progressive). CONFIRMED (FAQ)
- No pre-fill/login needed for personalised search per FAQ. UNVERIFIED (FAQ silent)

## Others (Jan Samarth, Kaarya, Samagra, Setu)
- Not researched within call budget. UNVERIFIED. Jan Samarth is credit-linked (loan schemes), asks a few eligibility questions per loan category — from memory, UNVERIFIED.

## Sources
- https://solve.mit.edu/challenges/community-driven-innovation/solutions/10131
- https://acumen.org/case-studies/haqdarshak/
- https://rightscolab.org/case_study/haqdarshak/
- https://acrpro.org/haqdarshak-yojana-card/ , https://yojanacard.haqdarshak.com/ (snippet only)
- https://www.abf.co.uk/responsibility/responsibility-in-our-businesses/retail/people-supply-chains-surrounding-communities
- https://www.myscheme.gov.in/faqs
- https://www.latestsarkariyojana.com/myscheme-gov-login/ , https://sarkariyojana.com/myscheme-gov-in/
- https://uxnimisha.medium.com/optimizing-the-onboarding-flow-of-haqdarshak-5db7b9430727 (403, not read)
