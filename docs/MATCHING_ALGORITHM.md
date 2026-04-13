# EndEndo Specialist Directory -- Matching Algorithm

## Overview

The matching algorithm scores providers against patient preferences using a weighted model that runs entirely client-side. The implementation lives in `lib/matching.js` with supporting constants in `lib/constants.js`.

The algorithm operates in three stages:

1. **Hard filters** eliminate providers who cannot meet non-negotiable requirements (wrong type, wrong state, not accepting patients, etc.).
2. **Dimension scoring** evaluates each surviving provider on up to ten preference dimensions (patient-controlled) and five surgical quality dimensions (always applied for surgeons).
3. **Aggregation** combines dimension scores into a single total score, which determines the match label shown to the patient.

Patients never see numerical scores. They see one of four match labels: Excellent Match, Strong Match, Good Match, or Possible Match.

---

## Patient-Controlled Importance Levels

For each preference dimension, the patient selects an importance level during the questionnaire. This controls the weight multiplier applied to that dimension's score.

| Level | Multiplier | Meaning |
|---|---|---|
| `critical` | 3.0x | Dealbreaker -- this preference is non-negotiable |
| `important` | 2.0x | This matters significantly (default) |
| `nice_to_have` | 1.0x | Would be nice but not essential |

The importance level for each dimension is stored in `patient_preferences` as `weightFaith`, `weightPhilosophy`, `weightUterusFertility`, etc. If no importance is specified, the default is `important` (2.0x).

---

## Preference Dimensions

Each preference dimension has a scoring function that returns a value between 0.0 and 1.0, or `null` if the dimension should be excluded from scoring (because the patient selected `no_preference` or the dimension does not apply).

### 1. Faith (`scoreFaith`)

Matches the patient's faith-based care preference against the provider's faith practice.

**Patient options**: `faith_based_required`, `faith_based_preferred`, `secular_preferred`, `no_preference`

**Scoring logic**:

When `faith_based_required`:
- Provider is not faith-based: 0.0
- Provider is faith-based, patient specified a tradition, traditions match: 1.0
- Provider is faith-based, patient specified a tradition, traditions differ: 0.5
- Provider is faith-based, no specific tradition required: 0.8

When `faith_based_preferred`:
- Provider is faith-based and traditions match: 1.0
- Provider is faith-based, no tradition match needed or different tradition: 0.8
- Provider is not faith-based: 0.4

When `secular_preferred`:
- Provider is faith-based: 0.3
- Provider is not faith-based: 1.0

### 2. Treatment Philosophy (`scorePhilosophy`)

Matches treatment philosophy preference using an adjacency model. Adjacent philosophies score higher than distant ones.

**Patient options**: `conventional`, `integrative`, `holistic`, `functional`, `no_preference`

**Adjacency map**:
- `conventional` is adjacent to: `integrative`
- `integrative` is adjacent to: `conventional`, `holistic`, `functional`
- `holistic` is adjacent to: `integrative`
- `functional` is adjacent to: `integrative`

**Scoring logic**:
- Exact match: 1.0
- Adjacent philosophy: 0.7
- Distant philosophy: 0.2
- Provider has no philosophy listed: 0.5 (neutral)

### 3. Uterus / Fertility (`scoreUterusFertility`)

Matches the patient's uterus preservation or fertility goals against the provider's approach.

**Patient options**: `preserve_uterus`, `fertility_preservation`, `open_to_hysterectomy`, `seeking_hysterectomy`, `not_applicable`

**Scoring logic**:

When `preserve_uterus`:
- Provider prioritizes uterus preservation: 1.0
- Provider is case-by-case AND hysterectomy is last resort: 0.7
- Provider considers hysterectomy early: 0.1
- Otherwise: 0.4

When `fertility_preservation`:
- Provider has fertility focus: 1.0
- Provider does not: 0.2

When `open_to_hysterectomy`:
- Score: 0.8 (mild preference for case-by-case approach, all providers acceptable)

