# Data Model Reference

This document describes every table in the EndEndo Specialist Directory database. The schema is defined using Drizzle ORM and targets a Replit-hosted PostgreSQL instance. The authoritative source of truth is `lib/schema.js`.

Throughout this document, columns marked **[NEW]** were added for the patient-preference matching system. All other columns are part of the original Replit schema.

---

## Table: `users`

Standard user accounts for patients, providers, and admins.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK, auto-increment |
| username | text | Login username | NOT NULL, UNIQUE |
| password | text | Hashed password | NOT NULL |
| email | text | Account email | NOT NULL, UNIQUE |
| isAdmin | boolean | Admin privileges flag | Default false |
| isDoctor | boolean | Provider account flag | Default false |
| alias | text | Display alias for forums | Nullable |
| createdAt | timestamp | Account creation time | Default now() |
| isVerified | boolean | Email verification status | Default false |
| verificationToken | text | Email verification token | Nullable |
| verificationExpires | timestamp | Token expiration | Nullable |
| resetPasswordToken | text | Password reset token | Nullable |
| resetPasswordExpires | timestamp | Reset token expiration | Nullable |
| lastLogin | timestamp | Most recent login | Nullable |
| firstName | text | First name | Nullable |
| lastName | text | Last name | Nullable |
| avatarUrl | text | Profile image URL | Nullable |
| bio | text | User biography | Nullable |
| subscribedToUpdates | boolean | Platform update emails | Default false |
| subscribedToNewsletter | boolean | Newsletter subscription | Default false |
| subscribedToMonthlyAma | boolean | Monthly AMA notifications | Default false |
| unsubscribedAt | timestamp | Timestamp of unsubscribe | Nullable |

---

## Table: `doctors`

The central provider table. Contains both the original directory fields and new columns for provider classification and patient-preference matching.

### Core identity and location

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK, auto-increment |
| name | text | Full provider name | NOT NULL |
| city | text | City | Nullable |
| state | text | US state abbreviation | Nullable |
| country | text | Country | Nullable |
| address | text | Street address | Nullable |
| postalCode | text | ZIP / postal code | Nullable |
| latitude | doublePrecision | Geocoded latitude | Nullable |
| longitude | doublePrecision | Geocoded longitude | Nullable |
| phone | text | Office phone | Nullable |
| email | text | Contact email | Nullable |
| website | text | Personal website | Nullable |
| officeHours | text | Free-text office hours | Nullable |
| telehealth | boolean | Offers telehealth visits | Default false |
| notes | text | Admin or provider notes | Nullable |
| practiceName | text | Practice or clinic name | Nullable |
| practiceWebsite | text | Practice URL | Nullable |
| profileImageUrl | text | Provider headshot URL | Nullable |
| source | text | How the listing was added | Nullable |
| createdAt | timestamp | Record creation time | Default now() |
| updatedAt | timestamp | Last modification time | Default now() |
| userId | integer | Linked user account | FK -> users.id, Nullable |

### Clinical specialties and procedures

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| specialties | text[] | Specialty labels | Nullable |
| procedures | text[] | Procedures performed | Nullable |
| languages | text[] | Languages spoken | Nullable |
| patientGenderPreference | text | Gender the provider primarily treats | Nullable |
| acceptingNewPatients | boolean | Accepting new patients | Default true |
| waitTimeMonths | integer | Estimated wait in months | Nullable |

### Certification and training

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| nancysNookListed | boolean | Listed on Nancy's Nook | Default false |
| abogCertification | boolean | ABOG board certified | Default false |
| abogCertificationStartDate | timestamp (date) | ABOG cert start | Nullable |
| abogRecertificationStatusDate | timestamp (date) | ABOG recertification check | Nullable |
| abogContinuingEducationStatus | boolean | ABOG CME current | Default false |
| abmsCertification | boolean | ABMS board certified | Default false |
| yearsAbogCertified | integer | Years holding ABOG cert | Nullable |
| yearsAbmsCertified | integer | Years holding ABMS cert | Nullable |
| certificationUpdated | boolean | Cert info recently refreshed | Default false |
| abogId | text | ABOG identification number | Nullable |
| abmsId | text | ABMS identification number | Nullable |
| additionalCertifications | text[] | Other certifications | Nullable |
| migsFellowshipTraining | boolean | MIGS fellowship completed | Default false |
| trainingYearEndDate | integer | Fellowship completion year | Nullable |
| annualCmeEndoRelated | text | Annual CME hours endo-focused | Nullable |
| annualCmeMonthYear | text | Date of CME reporting | Nullable |

