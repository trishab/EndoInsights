// ============================================================================
// EndEndo Specialist Directory — Constants & Enums
// ============================================================================

// Provider type classification
export const PROVIDER_TYPES = {
  excision_surgeon: {
    label: 'Excision Surgeon',
    shortLabel: 'Surgeon',
    description: 'Specializes in laparoscopic excision of endometriosis tissue',
    color: 'purple',
  },
  interventional_radiologist: {
    label: 'Interventional Radiologist',
    shortLabel: 'IR',
    description: 'Performs minimally invasive image-guided procedures such as uterine artery embolization',
    color: 'blue',
  },
  gastroenterologist: {
    label: 'Gastroenterologist',
    shortLabel: 'GI',
    description: 'Specializes in bowel endometriosis and digestive system involvement',
    color: 'amber',
  },
  functional_medicine: {
    label: 'Functional Medicine',
    shortLabel: 'Functional',
    description: 'Integrative approach addressing root causes through nutrition, lifestyle, and complementary therapies',
    color: 'green',
  },
  pelvic_floor_pt: {
    label: 'Pelvic Floor Physical Therapist',
    shortLabel: 'Pelvic PT',
    description: 'Specializes in pelvic floor rehabilitation, pain management, and pre/post-surgical care',
    color: 'teal',
  },
  urologist: {
    label: 'Urologist',
    shortLabel: 'Urology',
    description: 'Manages bladder and urinary tract involvement in endometriosis',
    color: 'indigo',
  },
  pain_management: {
    label: 'Pain Management Specialist',
    shortLabel: 'Pain Mgmt',
    description: 'Focuses on chronic pelvic pain through nerve blocks, medication management, and multidisciplinary approaches',
    color: 'rose',
  },
  mental_health: {
    label: 'Mental Health Provider',
    shortLabel: 'Mental Health',
    description: 'Psychologist, therapist, or psychiatrist with experience in chronic pain and endometriosis impact',
    color: 'violet',
  },
  nutritionist: {
    label: 'Nutritionist / Dietitian',
    shortLabel: 'Nutrition',
    description: 'Specializes in anti-inflammatory and endo-specific dietary approaches',
    color: 'lime',
  },
  other: {
    label: 'Other Specialist',
    shortLabel: 'Other',
    description: 'Other medical professional relevant to endometriosis care',
    color: 'gray',
  },
};

// NPI taxonomy code → provider type mapping
export const NPI_TAXONOMY_MAP = {
  // OB/GYN & Surgical
  '207V00000X': 'excision_surgeon',   // Obstetrics & Gynecology
  '207VG0400X': 'excision_surgeon',   // Gynecology
  '207VE0102X': 'excision_surgeon',   // Reproductive Endocrinology
  '207VF0040X': 'excision_surgeon',   // Female Pelvic Medicine
  // Radiology
  '2085R0001X': 'interventional_radiologist', // Radiology, Interventional
  '2085R0202X': 'interventional_radiologist', // Radiology, Diagnostic
  // Gastroenterology
  '207RG0100X': 'gastroenterologist',  // Internal Medicine, Gastroenterology
  // Physical Therapy
  '225100000X': 'pelvic_floor_pt',     // Physical Therapist
  '225200000X': 'pelvic_floor_pt',     // Physical Therapy Assistant
  // Urology
  '208800000X': 'urologist',           // Urology
  // Pain Management
  '208VP0014X': 'pain_management',     // Pain Medicine
  '2083P0901X': 'pain_management',     // Preventive Medicine, Pain Medicine
  // Mental Health
  '2084P0800X': 'mental_health',       // Psychiatry
  '103T00000X': 'mental_health',       // Psychologist, Clinical
  '101Y00000X': 'mental_health',       // Counselor
  '104100000X': 'mental_health',       // Social Worker, Clinical
  '106H00000X': 'mental_health',       // Marriage & Family Therapist
  // Naturopathic / Functional
  '175F00000X': 'functional_medicine', // Naturopath
  // Nutrition
  '133V00000X': 'nutritionist',        // Dietitian, Registered
  '136A00000X': 'nutritionist',        // Dietetic Technician
};

// Treatment philosophy
export const TREATMENT_PHILOSOPHIES = {
  conventional: { label: 'Conventional', description: 'Evidence-based Western medicine approaches' },
  integrative: { label: 'Integrative', description: 'Combines conventional medicine with complementary approaches' },
  holistic: { label: 'Holistic', description: 'Treats the whole person — mind, body, and spirit' },
  functional: { label: 'Functional', description: 'Focuses on identifying and addressing root causes of disease' },
};

