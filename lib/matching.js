import {
  IMPORTANCE_LEVELS,
  MATCH_LABELS,
  PHILOSOPHY_ADJACENCY,
} from './constants';

// ============================================================================
// EndEndo Matching Algorithm
//
// Scores providers against patient preferences using a weighted scoring model.
// Patients control the importance of each dimension (critical/important/nice_to_have).
// Surgical quality dimensions are always weighted for surgeons (25% of total).
// Patients NEVER see numerical scores — only match labels and badges.
// ============================================================================

// ---------------------------------------------------------------------------
// Individual dimension scoring functions (each returns 0.0 – 1.0)
// ---------------------------------------------------------------------------

export function scoreFaith(provider, preferences) {
  const pref = preferences.faithPreference;
  if (!pref || pref === 'no_preference') return null; // excluded from scoring

  const providerFaith = provider.faithBased;
  const providerTradition = (provider.faithTradition || '').toLowerCase();
  const patientTradition = (preferences.faithTradition || '').toLowerCase();

  if (pref === 'faith_based_required') {
    if (!providerFaith) return 0.0;
    if (patientTradition && providerTradition === patientTradition) return 1.0;
    if (patientTradition && providerTradition !== patientTradition) return 0.5;
    return 0.8; // faith-based but no specific tradition required
  }

  if (pref === 'faith_based_preferred') {
    if (providerFaith && patientTradition && providerTradition === patientTradition) return 1.0;
    if (providerFaith) return 0.8;
    return 0.4;
  }

  if (pref === 'secular_preferred') {
    return providerFaith ? 0.3 : 1.0;
  }

  return null;
}

export function scorePhilosophy(provider, preferences) {
  const pref = preferences.philosophyPreference;
  if (!pref || pref === 'no_preference') return null;

  const providerPhil = provider.treatmentPhilosophy;
  if (!providerPhil) return 0.5; // unknown — neutral score

  if (pref === providerPhil) return 1.0;

  const adjacent = PHILOSOPHY_ADJACENCY[pref] || [];
  if (adjacent.includes(providerPhil)) return 0.7;

  return 0.2; // distant philosophy
}

export function scoreUterusFertility(provider, preferences) {
  const goal = preferences.uterusGoal;
  if (!goal || goal === 'not_applicable') return null;

  const preservation = provider.uterusPreservation;
  const fertility = provider.fertilityFocus;
  const hystApproach = provider.approachToHysterectomy;

  if (goal === 'preserve_uterus') {
    if (preservation === 'priority') return 1.0;
    if (preservation === 'case_by_case' && hystApproach === 'last_resort') return 0.7;
    if (hystApproach === 'considers_early') return 0.1;
    return 0.4;
  }

  if (goal === 'fertility_preservation') {
    if (fertility) return 1.0;
    return 0.2;
  }

  if (goal === 'open_to_hysterectomy') {
    return 0.8; // mild preference for case_by_case
  }

  if (goal === 'seeking_hysterectomy') {
    if (hystApproach === 'last_resort') return 0.3;
    if (hystApproach === 'not_applicable') return 0.0;
    return 1.0;
  }

  return null;
}

export function scoreHormoneFree(provider, preferences) {
  const pref = preferences.hormoneFreePreference;
  if (!pref || pref === 'no_preference') return null;

  const offers = provider.hormoneFreeOptions;

  if (pref === 'required') return offers ? 1.0 : 0.0;
  if (pref === 'preferred') return offers ? 1.0 : 0.4;
  if (pref === 'open_to_hormones') return 0.8;

  return null;
}

export function scoreAutonomy(provider, preferences) {
  const pref = preferences.autonomyPreference;
  if (!pref || pref === 'no_preference') return null;

  const providerStyle = provider.patientAutonomy;
  if (!providerStyle) return 0.5;

  const scale = ['want_to_lead', 'want_collaboration', 'trust_provider'];
  const providerScale = ['high', 'collaborative', 'provider_guided'];

  const patientIdx = scale.indexOf(pref);
  const providerIdx = providerScale.indexOf(providerStyle);

  if (patientIdx === -1 || providerIdx === -1) return 0.5;

  const distance = Math.abs(patientIdx - providerIdx);
  if (distance === 0) return 1.0;
  if (distance === 1) return 0.6;
  return 0.2;
}

export function scoreComorbidity(provider, preferences) {
  const patientConditions = preferences.knownConditions || [];
  if (patientConditions.length === 0) return null;

  const providerExperience = provider.comorbidityExperience || [];
  if (providerExperience.length === 0) return 0.2;

  const overlap = patientConditions.filter(c => providerExperience.includes(c));
  return overlap.length / patientConditions.length;
}

export function scoreTraumaInformed(provider, preferences) {
  if (!preferences.traumaInformedImportant) return null;
  return provider.traumaInformed ? 1.0 : 0.1;
}

