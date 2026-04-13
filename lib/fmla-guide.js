import stateLeaveLaws from './data/state-leave-laws.json';
import { STATES_WITH_SDI } from './constants';

/**
 * Get personalized FMLA and disability guidance based on patient preferences.
 */
export function getFmlaGuidance(preferences) {
  const sections = [];

  if (!preferences.needsFmla && !preferences.needsDisability) {
    return sections;
  }

  const state = preferences.employmentState || preferences.state;
  const stateData = stateLeaveLaws[state] || stateLeaveLaws.DEFAULT;
  const employerSize = preferences.employerSize;

  // Section 1: FMLA Eligibility
  if (preferences.needsFmla) {
    const fmlaSection = {
      title: 'FMLA Eligibility',
      items: [],
    };

    // Federal FMLA check
    if (employerSize === '50_plus' || employerSize === 'federal') {
      fmlaSection.items.push({
        type: 'eligible',
        message: `Based on your employer size (${employerSize === 'federal' ? 'federal government' : '50+ employees'}), you likely qualify for federal FMLA. This gives you up to 12 weeks of unpaid, job-protected leave per year.`,
      });
    } else if (employerSize === 'under_50') {
      fmlaSection.items.push({
        type: 'warning',
        message: 'Your employer may not be covered by federal FMLA (requires 50+ employees within 75 miles).',
      });

      // Check state extensions
      if (stateData.hasStateFmla && stateData.stateFmlaMinEmployees < 50) {
        fmlaSection.items.push({
          type: 'eligible',
          message: `However, ${stateData.stateName} has ${stateData.stateFmlaName}, which covers employers with ${stateData.stateFmlaMinEmployees}+ employees. You may still be covered under state law.`,
        });
      }
    } else {
      fmlaSection.items.push({
        type: 'action',
        message: 'Ask your HR department: "How many employees does the company have within 75 miles?" This determines your FMLA eligibility.',
      });
    }

    // State FMLA info
    if (stateData.hasStateFmla && stateData.stateFmlaName) {
      fmlaSection.items.push({
        type: 'info',
        message: `${stateData.stateName} also has ${stateData.stateFmlaName}, providing up to ${stateData.stateFmlaWeeks} weeks of leave.`,
        resourceUrl: stateData.resourceUrl,
      });
    }

    // Intermittent FMLA tip
    fmlaSection.items.push({
      type: 'tip',
      message: 'Intermittent FMLA: If you have chronic flare days, you can use FMLA intermittently (individual days) rather than all at once. Ask your provider to certify this on your FMLA paperwork.',
    });

    sections.push(fmlaSection);
  }

  // Section 2: Short-Term Disability
  if (preferences.needsDisability) {
    const disabilitySection = {
      title: 'Short-Term Disability',
      items: [],
    };

    const hasBenefit = preferences.hasDisabilityBenefit;

    if (STATES_WITH_SDI.includes(state)) {
      disabilitySection.items.push({
        type: 'eligible',
        message: `${stateData.stateName} provides state disability insurance (${stateData.disabilityProgram}). Duration: ${stateData.disabilityDuration}. Wage replacement: ${stateData.disabilityWageReplacement}.`,
        resourceUrl: stateData.resourceUrl,
      });
    } else if (stateData.hasPaidFamilyLeave) {
      disabilitySection.items.push({
        type: 'eligible',
        message: `${stateData.stateName} has ${stateData.paidLeaveProgram} which may cover your medical leave. Wage replacement: ${stateData.disabilityWageReplacement}.`,
        resourceUrl: stateData.resourceUrl,
      });
    } else if (hasBenefit === 'employer_provided') {
      disabilitySection.items.push({
        type: 'info',
        message: 'Your employer provides short-term disability. Contact HR for your policy details: waiting period, coverage percentage, and duration.',
      });
    } else if (hasBenefit === 'none' || hasBenefit === 'unsure') {
      disabilitySection.items.push({
        type: 'warning',
        message: `Your state (${stateData.stateName || state}) does not have mandatory short-term disability. Check with your HR department if your employer offers this benefit.`,
      });
    }

    // Surgery-specific tip
    if (preferences.painJourneyStage === 'seeking_surgery' || preferences.seekingProviderTypes?.includes('excision_surgeon')) {
      disabilitySection.items.push({
        type: 'tip',
        message: 'For excision surgery, recovery typically requires 2-6 weeks off work. File your disability claim BEFORE surgery if possible — some policies have a waiting period.',
      });
    }

    sections.push(disabilitySection);
  }

  // Section 3: Questions to ask
  const questionsSection = {
    title: 'Questions to Ask',
    items: [],
  };

  if (preferences.needsFmla) {
    questionsSection.items.push(
      {
        type: 'question',
        who: 'Your Provider',
        message: 'Will your office complete my FMLA paperwork? Is there a fee?',
      },
      {
        type: 'question',
        who: 'Your Provider',
        message: 'How long does it typically take to get FMLA paperwork back?',
      },
      {
        type: 'question',
        who: 'Your Provider',
        message: 'If I need intermittent FMLA for flare days, will you certify that?',
      },
      {
        type: 'question',
        who: 'Your Employer/HR',
        message: 'Am I eligible for FMLA? How do I apply?',
      },
      {
        type: 'question',
        who: 'Your Employer/HR',
        message: 'What documentation do you need from my doctor?',
      }
    );
  }

  if (preferences.needsDisability) {
    questionsSection.items.push(
      {
        type: 'question',
        who: 'Your Employer/HR',
        message: 'Does the company offer short-term disability? What is the waiting period?',
      },
      {
        type: 'question',
        who: 'Your Provider',
        message: 'Can you provide documentation of my condition\'s impact on my ability to work?',
      }
    );
  }

  // Red flags
  questionsSection.items.push(
    {
      type: 'red_flag',
      message: 'If a provider refuses to complete FMLA paperwork or says "just take sick days," consider finding a provider who understands chronic illness employment impacts.',
    },
    {
      type: 'red_flag',
      message: 'If your employer discourages you from filing FMLA, know that retaliation for using FMLA is illegal under federal law.',
    }
  );

  sections.push(questionsSection);

  return sections;
}
