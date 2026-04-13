# Provider Types

This document describes every provider type supported by the EndEndo Specialist Directory. For each type it covers: what the provider does, which database fields apply, how the type participates in the patient-preference matching algorithm, and the expected shape of `typeSpecificData` where applicable.

Provider types are defined in `PROVIDER_TYPES` in `lib/constants.js` and stored in the `providerType` column on the `doctors` table.

---

## excision_surgeon

**Label:** Excision Surgeon

**Description:** A gynecological surgeon who specializes in laparoscopic excision (not ablation) of endometriosis tissue. This is the flagship provider type for the directory. Excision surgeons receive the most detailed data model and are the only type scored on surgical quality dimensions.

### Required fields

- `name`, `state` (or `country` for international), `providerType`

### Key fields

| Field | Purpose |
|-------|---------|
| migsFellowshipTraining | Whether the surgeon completed a MIGS (Minimally Invasive Gynecologic Surgery) fellowship |
| trainingYearEndDate | Year fellowship was completed |
| abogCertification / abmsCertification | Board certification status |
| surgicalVolumeExcisionHours | Lifetime excision case count |
| surgicalVolume200Excisions | Indicates 200+ cases performed |
| complicationRateMajor | Clavien-Dindo Grade III+ complication rate as a percentage |
| nancysNookListed | Whether the surgeon appears on the Nancy's Nook list |

### Quality scoring fields (always applied, 25% of total score)

These dimensions are scored by the matching algorithm for every excision surgeon, regardless of patient preferences:

1. **Surgical volume** -- higher volume correlates with better outcomes. 200+ cases scores 1.0.
2. **Complication rate** -- lower is better. See Clavien-Dindo reference in DATA_MODEL.md.
3. **Transparency** -- whether the surgeon shares operative photos, operative reports, pathology results, tracks outcomes, and discloses complication rates.
4. **Team approach** -- whether the surgeon has a multidisciplinary team (colorectal surgeon, urologist) or refers out for complex cases. Solo bowel surgery by an endo surgeon scores lower.
5. **Fellowship training** -- MIGS fellowship combined with high volume scores highest.

### Imaging capabilities

Excision surgeons may have detailed imaging data in `imagingCapabilities`:

- **TVUS (transvaginal ultrasound):** whether the surgeon performs TVUS in-office, interprets findings, has endo-specific TVUS training, and which protocol (IDEA, IETA, custom, standard).
- **MRI:** whether the surgeon reads MRI directly, reviews impressions only, interprets endo-specific findings, orders endo-protocol MRI, or collaborates with a radiologist.

### Multidisciplinary team detail

| Field | Purpose |
|-------|---------|
| hasMultidisciplinaryTeam | Formal team exists |
| teamSpecialties | List of specialties on the team |
| bowelSurgeryApproach | self, team_colorectal, refer_out, not_applicable |
| bladderSurgeryApproach | Same enum |
| diaphragmSurgeryApproach | Same enum (team_cardiothoracic for thoracic) |

### Matching participation

All nine preference dimensions apply (faith, philosophy, uterus/fertility, hormone-free, autonomy, comorbidity, trauma-informed, FMLA, diagnostic capability). Additionally, the five surgical quality dimensions are scored and blended at a 25% weight.

---

## interventional_radiologist

**Label:** Interventional Radiologist

**Description:** Performs minimally invasive image-guided procedures relevant to endometriosis and related conditions, including uterine artery embolization (UAE) for adenomyosis and fibroids, and treatment for pelvic congestion syndrome.

### Key clinical areas

- **Uterine artery embolization (UAE):** Non-surgical treatment for adenomyosis and uterine fibroids, preserving the uterus.
- **Pelvic congestion syndrome:** Ovarian vein embolization for chronic pelvic pain caused by dilated pelvic veins.
- **Endo-specific experience:** Some IRs develop expertise in endo-adjacent conditions. The directory captures this to help patients find IRs who understand the endo context.

### `typeSpecificData` structure

```json
{
  "performsUAE": true,
  "uaeCaseVolume": 150,
  "treatsCongestiveSyndrome": true,
  "endoSpecificExperience": true,
  "adenomyosisExperience": true,
  "collaboratesWithExcisionSurgeon": true,
  "imagingModalities": ["fluoroscopy", "ultrasound", "CT", "MRI"]
}
```

### Matching participation

Preference dimensions that apply: faith, philosophy, hormone-free (UAE is hormone-free), autonomy, comorbidity (adenomyosis, pelvic congestion), trauma-informed, FMLA, telehealth. Surgical quality dimensions do not apply.

---

## gastroenterologist

**Label:** Gastroenterologist

**Description:** Specializes in bowel endometriosis and digestive system involvement. Bowel endo can cause symptoms that mimic IBS and other GI conditions. A GI who understands endometriosis can distinguish endo-related GI symptoms from primary GI disease and collaborate with excision surgeons on bowel resection cases.