### Surgical volume and outcomes

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| surgicalVolumeExcisionHours | integer | Lifetime excision case count / hours | Nullable |
| surgicalVolume200Excisions | boolean | Has performed 200+ excisions | Default false |
| surgicalVolumeDocumentation | text | Supporting evidence link or note | Nullable |
| publicationsPids | text[] | PubMed IDs of publications | Nullable |
| patientOutcomeReviewLinks | text[] | Links to outcome data | Nullable |
| patientOutcomeRating | doublePrecision | Aggregate outcome rating | Nullable |
| clinicalTrialsNctNumbers | text[] | ClinicalTrials.gov NCT numbers | Nullable |

### Insurance and cost

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| acceptsInsurance | boolean | Takes insurance | Default false |
| insuranceDetails | text | Free-text insurance info | Nullable |
| insuranceNetworks | text[] | Network names | Nullable |
| insuranceOtherExplanation | text | Additional insurance notes | Nullable |
| outOfPocketCost | text | Estimated self-pay cost | Nullable |
| bundledServices | boolean | Offers bundled pricing | Default false |
| costBreakdown | text | Detailed cost information | Nullable |
| paymentOptions | text[] | Payment methods accepted | Nullable |

### Telehealth and multi-state licensing

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| multiStateLicenses | jsonb | States where provider is licensed | Nullable |
| telehealthPlatforms | text[] | Platform names (Zoom, Doxy, etc.) | Nullable |
| canReadMri | boolean | Legacy field -- can read MRI | Default false |
| mriNotes | text | MRI reading details | Nullable |

#### `multiStateLicenses` JSONB structure

```json
[
  { "state": "CA", "licenseNumber": "G12345", "active": true },
  { "state": "NY", "licenseNumber": "NY-98765", "active": true }
]
```

### Verification and ratings

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| verificationStatus | text | unverified, pending, verified, rejected | Default "unverified" |
| verificationDate | timestamp (date) | Date verified | Nullable |
| verificationNotes | text | Admin notes on verification | Nullable |
| lastVerificationCheckDate | timestamp (date) | Last re-check date | Nullable |
| rating | doublePrecision | Average review rating | Default 0 |
| reviewCount | integer | Total review count | Default 0 |
| featuredReviewId | integer | Pinned review ID | Nullable |

### Social media

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| socialMedia | jsonb | Social media profile links | Nullable |

#### `socialMedia` JSONB structure

```json
{
  "instagram": "https://instagram.com/drexample",
  "twitter": "https://twitter.com/drexample",
  "youtube": "https://youtube.com/@drexample",
  "linkedin": "https://linkedin.com/in/drexample",
  "tiktok": "https://tiktok.com/@drexample"
}
```

### [NEW] Provider classification

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| providerType | text | Primary provider category | Nullable. One of: excision_surgeon, interventional_radiologist, gastroenterologist, functional_medicine, pelvic_floor_pt, urologist, pain_management, mental_health, nutritionist, other |

### [NEW] Patient-preference matching fields

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| faithBased | boolean | Provider operates within a faith tradition | Default false |
| faithTradition | text | Specific tradition (e.g. Christian, Jewish) | Nullable |
| treatmentPhilosophy | text | conventional, integrative, holistic, functional | Nullable |
| uterusPreservation | text | priority, case_by_case, not_applicable | Nullable |
| fertilityFocus | boolean | Emphasizes fertility preservation | Default false |
| hormoneFreeOptions | boolean | Offers hormone-free treatment paths | Default false |
| patientAutonomy | text | high, collaborative, provider_guided | Nullable |
| approachToHysterectomy | text | last_resort, considers_early, case_by_case, not_applicable | Nullable |
| painValidation | text | high, moderate | Nullable |
| endoStageExpertise | text[] | Stages the provider treats (stage_1 through deep_infiltrating) | Nullable |
| comorbidityExperience | text[] | Comorbidities the provider has experience with | Nullable |
| traumaInformed | boolean | Trauma-informed care approach | Default false |

