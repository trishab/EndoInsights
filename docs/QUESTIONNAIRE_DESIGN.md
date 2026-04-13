# Patient Questionnaire Design

This document describes the multi-step patient questionnaire used to collect preferences for the provider matching system. It covers each step's content, UX rationale, and how each answer maps to the `patientPreferences` table in the database.

---

## Design Principles

**Warm, empathetic tone.** Endometriosis patients have often experienced years of dismissal and diagnostic delay. The questionnaire uses non-clinical, first-person language ("I'm looking for answers" rather than "Seeking diagnosis"). Labels are written as statements the patient might say to a friend.

**Multi-step wizard.** The questionnaire is divided into eight steps presented one at a time. This avoids overwhelming patients with a long form, which is especially important for people dealing with chronic pain and fatigue. Each step has a clear purpose and a manageable number of choices.

**Non-clinical language.** Medical terminology is avoided in patient-facing labels. For example, "Preserving my uterus is very important" is used instead of "Uterus-sparing surgical approach preferred." The underlying values stored in the database use developer-friendly enum strings.

**Progressive disclosure.** Later steps only appear when relevant. For example, the faith tradition follow-up field only appears when the patient selects a faith-based preference. FMLA fields only appear when the patient indicates FMLA or disability needs.

**No required fields.** Every question can be skipped. The matching algorithm handles missing preferences gracefully by excluding that dimension from the weighted score. Patients should never feel forced to disclose sensitive information.

---

## Step 1: Journey Stage

**Purpose:** Understand where the patient is in their endometriosis journey. This contextualizes their needs and may influence which provider types are suggested in the next step.

**UI pattern:** Single-select list of options, each with a label and a short description.

**Options (from `JOURNEY_STAGES` in `lib/constants.js`):**

| Value | Patient-facing label | Description |
|-------|---------------------|-------------|
| seeking_diagnosis | I'm looking for answers | Haven't been diagnosed yet, experiencing symptoms |
| newly_diagnosed | Recently diagnosed | Just received an endometriosis diagnosis |
| exploring_treatment | Exploring treatment options | Considering different approaches |
| seeking_surgery | Looking for a surgeon | Ready to pursue surgical treatment |
| post_surgery | Post-surgery care | Need follow-up or ongoing care after surgery |
| chronic_management | Managing ongoing symptoms | Living with endo long-term |

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Selected stage value | `patientPreferences.painJourneyStage` |

---

## Step 2: Provider Type Selection

**Purpose:** Let the patient choose which types of providers they are looking for. Multi-select is essential because endometriosis is a whole-body condition and patients often need a team of different specialists.

**UI pattern:** Multi-select card grid. Each card shows the provider type label, a short description, and a colored indicator matching the type's assigned color (from `PROVIDER_TYPES` in `lib/constants.js`).

**Options:**

| Value | Label | Description |
|-------|-------|-------------|
| excision_surgeon | Excision Surgeon | Specializes in laparoscopic excision of endometriosis tissue |
| interventional_radiologist | Interventional Radiologist | Performs minimally invasive image-guided procedures such as uterine artery embolization |
| gastroenterologist | Gastroenterologist | Specializes in bowel endometriosis and digestive system involvement |
| functional_medicine | Functional Medicine | Integrative approach addressing root causes through nutrition, lifestyle, and complementary therapies |
| pelvic_floor_pt | Pelvic Floor Physical Therapist | Specializes in pelvic floor rehabilitation, pain management, and pre/post-surgical care |
| mental_health | Mental Health Provider | Psychologist, therapist, or psychiatrist with experience in chronic pain and endometriosis impact |
| pain_management | Pain Management Specialist | Focuses on chronic pelvic pain through nerve blocks, medication management, and multidisciplinary approaches |
| urologist | Urologist | Manages bladder and urinary tract involvement in endometriosis |
| nutritionist | Nutritionist / Dietitian | Specializes in anti-inflammatory and endo-specific dietary approaches |

The `other` type is not shown in the questionnaire. It is used only for providers added to the directory that do not fit an existing category.

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Array of selected type keys | `patientPreferences.seekingProviderTypes` |

---

## Step 3: Location

**Purpose:** Determine where the patient needs care and how far they are willing to travel. Location is used as a hard filter before scoring begins.