When `seeking_hysterectomy`:
- Provider's hysterectomy approach is last resort: 0.3
- Provider's approach is not applicable (does not perform): 0.0
- Otherwise (considers early or case-by-case): 1.0

### 4. Hormone-Free Options (`scoreHormoneFree`)

Matches the patient's need for hormone-free treatment options.

**Patient options**: `required`, `preferred`, `open_to_hormones`, `no_preference`

**Scoring logic**:
- `required`: offers hormone-free = 1.0, does not = 0.0
- `preferred`: offers hormone-free = 1.0, does not = 0.4
- `open_to_hormones`: 0.8 (all providers acceptable)

Note: `required` also acts as a hard filter -- providers without hormone-free options are eliminated before scoring.

### 5. Patient Autonomy (`scoreAutonomy`)

Matches the patient's desired level of decision-making control with the provider's communication style.

**Patient scale**: `want_to_lead` (index 0), `want_collaboration` (index 1), `trust_provider` (index 2)
**Provider scale**: `high` (index 0), `collaborative` (index 1), `provider_guided` (index 2)

**Scoring logic** (distance-based):
- Distance 0 (exact match): 1.0
- Distance 1 (adjacent): 0.6
- Distance 2 (opposite ends): 0.2
- Provider has no autonomy data: 0.5

### 6. Comorbidity Experience (`scoreComorbidity`)

Matches the patient's known conditions against the provider's stated experience areas.

**Patient input**: Array of condition keys from `COMORBIDITIES` (adenomyosis, PCOS, interstitial_cystitis, IBS, fibromyalgia, autoimmune, pelvic_congestion, vulvodynia, mental_health, chronic_fatigue, migraines)

**Scoring logic**:
- Score = (number of patient conditions the provider has experience with) / (total patient conditions)
- Provider has no listed experience: 0.2
- Patient has no conditions: dimension excluded (returns null)

### 7. Trauma-Informed Care (`scoreTraumaInformed`)

Binary match on whether the patient wants trauma-informed care and the provider offers it.

**Scoring logic**:
- Patient wants trauma-informed care AND provider offers it: 1.0
- Patient wants it AND provider does not: 0.1
- Patient does not prioritize it: dimension excluded (returns null)

### 8. Telehealth (`scoreTelehealth`)

Matches telehealth preference.

**Patient options**: `required`, `preferred`, `in_person_preferred`, `no_preference`

**Scoring logic**:
- `required`: offers telehealth = 1.0, does not = 0.0
- `preferred`: offers telehealth = 1.0, does not = 0.5
- `in_person_preferred`: 0.8 (in-person is the default for most providers)

Note: `required` also acts as a hard filter.

### 9. FMLA / Disability Support (`scoreFmla`)

Matches patient needs for FMLA paperwork and/or disability documentation support.

**Patient input**: `needsFmla` (boolean), `needsDisability` (boolean)

**Scoring logic**:
- For each need (FMLA, disability), score 1.0 if provider completes that paperwork, 0.0 if not
- Final score is the average across active needs
- If neither need is active: dimension excluded

### 10. Diagnostic Capability (`scoreDiagnosticCapability`)

Evaluates the provider's imaging and diagnostic infrastructure for endometriosis.

**Scoring components** (additive, normalized to 0.0-1.0):

TVUS capability (up to 0.6 raw):
- Performs TVUS: +0.3
- Endo-specific TVUS training: +0.3

MRI capability (up to 0.5 raw):
- Reads MRI directly: +0.2
- Interprets endo findings on MRI: +0.2
- Collaborates with endo-trained radiologist: +0.1

The raw sum (max 1.1) is divided by 1.1 and capped at 1.0 to normalize.

This dimension is only scored when the patient indicates diagnostic capability is important (`diagnosticCapabilityImportant === true`).

---

## Surgical Quality Dimensions

For providers classified as `excision_surgeon`, five surgical quality dimensions are always scored. These are not controlled by patient importance levels -- they carry a fixed 25% weight in the total score for surgeons.

### 1. Surgical Volume (`scoreSurgicalVolume`)