export function scoreTelehealth(provider, preferences) {
  const pref = preferences.telehealthPreference;
  if (!pref || pref === 'no_preference') return null;

  const offers = provider.telehealth;

  if (pref === 'required') return offers ? 1.0 : 0.0;
  if (pref === 'preferred') return offers ? 1.0 : 0.5;
  if (pref === 'in_person_preferred') return 0.8; // in-person is the default

  return null;
}

export function scoreFmla(provider, preferences) {
  if (!preferences.needsFmla && !preferences.needsDisability) return null;

  let score = 0;
  let factors = 0;

  if (preferences.needsFmla) {
    score += provider.completesFmla ? 1.0 : 0.0;
    factors++;
  }

  if (preferences.needsDisability) {
    score += provider.completesDisabilityPaperwork ? 1.0 : 0.0;
    factors++;
  }

  return factors > 0 ? score / factors : null;
}

export function scoreDiagnosticCapability(provider, preferences) {
  if (!preferences.diagnosticCapabilityImportant) return null;

  const imaging = provider.imagingCapabilities || {};
  const tvus = imaging.tvus || {};
  const mri = imaging.mri || {};

  let score = 0;
  let factors = 0;

  // TVUS capability
  if (tvus.performsTvus) { score += 0.3; }
  if (tvus.tvusEndoTrained) { score += 0.3; }
  factors += 0.6;

  // MRI capability
  if (mri.readsMriDirectly) { score += 0.2; }
  if (mri.interpretsEndoFindings) { score += 0.2; }
  if (mri.collaboratesWithRadiologist) { score += 0.1; }
  factors += 0.5;

  // Normalize — max possible is 1.1, scale to 0-1
  return Math.min(score / 1.1, 1.0);
}

// ---------------------------------------------------------------------------
// Surgical quality dimensions (for surgeons only — always weighted, not
// shown as a score to patients)
// ---------------------------------------------------------------------------

export function scoreSurgicalVolume(provider) {
  const hours = provider.surgicalVolumeExcisionHours || 0;
  const has200 = provider.surgicalVolume200Excisions;

  if (has200 || hours >= 200) return 1.0;
  if (hours >= 100) return 0.7;
  if (hours >= 50) return 0.4;
  return 0.2;
}

export function scoreComplicationRate(provider) {
  const rate = provider.complicationRateMajor;
  if (rate == null) return 0.5; // unknown — neutral

  if (rate < 1) return 1.0;
  if (rate < 2) return 0.9;
  if (rate < 3) return 0.7;
  if (rate < 5) return 0.5;
  return 0.2; // above threshold
}

export function scoreTransparency(provider) {
  let score = 0;
  if (provider.providesOperativePhotos) score += 0.2;
  if (provider.providesOperativeReports) score += 0.2;
  if (provider.sharesPathologyResults) score += 0.2;
  if (provider.tracksOutcomes) score += 0.2;
  if (provider.complicationRateMajor != null) score += 0.2; // willing to share
  return score;
}

export function scoreTeamApproach(provider) {
  if (provider.hasMultidisciplinaryTeam) {
    const teamHasColorectal = (provider.teamSpecialties || []).some(
      s => s.toLowerCase().includes('colorectal') || s.toLowerCase().includes('general surg')
    );
    const teamHasUrology = (provider.teamSpecialties || []).some(
      s => s.toLowerCase().includes('urolog')
    );
    if (teamHasColorectal || teamHasUrology) return 1.0;
    return 0.8;
  }

  const bowel = provider.bowelSurgeryApproach;
  const bladder = provider.bladderSurgeryApproach;

  if (bowel === 'refer_out' || bladder === 'refer_out') return 0.7;
  if (bowel === 'self' || bladder === 'self') return 0.3; // endo surgeon doing bowel solo — lower
  return 0.5;
}

