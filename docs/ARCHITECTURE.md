# EndEndo Specialist Directory -- System Architecture

## Overview

The EndEndo Specialist Directory is a patient-facing web application that matches endometriosis patients with specialist providers based on care preferences. Patients complete a questionnaire describing their values, medical needs, and priorities. The system scores every eligible provider against those preferences and returns a ranked list. Patients see qualitative match labels and informational badges, never numerical scores.

This document covers the technology stack, data flow, scoring philosophy, data visibility model, authentication paths, and repository layout.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (Pages Router) | React 18, server-side rendering where needed |
| ORM | Drizzle ORM 0.30 | Type-safe SQL builder, Zod integration via drizzle-zod |
| Database | PostgreSQL (Replit-hosted) | Connected via `postgres` driver, `DATABASE_URL` env var |
| Auth | NextAuth.js 4 | Credential-based + future OAuth providers |
| Styling | Tailwind CSS 3.4 | Utility-first, no component library |
| Forms | react-hook-form + @hookform/resolvers + Zod | Client-side validation tied to schema |
| Icons | lucide-react | Lightweight SVG icon set |
| Testing | Jest 29 + React Testing Library + Playwright | Unit, component, and end-to-end |
| Schema Mgmt | drizzle-kit | `db:push` for migrations, `db:studio` for inspection |

---

## Data Flow

The system operates in four phases:

### 1. Patient Questionnaire

The patient completes a multi-step questionnaire that captures:

- Provider type sought (excision surgeon, pelvic floor PT, GI, etc.)
- Location and willingness to travel
- Care preferences across ten dimensions (faith, treatment philosophy, uterus/fertility goals, hormone-free needs, patient autonomy, comorbidity experience, trauma-informed care, telehealth, FMLA/disability support, diagnostic capability)
- Importance level for each dimension (critical, important, nice_to_have)

Preferences are saved to the `patient_preferences` table, keyed by a session ID. Anonymous patients get a UUID session; logged-in patients have their `userId` linked.

### 2. Provider Fetch

The server queries the `doctors` table for all verified providers matching basic filters (provider type, location). The full result set is returned to the client. No scoring happens on the server.

### 3. Client-Side Scoring

The matching algorithm (`lib/matching.js`) runs entirely in the browser. It applies hard filters first, then scores every remaining provider against the patient's preferences using a weighted model. Surgical quality dimensions are folded into the score for surgeon-type providers.

### 4. Ranked Results

Providers are sorted by total score and assigned a match label (Excellent, Strong, Good, Possible). The UI displays the label, relevant badges, and provider details. The numerical score is never exposed.

### Why Client-Side Matching

The provider count for any given search is in the hundreds, not millions. Scoring a single provider takes microseconds -- iterating over ten preference dimensions and five surgical quality dimensions with simple arithmetic. Running this in the browser:

- Eliminates server compute costs for scoring
- Allows instant re-ranking when a patient adjusts preferences without a round trip
- Keeps the scoring logic inspectable in the frontend bundle (no proprietary server-side black box)
- Simplifies the API surface to a single provider-fetch endpoint

The tradeoff is that provider data (minus backend-only fields) is sent to the client. This is acceptable because the data is either public or explicitly shared by the provider, and the dataset is small enough that payload size is not a concern.

---

## Design Philosophy: No Scores, Only Labels

Patients never see a numerical score. The interface presents:

- **Match labels**: Excellent Match, Strong Match, Good Match, Possible Match
- **Informational badges**: Fellowship trained, 200+ excisions/year, multidisciplinary team, shares operative photos, etc.
- **Preference alignment indicators**: Visual signals showing which of the patient's stated preferences a provider aligns with

Surgical quality metrics (volume, complication rate, team composition, transparency practices) are baked into the ranking algorithm and influence provider ordering, but they appear in the UI only as factual badges. A patient sees "Fellowship Trained" or "Multidisciplinary Team" as informational context, not as a component of a visible quality score.

This design serves two purposes:

1. **Litigation risk**: Displaying a numerical quality score derived from complication rates, volume data, or training credentials could create liability. If a patient selects a provider based on a displayed score and has a poor outcome, the score becomes a target for legal action. Match labels based on preference alignment are defensible as patient-preference matching, not quality ranking.

