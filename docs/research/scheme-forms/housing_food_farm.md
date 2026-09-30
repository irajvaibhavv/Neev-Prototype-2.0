# Scheme application fields: housing / food / farm (researched 2026-09-30)
Legend: C = CONFIRMED (read on official page this session), U = UNVERIFIED (search snippet/memory/secondary). Basic identity (name, DOB, gender, Aadhaar, mobile, address) assumed asked everywhere.
Fetch limits: most official portals are JS/landing pages; actual forms mostly not readable. Search-snippet text (even from official domains) is marked U unless the page itself was read.

## 1 PMAY-U 2.0 (BLC/ISS) - pmaymis.gov.in
| Field | Status |
|---|---|
| Apply components: ISSR, AHP, BLC/BLCE, CLSS (home page) | C |
| Aadhaar-existence check is the entry step (Check_Aadhar_Existence.aspx) | C (link seen) |
| Annual household income (EWS<=3L, LIG 3-6L, MIG 6-9L) | C (pmaymis FAQ page, fetched) |
| Family composition: husband, wife, unmarried children | C (FAQ page) |
| Land ownership proof (BLC) | C (FAQ page) |
| Affidavit/undertaking: no pucca house owned | C (FAQ page) |
| Bank account details | C (FAQ page) |
| Docs: ID (Aadhaar/PAN/voter/passport), address proof (ration card/utility bill), income certificate, land docs | C (FAQ page) |
| Exact portal form field list/order | U - form not fetched; user manual PDF https://pmaymis.gov.in/pmaymis2_2024/PDF/PMAY_UserManual.pdf not read |
Bank account required: YES (subsidy paid by DBT to account). Source: https://pmaymis.gov.in/pmaymis2_2024/PmayFAQ.aspx

## 2 Sukanya Samriddhi (Form-1)
| Field | Status |
|---|---|
| Girl child name/DOB, guardian name+KYC, birth certificate mandatory | U (search snippet; FORM1.pdf fetch failed: SSL cert error) |
| Nominee: name, relationship, address, Aadhaar, DOB | U (snippet) |
| Initial deposit amount/mode | U |
Bank account required: NO (account itself is opened at India Post/bank; cash/cheque deposit). U.
Docs: birth certificate of girl (<10 yrs), guardian ID+address KYC, photos (U).
Try: https://www.nsiindia.gov.in/writereaddata/FileUploads/FORM1.pdf (not readable here)

## 3 PM-KISAN new farmer registration - https://pmkisan.gov.in/RegistrationFormupdated.aspx
| Field | Status |
|---|---|
| Step 1 (public page): Aadhaar no., mobile no., State, captcha, Aadhaar consent checkbox | C |
| Step 2 (after OTP): State/District/Block/Village, farmer name, father name, gender, category (SC/ST/Others), IFSC, bank a/c no., DOB/age, farm size (ha), survey no., khasra no. | U (search snippet listing only; not read on page) |
| eKYC mandatory (OTP/biometric/face) | C (home page) |
Bank account required: YES (DBT of Rs 6000/yr; IFSC+a/c collected) - U for the field list, scheme is DBT by design.
Docs: land records (khatauni/khasra), Aadhaar, bank passbook (U). State verifies eligibility.

## 4 PM SVANidhi - https://pmsvanidhi.mohua.gov.in/
| Field | Status |
|---|---|
| Apply needs mobile linked to Aadhaar; tiers Rs15k/25k/50k | C |
| Name, address, mobile, Aadhaar, vending activity details, family member details, income details | U (search snippet summary) |
| Certificate of Vending / ID card from ULB, or LoR from TVC/ULB (for survey-missed vendors) | U (snippet; guidelines PDF not read: https://www.mohua.gov.in/pm_svandhi/guidelines.pdf) |
Bank account required: YES (loan disbursal + digital-txn cashback; U). FAQ PDF returned 403.

## 5 PM Ujjwala (KYC form) - https://www.pmuy.gov.in/
| Field | Status |
|---|---|
| Applicant must be woman >=18; no other LPG connection in household | C |
| Docs: KYC form, Aadhaar, address proof only if differs from Aadhaar (self-decl for migrants), family composition doc (ration card / govt doc), Aadhaar of all adult family members listed, bank passbook/cancelled cheque, deprivation declaration | C |
| Forms in 13 languages; apply via IOCL/BPCL/HPCL portal or distributor | C |
Bank account required: YES (passbook/cancelled cheque required; LPG subsidy DBT).

## 6 NFSA ration card
| Field | Status |
|---|---|
| nfsa.gov.in only links to state portals; no fields readable. Delhi portal (nfs.delhi.gov.in) connection refused; Bihar epds.bihar.gov.in not fetched | - |
| Typical (memory): head of family, all members with Aadhaar/relation/age, income, occupation, address proof, gas connection Y/N, bank a/c | U |
Bank account required: varies by state (many ask for a/c for DBT); UNVERIFIED.
Source attempted: https://nfsa.gov.in/portal/apply_ration_card

## 7 Ayushman Bharat PM-JAY - https://beneficiary.nha.gov.in/ (ekyc)
| Field | Status |
|---|---|
| Portal does verification, e-KYC, card generation | C (landing text only) |
| Search by State, Scheme, Family ID, Aadhaar no., PM-JAY ID; authenticate as family member; e-KYC via Aadhaar OTP or fingerprint/face; then download card | U (snippets from NHA BIS pages/manual) |
Bank account required: NO (health cover, cashless at hospital; not stated on page, inferred). Docs: Aadhaar, ration card/family ID for eligibility (U).

## Gaps to close if needed
Need PDFs/browser: NSI FORM1, SVANidhi guidelines, PMAY user manual, PM-KISAN step-2 form, a state ration card form. WebFetch cannot render JS forms; use Playwright.