### `typeSpecificData` structure

```json
{
  "bowelEndoExperience": true,
  "collaboratesWithExcisionSurgeon": true,
  "performsColonoscopy": true,
  "ibsDifferentialDiagnosis": true,
  "motilityTesting": true,
  "dietaryGuidance": true,
  "smallBowelImaging": true
}
```

### Matching participation

Preference dimensions that apply: faith, philosophy, autonomy, comorbidity (IBS, bowel-related conditions), trauma-informed, FMLA, telehealth. Uterus/fertility and hormone-free dimensions are typically not applicable but not excluded.

---

## functional_medicine

**Label:** Functional Medicine

**Description:** Practitioners who take an integrative or root-cause approach to endometriosis management. This category includes IFM-certified practitioners, naturopathic doctors (ND), licensed acupuncturists (LAc), and other complementary providers who work alongside conventional medicine.

The directory emphasizes that functional medicine providers listed here are evidence-based and work in collaboration with (not as a replacement for) conventional medical care.

### `typeSpecificData` structure

```json
{
  "credentialType": "IFM_certified",
  "ifmCertified": true,
  "naturopathicDoctor": false,
  "licensedAcupuncturist": false,
  "evidenceBasedApproach": true,
  "worksAlongsideConventional": true,
  "specializations": ["hormone_balance", "gut_health", "inflammation", "immune_modulation"],
  "herbalism": false,
  "supplements": true,
  "functionalTesting": true,
  "antiInflammatoryProtocols": true
}
```

Valid `credentialType` values: `IFM_certified`, `ND`, `LAc`, `DO_functional`, `MD_functional`, `other`.

### Matching participation

Preference dimensions that apply: faith, philosophy (this type naturally aligns with integrative/functional/holistic philosophies), hormone-free (many functional approaches are hormone-free), autonomy, comorbidity (autoimmune, chronic fatigue, gut issues), trauma-informed, telehealth. Surgical quality dimensions do not apply.

---

## pelvic_floor_pt

**Label:** Pelvic Floor Physical Therapist

**Description:** Specializes in pelvic floor rehabilitation for endometriosis patients. Treats pelvic floor dysfunction, myofascial pain, and scar tissue. Provides both pre-surgical and post-surgical rehabilitation.

### `typeSpecificData` structure

```json
{
  "internalManualTherapy": true,
  "preSurgicalRehab": true,
  "postSurgicalRehab": true,
  "traumaInformedPelvic": true,
  "biofeedback": true,
  "visceralMobilization": true,
  "dryNeedling": false,
  "myofascialRelease": true,
  "bladderRetraining": false,
  "yearsSpecializingPelvicFloor": 8
}
```

### Key capabilities

- **Internal manual therapy:** Direct treatment of pelvic floor muscles -- the core modality for pelvic floor PT.
- **Pre/post-surgical care:** Preparing the pelvic floor before excision surgery and rehabilitating afterward.
- **Trauma-informed approach:** Many endo patients have experienced medical trauma or painful examinations. Trauma-informed PTs adjust their approach accordingly.
- **Biofeedback:** Uses sensors to help patients learn to relax or strengthen pelvic floor muscles.
- **Visceral mobilization:** Gentle manual techniques to address adhesions and organ mobility.

### Matching participation

Preference dimensions that apply: faith, philosophy, autonomy, comorbidity (vulvodynia, interstitial cystitis, fibromyalgia), trauma-informed (particularly relevant for this type), telehealth, FMLA. Hormone-free and uterus/fertility dimensions are not typically applicable.

---

## mental_health

**Label:** Mental Health Provider

**Description:** Psychologists, therapists, and psychiatrists with experience in chronic pain conditions, endometriosis-related psychological impact, grief (fertility loss, identity), and the intersection of mental health with chronic illness.

### `typeSpecificData` structure

```json
{
  "licenseType": "psychologist",
  "chronicPainExperience": true,
  "endoSpecificExperience": true,
  "therapyModalities": ["CBT", "EMDR", "somatic_experiencing", "ACT"],
  "prescribesMediation": false,
  "griefAndLossExperience": true,
  "fertilityGriefExperience": true,
  "couplesCounseling": false,
  "groupTherapy": true,
  "virtualOnly": false
}
```

Valid `licenseType` values: `psychologist`, `therapist` (LCSW, LPC, LMFT), `psychiatrist`.

### Key modalities

- **CBT (Cognitive Behavioral Therapy):** Evidence-based approach for chronic pain coping.
- **EMDR (Eye Movement Desensitization and Reprocessing):** For medical trauma and PTSD from painful procedures or diagnostic delays.
- **Somatic experiencing:** Body-based therapy for trauma stored in the nervous system.
- **ACT (Acceptance and Commitment Therapy):** Psychological flexibility for living with chronic illness.