### [NEW] Surgeon-specific quality fields

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| complicationRateMajor | doublePrecision | Clavien-Dindo Grade III+ complication rate (%) | Nullable |
| dedicatedSurgicalPractice | boolean | Practice is primarily endo surgery | Default false |
| providesOperativePhotos | boolean | Shares surgical photos with patient | Default false |
| providesOperativeReports | boolean | Provides detailed operative reports | Default false |
| sharesPathologyResults | boolean | Shares pathology with patient | Default false |
| tracksOutcomes | boolean | Formally tracks surgical outcomes | Default false |
| practiceSetting | text | academic, hospital_employed, private_group, solo_private | Nullable |

### [NEW] Multidisciplinary team

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| bowelSurgeryApproach | text | self, team_colorectal, refer_out, not_applicable | Nullable |
| bladderSurgeryApproach | text | Same enum as bowel | Nullable |
| diaphragmSurgeryApproach | text | Same enum (team_cardiothoracic for thoracic) | Nullable |
| hasMultidisciplinaryTeam | boolean | Operates with a formal team | Default false |
| teamSpecialties | text[] | Specialties on the team | Nullable |

### [NEW] Imaging capabilities

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| imagingCapabilities | jsonb | Structured imaging data (see below) | Nullable |

#### `imagingCapabilities` JSONB structure

```json
{
  "tvus": {
    "performsTvus": true,
    "interpretsTvus": true,
    "tvusEndoTrained": true,
    "tvusProtocol": "idea",
    "refersTvus": false
  },
  "mri": {
    "readsMriDirectly": false,
    "reviewsImpressionOnly": true,
    "interpretsEndoFindings": true,
    "ordersEndoProtocolMri": true,
    "collaboratesWithRadiologist": true
  },
  "otherImaging": {
    "renalUltrasound": false,
    "colonoscopy": false
  }
}
```

- **tvus.tvusProtocol** values: `idea` (IDEA -- International Deep Endometriosis Analysis), `ieta` (IETA), `custom`, `standard`. Defined in `TVUS_PROTOCOLS` in `lib/constants.js`.
- The `canReadMri` boolean on the main table is a legacy field. Use `imagingCapabilities.mri` for new code.

### [NEW] FMLA and disability support

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| completesFmla | boolean | Completes FMLA paperwork | Default false |
| completesDisabilityPaperwork | boolean | Completes disability forms | Default false |
| fmlaDisabilityNotes | text | Additional notes about support | Nullable |
| fmlaResponseTimeDays | integer | Typical turnaround in days | Nullable |

### [NEW] International support

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| countryRegistrationNumber | text | Non-US registration/license number | Nullable |
| countryRegistrationType | text | Registration body (gmc_uk, ahpra_au, etc.) | Nullable |
| regionOrProvince | text | Non-US region or province | Nullable |
| currencyForCosts | text | Currency code for cost fields | Default "USD" |

### [NEW] Type-specific data

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| typeSpecificData | jsonb | Fields unique to non-surgeon provider types | Nullable |

The `typeSpecificData` column stores provider-type-specific attributes that do not warrant their own columns. Each provider type defines its own expected shape. See `docs/PROVIDER_TYPES.md` for the full specification per type. Example for `pelvic_floor_pt`:

```json
{
  "internalManualTherapy": true,
  "preSurgicalRehab": true,
  "postSurgicalRehab": true,
  "traumaInformedPelvic": true,
  "biofeedback": true,
  "visceralMobilization": false,
  "dryNeedling": false
}
```

---

## Table: `reviews`

Patient reviews of providers.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| doctorId | integer | Reviewed provider | FK -> doctors.id, NOT NULL |
| userId | integer | Reviewing user | FK -> users.id, NOT NULL |
| title | text | Review title | NOT NULL |
| content | text | Review body | NOT NULL |
| rating | integer | Numeric rating (1-5) | NOT NULL |
| treatmentDate | text | Approximate treatment date | Nullable |
| procedures | text[] | Procedures in this review | Nullable |
| displayName | text | Name shown publicly | Nullable |
| status | text | pending, approved, rejected | Default "pending" |
| publicResponse | text | Provider public reply | Nullable |
| privateResponse | text | Provider private reply | Nullable |
| createdAt | timestamp | Submission time | Default now() |

