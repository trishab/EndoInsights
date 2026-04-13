# EndEndo Specialist Directory -- Provider Classification Methodology

## Overview

This document describes how providers are classified, evaluated, and surfaced in the EndEndo Specialist Directory. The classification methodology was developed with consultation from an academic excision surgeon at Mass General Brigham, whose clinical perspective informed decisions about which signals are meaningful, which are misleading, and which require careful contextual presentation.

The system classifies providers across four tiers: core qualifications, quality indicators, data visibility controls, and warning flags. Non-surgeon provider types have their own classification criteria. This document also covers imaging capabilities, the role of publications, practice setting neutrality, and why certain practice patterns are flagged.

---

## Tier 1: Core Qualifications

Core qualifications determine whether a provider enters the directory as a verified specialist. These are minimum thresholds, not ranking factors.

### Excision Surgeons

A surgeon qualifies for inclusion if they meet at least one of:

- **Fellowship trained**: Completed a MIGS (Minimally Invasive Gynecologic Surgery) fellowship or equivalent advanced surgical training in endometriosis excision.
- **High-volume practitioner**: Performs 200 or more excision procedures per year, or has documented equivalent surgical hours.
- **Performs excision**: The surgeon's primary approach to endometriosis is laparoscopic excision (not ablation alone). This is the baseline clinical standard per expert consultation.
- **Willing to self-report**: The provider has agreed to enter quality data through the provider portal. Self-reported data is the foundation of the classification system. Providers who refuse to participate in reporting cannot be meaningfully evaluated.

All four criteria are tracked in the `doctors` table: `migsFellowshipTraining`, `surgicalVolume200Excisions` / `surgicalVolumeExcisionHours`, procedures array, and verification status.

### Non-Surgeon Providers

Non-surgeon providers qualify based on demonstrated experience with endometriosis patients within their specialty. They are verified through NPI lookup (US) or country registration (international) and must indicate endometriosis as a focus area.

---

## Tier 2: Quality Indicators

Quality indicators are used by the matching algorithm to influence ranking. They are shown to patients as informational badges, not as scores. Each indicator has a defined data source.

### Surgical Volume

- **Metric**: Number of excision procedures per year, or total excision hours logged
- **Thresholds**: 200+/year is the high-volume benchmark. 100-199 is moderate. Below 50 is low.
- **Data source**: Provider self-report via portal (`surgicalVolumeExcisionHours`, `surgicalVolume200Excisions`). Documentation links are stored in `surgicalVolumeDocumentation`.
- **Rationale**: Volume is the strongest single predictor of surgical outcomes for complex procedures. This is well-established in surgical literature and confirmed by expert consultation.

### Major Complication Rate

- **Metric**: Clavien-Dindo Grade III or higher complications as a percentage of total cases
- **Threshold**: Below 5% is the benchmark for quality. Below 2% is excellent.
- **Data source**: Provider self-report (`complicationRateMajor`). This field is visibility-controlled and defaults to on-request.
- **Context**: Complication rates must be interpreted with caution. Surgeons who take on more complex cases (Stage IV, deep infiltrating endometriosis involving bowel/bladder/diaphragm) will have higher complication rates than those who only operate on early-stage disease. A raw number without case-mix context is misleading. This is why the rate influences algorithmic ranking but is presented to patients only with educational context when specifically requested.

### Dedicated Surgical Practice

- **Metric**: Whether the surgeon's practice is primarily or exclusively focused on endometriosis surgery, as opposed to general OB/GYN with some endo cases
- **Data source**: `dedicatedSurgicalPractice` boolean
- **Rationale**: A surgeon who performs endometriosis excision as a dedicated focus develops pattern recognition and technical skill that a generalist performing occasional cases does not.

### Multidisciplinary Team

- **Metric**: Whether the surgeon operates with a standing multidisciplinary team that includes colorectal surgery, urology, or other relevant specialties
- **Data source**: `hasMultidisciplinaryTeam`, `teamSpecialties` array
- **Scoring detail**: A team that includes colorectal surgery or urology scores highest. A team without these specific specialties scores slightly lower. No team at all scores lower still. See the Bowel Surgery section below for why this matters.

### Transparency Practices

The following transparency indicators are tracked individually and combined into a composite transparency score in the matching algorithm:

- **Provides operative photos** (`providesOperativePhotos`): Surgeon routinely gives patients photos from their procedure
- **Provides operative reports** (`providesOperativeReports`): Surgeon shares the full operative report with the patient
- **Shares pathology results** (`sharesPathologyResults`): Pathology findings are shared directly with the patient
- **Tracks outcomes** (`tracksOutcomes`): Surgeon maintains a personal outcomes database or participates in a registry
- **Reports complication rate** (`complicationRateMajor != null`): Surgeon is willing to disclose their complication rate

Each indicator is a boolean. The transparency score is the count of true values divided by five.

### ABOG/ABMS Board Certification

Board certification data (`abogCertification`, `abmsCertification`) and continuing education status are tracked but treated as baseline credentials rather than differentiating quality signals. Most practicing OB/GYNs are board certified; the absence of certification is more informative than its presence.

---

## Practice Setting Is Not a Quality Signal

The `practiceSetting` field records whether a provider works in an academic medical center, hospital-employed practice, private group practice, or solo private practice. This field is informational only and does not influence scoring.

Per expert consultation: excellent surgeons exist in every practice setting. Academic surgeons have research infrastructure and trainee support but may have longer wait times and less schedule flexibility. Private practice surgeons may offer more personalized care and shorter waits. Hospital-employed surgeons fall somewhere between. None of these settings is inherently better for patient outcomes.

The defined settings are: `academic`, `hospital_employed`, `private_group`, `solo_private`.

---

## Tier 3: Data Visibility

Sensitive quality data entered by providers through the portal is governed by a three-tier visibility system. Providers control which data patients can access.

### Visibility Levels

- **Public**: Always visible on the provider's directory listing. Examples: fellowship training status, multidisciplinary team, whether they complete FMLA paperwork, wait time.
- **On request**: Hidden by default. When a patient requests access to these fields, the system logs the request in `patient_data_requests` and reveals the data alongside educational context explaining what the metric means and how to interpret it. Examples: surgical volume, complication rate, cost details, bowel/bladder/diaphragm surgery approach.
- **Backend only**: Never shown to patients under any circumstances. Used exclusively by the matching algorithm for scoring purposes. The provider has agreed to contribute this data to improve matching accuracy but does not want it displayed.

### Implementation

The `provider_data_visibility` table stores per-provider, per-field visibility settings. The `VISIBILITY_CONTROLLED_FIELDS` constant defines the 16 fields that support visibility controls and their default levels. The `applyVisibility` function strips restricted fields from provider objects before they reach the client.

### Rationale

Providers, particularly surgeons, are often reluctant to share quality metrics publicly because raw numbers can be misinterpreted. A complication rate of 4% for a surgeon who exclusively handles Stage IV deep infiltrating endometriosis is excellent; the same rate for a surgeon who only does Stage I/II cases would be concerning. The on-request model with educational framing gives patients access to meaningful data while protecting providers from context-free comparisons.

---

## Tier 4: Flags

Certain provider characteristics trigger warning flags. These are not disqualifying -- flagged providers remain in the directory -- but the flags are factored into scoring and may be shown to patients as informational alerts.

### Cash-Only / Boutique Practice

Providers who do not accept any insurance (`acceptsInsurance === false`) are flagged. Per expert consultation: the consulting surgeon regularly sees complications from boutique/cash-only endometriosis practices. Patients who pay $15,000-$40,000 out of pocket for an initial surgery at a cash-only practice may not be able to afford a revision if complications arise. The flag does not prevent a match but alerts the patient to consider whether they have financial resources for potential follow-up care.

### Solo Bowel Surgery

Surgeons who indicate `bowelSurgeryApproach === 'self'` are flagged. Endometriosis involving the bowel (rectum, sigmoid, cecum) should be operated on by or with a colorectal surgeon, not by a gynecologic surgeon operating alone. Per expert consultation: bowel complications from gynecologic surgeons performing bowel resections without colorectal surgery support are a recognized pattern. The appropriate approaches are `team_colorectal` (colorectal surgeon on the operating team) or `refer_out` (referral to a surgeon who has colorectal support).

The same principle applies to bladder surgery (`bladderSurgeryApproach`) where urologic support is the standard of care, though the risk profile is somewhat lower than bowel.

### Refuses to Share Complications