### Matching participation

Preference dimensions that apply: faith, philosophy, autonomy, comorbidity (anxiety, depression, chronic fatigue), trauma-informed (core to this type), telehealth (many mental health providers offer virtual sessions), FMLA (psychiatrists may complete paperwork).

---

## pain_management

**Label:** Pain Management Specialist

**Description:** Physicians who focus on chronic pelvic pain through interventional procedures, medication management, and multidisciplinary coordination. The directory prioritizes providers who emphasize non-opioid approaches.

### `typeSpecificData` structure

```json
{
  "nonOpioidFocus": true,
  "nerveBlocks": true,
  "triggerPointInjections": true,
  "neuromodulation": false,
  "botoxForPelvicPain": true,
  "ketamineTherapy": false,
  "medicationManagement": true,
  "multidisciplinaryApproach": true,
  "collaboratesWithExcisionSurgeon": true,
  "pelvicPainSpecialization": true
}
```

### Matching participation

Preference dimensions that apply: faith, philosophy, hormone-free (relevant for medication choices), autonomy, comorbidity (fibromyalgia, interstitial cystitis, migraines), trauma-informed, FMLA, telehealth. Surgical quality dimensions do not apply.

---

## urologist

**Label:** Urologist

**Description:** Manages bladder and urinary tract involvement in endometriosis. Bladder endometriosis can cause urinary frequency, urgency, and pain. There is significant clinical overlap between bladder endo and interstitial cystitis (IC), and patients often see urologists for differential diagnosis.

### `typeSpecificData` structure

```json
{
  "bladderEndoExperience": true,
  "interstitialCystitisExperience": true,
  "collaboratesWithExcisionSurgeon": true,
  "performsCystoscopy": true,
  "urodynamicTesting": true,
  "bladderInstillations": true,
  "differentialDiagnosisEndoVsIC": true,
  "surgicalBladderEndoExcision": false
}
```

### Matching participation

Preference dimensions that apply: faith, philosophy, autonomy, comorbidity (interstitial cystitis, bladder endo), trauma-informed, FMLA, telehealth. Hormone-free may apply depending on treatment approach.

---

## nutritionist

**Label:** Nutritionist / Dietitian

**Description:** Registered dietitians or certified nutritionists who specialize in anti-inflammatory dietary approaches for endometriosis, gut health optimization, and evidence-based supplement protocols.

### `typeSpecificData` structure

```json
{
  "registeredDietitian": true,
  "certifiedNutritionist": false,
  "antiInflammatoryDiet": true,
  "eliminationDietExperience": true,
  "gutHealthSpecialization": true,
  "supplementProtocols": true,
  "evidenceBasedOnly": true,
  "foodSensitivityTesting": true,
  "mealPlanning": true,
  "eatingDisorderAwareness": true,
  "endoSpecificExperience": true
}
```

### Matching participation

Preference dimensions that apply: faith, philosophy (often aligns with integrative/functional), autonomy, comorbidity (IBS, autoimmune, chronic fatigue), trauma-informed (especially eating disorder awareness), telehealth (most nutritionists offer virtual sessions). Hormone-free and uterus/fertility dimensions are not typically applicable.

---

## other

**Label:** Other Specialist

**Description:** A catch-all for provider types not yet covered by a dedicated category. Providers classified as `other` should include a description in their notes field. When enough providers of a particular type are added, a dedicated type should be created (see `docs/ADDING_PROVIDER_TYPES.md`).

### Matching participation

All preference dimensions apply at the generic level. No type-specific scoring.

---

## Matching Dimension Applicability Summary

The table below shows which preference-matching dimensions are scored for each provider type. Surgical quality dimensions are scored only for excision surgeons (always applied at 25% weight).

| Dimension | Surgeon | IR | GI | Functional | Pelvic PT | Mental Health | Pain Mgmt | Urology | Nutrition |
|-----------|---------|----|----|------------|-----------|---------------|-----------|---------|-----------|
| Faith | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Philosophy | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Uterus/Fertility | Yes | Yes | -- | -- | -- | -- | -- | -- | -- |
| Hormone-free | Yes | Yes | -- | Yes | -- | -- | Yes | -- | -- |
| Autonomy | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Comorbidity | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Trauma-informed | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| FMLA | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | -- |
| Diagnostic capability | Yes | -- | -- | -- | -- | -- | -- | -- | -- |
| Surgical quality (5 dims) | Yes | -- | -- | -- | -- | -- | -- | -- | -- |

"Yes" means the dimension is scored when a patient has expressed a preference. "--" means the dimension is technically scored but is less commonly relevant; it will return null if the patient has no preference, which excludes it from the weighted average. The matching algorithm in `lib/matching.js` handles all types uniformly -- dimensions return null (excluded) when not applicable rather than penalizing the provider.