---

## Table: `patientPreferences` [NEW]

Stores patient questionnaire responses. Used for matching and analytics. A patient can have multiple preference sets (one per session), and optionally link to a user account.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| sessionId | text | Anonymous session identifier | NOT NULL |
| userId | integer | Linked user account (if logged in) | FK -> users.id, Nullable |
| email | text | Optional contact email | Nullable |
| seekingProviderTypes | text[] | Provider types the patient wants | Nullable |
| state | text | US state for location filter | Nullable |
| city | text | City preference | Nullable |
| willingToTravel | boolean | Will travel outside state | Default false |
| maxTravelMiles | integer | Maximum travel distance | Nullable |
| faithPreference | text | faith_based_required, faith_based_preferred, secular_preferred, no_preference | Nullable |
| faithTradition | text | Specific faith tradition | Nullable |
| philosophyPreference | text | conventional, integrative, holistic, functional, no_preference | Nullable |
| uterusGoal | text | preserve_uterus, fertility_preservation, open_to_hysterectomy, seeking_hysterectomy, not_applicable | Nullable |
| fertilityImportance | text | critical, important, not_a_factor | Nullable |
| hormoneFreePreference | text | required, preferred, open_to_hormones, no_preference | Nullable |
| autonomyPreference | text | want_to_lead, want_collaboration, trust_provider, no_preference | Nullable |
| painJourneyStage | text | seeking_diagnosis, newly_diagnosed, exploring_treatment, seeking_surgery, post_surgery, chronic_management | Nullable |
| knownConditions | text[] | Comorbidities from COMORBIDITIES enum | Nullable |
| genderPreference | text | Provider gender preference | Nullable |
| telehealthPreference | text | required, preferred, in_person_preferred, no_preference | Nullable |
| traumaInformedImportant | boolean | Wants trauma-informed care | Default false |
| diagnosticCapabilityImportant | boolean | Prioritizes diagnostic imaging | Default false |
| insurancePlan | text | Insurance plan name | Nullable |
| additionalNotes | text | Free-text notes | Nullable |
| needsFmla | boolean | Needs FMLA paperwork | Default false |
| needsDisability | boolean | Needs disability paperwork | Default false |
| employmentState | text | State of employment | Nullable |
| employerSize | text | under_50, 50_plus, federal, unsure | Nullable |
| hasDisabilityBenefit | text | employer_provided, state_provided, both, none, unsure | Nullable |
| weightFaith | text | Importance: critical, important, nice_to_have | Default "important" |
| weightPhilosophy | text | Same importance scale | Default "important" |
| weightUterusFertility | text | Same importance scale | Default "important" |
| weightHormoneFree | text | Same importance scale | Default "important" |
| weightAutonomy | text | Same importance scale | Default "important" |
| weightComorbidity | text | Same importance scale | Default "important" |
| weightTraumaInformed | text | Same importance scale | Default "important" |
| weightFmla | text | Same importance scale | Default "nice_to_have" |
| weightDiagnosticCapability | text | Same importance scale | Default "important" |
| createdAt | timestamp | Submission time | Default now() |
| updatedAt | timestamp | Last update time | Default now() |

---

## Table: `providerDataVisibility` [NEW]

Per-field visibility controls that let providers decide what patients can see.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| doctorId | integer | Provider this rule applies to | FK -> doctors.id, NOT NULL |
| fieldName | text | Column or data field name | NOT NULL |
| visibility | text | public, on_request, backend_only | NOT NULL, Default "on_request" |

The set of fields eligible for visibility control is defined in `VISIBILITY_CONTROLLED_FIELDS` in `lib/constants.js`. Fields default to either `public` or `on_request` depending on sensitivity.

---

## Table: `patientDataRequests` [NEW]