**UI pattern:** Dropdown for state, text input for city, toggle for travel willingness, and a conditional numeric input for maximum travel distance.

**Fields:**

| Field | Input type | Notes |
|-------|-----------|-------|
| State | Dropdown (US_STATES from constants) | Optional. Leaving blank returns all states. |
| City | Text input | Optional. Used for display and future distance calculations. |
| Willing to travel | Toggle / checkbox | Default off. When off, only providers in the selected state are shown. |
| Maximum travel distance (miles) | Numeric input | Only shown when "willing to travel" is on. |

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| State selection | `patientPreferences.state` |
| City text | `patientPreferences.city` |
| Travel toggle | `patientPreferences.willingToTravel` |
| Miles value | `patientPreferences.maxTravelMiles` |

---

## Step 4: Philosophy and Faith

**Purpose:** Capture the patient's preferences around treatment philosophy and faith-based care. These are deeply personal dimensions that significantly affect the patient-provider relationship.

### Treatment philosophy

**UI pattern:** Visual card selection. Four cards, each with a label and short description. Single-select.

**Options (from `TREATMENT_PHILOSOPHIES` in `lib/constants.js`):**

| Value | Label | Description |
|-------|-------|-------------|
| conventional | Conventional | Evidence-based Western medicine approaches |
| integrative | Integrative | Combines conventional medicine with complementary approaches |
| holistic | Holistic | Treats the whole person -- mind, body, and spirit |
| functional | Functional | Focuses on identifying and addressing root causes of disease |

A fifth implicit option, "No preference," is available as a link or separate control below the cards.

The matching algorithm uses a philosophy adjacency map (`PHILOSOPHY_ADJACENCY` in `lib/constants.js`) to give partial credit to adjacent philosophies. For example, a patient who prefers "integrative" will still score well with a "conventional" or "functional" provider (score 0.7), but poorly with a "holistic" provider not adjacent to their choice (score 0.2).

### Faith preference

**UI pattern:** Radio button group. When the patient selects a faith-based option, a follow-up text input or dropdown appears asking for the specific tradition.

**Options (from `FAITH_PREFERENCES` in `lib/constants.js`):**

| Value | Label | Follow-up |
|-------|-------|-----------|
| faith_based_required | Faith-based care is very important to me | Shows tradition selector |
| faith_based_preferred | I'd prefer a provider who practices within a faith tradition | Shows tradition selector |
| secular_preferred | I'd prefer a secular approach | No follow-up |
| no_preference | This doesn't matter to me | No follow-up |

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Philosophy selection | `patientPreferences.philosophyPreference` |
| Faith radio value | `patientPreferences.faithPreference` |
| Faith tradition (conditional) | `patientPreferences.faithTradition` |

---

## Step 5: Treatment Goals

**Purpose:** Understand the patient's priorities around uterus preservation, fertility, and hormone use. These are among the most emotionally charged topics for endo patients and directly affect surgical decision-making.

### Uterus and fertility goals

**UI pattern:** Single-select card list.

**Options (from `UTERUS_GOALS` in `lib/constants.js`):**

| Value | Label | Description |
|-------|-------|-------------|
| preserve_uterus | Preserving my uterus is very important | I want to keep my uterus |
| fertility_preservation | Fertility preservation is my priority | I want to protect my ability to have children |
| open_to_hysterectomy | I'm open to all options | Including hysterectomy if recommended |
| seeking_hysterectomy | I'm actively seeking a hysterectomy | I want a provider who supports this choice |
| not_applicable | This doesn't apply to me | (no description) |

### Hormone-free preference

**UI pattern:** Single-select radio or card group.

**Options (from `HORMONE_PREFERENCES` in `lib/constants.js`):**

| Value | Label | Description |
|-------|-------|-------------|
| required | I need hormone-free options | Hormonal treatments are not an option for me |
| preferred | I'd prefer hormone-free but am open | (no description) |
| open_to_hormones | I'm open to hormonal treatments | (no description) |
| no_preference | No preference | (no description) |

Note: "required" is treated as a hard filter in the matching algorithm. Providers who do not offer hormone-free options will be excluded entirely.

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Uterus/fertility selection | `patientPreferences.uterusGoal` |
| Hormone preference | `patientPreferences.hormoneFreePreference` |

---

## Step 6: Care Preferences

**Purpose:** Capture a set of specific care-style preferences that affect provider selection. This step covers several dimensions, each presented as a compact control.