- 200+ excisions/year or 200+ hours: 1.0
- 100-199 hours: 0.7
- 50-99 hours: 0.4
- Below 50 hours: 0.2

### 2. Complication Rate (`scoreComplicationRate`)

Major complication rate (Clavien-Dindo Grade III+):

- Below 1%: 1.0
- 1% to under 2%: 0.9
- 2% to under 3%: 0.7
- 3% to under 5%: 0.5
- 5% or above: 0.2
- Unknown (not reported): 0.5 (neutral)

### 3. Transparency (`scoreTransparency`)

Composite of five boolean indicators, each worth 0.2:

- Provides operative photos: +0.2
- Provides operative reports: +0.2
- Shares pathology results: +0.2
- Tracks outcomes: +0.2
- Reports complication rate (field is not null): +0.2

Total: 0.0 to 1.0.

### 4. Team Approach (`scoreTeamApproach`)

- Has multidisciplinary team with colorectal or urology: 1.0
- Has multidisciplinary team without those specialties: 0.8
- No team, but refers bowel/bladder cases out: 0.7
- No team, performs bowel/bladder surgery solo: 0.3
- No team, no bowel/bladder data: 0.5

### 5. Fellowship Training (`scoreFellowshipTraining`)

- Fellowship trained AND high-volume: 1.0
- Fellowship trained only: 0.8
- High-volume only (no fellowship): 0.7
- Neither: 0.3

---

## Hard Filters

Hard filters are applied before scoring. Any provider that fails a hard filter is excluded entirely from results. The function `applyHardFilters` implements these.

| Filter | Condition for exclusion |
|---|---|
| Provider type | Patient specified `seekingProviderTypes` and provider's type is not in the list |
| Location | Patient specified a `state` AND is not willing to travel AND provider is in a different state |
| Verification status | Provider's `verificationStatus` is `rejected` |
| Accepting patients | Provider's `acceptingNewPatients` is `false` |
| Hormone-free | Patient's `hormoneFreePreference` is `required` AND provider does not offer hormone-free options |
| Telehealth | Patient's `telehealthPreference` is `required` AND provider does not offer telehealth |
| Gender | Patient specified a `genderPreference` (not `no_preference`) AND provider's `patientGenderPreference` is set AND does not match |

---

## Weight Redistribution

When a patient selects `no_preference` for a dimension, or a dimension is otherwise not applicable (returns `null`), that dimension is excluded from the scoring entirely. Its weight does not count toward the denominator.

This means the remaining dimensions automatically receive proportionally more influence. The normalization formula is:

```
preferenceScore = sum(score_i * multiplier_i) / sum(multiplier_i)
```

Where the sums only include dimensions with non-null scores. If a patient marks 3 of 10 dimensions as `no_preference`, those 3 are dropped from both numerator and denominator, and the remaining 7 dimensions determine the full preference score.

For surgeons, the total score is:

```
totalScore = preferenceScore * 0.75 + surgicalQualityAverage * 0.25
```

For non-surgeons:

```
totalScore = preferenceScore
```

If all preference dimensions return null (every dimension is `no_preference`), the total score falls back to the surgical quality average for surgeons, or 0.5 for non-surgeons.

---

## Match Labels

The total score (0.0 to 1.0) maps to a human-readable label:

| Label | Minimum Score | CSS Class |
|---|---|---|
| Excellent Match | 0.85 | `match-excellent` |
| Strong Match | 0.70 | `match-strong` |
| Good Match | 0.50 | `match-good` |
| Possible Match | below 0.50 | `match-possible` |

The label is the only score-derived information the patient sees. The numerical score, dimension breakdown, and surgical quality scores are internal to the system.

---

## Worked Examples

### Example 1: Faith-focused patient seeking excision surgeon

**Patient preferences**:

| Dimension | Value | Importance |
|---|---|---|
| Faith | `faith_based_required`, tradition: `christian` | `critical` (3x) |
| Philosophy | `integrative` | `important` (2x) |
| Uterus/Fertility | `preserve_uterus` | `critical` (3x) |
| Hormone-free | `preferred` | `nice_to_have` (1x) |
| Autonomy | `want_collaboration` | `important` (2x) |
| Comorbidity | `[adenomyosis, ibs]` | `important` (2x) |
| Trauma-informed | not important | excluded |
| Telehealth | `no_preference` | excluded |
| FMLA | not needed | excluded |
| Diagnostic | not important | excluded |