Logs requests from patients to view provider data that is marked `on_request`.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| sessionId | text | Requesting session | NOT NULL |
| userId | integer | Requesting user (if logged in) | FK -> users.id, Nullable |
| doctorId | integer | Provider whose data was requested | FK -> doctors.id, NOT NULL |
| requestedFields | text[] | Field names requested | Nullable |
| createdAt | timestamp | Request timestamp | Default now() |

---

## Table: `doctorRequests`

Patient-submitted requests for providers not yet in the directory.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| name | text | Requester name | NOT NULL |
| email | text | Requester email | NOT NULL |
| location | text | Desired location | NOT NULL |
| specialtyNeeded | text | Type of provider needed | NOT NULL |
| additionalRequirements | text | Free-text requirements | Nullable |
| searchCriteria | text | What they searched for | Nullable |
| status | text | pending, in_progress, completed | Default "pending" |
| createdAt | timestamp | Submission time | Default now() |
| updatedAt | timestamp | Last status change | Default now() |
| notes | text | Admin notes | Nullable |

---

## Table: `doctorRegistrations`

Provider self-registration requests linking a user account to a doctor profile.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| userId | integer | Registering user | FK -> users.id, NOT NULL |
| doctorId | integer | Matched doctor record | FK -> doctors.id, Nullable |
| credentials | jsonb | Uploaded credential data | Nullable |
| status | text | pending, approved, rejected | Default "pending" |
| notes | text | Admin notes | Nullable |
| createdAt | timestamp | Submission time | Default now() |

---

## Table: `doctorUpdateRequests`

Requests to update or create provider listings. Submitted by providers or community members and reviewed by admins.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| userId | integer | Submitting user | FK -> users.id, Nullable |
| doctorId | integer | Existing doctor to update | FK -> doctors.id, Nullable |
| type | varchar(20) | "new" or "update" | NOT NULL |
| status | varchar(20) | pending, approved, rejected | NOT NULL, Default "pending" |
| name | varchar(255) | Provider name | NOT NULL |
| email | varchar(255) | Provider email | NOT NULL |
| city | varchar(100) | City | NOT NULL |
| state | varchar(50) | State | NOT NULL |
| country | varchar(50) | Country | NOT NULL, Default "USA" |
| phone | varchar(20) | Phone | Nullable |
| website | varchar(500) | Website | Nullable |
| notes | text | Free-text notes | Nullable |
| abogCertification | boolean | ABOG cert | Default false |
| abogCertificationStartDate | timestamp (date) | ABOG start | Nullable |
| abogRecertificationStatusDate | timestamp (date) | ABOG recert date | Nullable |
| abogContinuingEducationStatus | boolean | ABOG CME | Default false |
| abmsCertification | boolean | ABMS cert | Default false |
| specialties | text | Specialties (free text) | Nullable |
| procedures | text | Procedures (free text) | Nullable |
| migsFellowshipTraining | boolean | MIGS fellowship | Default false |
| trainingYearEndDate | integer | Fellowship year | Nullable |
| annualCmeEndoRelated | text | Endo CME hours | Nullable |
| annualCmeMonthYear | text | CME date | Nullable |
| surgicalVolumeExcisionHours | integer | Volume count | Nullable |
| surgicalVolume200Excisions | boolean | 200+ excisions | Default false |
| surgicalVolumeDocumentation | text | Evidence | Nullable |
| publicationsPids | text[] | PubMed IDs | Nullable |
| patientOutcomeReviewLinks | text[] | Outcome links | Nullable |
| patientOutcomeRating | doublePrecision | Outcome rating | Nullable |
| clinicalTrialsNctNumbers | text[] | NCT numbers | Nullable |
| multiStateLicenses | jsonb | License data | Nullable |
| telehealthPlatforms | text[] | Telehealth platforms | Nullable |
| insuranceNetworks | text[] | Networks | Nullable |
| insuranceOtherExplanation | text | Insurance notes | Nullable |
| acceptingNewPatients | boolean | Accepting patients | Default false |
| telehealth | boolean | Telehealth offered | Default false |
| submitterName | text | Name of person submitting | Nullable |
| submitterEmail | text | Submitter contact | Nullable |
| reviewNotes | text | Admin review notes | Nullable |
| reviewedBy | integer | Admin who reviewed | FK -> users.id, Nullable |
| reviewedAt | timestamp | Review timestamp | Nullable |
| createdAt | timestamp | Submission time | Default now() |
| updatedAt | timestamp | Last modified | Default now() |