2. **Expert guidance**: Consultation with an academic excision surgeon at Mass General Brigham confirmed that patients lack the clinical context to interpret raw quality metrics. A complication rate of 3% means different things depending on case complexity, patient population, and what counts as a complication. Badges with educational context serve patients better than numbers without context.

---

## Provider Data Visibility

Provider data falls into three visibility tiers, controlled per-field by the provider through their portal:

### Tier 1: Public

Always visible to patients. Examples: name, location, provider type, accepting new patients, telehealth availability, insurance networks, wait time, fellowship training, FMLA support, whether they share operative photos/reports.

### Tier 2: On Request

Hidden by default. Patients can request to see this data, which triggers a logged request (stored in `patient_data_requests`) and reveals the field with educational context explaining what the metric means. Examples: surgical volume, major complication rate (Clavien-Dindo Grade III+), out-of-pocket cost, cost breakdown, bowel/bladder/diaphragm surgery approach.

### Tier 3: Backend Only

Never shown to patients. Used exclusively by the matching algorithm for scoring. The provider enters this data through their portal, it influences ranking, but patients cannot see or request it. This tier exists for data that providers are willing to report for algorithmic use but not for direct patient consumption.

The visibility configuration is stored in the `provider_data_visibility` table. Each row maps a provider ID, a field name, and a visibility level. The `VISIBILITY_CONTROLLED_FIELDS` constant in `lib/constants.js` defines the full set of fields that support visibility controls and their defaults.

The `applyVisibility` function in `lib/database.js` strips fields from the provider object before it reaches the client, based on the visibility settings and any active data requests.

---

## Authentication

The system supports two distinct authentication paths:

### Patient Path

Patients can use the directory without creating an account. Anonymous access works via a UUID-based session stored in a cookie. This session ID keys their preferences in the `patient_preferences` table.

If a patient creates an account (email + password via NextAuth.js credentials provider), their session preferences are linked to their `userId`. Account benefits include saving preference sets, bookmarking providers, and viewing request history.

### Provider Path

Providers must verify their identity to claim or create a profile.

**US-based providers**: NPI (National Provider Identifier) verification via the NPPES registry API (`lib/npi-verify.js`). The system validates the 10-digit NPI, retrieves the provider's name, credentials, taxonomy codes, and practice address. The taxonomy code is mapped to an EndEndo provider type using `NPI_TAXONOMY_MAP` in `lib/constants.js`.

**International providers**: Country-specific registration number verification. Supported registration types include GMC (UK), AHPRA (Australia), CRM (Brazil), CMO (Mexico), CPSO/CPSBC (Canada), NMC (India), and Japan Medical Practitioner License. The `countryRegistrationNumber` and `countryRegistrationType` fields on the `doctors` table store this data.

Provider accounts are linked to a user record and a doctor record. The `doctor_registrations` table tracks the verification workflow. Once verified, providers can edit their profile, set data visibility preferences, and view patient data requests.

---

## Repository and Branching

- **Repository**: `trishab/EndoInsights` on GitHub
- **Active branch**: `specialist-directory` -- all directory feature work happens here
- **Merge target**: `main` -- merge when the specialist directory feature set is complete and tested
- **Branch strategy**: Feature branch with periodic rebases against `main`

---

## Key Files

| Path | Purpose |
|---|---|
| `lib/schema.js` | Drizzle ORM table definitions (users, doctors, reviews, patient_preferences, provider_data_visibility, patient_data_requests) |
| `lib/constants.js` | All enums, classification maps, NPI taxonomy mapping, match labels, importance levels |
| `lib/matching.js` | Scoring functions, hard filters, ranking logic -- runs client-side |
| `lib/database.js` | Server-side database queries, visibility filtering, preference CRUD, duplicate detection |
| `lib/db.js` | Drizzle client instantiation from DATABASE_URL |
| `lib/npi-verify.js` | NPI registry API integration for US provider verification |
| `pages/index.js` | Main directory page (currently basic search, evolving to preference-matched results) |
| `drizzle.config.js` | Drizzle Kit configuration for schema management |