// Philosophy adjacency map (for scoring — closer philosophies score higher)
export const PHILOSOPHY_ADJACENCY = {
  conventional: ['integrative'],
  integrative: ['conventional', 'holistic', 'functional'],
  holistic: ['integrative'],
  functional: ['integrative'],
};

// Patient journey stages
export const JOURNEY_STAGES = {
  seeking_diagnosis: { label: "I'm looking for answers", description: "Haven't been diagnosed yet, experiencing symptoms" },
  newly_diagnosed: { label: 'Recently diagnosed', description: 'Just received an endometriosis diagnosis' },
  exploring_treatment: { label: 'Exploring treatment options', description: 'Considering different approaches' },
  seeking_surgery: { label: 'Looking for a surgeon', description: 'Ready to pursue surgical treatment' },
  post_surgery: { label: 'Post-surgery care', description: 'Need follow-up or ongoing care after surgery' },
  chronic_management: { label: 'Managing ongoing symptoms', description: 'Living with endo long-term' },
};

// Uterus/fertility goals
export const UTERUS_GOALS = {
  preserve_uterus: { label: 'Preserving my uterus is very important', description: 'I want to keep my uterus' },
  fertility_preservation: { label: 'Fertility preservation is my priority', description: 'I want to protect my ability to have children' },
  open_to_hysterectomy: { label: "I'm open to all options", description: 'Including hysterectomy if recommended' },
  seeking_hysterectomy: { label: "I'm actively seeking a hysterectomy", description: 'I want a provider who supports this choice' },
  not_applicable: { label: "This doesn't apply to me", description: '' },
};

// Hysterectomy approach (provider side)
export const HYSTERECTOMY_APPROACHES = {
  last_resort: { label: 'Last resort', description: 'Only after all other options exhausted' },
  considers_early: { label: 'Considers early', description: 'May recommend earlier depending on case' },
  case_by_case: { label: 'Case by case', description: 'Evaluates individually' },
  not_applicable: { label: 'Not applicable', description: 'Does not perform hysterectomies' },
};

// Faith preferences
export const FAITH_PREFERENCES = {
  faith_based_required: { label: 'Faith-based care is very important to me', followUp: true },
  faith_based_preferred: { label: "I'd prefer a provider who practices within a faith tradition", followUp: true },
  secular_preferred: { label: "I'd prefer a secular approach", followUp: false },
  no_preference: { label: "This doesn't matter to me", followUp: false },
};

// Hormone-free preferences
export const HORMONE_PREFERENCES = {
  required: { label: 'I need hormone-free options', description: 'Hormonal treatments are not an option for me' },
  preferred: { label: "I'd prefer hormone-free but am open", description: '' },
  open_to_hormones: { label: "I'm open to hormonal treatments", description: '' },
  no_preference: { label: 'No preference', description: '' },
};

// Patient autonomy
export const AUTONOMY_PREFERENCES = {
  want_to_lead: { label: 'I want to lead my own care decisions', description: 'Provider advises, I decide' },
  want_collaboration: { label: 'I want a collaborative relationship', description: 'We decide together' },
  trust_provider: { label: 'I trust my provider to guide decisions', description: 'I want expert guidance' },
  no_preference: { label: 'No preference', description: '' },
};

// Telehealth preferences
export const TELEHEALTH_PREFERENCES = {
  required: { label: 'Telehealth required', description: 'I can only do virtual visits' },
  preferred: { label: 'Telehealth preferred', description: "I'd like the option" },
  in_person_preferred: { label: 'In-person preferred', description: 'I prefer face-to-face visits' },
  no_preference: { label: 'No preference', description: '' },
};

// Common comorbidities
export const COMORBIDITIES = {
  adenomyosis: 'Adenomyosis',
  pcos: 'PCOS',
  interstitial_cystitis: 'Interstitial Cystitis / Painful Bladder',
  ibs: 'IBS / Digestive Issues',
  fibromyalgia: 'Fibromyalgia',
  autoimmune: 'Autoimmune Conditions',
  pelvic_congestion: 'Pelvic Congestion Syndrome',
  vulvodynia: 'Vulvodynia',
  mental_health: 'Anxiety / Depression',
  chronic_fatigue: 'Chronic Fatigue',
  migraines: 'Migraines',
};

// Endometriosis stages
export const ENDO_STAGES = {
  stage_1: 'Stage I (Minimal)',
  stage_2: 'Stage II (Mild)',
  stage_3: 'Stage III (Moderate)',
  stage_4: 'Stage IV (Severe)',
  deep_infiltrating: 'Deep Infiltrating Endometriosis (DIE)',
};

// Importance levels (patient-controlled weights)
export const IMPORTANCE_LEVELS = {
  critical: { label: 'Critical', description: 'This is a dealbreaker for me', multiplier: 3.0 },
  important: { label: 'Important', description: 'I care about this', multiplier: 2.0 },
  nice_to_have: { label: 'Nice to have', description: "It matters but isn't essential", multiplier: 1.0 },
};

