/**
 * Generate personalized advocacy questions based on patient preferences.
 * Each question includes context about why it matters and what a good answer looks like.
 */
export function generateAdvocacyQuestions(preferences) {
  const questions = [];

  // Surgeon-specific questions
  if (preferences.seekingProviderTypes?.includes('excision_surgeon')) {
    questions.push({
      question: 'How many excision surgeries do you perform per year?',
      why: 'Surgical volume correlates with better outcomes. High-volume surgeons (200+/year) have more experience with complex cases.',
      idealAnswer: '200+ cases per year, or operating at least 2 days per week',
      redFlag: 'Vague answers like "many" or unwillingness to share a number',
      category: 'surgical',
    });

    questions.push({
      question: 'What is your major complication rate (Clavien-Dindo Grade III or higher)?',
      why: 'Willingness to share this is itself a trust signal. Grade III means complications requiring additional intervention.',
      idealAnswer: 'Under 3-5%. The best surgeons are transparent about this.',
      redFlag: 'Refusing to answer or not tracking complications at all',
      category: 'surgical',
    });

    questions.push({
      question: 'For bowel or bladder involvement, do you operate yourself or work with a colorectal surgeon or urologist?',
      why: 'Research shows colorectal surgeons have lower complication rates for bowel surgery than endo surgeons operating alone.',
      idealAnswer: 'Works with a colorectal surgeon and/or urologist as part of a multidisciplinary team',
      redFlag: 'Claims to do everything alone, especially bowel resections',
      category: 'surgical',
    });

    questions.push({
      question: 'Will I receive operative photos and a detailed operative report?',
      why: 'Patients consistently cite this as a top trust signal. Standard of care includes sharing these.',
      idealAnswer: 'Yes — photos taken during surgery and provided to the patient, along with a full operative report',
      redFlag: 'No photos taken, or requiring you to bring a thumb drive',
      category: 'transparency',
    });

    questions.push({
      question: 'Do you perform excision or ablation?',
      why: 'Excision (cutting out) is the gold standard. Ablation (burning) has higher recurrence rates.',
      idealAnswer: 'Excision is the primary technique',
      redFlag: 'Primarily uses ablation, or is vague about the difference',
      category: 'surgical',
    });
  }

  // Uterus preservation
  if (preferences.uterusGoal === 'preserve_uterus') {
    questions.push({
      question: 'What is your approach to hysterectomy? Under what circumstances would you recommend it?',
      why: 'You want to preserve your uterus. Understanding the provider\'s threshold is important.',
      idealAnswer: 'Treats hysterectomy as a last resort, discusses all alternatives first',
      redFlag: 'Suggests hysterectomy early without exploring other options',
      category: 'treatment',
    });
  }

  // Seeking hysterectomy
  if (preferences.uterusGoal === 'seeking_hysterectomy') {
    questions.push({
      question: 'Are you willing to perform a hysterectomy for endometriosis if that is what I want?',
      why: 'You are actively seeking this option and need a provider who supports patient autonomy in this decision.',
      idealAnswer: 'Respects patient choice and is willing to perform if medically appropriate',
      redFlag: 'Refuses to consider it or tries to talk you out of it without exploring your reasons',
      category: 'treatment',
    });
  }

  // Fertility
  if (preferences.fertilityImportance === 'critical') {
    questions.push({
      question: 'How do you protect fertility during excision surgery?',
      why: 'Fertility preservation is critical to you. Surgical technique matters.',
      idealAnswer: 'Discusses ovarian reserve testing before surgery, minimizes ovarian tissue removal, works with reproductive endocrinology',
      redFlag: 'Does not mention fertility considerations or ovarian reserve',
      category: 'treatment',
    });
  }

  // Hormone-free
  if (preferences.hormoneFreePreference === 'required' || preferences.hormoneFreePreference === 'preferred') {
    questions.push({
      question: 'What non-hormonal treatment options do you offer?',
      why: 'You prefer hormone-free approaches. Not all providers are experienced with alternatives.',
      idealAnswer: 'Discusses surgical excision, pelvic floor therapy, pain management, dietary approaches',
      redFlag: 'Insists hormonal suppression is the only option',
      category: 'treatment',
    });
  }

  // FMLA
  if (preferences.needsFmla) {
    questions.push({
      question: 'Does your office complete FMLA paperwork? Is there a fee? How long does it take?',
      why: 'You need FMLA support to protect your employment during treatment.',
      idealAnswer: 'Yes, handled by the office staff, typically within 1-2 weeks, at no additional charge',
      redFlag: 'Refuses to complete paperwork, charges excessive fees, or has very long turnaround times',
      category: 'employment',
    });
    questions.push({
      question: 'Can you certify intermittent FMLA for chronic endometriosis flare-ups?',
      why: 'Intermittent FMLA lets you take individual days for flares instead of continuous leave.',
      idealAnswer: 'Yes, familiar with intermittent FMLA certification for chronic conditions',
      redFlag: 'Unfamiliar with intermittent FMLA or unwilling to certify it',
      category: 'employment',
    });
  }

  // Disability
  if (preferences.needsDisability) {
    questions.push({
      question: 'Will you complete short-term disability paperwork for my surgery recovery?',
      why: 'You need disability support for income during recovery.',
      idealAnswer: 'Yes, the office handles disability paperwork routinely',
      redFlag: 'Refuses or is unfamiliar with the process',
      category: 'employment',
    });
  }

  // Trauma-informed
  if (preferences.traumaInformedImportant) {
    questions.push({
      question: 'How do you approach pelvic exams for patients with a history of trauma?',
      why: 'Trauma-informed care is important to you.',
      idealAnswer: 'Asks permission at each step, explains what they are doing, stops when asked, offers alternatives',
      redFlag: 'Dismissive of trauma concerns or does not ask about comfort level',
      category: 'care_style',
    });
  }

  // Pelvic floor PT
  if (preferences.seekingProviderTypes?.includes('pelvic_floor_pt')) {
    questions.push({
      question: 'Do you do internal pelvic floor work? What techniques do you use?',
      why: 'Internal manual therapy is the most effective approach for pelvic floor dysfunction.',
      idealAnswer: 'Yes — uses internal manual therapy, biofeedback, and/or visceral mobilization',
      redFlag: 'Only does external work or focuses exclusively on Kegels (often counterproductive for endo patients)',
      category: 'treatment',
    });
  }

  // Functional medicine
  if (preferences.seekingProviderTypes?.includes('functional_medicine')) {
    questions.push({
      question: 'Are you IFM-certified or equivalent? Do you collaborate with conventional medicine providers?',
      why: 'Certification and collaboration ensure an evidence-based integrative approach.',
      idealAnswer: 'IFM-certified, works alongside gynecologists and surgeons',
      redFlag: 'No formal training, or advises against conventional treatment entirely',
      category: 'credentials',
    });
  }

  // General questions for everyone
  questions.push({
    question: 'What is your typical wait time for a new patient appointment?',
    why: 'Managing expectations helps you plan your care timeline.',
    idealAnswer: 'Provides a specific timeframe. Months-long waits are normal for top specialists.',
    redFlag: 'Unable or unwilling to give an estimate',
    category: 'logistics',
  });

  return questions;
}