Providers who have a verified account, have entered quality data, but have set `complicationRateMajor` visibility to `backend_only` AND have not entered any value are flagged. This distinguishes between three cases:

1. Provider entered a complication rate and set it to on-request -- not flagged, this is the intended workflow
2. Provider entered a complication rate and set it to backend-only -- not flagged, data is available to the algorithm
3. Provider has an active portal account, has entered other quality data, but refuses to report complications at all -- flagged

The flag is subtle: it is expressed as the absence of a transparency badge rather than an explicit warning.

---

## Clavien-Dindo Classification Reference

The Clavien-Dindo classification is the international standard for grading surgical complications. The `complicationRateMajor` field in the directory tracks Grade III and above.

| Grade | Definition |
|---|---|
| Grade I | Any deviation from normal postoperative course. No pharmacological treatment or interventions needed beyond antiemetics, antipyretics, analgesics, diuretics, electrolytes, and physiotherapy. Includes wound infections opened at the bedside. |
| Grade II | Requiring pharmacological treatment beyond Grade I drugs. Blood transfusions and total parenteral nutrition are included. |
| Grade III | Requiring surgical, endoscopic, or radiological intervention. Subdivided into IIIa (not under general anesthesia) and IIIb (under general anesthesia). |
| Grade IV | Life-threatening complication requiring ICU management. Subdivided into IVa (single organ dysfunction) and IVb (multiorgan dysfunction). |
| Grade V | Death. |

For the purposes of this directory, "major complication rate" means the percentage of cases resulting in Grade III, IV, or V outcomes. This aligns with the standard used in surgical quality registries and peer-reviewed literature.

---

## Non-Surgeon Provider Types

The directory is not limited to excision surgeons. The following non-surgeon provider types are classified and matched using the same preference framework, minus the surgical quality dimensions.

### Interventional Radiology (IR)

Performs minimally invasive image-guided procedures relevant to endometriosis care, such as uterine artery embolization. Classified via NPI taxonomy code `2085R0001X` or `2085R0202X`. Type-specific data is stored in the `typeSpecificData` JSONB field.

### Gastroenterology (GI)

Specializes in bowel endometriosis and digestive system involvement. Relevant for patients with IBS-like symptoms, bowel endo confirmed or suspected, or needing colonoscopy evaluation. NPI taxonomy `207RG0100X`.

### Functional Medicine

Integrative approach addressing root causes through nutrition, lifestyle, and complementary therapies. Includes naturopathic providers (taxonomy `175F00000X`). Treatment philosophy is typically `functional` or `integrative`.

### Pelvic Floor Physical Therapy

Specializes in pelvic floor rehabilitation, pain management, and pre/post-surgical physical therapy. NPI taxonomies `225100000X` and `225200000X`. Critical for post-surgical recovery and chronic pain management.

### Mental Health

Psychologists, therapists, psychiatrists, counselors, and clinical social workers with experience in chronic pain, endometriosis impact on quality of life, and medical trauma. Multiple NPI taxonomies covered (psychiatry, clinical psychology, counseling, social work, marriage and family therapy).

### Pain Management

Chronic pelvic pain specialists who use nerve blocks, medication management, and multidisciplinary pain approaches. NPI taxonomies `208VP0014X` and `2083P0901X`.

### Urology

Manages bladder and urinary tract involvement in endometriosis. Relevant when endo affects the bladder, ureters, or kidneys. NPI taxonomy `208800000X`.

### Nutritionist / Dietitian

Specializes in anti-inflammatory dietary approaches and endo-specific nutrition. NPI taxonomies `133V00000X` and `136A00000X`.

---

## Why Publications Are Not a Reliable Quality Signal

The database stores publication data (`publicationsPids`) and clinical trial enrollment (`clinicalTrialsNctNumbers`). These fields are tracked for informational purposes but do not influence the matching algorithm's quality scoring.

Per expert consultation: publication count does not reliably predict surgical quality. The correlation between academic output and clinical skill is weak for several reasons:

1. Many of the best clinical surgeons are in private practice and do not publish. They operate at high volume with excellent outcomes but have no academic incentive or institutional support for research.
2. Academic surgeons may have extensive publication records while performing relatively few surgeries per year, because their time is split between research, teaching, and clinical work.
3. Publications can reflect the work of a research team, fellows, or co-authors rather than the named surgeon's individual clinical ability.
4. Some of the most-published endometriosis researchers focus on basic science, imaging, or medical management rather than surgical technique.

