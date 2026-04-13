import { pgTable, text, serial, integer, timestamp, boolean, jsonb, doublePrecision, varchar } from 'drizzle-orm/pg-core';

// ============================================================================
// EXISTING TABLES (from Replit) — preserved exactly, extended with new fields
// ============================================================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  email: text('email').notNull().unique(),
  isAdmin: boolean('is_admin').default(false),
  isDoctor: boolean('is_doctor').default(false),
  alias: text('alias'),
  createdAt: timestamp('created_at').defaultNow(),
  isVerified: boolean('is_verified').default(false),
  verificationToken: text('verification_token'),
  verificationExpires: timestamp('verification_expires'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpires: timestamp('reset_password_expires'),
  lastLogin: timestamp('last_login'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  subscribedToUpdates: boolean('subscribed_to_updates').default(false),
  subscribedToNewsletter: boolean('subscribed_to_newsletter').default(false),
  subscribedToMonthlyAma: boolean('subscribed_to_monthly_ama').default(false),
  unsubscribedAt: timestamp('unsubscribed_at'),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  address: text('address'),
  postalCode: text('postal_code'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  officeHours: text('office_hours'),
  telehealth: boolean('telehealth').default(false),
  notes: text('notes'),
  specialties: text('specialties').array(),
  procedures: text('procedures').array(),
  acceptingNewPatients: boolean('accepting_new_patients').default(true),
  waitTimeMonths: integer('wait_time_months'),
  languages: text('languages').array(),
  patientGenderPreference: text('patient_gender_preference'),
  practiceName: text('practice_name'),
  practiceWebsite: text('practice_website'),
  nancysNookListed: boolean('nancys_nook_listed').default(false),
  abogCertification: boolean('abog_certification').default(false),
  abogCertificationStartDate: timestamp('abog_certification_start_date', { mode: 'date' }),
  abogRecertificationStatusDate: timestamp('abog_recertification_status_date', { mode: 'date' }),
  abogContinuingEducationStatus: boolean('abog_continuing_education_status').default(false),
  abmsCertification: boolean('abms_certification').default(false),
  yearsAbogCertified: integer('years_abog_certified'),
  yearsAbmsCertified: integer('years_abms_certified'),
  certificationUpdated: boolean('certification_updated').default(false),
  abogId: text('abog_id'),
  abmsId: text('abms_id'),
  additionalCertifications: text('additional_certifications').array(),
  migsFellowshipTraining: boolean('migs_fellowship_training').default(false),
  trainingYearEndDate: integer('training_year_end_date'),
  annualCmeEndoRelated: text('annual_cme_endo_related'),
  annualCmeMonthYear: text('annual_cme_month_year'),
  surgicalVolumeExcisionHours: integer('surgical_volume_excision_hours'),
  surgicalVolume200Excisions: boolean('surgical_volume_200_excisions').default(false),
  surgicalVolumeDocumentation: text('surgical_volume_documentation'),
  publicationsPids: text('publications_pids').array(),
  patientOutcomeReviewLinks: text('patient_outcome_review_links').array(),
  patientOutcomeRating: doublePrecision('patient_outcome_rating'),
  clinicalTrialsNctNumbers: text('clinical_trials_nct_numbers').array(),
  multiStateLicenses: jsonb('multi_state_licenses'),
  telehealthPlatforms: text('telehealth_platforms').array(),
  acceptsInsurance: boolean('accepts_insurance').default(false),
  insuranceDetails: text('insurance_details'),
  insuranceNetworks: text('insurance_networks').array(),
  insuranceOtherExplanation: text('insurance_other_explanation'),
  outOfPocketCost: text('out_of_pocket_cost'),
  bundledServices: boolean('bundled_services').default(false),
  costBreakdown: text('cost_breakdown'),
  paymentOptions: text('payment_options').array(),
  canReadMri: boolean('can_read_mri').default(false),
  mriNotes: text('mri_notes'),
  verificationStatus: text('verification_status').default('unverified'),
  verificationDate: timestamp('verification_date', { mode: 'date' }),
  verificationNotes: text('verification_notes'),
  lastVerificationCheckDate: timestamp('last_verification_check_date', { mode: 'date' }),
  rating: doublePrecision('rating').default(0),
  reviewCount: integer('review_count').default(0),
  featuredReviewId: integer('featured_review_id'),
  socialMedia: jsonb('social_media'),
  profileImageUrl: text('profile_image_url'),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  userId: integer('user_id').references(() => users.id),

  // ===========================================================================
  // NEW FIELDS — Provider classification & patient-preference matching
  // ===========================================================================

  // Primary provider classification
  providerType: text('provider_type'), // excision_surgeon, interventional_radiologist, gastroenterologist, functional_medicine, pelvic_floor_pt, urologist, pain_management, mental_health, nutritionist, other

  // Patient-preference matching fields
  faithBased: boolean('faith_based').default(false),
  faithTradition: text('faith_tradition'),
  treatmentPhilosophy: text('treatment_philosophy'), // conventional, integrative, holistic, functional
  uterusPreservation: text('uterus_preservation'), // priority, case_by_case, not_applicable
  fertilityFocus: boolean('fertility_focus').default(false),
  hormoneFreeOptions: boolean('hormone_free_options').default(false),
  patientAutonomy: text('patient_autonomy'), // high, collaborative, provider_guided
  approachToHysterectomy: text('approach_to_hysterectomy'), // last_resort, considers_early, case_by_case, not_applicable
  painValidation: text('pain_validation'), // high, moderate
  endoStageExpertise: text('endo_stage_expertise').array(),
  comorbidityExperience: text('comorbidity_experience').array(),
  traumaInformed: boolean('trauma_informed').default(false),

  // Surgeon-specific quality fields
  complicationRateMajor: doublePrecision('complication_rate_major'), // Clavien-Dindo Grade III+ %
  dedicatedSurgicalPractice: boolean('dedicated_surgical_practice').default(false),
  providesOperativePhotos: boolean('provides_operative_photos').default(false),
  providesOperativeReports: boolean('provides_operative_reports').default(false),
  sharesPathologyResults: boolean('shares_pathology_results').default(false),
  tracksOutcomes: boolean('tracks_outcomes').default(false),
  practiceSetting: text('practice_setting'), // academic, hospital_employed, private_group, solo_private

  // Multidisciplinary team
  bowelSurgeryApproach: text('bowel_surgery_approach'), // self, team_colorectal, refer_out, not_applicable
  bladderSurgeryApproach: text('bladder_surgery_approach'),
  diaphragmSurgeryApproach: text('diaphragm_surgery_approach'),
  hasMultidisciplinaryTeam: boolean('has_multidisciplinary_team').default(false),
  teamSpecialties: text('team_specialties').array(),

  // Imaging capabilities (replaces simple canReadMri)
  imagingCapabilities: jsonb('imaging_capabilities'),
  // Structure: { tvus: { performsTvus, interpretsTvus, tvusEndoTrained, tvusProtocol, refersTvus },
  //              mri: { readsMriDirectly, reviewsImpressionOnly, interpretsEndoFindings, ordersEndoProtocolMri, collaboratesWithRadiologist },
  //              otherImaging: { renalUltrasound, colonoscopy } }

  // FMLA & disability support
  completesFmla: boolean('completes_fmla').default(false),
  completesDisabilityPaperwork: boolean('completes_disability_paperwork').default(false),
  fmlaDisabilityNotes: text('fmla_disability_notes'),
  fmlaResponseTimeDays: integer('fmla_response_time_days'),

  // International support
  countryRegistrationNumber: text('country_registration_number'),
  countryRegistrationType: text('country_registration_type'), // gmc_uk, ahpra_au, crm_brazil, etc.
  regionOrProvince: text('region_or_province'),
  currencyForCosts: text('currency_for_costs').default('USD'),

  // Non-surgeon type-specific data
  typeSpecificData: jsonb('type_specific_data'),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  treatmentDate: text('treatment_date'),
  procedures: text('procedures').array(),
  displayName: text('display_name'),
  status: text('status').default('pending'),
  publicResponse: text('public_response'),
  privateResponse: text('private_response'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const doctorRequests = pgTable('doctor_requests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  location: text('location').notNull(),
  specialtyNeeded: text('specialty_needed').notNull(),
  additionalRequirements: text('additional_requirements'),
  searchCriteria: text('search_criteria'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  notes: text('notes'),
});

export const forumPosts = pgTable('forum_posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  upvotes: integer('upvotes').default(0),
  needsDoctorInput: boolean('needs_doctor_input').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const forumComments = pgTable('forum_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => forumPosts.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const grandRounds = pgTable('grand_rounds', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  dateTime: timestamp('date_time').notNull(),
  hostDoctor: integer('host_doctor').references(() => doctors.id),
  zoomLink: text('zoom_link'),
  caseMaterials: jsonb('case_materials'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const doctorRegistrations = pgTable('doctor_registrations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  doctorId: integer('doctor_id').references(() => doctors.id),
  credentials: jsonb('credentials'),
  status: text('status').default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const monthlyAma = pgTable('monthly_ama', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  isActive: boolean('is_active').default(true),
});

export const doctorUpdateRequests = pgTable('doctor_update_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  doctorId: integer('doctor_id').references(() => doctors.id),
  type: varchar('type', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  country: varchar('country', { length: 50 }).notNull().default('USA'),
  phone: varchar('phone', { length: 20 }),
  website: varchar('website', { length: 500 }),
  notes: text('notes'),
  abogCertification: boolean('abog_certification').default(false),
  abogCertificationStartDate: timestamp('abog_certification_start_date', { mode: 'date' }),
  abogRecertificationStatusDate: timestamp('abog_recertification_status_date', { mode: 'date' }),
  abogContinuingEducationStatus: boolean('abog_continuing_education_status').default(false),
  abmsCertification: boolean('abms_certification').default(false),
  specialties: text('specialties'),
  procedures: text('procedures'),
  migsFellowshipTraining: boolean('migs_fellowship_training').default(false),
  trainingYearEndDate: integer('training_year_end_date'),
  annualCmeEndoRelated: text('annual_cme_endo_related'),
  annualCmeMonthYear: text('annual_cme_month_year'),
  surgicalVolumeExcisionHours: integer('surgical_volume_excision_hours'),
  surgicalVolume200Excisions: boolean('surgical_volume_200_excisions').default(false),
  surgicalVolumeDocumentation: text('surgical_volume_documentation'),
  publicationsPids: text('publications_pids').array(),
  patientOutcomeReviewLinks: text('patient_outcome_review_links').array(),
  patientOutcomeRating: doublePrecision('patient_outcome_rating'),
  clinicalTrialsNctNumbers: text('clinical_trials_nct_numbers').array(),
  multiStateLicenses: jsonb('multi_state_licenses'),
  telehealthPlatforms: text('telehealth_platforms').array(),
  insuranceNetworks: text('insurance_networks').array(),
  insuranceOtherExplanation: text('insurance_other_explanation'),
  acceptingNewPatients: boolean('accepting_new_patients').default(false),
  telehealth: boolean('telehealth').default(false),
  submitterName: text('submitter_name'),
  submitterEmail: text('submitter_email'),
  reviewNotes: text('review_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const forumSubscriptions = pgTable('forum_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  userId: integer('user_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// NEW TABLES
// ============================================================================

// Patient preference questionnaire responses — for matching + analytics
export const patientPreferences = pgTable('patient_preferences', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userId: integer('user_id').references(() => users.id),
  email: text('email'),

  // Provider search criteria
  seekingProviderTypes: text('seeking_provider_types').array(),
  state: text('state'),
  city: text('city'),
  willingToTravel: boolean('willing_to_travel').default(false),
  maxTravelMiles: integer('max_travel_miles'),

  // Care preferences
  faithPreference: text('faith_preference'), // faith_based_required, faith_based_preferred, secular_preferred, no_preference
  faithTradition: text('faith_tradition'),
  philosophyPreference: text('philosophy_preference'), // conventional, integrative, holistic, functional, no_preference
  uterusGoal: text('uterus_goal'), // preserve_uterus, fertility_preservation, open_to_hysterectomy, seeking_hysterectomy, not_applicable
  fertilityImportance: text('fertility_importance'), // critical, important, not_a_factor
  hormoneFreePreference: text('hormone_free_preference'), // required, preferred, open_to_hormones, no_preference
  autonomyPreference: text('autonomy_preference'), // want_to_lead, want_collaboration, trust_provider, no_preference
  painJourneyStage: text('pain_journey_stage'), // seeking_diagnosis, newly_diagnosed, exploring_treatment, seeking_surgery, post_surgery, chronic_management
  knownConditions: text('known_conditions').array(),
  genderPreference: text('gender_preference'),
  telehealthPreference: text('telehealth_preference'), // required, preferred, in_person_preferred, no_preference
  traumaInformedImportant: boolean('trauma_informed_important').default(false),
  diagnosticCapabilityImportant: boolean('diagnostic_capability_important').default(false),
  insurancePlan: text('insurance_plan'),
  additionalNotes: text('additional_notes'),

  // FMLA / disability needs
  needsFmla: boolean('needs_fmla').default(false),
  needsDisability: boolean('needs_disability').default(false),
  employmentState: text('employment_state'),
  employerSize: text('employer_size'), // under_50, 50_plus, federal, unsure
  hasDisabilityBenefit: text('has_disability_benefit'), // employer_provided, state_provided, both, none, unsure

  // Patient-controlled importance weights
  weightFaith: text('weight_faith').default('important'), // critical, important, nice_to_have
  weightPhilosophy: text('weight_philosophy').default('important'),
  weightUterusFertility: text('weight_uterus_fertility').default('important'),
  weightHormoneFree: text('weight_hormone_free').default('important'),
  weightAutonomy: text('weight_autonomy').default('important'),
  weightComorbidity: text('weight_comorbidity').default('important'),
  weightTraumaInformed: text('weight_trauma_informed').default('important'),
  weightFmla: text('weight_fmla').default('nice_to_have'),
  weightDiagnosticCapability: text('weight_diagnostic_capability').default('important'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Provider data visibility controls — what patients can see per field
export const providerDataVisibility = pgTable('provider_data_visibility', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  fieldName: text('field_name').notNull(), // e.g., 'surgicalVolumeExcisionHours', 'complicationRateMajor'
  visibility: text('visibility').notNull().default('on_request'), // public, on_request, backend_only
});

// Tracks when patients request sensitive provider data
export const patientDataRequests = pgTable('patient_data_requests', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userId: integer('user_id').references(() => users.id),
  doctorId: integer('doctor_id').references(() => doctors.id).notNull(),
  requestedFields: text('requested_fields').array(),
  createdAt: timestamp('created_at').defaultNow(),
});
