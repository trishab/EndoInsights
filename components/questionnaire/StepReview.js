import {
  JOURNEY_STAGES,
  PROVIDER_TYPES,
  TREATMENT_PHILOSOPHIES,
  FAITH_PREFERENCES,
  UTERUS_GOALS,
  HORMONE_PREFERENCES,
  AUTONOMY_PREFERENCES,
  TELEHEALTH_PREFERENCES,
  COMORBIDITIES,
  IMPORTANCE_LEVELS,
} from '../../lib/constants';

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

function ReviewSection({ title, stepIndex, onEdit, children }) {
  return (
    <div className="card-solid">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-secondary-dark">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="text-sm font-medium text-primary hover:text-primary-700 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="text-secondary-light text-sm space-y-1.5">{children}</div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-block bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-100">
      {children}
    </span>
  );
}

function ValueRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-secondary-dark font-medium">{value}</span>
    </div>
  );
}

export default function StepReview({ data, updateData, onGoToStep, onSubmit }) {
  const journeyStage = JOURNEY_STAGES[data.painJourneyStage];
  const providerTypes = (data.seekingProviderTypes || [])
    .map((key) => PROVIDER_TYPES[key]?.label)
    .filter(Boolean);

  const philosophy = data.philosophyPreference === 'no_preference'
    ? 'No preference'
    : TREATMENT_PHILOSOPHIES[data.philosophyPreference]?.label;

  const faith = FAITH_PREFERENCES[data.faithPreference]?.label;
  const uterus = UTERUS_GOALS[data.uterusGoal]?.label;
  const hormone = HORMONE_PREFERENCES[data.hormoneFreePreference]?.label;
  const autonomy = AUTONOMY_PREFERENCES[data.autonomyPreference]?.label;
  const telehealth = TELEHEALTH_PREFERENCES[data.telehealthPreference]?.label;
  const comorbidityLabels = (data.comorbidities || [])
    .map((key) => COMORBIDITIES[key])
    .filter(Boolean);

  const locationParts = [];
  if (data.city) locationParts.push(data.city);
  if (data.state) locationParts.push(STATE_NAMES[data.state] || data.state);
  const locationStr = locationParts.join(', ') || 'Not specified';

  const genderLabels = {
    female: 'Female provider',
    male: 'Male provider',
    no_preference: 'No preference',
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-heading text-2xl font-bold text-secondary-dark">
          Review your preferences
        </h2>
        <p className="text-muted-foreground text-base">
          Take a moment to review your selections before we find your matches.
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Journey Stage */}
        <ReviewSection title="Your Journey" stepIndex={0} onEdit={onGoToStep}>
          {journeyStage ? (
            <p className="text-secondary-dark font-medium">{journeyStage.label}</p>
          ) : (
            <p className="text-muted-foreground italic">Not selected</p>
          )}
        </ReviewSection>

        {/* Step 2: Provider Types */}
        <ReviewSection title="Provider Types" stepIndex={1} onEdit={onGoToStep}>
          {providerTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {providerTypes.map((label) => (
                <Tag key={label}>{label}</Tag>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">None selected</p>
          )}
        </ReviewSection>

        {/* Step 3: Location */}
        <ReviewSection title="Location" stepIndex={2} onEdit={onGoToStep}>
          <ValueRow label="Location" value={locationStr} />
          {data.willingToTravel && (
            <ValueRow
              label="Willing to travel"
              value={data.maxTravelMiles ? `Up to ${data.maxTravelMiles} miles` : 'Yes'}
            />
          )}
        </ReviewSection>

        {/* Step 4: Philosophy & Faith */}
        <ReviewSection title="Philosophy & Faith" stepIndex={3} onEdit={onGoToStep}>
          <ValueRow label="Philosophy" value={philosophy} />
          <ValueRow label="Faith preference" value={faith} />
          {data.faithTradition && (
            <ValueRow label="Tradition" value={data.faithTradition} />
          )}
        </ReviewSection>

        {/* Step 5: Treatment Goals */}
        <ReviewSection title="Treatment Goals" stepIndex={4} onEdit={onGoToStep}>
          <ValueRow label="Uterus / fertility" value={uterus} />
          <ValueRow label="Hormonal treatment" value={hormone} />
        </ReviewSection>

        {/* Step 6: Care Preferences */}
        <ReviewSection title="Care Preferences" stepIndex={5} onEdit={onGoToStep}>
          <ValueRow label="Decision-making" value={autonomy} />
          <ValueRow label="Gender" value={genderLabels[data.genderPreference]} />
          <ValueRow label="Telehealth" value={telehealth} />
          {data.traumaInformedCare && (
            <ValueRow label="Trauma-informed care" value="Yes" />
          )}
          {data.diagnosticCapability && (
            <ValueRow label="Pre-surgical imaging diagnosis" value="Yes" />
          )}
          {data.needsFmla && <ValueRow label="FMLA paperwork" value="Yes" />}
          {data.needsDisability && <ValueRow label="Disability paperwork" value="Yes" />}
          {comorbidityLabels.length > 0 && (
            <div>
              <span className="text-muted-foreground">Related conditions:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {comorbidityLabels.map((label) => (
                  <Tag key={label}>{label}</Tag>
                ))}
              </div>
            </div>
          )}
        </ReviewSection>

        {/* Step 7: Importance Weights */}
        <ReviewSection title="Priority Levels" stepIndex={6} onEdit={onGoToStep}>
          {[
            { key: 'weightFaith', label: 'Faith' },
            { key: 'weightPhilosophy', label: 'Philosophy' },
            { key: 'weightUterus', label: 'Uterus / fertility' },
            { key: 'weightHormoneFree', label: 'Hormone-free' },
            { key: 'weightAutonomy', label: 'Autonomy' },
            { key: 'weightComorbidity', label: 'Comorbidities' },
            { key: 'weightTraumaInformed', label: 'Trauma-informed' },
            { key: 'weightFmla', label: 'FMLA' },
            { key: 'weightDiagnosticCapability', label: 'Diagnostic capability' },
          ]
            .filter((w) => data[w.key])
            .map((w) => (
              <ValueRow
                key={w.key}
                label={w.label}
                value={IMPORTANCE_LEVELS[data[w.key]]?.label || data[w.key]}
              />
            ))}
        </ReviewSection>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary w-full text-center text-lg py-4"
        >
          Find My Matches
        </button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Your preferences are private and only used to match you with compatible providers.
        </p>
      </div>
    </div>
  );
}