**Provider A** (excision surgeon):
- Faith-based: yes, tradition: `christian`
- Philosophy: `integrative`
- Uterus preservation: `priority`
- Hormone-free options: yes
- Autonomy: `collaborative`
- Comorbidity experience: `[adenomyosis, pcos, ibs]`
- Surgical volume: 250 hours/year
- Complication rate: 1.5%
- Transparency: provides photos, reports, pathology, tracks outcomes, reports complications (5/5)
- Team: multidisciplinary with colorectal
- Fellowship: yes

Dimension scores for Provider A:

| Dimension | Score | Multiplier | Weighted |
|---|---|---|---|
| Faith | 1.0 (faith-based, tradition matches) | 3.0 | 3.0 |
| Philosophy | 1.0 (exact match) | 2.0 | 2.0 |
| Uterus/Fertility | 1.0 (preservation is priority) | 3.0 | 3.0 |
| Hormone-free | 1.0 (offers hormone-free) | 1.0 | 1.0 |
| Autonomy | 1.0 (collaborative matches want_collaboration) | 2.0 | 2.0 |
| Comorbidity | 1.0 (2/2 conditions covered) | 2.0 | 2.0 |

Preference weighted sum: 3.0 + 2.0 + 3.0 + 1.0 + 2.0 + 2.0 = 13.0
Preference weight total: 3.0 + 2.0 + 3.0 + 1.0 + 2.0 + 2.0 = 13.0
Preference normalized: 13.0 / 13.0 = 1.0

Surgical quality scores:
- Volume: 1.0 (250 >= 200)
- Complication rate: 0.9 (1.5% is between 1% and 2%)
- Transparency: 1.0 (5/5)
- Team approach: 1.0 (multidisciplinary with colorectal)
- Fellowship: 1.0 (fellowship + high-volume)
- Quality average: (1.0 + 0.9 + 1.0 + 1.0 + 1.0) / 5 = 0.98

Total score: 1.0 * 0.75 + 0.98 * 0.25 = 0.75 + 0.245 = **0.995**
Match label: **Excellent Match** (>= 0.85)

---

**Provider B** (excision surgeon):
- Faith-based: no
- Philosophy: `conventional`
- Uterus preservation: `case_by_case`, hysterectomy: `considers_early`
- Hormone-free options: no
- Autonomy: `provider_guided`
- Comorbidity experience: `[pcos]`
- Surgical volume: 80 hours/year
- Complication rate: not reported
- Transparency: provides reports only (1/5)
- Team: no team, refers bowel out
- Fellowship: no

Dimension scores for Provider B:

| Dimension | Score | Multiplier | Weighted |
|---|---|---|---|
| Faith | 0.0 (required faith-based, provider is not) | 3.0 | 0.0 |
| Philosophy | 0.7 (conventional is adjacent to integrative) | 2.0 | 1.4 |
| Uterus/Fertility | 0.1 (considers hysterectomy early) | 3.0 | 0.3 |
| Hormone-free | 0.4 (preferred but not offered) | 1.0 | 0.4 |
| Autonomy | 0.6 (collaborative vs provider_guided, distance 1) | 2.0 | 1.2 |
| Comorbidity | 0.0 (0/2 conditions covered) | 2.0 | 0.0 |

Preference weighted sum: 0.0 + 1.4 + 0.3 + 0.4 + 1.2 + 0.0 = 3.3
Preference weight total: 3.0 + 2.0 + 3.0 + 1.0 + 2.0 + 2.0 = 13.0
Preference normalized: 3.3 / 13.0 = 0.254

