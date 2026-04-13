/**
 * Guideline-informed suggestions based on patient preferences.
 * Sources: ESHRE 2022, ACOG Practice Bulletin, AAGL Practice Guidelines, NICE Guidelines.
 * These nudge patients toward evidence-based care without overriding their autonomy.
 */
export function getGuidelineSuggestions(preferences) {
  const suggestions = [];

  // Diagnosis stage + no imaging priority
  if (
    preferences.painJourneyStage === 'seeking_diagnosis' &&
    !preferences.diagnosticCapabilityImportant
  ) {
    suggestions.push({
      id: 'imaging_for_diagnosis',
      message: 'Medical guidelines recommend starting with endo-focused transvaginal ultrasound (TVUS) or MRI before considering surgery. Providers trained in the IDEA protocol can often identify endometriosis through imaging alone.',
      suggestedChange: { diagnosticCapabilityImportant: true },
      relevantStep: 5, // StepCarePreferences
      source: 'ESHRE Endometriosis Guidelines 2022',
      priority: 'high',
    });
  }

  // Preserve uterus but didn't flag fertility
  if (
    preferences.uterusGoal === 'preserve_uterus' &&
    preferences.fertilityImportance !== 'critical' &&
    preferences.fertilityImportance !== 'important'
  ) {
    suggestions.push({
      id: 'fertility_consideration',
      message: 'If fertility may be relevant to you in the future, consider adding it as a priority. Endometriosis can affect fertility, and some surgical decisions may impact future options.',
      suggestedChange: { fertilityImportance: 'important' },
      relevantStep: 4, // StepTreatmentGoals
      source: 'ACOG Practice Bulletin #114',
      priority: 'medium',
    });
  }

  // Holistic only + seeking surgery
  if (
    preferences.philosophyPreference === 'holistic' &&
    preferences.seekingProviderTypes?.includes('excision_surgeon')
  ) {
    suggestions.push({
      id: 'integrative_surgery',
      message: 'Excision surgery is the gold standard for removing endometriosis tissue. Consider looking for providers who combine surgical expertise with integrative approaches, rather than limiting to holistic-only practitioners for surgery.',
      suggestedChange: { philosophyPreference: 'integrative' },
      relevantStep: 3, // StepPhilosophy
      source: 'AAGL Practice Guidelines for Surgical Treatment of Endometriosis',
      priority: 'high',
    });
  }

  // Seeking surgery but no team preference for advanced cases
  if (
    preferences.seekingProviderTypes?.includes('excision_surgeon') &&
    preferences.knownConditions?.some(c => ['adenomyosis', 'ibs'].includes(c)) &&
    !preferences.seekingProviderTypes?.includes('gastroenterologist') &&
    !preferences.seekingProviderTypes?.includes('pelvic_floor_pt')
  ) {
    suggestions.push({
      id: 'multidisciplinary_care',
      message: 'Given your conditions, medical guidelines recommend a multidisciplinary approach. Consider also looking for a gastroenterologist or pelvic floor physical therapist who can work alongside your surgeon.',
      suggestedChange: null, // just informational
      relevantStep: 1, // StepProviderType
      source: 'ESHRE Endometriosis Guidelines 2022',
      priority: 'medium',
    });
  }

  // Stage 4 / DIE but didn't prioritize multidisciplinary team
  if (
    preferences.painJourneyStage === 'seeking_surgery' &&
    preferences.knownConditions?.length > 2
  ) {
    suggestions.push({
      id: 'complex_case_team',
      message: 'For complex endometriosis cases, guidelines strongly recommend surgeons who work with a multidisciplinary team (colorectal surgeon, urologist). This is associated with lower complication rates and better outcomes.',
      suggestedChange: null,
      relevantStep: 1,
      source: 'AAGL Practice Guidelines',
      priority: 'high',
    });
  }

  // Hormone-free required + no other treatment exploration
  if (
    preferences.hormoneFreePreference === 'required' &&
    !preferences.seekingProviderTypes?.includes('functional_medicine') &&
    !preferences.seekingProviderTypes?.includes('pelvic_floor_pt')
  ) {
    suggestions.push({
      id: 'hormone_free_alternatives',
      message: 'If hormonal treatments are not an option for you, consider adding functional medicine or pelvic floor physical therapy to your provider search. These specialists offer evidence-based hormone-free approaches for symptom management.',
      suggestedChange: null,
      relevantStep: 1,
      source: 'NICE Guideline NG73: Endometriosis',
      priority: 'medium',
    });
  }

  // Post-surgery but no PT
  if (
    preferences.painJourneyStage === 'post_surgery' &&
    !preferences.seekingProviderTypes?.includes('pelvic_floor_pt')
  ) {
    suggestions.push({
      id: 'post_surgical_pt',
      message: 'Pelvic floor physical therapy after excision surgery can significantly improve recovery and reduce ongoing pain. Consider adding a pelvic floor PT to your care team.',
      suggestedChange: null,
      relevantStep: 1,
      source: 'ESHRE Endometriosis Guidelines 2022',
      priority: 'medium',
    });
  }

  // Chronic management but no mental health
  if (
    preferences.painJourneyStage === 'chronic_management' &&
    !preferences.seekingProviderTypes?.includes('mental_health')
  ) {
    suggestions.push({
      id: 'chronic_mental_health',
      message: 'Living with chronic pain can significantly impact mental health. Research shows that working with a therapist experienced in chronic pain (especially CBT or ACT approaches) can improve both pain management and quality of life.',
      suggestedChange: null,
      relevantStep: 1,
      source: 'NICE Guideline NG73',
      priority: 'medium',
    });
  }

  return suggestions;
}