### Patient autonomy

**UI pattern:** Single-select card or radio group.

**Options (from `AUTONOMY_PREFERENCES` in `lib/constants.js`):**

| Value | Label | Description |
|-------|-------|-------------|
| want_to_lead | I want to lead my own care decisions | Provider advises, I decide |
| want_collaboration | I want a collaborative relationship | We decide together |
| trust_provider | I trust my provider to guide decisions | I want expert guidance |
| no_preference | No preference | (no description) |

### Provider gender preference

**UI pattern:** Radio group or dropdown.

Options: Female, Male, Non-binary, No preference.

### Telehealth preference

**UI pattern:** Radio group.

**Options (from `TELEHEALTH_PREFERENCES` in `lib/constants.js`):**

| Value | Label |
|-------|-------|
| required | Telehealth required -- I can only do virtual visits |
| preferred | Telehealth preferred -- I'd like the option |
| in_person_preferred | In-person preferred -- I prefer face-to-face visits |
| no_preference | No preference |

Note: "required" is treated as a hard filter.

### Trauma-informed care

**UI pattern:** Toggle or checkbox.

Label: "Trauma-informed care is important to me." A brief tooltip or explainer text can describe what trauma-informed care means: providers who recognize the impact of medical trauma, ask permission before examinations, explain procedures, and create a safe environment.

### Comorbidities

**UI pattern:** Multi-select checkbox list.

**Options (from `COMORBIDITIES` in `lib/constants.js`):**

| Value | Label |
|-------|-------|
| adenomyosis | Adenomyosis |
| pcos | PCOS |
| interstitial_cystitis | Interstitial Cystitis / Painful Bladder |
| ibs | IBS / Digestive Issues |
| fibromyalgia | Fibromyalgia |
| autoimmune | Autoimmune Conditions |
| pelvic_congestion | Pelvic Congestion Syndrome |
| vulvodynia | Vulvodynia |
| mental_health | Anxiety / Depression |
| chronic_fatigue | Chronic Fatigue |
| migraines | Migraines |

### Diagnostic capability

**UI pattern:** Toggle or checkbox.

Label: "It's important that my provider can perform or interpret imaging for endometriosis (ultrasound, MRI)."

### FMLA and disability needs

**UI pattern:** Two toggles with conditional follow-up fields.

| Control | Label |
|---------|-------|
| FMLA toggle | I need a provider who completes FMLA paperwork |
| Disability toggle | I need a provider who completes disability paperwork |

When either toggle is on, additional fields appear:

| Field | Input type | Maps to |
|-------|-----------|---------|
| Employment state | Dropdown | `employmentState` |
| Employer size | Radio (under_50, 50_plus, federal, unsure) | `employerSize` |
| Disability benefit type | Radio (employer_provided, state_provided, both, none, unsure) | `hasDisabilityBenefit` |

The `EMPLOYER_SIZES` constant in `lib/constants.js` includes an `fmlaEligible` flag. When the employer has under 50 employees, FMLA does not apply federally; the UI may display an informational note. States in `STATES_WITH_SDI` (CA, HI, NJ, NY, RI) have mandatory short-term disability programs.

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Autonomy selection | `patientPreferences.autonomyPreference` |
| Gender preference | `patientPreferences.genderPreference` |
| Telehealth selection | `patientPreferences.telehealthPreference` |
| Trauma-informed toggle | `patientPreferences.traumaInformedImportant` |
| Comorbidities array | `patientPreferences.knownConditions` |
| Diagnostic capability toggle | `patientPreferences.diagnosticCapabilityImportant` |
| FMLA toggle | `patientPreferences.needsFmla` |
| Disability toggle | `patientPreferences.needsDisability` |
| Employment state | `patientPreferences.employmentState` |
| Employer size | `patientPreferences.employerSize` |
| Disability benefit type | `patientPreferences.hasDisabilityBenefit` |

---

## Step 7: Importance Sliders

**Purpose:** Let the patient control how much each preference dimension matters to them. This is what makes the matching algorithm patient-driven rather than platform-driven.

**UI pattern:** A list of dimensions the patient provided preferences for in earlier steps. Each dimension has a three-position slider or segmented control with the options: Critical, Important, Nice to have.

**Importance levels (from `IMPORTANCE_LEVELS` in `lib/constants.js`):**