export function scoreFellowshipTraining(provider) {
  const fellowship = provider.migsFellowshipTraining;
  const highVolume = provider.surgicalVolume200Excisions || (provider.surgicalVolumeExcisionHours || 0) >= 200;

  if (fellowship && highVolume) return 1.0;
  if (fellowship) return 0.8;
  if (highVolume) return 0.7;
  return 0.3;
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

const PREFERENCE_DIMENSIONS = [
  { key: 'faith', weightField: 'weightFaith', scoreFn: scoreFaith },
  { key: 'philosophy', weightField: 'weightPhilosophy', scoreFn: scorePhilosophy },
  { key: 'uterusFertility', weightField: 'weightUterusFertility', scoreFn: scoreUterusFertility },
  { key: 'hormoneFree', weightField: 'weightHormoneFree', scoreFn: scoreHormoneFree },
  { key: 'autonomy', weightField: 'weightAutonomy', scoreFn: scoreAutonomy },
  { key: 'comorbidity', weightField: 'weightComorbidity', scoreFn: scoreComorbidity },
  { key: 'traumaInformed', weightField: 'weightTraumaInformed', scoreFn: scoreTraumaInformed },
  { key: 'fmla', weightField: 'weightFmla', scoreFn: scoreFmla },
  { key: 'diagnosticCapability', weightField: 'weightDiagnosticCapability', scoreFn: scoreDiagnosticCapability },
];

const SURGICAL_QUALITY_DIMENSIONS = [
  { key: 'surgicalVolume', scoreFn: scoreSurgicalVolume },
  { key: 'complicationRate', scoreFn: scoreComplicationRate },
  { key: 'transparency', scoreFn: scoreTransparency },
  { key: 'teamApproach', scoreFn: scoreTeamApproach },
  { key: 'fellowshipTraining', scoreFn: scoreFellowshipTraining },
];

// Surgical quality weight as fraction of total (25% for surgeons, 0% for others)
const SURGICAL_QUALITY_WEIGHT_FRACTION = 0.25;

/**
 * Score a single provider against patient preferences.
 * Returns { totalScore: 0-1, breakdown: { [key]: { score, weight, weighted } }, matchLabel }
 */
export function scoreProvider(provider, preferences) {
  const isSurgeon = provider.providerType === 'excision_surgeon';

  // Score preference dimensions
  const prefBreakdown = {};
  let prefWeightedSum = 0;
  let prefWeightSum = 0;

  for (const dim of PREFERENCE_DIMENSIONS) {
    const score = dim.scoreFn(provider, preferences);
    if (score === null) continue; // dimension excluded (no_preference or not applicable)

    const importanceLevel = preferences[dim.weightField] || 'important';
    const multiplier = IMPORTANCE_LEVELS[importanceLevel]?.multiplier || 2.0;

    prefBreakdown[dim.key] = { score, weight: multiplier, weighted: score * multiplier };
    prefWeightedSum += score * multiplier;
    prefWeightSum += multiplier;
  }

  // Score surgical quality dimensions (surgeons only)
  const qualityBreakdown = {};
  let qualityAvg = 0;

  if (isSurgeon) {
    let qualitySum = 0;
    for (const dim of SURGICAL_QUALITY_DIMENSIONS) {
      const score = dim.scoreFn(provider);
      qualityBreakdown[dim.key] = { score };
      qualitySum += score;
    }
    qualityAvg = qualitySum / SURGICAL_QUALITY_DIMENSIONS.length;
  }

  // Combine scores
  let totalScore;
  if (prefWeightSum === 0) {
    // All preferences are no_preference — rank by surgical quality only (or 0.5 for non-surgeons)
    totalScore = isSurgeon ? qualityAvg : 0.5;
  } else {
    const prefNormalized = prefWeightedSum / prefWeightSum;
    if (isSurgeon) {
      totalScore =
        prefNormalized * (1 - SURGICAL_QUALITY_WEIGHT_FRACTION) +
        qualityAvg * SURGICAL_QUALITY_WEIGHT_FRACTION;
    } else {
      totalScore = prefNormalized;
    }
  }

  return {
    totalScore,
    breakdown: { ...prefBreakdown, ...qualityBreakdown },
    matchLabel: getMatchLabel(totalScore),
  };
}

/**
 * Get human-readable match label from score.
 */
export function getMatchLabel(score) {
  if (score >= MATCH_LABELS.excellent.minScore) return MATCH_LABELS.excellent;
  if (score >= MATCH_LABELS.strong.minScore) return MATCH_LABELS.strong;
  if (score >= MATCH_LABELS.good.minScore) return MATCH_LABELS.good;
  return MATCH_LABELS.possible;
}

// ---------------------------------------------------------------------------
// Hard filters (applied before scoring)
// ---------------------------------------------------------------------------

export function applyHardFilters(providers, preferences) {
  return providers.filter(provider => {
    // Provider type must match
    const seekingTypes = preferences.seekingProviderTypes || [];
    if (seekingTypes.length > 0 && !seekingTypes.includes(provider.providerType)) {
      return false;
    }

    // Location filter
    if (preferences.state && !preferences.willingToTravel) {
      if (provider.state !== preferences.state) return false;
    }

    // Must be verified/active
    if (provider.verificationStatus === 'rejected') return false;
    if (provider.acceptingNewPatients === false) return false;

    // Hormone-free hard filter
    if (preferences.hormoneFreePreference === 'required' && !provider.hormoneFreeOptions) {
      return false;
    }

    // Telehealth hard filter
    if (preferences.telehealthPreference === 'required' && !provider.telehealth) {
      return false;
    }

    // Gender preference hard filter
    if (preferences.genderPreference && preferences.genderPreference !== 'no_preference') {
      if (provider.patientGenderPreference && provider.patientGenderPreference !== preferences.genderPreference) {
        return false;
      }
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// Rank providers
// ---------------------------------------------------------------------------

/**
 * Filter, score, and rank providers against patient preferences.
 * Returns sorted array of { provider, totalScore, breakdown, matchLabel }.
 */
export function rankProviders(providers, preferences) {
  const filtered = applyHardFilters(providers, preferences);

  const scored = filtered.map(provider => {
    const result = scoreProvider(provider, preferences);
    return { provider, ...result };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored;
}