Surgical quality scores:
- Volume: 0.4 (80 hours, 50-99 range)
- Complication rate: 0.5 (unknown)
- Transparency: 0.2 (1/5 -- operative reports only)
- Team approach: 0.7 (no team, refers bowel out)
- Fellowship: 0.3 (neither fellowship nor high-volume)
- Quality average: (0.4 + 0.5 + 0.2 + 0.7 + 0.3) / 5 = 0.42

Total score: 0.254 * 0.75 + 0.42 * 0.25 = 0.190 + 0.105 = **0.296**
Match label: **Possible Match** (< 0.50)

---

### Example 2: Patient seeking hormone-free pelvic floor PT with telehealth

**Patient preferences**:

| Dimension | Value | Importance |
|---|---|---|
| Faith | `no_preference` | excluded |
| Philosophy | `functional` | `important` (2x) |
| Uterus/Fertility | `not_applicable` | excluded |
| Hormone-free | `required` | `critical` (3x) |
| Autonomy | `want_to_lead` | `important` (2x) |
| Comorbidity | `[interstitial_cystitis, vulvodynia]` | `critical` (3x) |
| Trauma-informed | yes | `critical` (3x) |
| Telehealth | `required` | `important` (2x) |
| FMLA | not needed | excluded |
| Diagnostic | not important | excluded |

Seeking provider type: `pelvic_floor_pt`. Hard filters: telehealth required, hormone-free required.

**Provider C** (pelvic floor PT):
- Philosophy: `integrative`
- Hormone-free options: yes
- Autonomy: `high`
- Comorbidity experience: `[interstitial_cystitis, vulvodynia, pelvic_congestion]`
- Trauma-informed: yes
- Telehealth: yes

Provider C passes hard filters (offers telehealth, offers hormone-free). Not a surgeon, so no surgical quality dimensions.

Dimension scores:

| Dimension | Score | Multiplier | Weighted |
|---|---|---|---|
| Philosophy | 0.7 (functional is adjacent to integrative) | 2.0 | 1.4 |
| Hormone-free | 1.0 (required and offered) | 3.0 | 3.0 |
| Autonomy | 1.0 (want_to_lead matches high) | 2.0 | 2.0 |
| Comorbidity | 1.0 (2/2 conditions covered) | 3.0 | 3.0 |
| Trauma-informed | 1.0 (offered) | 3.0 | 3.0 |
| Telehealth | 1.0 (required and offered) | 2.0 | 2.0 |

Preference weighted sum: 1.4 + 3.0 + 2.0 + 3.0 + 3.0 + 2.0 = 14.4
Preference weight total: 2.0 + 3.0 + 2.0 + 3.0 + 3.0 + 2.0 = 15.0
Preference normalized: 14.4 / 15.0 = 0.96

Total score (non-surgeon): **0.96**
Match label: **Excellent Match** (>= 0.85)

---

**Provider D** (pelvic floor PT):
- Philosophy: `conventional`
- Hormone-free options: yes
- Autonomy: `provider_guided`
- Comorbidity experience: `[fibromyalgia]`
- Trauma-informed: no
- Telehealth: yes

Provider D passes hard filters.

Dimension scores:

| Dimension | Score | Multiplier | Weighted |
|---|---|---|---|
| Philosophy | 0.2 (functional to conventional is distant) | 2.0 | 0.4 |
| Hormone-free | 1.0 (required and offered) | 3.0 | 3.0 |
| Autonomy | 0.2 (want_to_lead vs provider_guided, distance 2) | 2.0 | 0.4 |
| Comorbidity | 0.0 (0/2 conditions covered) | 3.0 | 0.0 |
| Trauma-informed | 0.1 (wanted but not offered) | 3.0 | 0.3 |
| Telehealth | 1.0 (required and offered) | 2.0 | 2.0 |

Preference weighted sum: 0.4 + 3.0 + 0.4 + 0.0 + 0.3 + 2.0 = 6.1
Preference weight total: 2.0 + 3.0 + 2.0 + 3.0 + 3.0 + 2.0 = 15.0
Preference normalized: 6.1 / 15.0 = 0.407

Total score (non-surgeon): **0.407**
Match label: **Possible Match** (< 0.50)