// Match quality labels
export const MATCH_LABELS = {
  excellent: { label: 'Excellent Match', minScore: 0.85, className: 'match-excellent' },
  strong: { label: 'Strong Match', minScore: 0.70, className: 'match-strong' },
  good: { label: 'Good Match', minScore: 0.50, className: 'match-good' },
  possible: { label: 'Possible Match', minScore: 0, className: 'match-possible' },
};

// Practice settings
export const PRACTICE_SETTINGS = {
  academic: 'Academic Medical Center',
  hospital_employed: 'Hospital Employed',
  private_group: 'Private Group Practice',
  solo_private: 'Solo Private Practice',
};

// TVUS protocols
export const TVUS_PROTOCOLS = {
  idea: 'IDEA (International Deep Endometriosis Analysis)',
  ieta: 'IETA (International Endometrial Tumor Analysis)',
  custom: 'Custom Protocol',
  standard: 'Standard TVUS',
};

// Surgery approach options (for bowel/bladder/diaphragm)
export const SURGERY_APPROACHES = {
  self: 'I perform this myself',
  team_colorectal: 'Colorectal surgeon on my team',
  team_urologist: 'Urologist on my team',
  team_cardiothoracic: 'Cardiothoracic surgeon on my team',
  refer_out: 'I refer to a specialist',
  not_applicable: 'Not applicable to my practice',
};

// Employer size options (for FMLA eligibility)
export const EMPLOYER_SIZES = {
  under_50: { label: 'Under 50 employees', fmlaEligible: false },
  '50_plus': { label: '50 or more employees', fmlaEligible: true },
  federal: { label: 'Federal government', fmlaEligible: true },
  unsure: { label: "I'm not sure", fmlaEligible: null },
};

// States with mandatory short-term disability
export const STATES_WITH_SDI = ['CA', 'HI', 'NJ', 'NY', 'RI'];

// International registration types
export const INTL_REGISTRATION_TYPES = {
  gmc_uk: { label: 'GMC (UK)', country: 'United Kingdom' },
  ahpra_au: { label: 'AHPRA (Australia)', country: 'Australia' },
  crm_brazil: { label: 'CRM (Brazil)', country: 'Brazil' },
  cmo_mexico: { label: 'CMO (Mexico)', country: 'Mexico' },
  cpso_canada: { label: 'CPSO (Ontario, Canada)', country: 'Canada' },
  cpsbc_canada: { label: 'CPSBC (BC, Canada)', country: 'Canada' },
  mc_india: { label: 'NMC (India)', country: 'India' },
  bma_japan: { label: 'Medical Practitioner License (Japan)', country: 'Japan' },
};

// US states list
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Sensitive fields that support visibility controls
export const VISIBILITY_CONTROLLED_FIELDS = [
  { field: 'surgicalVolumeExcisionHours', label: 'Surgical Volume (Hours)', defaultVisibility: 'on_request' },
  { field: 'surgicalVolume200Excisions', label: '200+ Excisions', defaultVisibility: 'on_request' },
  { field: 'complicationRateMajor', label: 'Major Complication Rate', defaultVisibility: 'on_request' },
  { field: 'outOfPocketCost', label: 'Out-of-Pocket Cost', defaultVisibility: 'on_request' },
  { field: 'costBreakdown', label: 'Cost Breakdown', defaultVisibility: 'on_request' },
  { field: 'bowelSurgeryApproach', label: 'Bowel Surgery Approach', defaultVisibility: 'on_request' },
  { field: 'bladderSurgeryApproach', label: 'Bladder Surgery Approach', defaultVisibility: 'on_request' },
  { field: 'diaphragmSurgeryApproach', label: 'Diaphragm Surgery Approach', defaultVisibility: 'on_request' },
  { field: 'waitTimeMonths', label: 'Wait Time', defaultVisibility: 'public' },
  { field: 'migsFellowshipTraining', label: 'Fellowship Training', defaultVisibility: 'public' },
  { field: 'hasMultidisciplinaryTeam', label: 'Multidisciplinary Team', defaultVisibility: 'public' },
  { field: 'providesOperativePhotos', label: 'Provides Operative Photos', defaultVisibility: 'public' },
  { field: 'providesOperativeReports', label: 'Provides Operative Reports', defaultVisibility: 'public' },
  { field: 'sharesPathologyResults', label: 'Shares Pathology Results', defaultVisibility: 'public' },
  { field: 'completesFmla', label: 'Completes FMLA', defaultVisibility: 'public' },
  { field: 'completesDisabilityPaperwork', label: 'Completes Disability Paperwork', defaultVisibility: 'public' },
];