---

## Table: `forumPosts`

Community forum posts.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| userId | integer | Author | FK -> users.id, NOT NULL |
| title | text | Post title | NOT NULL |
| content | text | Post body | NOT NULL |
| upvotes | integer | Community votes | Default 0 |
| needsDoctorInput | boolean | Flagged for provider response | Default false |
| createdAt | timestamp | Posted at | Default now() |

---

## Table: `forumComments`

Replies to forum posts.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| postId | integer | Parent post | FK -> forumPosts.id, NOT NULL |
| userId | integer | Commenter | FK -> users.id, NOT NULL |
| content | text | Comment body | NOT NULL |
| createdAt | timestamp | Commented at | Default now() |

---

## Table: `forumSubscriptions`

Email subscriptions to forum activity.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| email | text | Subscriber email | NOT NULL |
| userId | integer | Linked user (if registered) | FK -> users.id, Nullable |
| isActive | boolean | Currently subscribed | Default true |
| createdAt | timestamp | Subscription date | Default now() |

---

## Table: `grandRounds`

Virtual grand rounds sessions hosted by providers.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| title | text | Session title | NOT NULL |
| description | text | Description | NOT NULL |
| dateTime | timestamp | Scheduled date and time | NOT NULL |
| hostDoctor | integer | Hosting provider | FK -> doctors.id, Nullable |
| zoomLink | text | Video conference URL | Nullable |
| caseMaterials | jsonb | Attached case study materials | Nullable |
| isActive | boolean | Visible on the platform | Default true |
| createdAt | timestamp | Created at | Default now() |

---

## Table: `monthlyAma`

Monthly Ask Me Anything sessions.

| Column | Type | Purpose | Constraints |
|--------|------|---------|-------------|
| id | serial | Primary key | PK |
| doctorId | integer | Hosting provider | FK -> doctors.id, NOT NULL |
| title | text | Session title | NOT NULL |
| description | text | Topic description | NOT NULL |
| date | timestamp | Scheduled date | NOT NULL |
| isActive | boolean | Visible on the platform | Default true |

---

## Recommended Indexes

The following indexes should be created for common query patterns. They are not yet defined in the Drizzle schema and should be added as the application scales.

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| doctors | providerType | Filter providers by type during matching |
| doctors | state | Location-based queries |
| doctors | state, providerType | Combined location + type filter |
| doctors | verificationStatus | Exclude rejected providers |
| doctors | acceptingNewPatients | Filter to active providers |
| patientPreferences | sessionId | Look up preferences by session |
| patientPreferences | userId | Look up preferences by user |
| providerDataVisibility | doctorId, fieldName | Unique compound -- one visibility rule per field per provider |
| patientDataRequests | doctorId | Track request volume per provider |
| reviews | doctorId | Fetch reviews for a provider |
| reviews | userId | Fetch reviews by a user |
| forumPosts | userId | Posts by user |
| forumComments | postId | Comments on a post |

---

## Clavien-Dindo Classification Reference

The `complicationRateMajor` field on the `doctors` table records the percentage of surgical cases resulting in Clavien-Dindo Grade III or higher complications. This is the standard surgical quality metric used by the matching algorithm.

| Grade | Definition |
|-------|-----------|
| I | Normal postoperative course, no pharmacological treatment needed |
| II | Requires pharmacological treatment (e.g. antibiotics, blood transfusion) |
| IIIa | Requires intervention not under general anesthesia |
| IIIb | Requires intervention under general anesthesia |
| IVa | Single organ dysfunction requiring ICU |
| IVb | Multi-organ dysfunction requiring ICU |
| V | Death |

The matching algorithm scores complication rates as follows:

- Below 1%: score 1.0
- 1% to under 2%: score 0.9
- 2% to under 3%: score 0.7
- 3% to under 5%: score 0.5
- 5% and above: score 0.2
- Unknown (null): score 0.5 (neutral)