For these reasons, publications are displayed on provider profiles as informational context but carry zero weight in the matching algorithm.

---

## Why Boutique/Cash-Only Practices Are Flagged

This flag was added based on direct clinical experience reported during expert consultation. The consulting surgeon described a pattern of receiving referrals from patients who had initial surgery at cash-only endometriosis practices and developed complications requiring revision.

The concern is structural, not about any individual practice:

- Cash-only practices charge $15,000-$40,000 or more for excision surgery. Patients who exhaust their financial resources on the initial procedure may not be able to afford a second surgery if the first one is incomplete or results in complications.
- Insurance-based practices allow patients to access revision surgery under their coverage, reducing the financial barrier to necessary follow-up care.
- Cash-only practices are not subject to the same credentialing and peer review processes that hospital-based and insurance-contracted practices undergo.

The flag does not exclude cash-only providers from the directory. It ensures that patients who match with a cash-only provider are informed about the financial risk so they can plan accordingly.

---

## Why Colorectal Surgeons Should Do Bowel Surgery

Endometriosis can infiltrate the rectum, sigmoid colon, cecum, appendix, and small bowel. Surgical treatment of bowel endometriosis may require shaving, disc excision, or segmental bowel resection -- all of which are colorectal surgery procedures.

Per expert consultation: gynecologic surgeons who perform bowel resections without colorectal surgery training or support have a higher rate of anastomotic leaks, fistulas, and other bowel-specific complications. The technical demands of bowel surgery are distinct from pelvic dissection, and colorectal surgeons develop these skills through dedicated training and high-volume practice.

The standard of care for bowel endometriosis is one of:

- **Multidisciplinary team**: The gynecologic surgeon and colorectal surgeon operate together. The GYN handles the pelvic endometriosis, the colorectal surgeon handles the bowel component. This is the preferred model.
- **Referral**: The gynecologic surgeon refers the patient to a center that has multidisciplinary capability.

The directory scores `team_colorectal` highest, `refer_out` moderately, and `self` lowest for the `bowelSurgeryApproach` field. Providers who indicate they perform bowel surgery solo receive a flag (see Tier 4 above).

---

## Imaging Capabilities

Diagnostic imaging is critical for preoperative planning in endometriosis. The directory tracks imaging capabilities in a structured JSONB field (`imagingCapabilities`) with three subsections.

### Transvaginal Ultrasound (TVUS)

TVUS is the first-line imaging modality for endometriosis. The directory distinguishes between standard TVUS and endometriosis-specific protocols:

- `performsTvus`: Provider performs TVUS in their office
- `tvusEndoTrained`: Provider or their sonographer has specific training in detecting endometriosis on TVUS
- `tvusProtocol`: Which protocol is used. The IDEA protocol (International Deep Endometriosis Analysis) is the current standard for systematic evaluation of deep endometriosis. Standard TVUS may miss deep infiltrating disease.
- `refersTvus`: Provider refers TVUS to an external facility

The IDEA protocol is tracked specifically because it represents a systematic approach to mapping endometriosis locations and depths, which directly informs surgical planning.

### MRI

MRI is the second-line imaging modality, used when TVUS findings are equivocal or when deep infiltrating endometriosis is suspected in locations difficult to assess with ultrasound (diaphragm, ureters, rectovaginal septum):

- `readsMriDirectly`: Provider reads MRI images themselves rather than relying solely on the radiologist's report
- `interpretsEndoFindings`: Provider can identify endometriosis-specific findings on MRI
- `ordersEndoProtocolMri`: Provider orders MRI with an endometriosis-specific protocol (sequences, contrast timing, and bowel prep optimized for endo detection)
- `collaboratesWithRadiologist`: Provider works with a radiologist who has endometriosis imaging expertise
- `reviewsImpressionOnly`: Provider only reads the radiologist's text report, does not review images directly

The distinction between reading images directly and reviewing impressions only is significant. Radiologists without endometriosis expertise frequently miss or underreport findings. A surgeon who reads their own MRIs (or works closely with an endo-trained radiologist) provides better preoperative planning.

### Other Imaging

- `renalUltrasound`: Capability to assess ureteral/renal involvement
- `colonoscopy`: Capability to evaluate bowel involvement endoscopically