| Value | Label | Description | Weight multiplier |
|-------|-------|-------------|-------------------|
| critical | Critical | This is a dealbreaker for me | 3.0 |
| important | Important | I care about this | 2.0 |
| nice_to_have | Nice to have | It matters but isn't essential | 1.0 |

**Dimensions shown (only those where the patient expressed a preference):**

| Dimension | Shown when | Weight field |
|-----------|-----------|--------------|
| Faith | faithPreference is not no_preference | `weightFaith` |
| Treatment philosophy | philosophyPreference is not no_preference | `weightPhilosophy` |
| Uterus/fertility | uterusGoal is not not_applicable | `weightUterusFertility` |
| Hormone-free | hormoneFreePreference is not no_preference | `weightHormoneFree` |
| Patient autonomy | autonomyPreference is not no_preference | `weightAutonomy` |
| Comorbidity experience | knownConditions has at least one entry | `weightComorbidity` |
| Trauma-informed care | traumaInformedImportant is true | `weightTraumaInformed` |
| FMLA/disability | needsFmla or needsDisability is true | `weightFmla` |
| Diagnostic capability | diagnosticCapabilityImportant is true | `weightDiagnosticCapability` |

Dimensions the patient skipped or marked "no preference" are not shown. Their weight fields retain their defaults but are excluded from scoring because the dimension's score function returns null.

**Defaults:**

All weight fields default to `important` (multiplier 2.0), except `weightFmla` which defaults to `nice_to_have` (multiplier 1.0). Patients can adjust any dimension up to "critical" or down to "nice to have."

**Database mapping:**

Each slider maps directly to the corresponding `weight*` column on `patientPreferences`.

---

## Step 8: Review and Submit

**Purpose:** Let the patient review all their selections before submitting. Build confidence that their preferences were captured correctly.

**UI pattern:** A summary view organized by step. Each section shows the patient's selections in plain language with an "Edit" link that returns to that step. At the bottom, optional fields:

- **Email** (text input): For receiving match results and future notifications. Maps to `patientPreferences.email`.
- **Additional notes** (textarea): Free-text field for anything the patient wants to add. Maps to `patientPreferences.additionalNotes`.
- **Insurance plan** (text input): Optional insurance plan name to help with filtering. Maps to `patientPreferences.insurancePlan`.

On submission, a `sessionId` is generated (UUID) and stored with the preferences. If the patient is logged in, `userId` is also stored. The patient is then redirected to the match results page.

**Database mapping:**

| Answer | Stored in |
|--------|-----------|
| Email | `patientPreferences.email` |
| Additional notes | `patientPreferences.additionalNotes` |
| Insurance plan | `patientPreferences.insurancePlan` |
| Generated session ID | `patientPreferences.sessionId` |
| Logged-in user ID | `patientPreferences.userId` |

---

## How Answers Drive the Matching Algorithm

After submission, the stored `patientPreferences` record is passed to `rankProviders()` in `lib/matching.js`. The flow is:

1. **Hard filters** (`applyHardFilters`): Remove providers that fail absolute requirements.
   - Provider type must be in `seekingProviderTypes`.
   - State must match if `willingToTravel` is false.
   - Rejected or not-accepting providers are excluded.
   - `hormoneFreePreference === 'required'` excludes providers without hormone-free options.
   - `telehealthPreference === 'required'` excludes providers without telehealth.
   - Gender preference is enforced as a hard filter.

2. **Dimension scoring**: Each of the nine preference dimensions calls its scoring function with the provider and preferences. The function returns a score from 0.0 to 1.0, or null if the dimension is excluded.

3. **Weighting**: Each non-null dimension score is multiplied by the patient's importance weight (critical = 3.0, important = 2.0, nice_to_have = 1.0).

4. **Normalization**: The weighted sum is divided by the sum of weights to produce a normalized preference score between 0.0 and 1.0.

5. **Surgical quality blend** (excision surgeons only): Five surgical quality dimensions are averaged and blended at 25% weight with the preference score at 75% weight.

6. **Match label assignment**: The final score is mapped to a human-readable label. Patients never see numerical scores.

| Label | Minimum score |
|-------|--------------|
| Excellent Match | 0.85 |
| Strong Match | 0.70 |
| Good Match | 0.50 |
| Possible Match | 0.00 |
