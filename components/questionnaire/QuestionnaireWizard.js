import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STEP_NAMES = [
  'journey',
  'providerType',
  'location',
  'philosophy',
  'treatmentGoals',
  'carePreferences',
  'importance',
  'review',
];

const STEP_LABELS = [
  'Your Journey',
  'Provider Type',
  'Location',
  'Philosophy',
  'Treatment Goals',
  'Care Preferences',
  'Priorities',
  'Review',
];

export default function QuestionnaireWizard({ steps, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    sessionId: '',
    // Step 1
    painJourneyStage: '',
    // Step 2
    seekingProviderTypes: [],
    // Step 3
    state: '',
    city: '',
    willingToTravel: false,
    maxTravelMiles: null,
    // Step 4
    philosophyPreference: 'no_preference',
    faithPreference: 'no_preference',
    faithTradition: '',
    // Step 5
    uterusGoal: 'not_applicable',
    hormoneFreePreference: 'no_preference',
    // Step 6
    autonomyPreference: 'no_preference',
    genderPreference: 'no_preference',
    telehealthPreference: 'no_preference',
    traumaInformedImportant: false,
    diagnosticCapabilityImportant: false,
    needsFmla: false,
    needsDisability: false,
    knownConditions: [],
    // Step 7 — importance weights
    weightFaith: 'important',
    weightPhilosophy: 'important',
    weightUterusFertility: 'important',
    weightHormoneFree: 'important',
    weightAutonomy: 'important',
    weightComorbidity: 'important',
    weightTraumaInformed: 'important',
    weightFmla: 'nice_to_have',
    weightDiagnosticCapability: 'important',
  });

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem('endendo_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('endendo_session_id', sessionId);
    }
    setData(prev => ({ ...prev, sessionId }));

    // Restore saved progress
    const saved = localStorage.getItem('endendo_questionnaire');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed, sessionId }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save progress to localStorage on every change
  useEffect(() => {
    if (data.sessionId) {
      localStorage.setItem('endendo_questionnaire', JSON.stringify(data));
    }
  }, [data]);

  const updateData = (updates) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (index) => {
    setCurrentStep(index);
    window.scrollTo(0, 0);
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const StepComponent = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-secondary-light">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-primary">
            {STEP_LABELS[currentStep]}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-between mt-3">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => i <= currentStep && goToStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentStep
                  ? 'bg-primary'
                  : i < currentStep
                  ? 'bg-primary-300 cursor-pointer'
                  : 'bg-border'
              }`}
              title={label}
              disabled={i > currentStep}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <StepComponent
        data={data}
        updateData={updateData}
        goToStep={goToStep}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          disabled={isFirst}
          className={`btn-ghost ${isFirst ? 'invisible' : ''}`}
        >
          Back
        </button>
        {isLast ? (
          <button onClick={handleComplete} className="btn-primary">
            See My Matches
          </button>
        ) : (
          <button onClick={goNext} className="btn-primary">
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
